import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { protect } from "../middleware/authMiddleware.js";
import { Checkout } from "../models/checkout.model.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/order", protect, async (req, res) => {
  try {
    const { checkoutId } = req.body;

    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) {
      return res.status(404).json({ message: "Checkot not found" });
    }

    if (checkout.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized for this checkout." });
    }

    if (checkout.isPaid) {
      return res.status(400).json({ message: "Checkout already paid" });
    }

    // amount in paise
    const amountPaise = Math.round(Number(checkout.totalPrice) * 100);
    if (!amountPaise || amountPaise <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${checkoutId}`,
      notes: {
        checkoutId,
        userId: String(req.user._id),
      },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, //frontend needs this
    });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    return res.status(500).json({ message: "Failed to create payment order" });
  }
});

router.post("/verify", protect, async (req, res) => {
  const session = await Checkout.startSession();
  session.startTransaction();

  try {
    const {
      checkoutId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Missing Razorpay payment params" });
    }

    const checkout = await Checkout.findById(checkoutId).session(session);
    if (!checkout) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Checkout not found" });
    }

    // CRITICAL: Check if already verified - prevents double processing
    if (checkout.isPaid === true) {
      await session.abortTransaction();
      return res.json({ 
        success: true, 
        message: "Payment already processed" 
      });
    }

    if (checkout.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Mark checkout paid atomically
    const updatedCheckout = await Checkout.findByIdAndUpdate(
      checkoutId,
      {
        isPaid: true,
        paymentStatus: "paid",
        paidAt: new Date(),
        paymentDetails: {
          provider: "razorpay",
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      },
      { session, new: true }
    );

    await session.commitTransaction();
    return res.json({ success: true, checkout: updatedCheckout });
  } catch (err) {
    await session.abortTransaction();
    console.error("Razorpay verify error:", err);
    return res.status(500).json({ message: "Verification failed" });
  } finally {
    session.endSession();
  }
});

export default router;
