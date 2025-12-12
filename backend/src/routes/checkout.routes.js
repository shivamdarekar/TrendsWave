import express from "express";
import { Checkout } from "../models/checkout.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Create a new Checkout session
//access -> private
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({
      message:
        "No items found in checkout. Please add products before proceeding.",
    });
  }

  try {
    //create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems: checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "pending",
      isPaid: false,
    });

    //console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while creating checkout" });
  }
});


//Finalize checkout and convert to an order after payment confirmation
//access -> private

router.post("/:id/finalize", protect, async (req, res) => {
  const session = await Checkout.startSession();
  session.startTransaction();

  try {
    const checkout = await Checkout.findById(req.params.id).session(session);

    if (!checkout) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Checkout session not found." });
    }

    // Make sure the checkout belongs to the logged-in user
    if (checkout.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Unauthorized to finalize this checkout." });
    }

    if (!checkout.isPaid) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Checkout is not marked as paid yet." });
    }

    // CRITICAL: Use atomic update to mark as finalized and prevent duplicate processing
    const finalizedCheckout = await Checkout.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          isFinalized: true,
          finalizedAt: new Date()
        } 
      },
      { session, new: true }
    );

    // If it was already finalized, abort this transaction
    if (!finalizedCheckout || (checkout.isFinalized && checkout.finalizedAt)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "This checkout has already been finalized." });
    }

    // BUILD ORDER ITEMS — **freeze the paid price** here
    const orderItems = finalizedCheckout.checkoutItems.map((item) => {
      const paidUnitPrice =
        typeof item.discountPrice === "number" && item.discountPrice > 0
          ? item.discountPrice
          : item.price;

      return {
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: paidUnitPrice, // frozen paid price per unit
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        owner: item.owner,
      };
    });

    // Compute total price from the frozen order items
    const totalPrice = orderItems.reduce(
      (acc, it) => acc + it.price * it.quantity,
      0
    );

    // Create final order atomically
    const finalOrder = await Order.create(
      [{
        user: finalizedCheckout.user,
        orderItems,
        shippingAddress: finalizedCheckout.shippingAddress,
        paymentMethod: finalizedCheckout.paymentMethod,
        totalPrice,
        isPaid: true,
        paidAt: finalizedCheckout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: finalizedCheckout.paymentDetails,
      }],
      { session }
    );

    // Delete the cart associated with user atomically
    await Cart.findOneAndDelete({ user: finalizedCheckout.user }, { session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Order successfully created from checkout.",
      order: finalOrder[0],
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Finalize error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while finalizing checkout." });
  } finally {
    session.endSession();
  }
});

    return res.status(201).json({
      message: "Order successfully created from checkout.",
      order: finalOrder,
    });
  } catch (error) {
    console.error("Finalize error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while finalizing checkout." });
  }
});

export default router;
