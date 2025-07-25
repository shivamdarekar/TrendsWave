import express from "express"
import { Order } from "../models/order.model.js"
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

//Get all orders(admin only)
router.get("/", protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email");
        return res.json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while fetching all orders" });
    }
});


// Update order status (Admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status field is required" });
    }

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    if (status.toLowerCase() === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
        order.isDelivered = false;
        order.deliveredAt = null;
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Update Order Error:", error);
    return res.status(500).json({ message: "Server error while updating order status" });
  }
});


//delete a order(admin only)
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        await order.deleteOne();
        return res.json({ message: "Order removed successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while deleting the order" });
    }
});


export default router;