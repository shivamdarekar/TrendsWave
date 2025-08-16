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

  try {
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });

    //determine if the user is logged in or guest
    let cart = await getCart(userId, guestId);

    //if the cart exists, update it
    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );

        /*
        findIndex() ek array method hai jo array ke andar first matching item ka index 
        return karta hai — yaani kis position pe item mila.
        Kya same productId, size, and color already cart me hai?
        Agar mil gaya, findIndex() uska index dega (like 0, 1, 2).
        Agar nahi mila, -1 return karega.
        */

      if (productIndex > -1) {
        //if product already exists, update the quantity
        cart.products[productIndex].quantity += quantity;

        //Same ID + same size + same color → update quantity
        //Same ID + different size or color → add new item 
          
      } else {
        //add new product to existing cart
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          discountPrice: product.discountPrice,
          size,
          color,
          quantity,
          owner:product.owner
        });
      }

      //recalculate total price
     cart.totalPrice = cart.products.reduce(
  (acc, item) =>
    acc + (((item.discountPrice ?? item.price) * (item.quantity || 1))),
  0
);


        //reduce() ek array method hai jo array ko ek single value me reduce karta hai. Jaise total sum, average, or merging.
        //accumalator mai hum total value store kr rahe hai
        //We use .reduce() only when the cart already has multiple products, and we need to calculate the total of all of them.
        /* Start with acc = 0
        First item: acc = 0 + 100*2 = 200
        Second item: acc = 200 + 50*3 = 200 + 150 = 350*/

      await cart.save();
      return res.status(200).json(cart);
    } else {
        //create new cart for guest or user if cart not exists
        //jab cart mai 1st item insert hoga tb ye newcart run hoga agar 2nd item insert karte time again upar wala run hoga
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
            owner:product.owner
          },
        ],
totalPrice: ((product.discountPrice ?? product.price) * (quantity || 1)),
      });
      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error while creating a cart");
  }
});


//update the product quantity of cart for guest or logged in user
router.put("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body

    try {
        let cart = await getCart(userId, guestId)

        if (!cart) return res.status(404).json({ message: "Product not found" });

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );

        if (productIndex > -1) {
            //update quantity
            if (quantity > 0) {
                cart.products[productIndex].quantity = quantity;
            } else {
                //Removes 1 item from the cart.products array at productIndex.
                cart.products.splice(productIndex, 1); //remove product if quantity is 0
            }
cart.totalPrice = cart.products.reduce(
  (acc, item) =>
    acc + (((item.discountPrice ?? item.price) * (item.quantity || 1))),
  0
);


            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found in cart.." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send("Error while updating the quantity");
    }
});


//Remove a product from cart
router.delete("/", async (req, res) => {
    const { productId, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);

        if (!cart) return res.status(404).json({message:"Cart not found"})

        const productIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

          cart.totalPrice = cart.products.reduce(
  (acc, item) =>
    acc + (((item.discountPrice ?? item.price) * (item.quantity || 1))),
  0
);


            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while deleting item from cart" });
        
    }
})


//Get cart of logged in user of guest user
router.get("/", async (req, res) => {
    const { userId, guestId } = req.query;

    try {
        let cart = await getCart(userId, guestId);

        if (!cart) {
          // If no cart is found, create a new one
          const newCartData = {
            products: [],
            totalPrice: 0
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


//if guest user click on checkout, redirect user to login page
//merge guest cart into user cart on login
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;

  try {
    //find the guest cart and user cart
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    
    if (guestCart) {

      //Stops the merge if guest cart has no items.
      if (guestCart.products.length === 0) {
        return res.status(400).json({ message: "Guest cart is empty" });
      }

      //user ka already koi cart hai but user login nahi hai aur wo guest id aur ek cart bana raha hai
      //uss time uss user ke guest cart mai and user cart mai same item hai to only quantity badhao otherwise item add karo
      if (userCart) {
        //merge guest cart into user cart
        guestCart.products.forEach((guestItem) => {
          const productIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString() &&
              item.size === guestItem.size &&
              item.color === guestItem.color
          );

          if (productIndex > -1) {
            //if items exists in user cart,update the quantity
            userCart.products[productIndex].quantity += guestItem.quantity;
          } else {
            //otherwise add the guest item to the cart
            userCart.products.push(guestItem);
          }
        });

        userCart.totalPrice = userCart.products.reduce(
          (acc, item) => acc +((item.discountPrice ?? item.price) * (item.quantity || 1)),
   0
        );

        await userCart.save();

        //Remove the guest cart after merging
        try {
          await Cart.findOneAndDelete({ guestId });
        } catch (error) {
          console.error("Error while deleting the guest cart",error); 
        }

        res.status(200).json(userCart)

      } else {
        //if user has no existing cart,assign guest cart to the user
        guestCart.user = req.user._id;
        guestCart.guestId = undefined;
        await guestCart.save();

        res.status(200).json(guestCart);
      }
    } else {
      //if (guestCart) was false, so there is no guest cart in database maybe its already merge and deleted
      //guest cart was already merged earlier. So we simply return the existing user cart — no errors.
      if (userCart) {
        //guest cart has already been merged, return user cart
        return res.status(200).json(userCart);
      }

      //otherwise no guest cart or no user cart
      res.status(404).json({ message: "Guest cart not found" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while merging guest cart into user Cart.." });
  }
})


export default router;
