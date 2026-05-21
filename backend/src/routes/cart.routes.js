import express from "express";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//helper f:n to get cart by user Id or guest ID
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

//add product to cart for a guest or logged in user
//access -> public
router.post("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  // If userId provided, validate it's a valid ObjectId format to prevent injection
  const safeFilter = userId ? { user: userId } : { guestId };
  try {
    const product = await Product.findById(productId).select({ name: 1, images: 1, price: 1, discountPrice: 1, owner: 1 });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const filter = safeFilter;
    
    const updatedCart = await Cart.findOneAndUpdate(
      {
        ...filter,
        "products.productId": productId,
        "products.size": size,
        "products.color": color,
      },
      {
        $inc: { "products.$.quantity": quantity }, // Atomic increment
      },
      { new: true }
    );

    if (updatedCart) {
      // Product already existed, quantity was incremented atomically
      updatedCart.totalPrice = updatedCart.products.reduce(
        (acc, item) =>
          acc + (item.discountPrice ?? item.price) * (item.quantity || 1),
        0
      );
      await updatedCart.save();
      return res.status(200).json(updatedCart);
    }

    // Product doesn't exist in cart, need to add it
    let cart = await Cart.findOne(filter);

    if (!cart) {
      // Create new cart with product
      const newCart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            discountPrice: product.discountPrice,
            size,
            color,
            quantity,
            owner: product.owner,
          },
        ],
        totalPrice: (product.discountPrice ?? product.price) * (quantity || 1),
      });
      return res.status(201).json(newCart);
    } else {
      // Add new product to existing cart
      cart.products.push({
        productId,
        name: product.name,
        image: product.images[0].url,
        price: product.price,
        discountPrice: product.discountPrice,
        size,
        color,
        quantity,
        owner: product.owner,
      });
      
      cart.totalPrice = cart.products.reduce(
        (acc, item) =>
          acc + (item.discountPrice ?? item.price) * (item.quantity || 1),
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error while creating a cart");
  }
});

//update the product quantity of cart for guest or logged in user
router.put("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    const filter = userId ? { user: userId } : { guestId };

    if (quantity <= 0) {
      // Remove item atomically
      const cart = await Cart.findOneAndUpdate(
        filter,
        { $pull: { products: { productId, size, color } } },
        { new: true }
      );
      if (!cart) return res.status(404).json({ message: "Cart not found" });
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + (item.discountPrice ?? item.price) * (item.quantity || 1), 0
      );
      await cart.save();
      return res.status(200).json(cart);
    }

    const cart = await Cart.findOneAndUpdate(
      { ...filter, "products.productId": productId, "products.size": size, "products.color": color },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );

    if (!cart) return res.status(404).json({ message: "Product not found in cart" });

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + (item.discountPrice ?? item.price) * (item.quantity || 1), 0
    );
    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error while updating the quantity");
  }
});

//Remove a product from cart
router.delete("/", async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body;

  try {
    const filter = userId ? { user: userId } : { guestId };

    const cart = await Cart.findOneAndUpdate(
      filter,
      { $pull: { products: { productId, size, color } } },
      { new: true }
    );

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + (item.discountPrice ?? item.price) * (item.quantity || 1), 0
    );
    await cart.save();
    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while deleting item from cart" });
  }
});

//Get cart of logged in user of guest user
router.get("/", async (req, res) => {
  const { userId, guestId } = req.query;

  try {
    let cart = await getCart(userId, guestId);

    if (!cart) {
      // If no cart is found, create a new one
      const newCartData = {
        products: [],
        totalPrice: 0,
      };
      if (userId) {
        newCartData.user = userId;
      } else if (guestId) {
        newCartData.guestId = guestId;
      }
      cart = await Cart.create(newCartData);
    }

    return res.json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error while fetching the cart !");
  }
});

router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;
  const session = await Cart.startSession();
  session.startTransaction();

  try {
    //find the guest cart and user cart within transaction
    const guestCart = await Cart.findOne({ guestId }).session(session);
    const userCart = await Cart.findOne({ user: req.user._id }).session(session);

    if (guestCart) {
      //Stops the merge if guest cart has no items.
      if (guestCart.products.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Guest cart is empty" });
      }

      if (userCart) {
        //merge guest cart into user cart with deduplication
        guestCart.products.forEach((guestItem) => {
          const productIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString() &&
              item.size === guestItem.size &&
              item.color === guestItem.color
          );

          if (productIndex > -1) {
            //if items exists in user cart, update the quantity
            userCart.products[productIndex].quantity += guestItem.quantity;
          } else {
            //otherwise add the guest item to the cart
            userCart.products.push(guestItem);
          }
        });

        userCart.totalPrice = userCart.products.reduce(
          (acc, item) =>
            acc + (item.discountPrice ?? item.price) * (item.quantity || 1),
          0
        );

        await userCart.save({ session });

        //Remove the guest cart after merging atomically
        await Cart.findOneAndDelete({ guestId }, { session });

        await session.commitTransaction();
        res.status(200).json(userCart);
      } else {
        //if user has no existing cart, assign guest cart to the user
        guestCart.user = req.user._id;
        guestCart.guestId = undefined;
        await guestCart.save({ session });

        await session.commitTransaction();
        res.status(200).json(guestCart);
      }
    } else {
      //guest cart was already merged earlier
      if (userCart) {
        await session.abortTransaction();
        return res.status(200).json(userCart);
      }

      //otherwise no guest cart or no user cart
      await session.abortTransaction();
      res.status(404).json({ message: "Guest cart not found" });
    }
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res
      .status(500)
      .json({ message: "Error while merging guest cart into user Cart.." });
  } finally {
    session.endSession();
  }
});

export default router;
