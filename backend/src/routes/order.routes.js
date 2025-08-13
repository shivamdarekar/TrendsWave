import express from "express";
import { Order } from "../models/order.model.js";
import { protect } from "../middleware/authMiddleware.js";
import { User } from "../models/user.model.js";

const router = express.Router();

//Get logged in users order
//access -> private
router.get("/my-orders", protect, async (req, res) => {
  const userId = req.user._id;
  
  try {
    //find orders for authenticated user
    const orders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    }); //sort most recent orders first
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while getting users orders" });
  }
});

// Get order details by id
router.get("/:id", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // First fetch order without populating
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure order belongs to the logged-in user
    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    // Now populate after verification
    await order.populate("user", "name email");

    res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
