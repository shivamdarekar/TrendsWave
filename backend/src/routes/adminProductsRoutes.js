import express from "express";
import { Product } from "../models/product.model.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

//get all products
router.get("/", protect, admin, async (req, res) => {
    try {
        const products = await Product.find({});
        return res.json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while grtting all products" });    
    }
});




export default router;