import express from "express";
import { Order } from "../models/order.model.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Get logged in users order
//access -> private
router.get("/my-orders", protect, async (req, res) => {
    try {
        //find orders for authenticated user
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1
        }); //sort most recent orders first
        return res.json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while getting users orders" });
    }
});


//Get order details by id
router.get("/:id", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        //return the full order details
        res.json(order);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" })
        
    }
});

export default router;