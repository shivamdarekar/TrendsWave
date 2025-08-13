import express from "express";
import { Product } from "../models/product.model.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

//get all products
router.get("/", protect, admin, async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          discountPrice: 1,
          countInStock: 1,
          sku: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error while grtting all products" });
  }
});


export default router;
