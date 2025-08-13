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
    return res
      .status(400)
      .json({
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

//Update checkout to mark as paid after successfull payment
//access -> private
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    // Prevent other users from updating this checkout
    if (checkout.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this checkout." });
    }

    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();

      return res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Invalid Payment Status" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while updating the Payment status" });
  }
});

//Finalize checkout and convert to an order after payment confirmation
//access -> private
// router.post("/:id/finalize", protect, async (req, res) => {
//   try {
//     const checkout = await Checkout.findById(req.params.id);

//     if (!checkout) {
//       return res.status(404).json({ message: "Checkout not found" });
//     }

//     if (checkout.isPaid && !checkout.isFinalized) {
//       //create final order based on checkout details
//       const finalOrder = await Order.create({
//         user: checkout.user,
//         orderItems: checkout.checkoutItems,
//         shippingAddress: checkout.shippingAddress,
//         paymentMethod: checkout.paymentMethod,
//         totalPrice: checkout.totalPrice,
//         isPaid: true,
//         paidAt: checkout.paidAt,
//         isDelivered: false,
//         paymentStatus: "paid",
//         paymentDetails: checkout.paymentDetails,
//       });

//       //mark checkout as finalizes, to prevent duplicate orders.
//       checkout.isFinalized = true;
//       checkout.finalizeAt = Date.now();
//       await checkout.save();

//       //delete the cart associated with user
//       await Cart.findOneAndDelete({ user: checkout.user });
//       return res.status(201).json(finalOrder);
//     } else if (checkout.isFinalized) {
//       return res.status(400).json({ message: "Checkout already finalized" });
//     } else {
//       return res.status(400).json({ message: "Checkout is not paid" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Error while coverting checkout into order " });
//   }
// });

//code without if else
// router.post("/:id/finalize", protect, async (req, res) => {
//   try {
//     const checkout = await Checkout.findById(req.params.id);

//     if (!checkout) {
//       return res.status(404).json({ message: "Checkout session not found." });
//     }

//     // Make sure the checkout belongs to the logged-in user
//     if (checkout.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Unauthorized to finalize this checkout." });
//     }

//     if (!checkout.isPaid) {
//       return res.status(400).json({ message: "Checkout is not marked as paid yet." });
//     }

//     if (checkout.isFinalized) {
//       return res.status(400).json({ message: "This checkout has already been finalized." });
//     }

//     const finalOrder = await Order.create({
//       user: checkout.user,
//       orderItems: checkout.checkoutItems,
//       shippingAddress: checkout.shippingAddress,
//       paymentMethod: checkout.paymentMethod,
//       totalPrice: checkout.totalPrice,
//       isPaid: true,
//       paidAt: checkout.paidAt,
//       isDelivered: false,
//       paymentStatus: "paid",
//       paymentDetails: checkout.paymentDetails,
//     });

//     checkout.isFinalized = true;
//     checkout.finalizeAt = new Date();
//     await checkout.save();

//     // Clean up user's cart
//     await Cart.findOneAndDelete({ user: checkout.user });

//     return res.status(201).json({
//       message: "Order successfully created from checkout.",
//       order: finalOrder,
//     });

//   } catch (error) {
//     console.error("Finalize error:", error.message);
//     return res.status(500).json({ message: "Server error while finalizing checkout." });
//   }
// });

router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout session not found." });
    }

    // Make sure the checkout belongs to the logged-in user
    if (checkout.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to finalize this checkout." });
    }

    if (!checkout.isPaid) {
      return res.status(400).json({ message: "Checkout is not marked as paid yet." });
    }

    if (checkout.isFinalized) {
      return res.status(400).json({ message: "This checkout has already been finalized." });
    }

    // BUILD ORDER ITEMS — **freeze the paid price** here
    const orderItems = checkout.checkoutItems.map((item) => {
      const paidUnitPrice = (typeof item.discountPrice === "number" && item.discountPrice >= 0)
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

    // Compute total price from the frozen order items (avoid re-calculating using product DB)
    const totalPrice = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);

    // Create final order
    const finalOrder = await Order.create({
      user: checkout.user,
      orderItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice,
      isPaid: true,
      paidAt: checkout.paidAt,
      isDelivered: false,
      paymentStatus: "paid",
      paymentDetails: checkout.paymentDetails,
    });

    // mark checkout finalized
    checkout.isFinalized = true;
    checkout.finalizeAt = new Date();
    await checkout.save();

    // delete the cart associated with user
    await Cart.findOneAndDelete({ user: checkout.user });

    return res.status(201).json({
      message: "Order successfully created from checkout.",
      order: finalOrder,
    });
  } catch (error) {
    console.error("Finalize error:", error.message);
    return res.status(500).json({ message: "Server error while finalizing checkout." });
  }
});


export default router;
