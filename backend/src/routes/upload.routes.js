import express from "express";
import sharp from "sharp";
import heicConvert from "heic-convert";
import { upload } from "../utils/multer.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { Product } from "../models/product.model.js";

const router = express.Router();

//add image at time of updating product
router.post("/:productId",protect,admin,upload.single("image"), async (req, res) => {
    try {
      const { productId } = req.params;

      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let inputBuffer = req.file.buffer;

      // If it's HEIC/HEIF → convert to JPEG first
      if (
        req.file.originalname.toLowerCase().endsWith(".heic") ||
        req.file.mimetype === "image/heic" ||
        req.file.mimetype === "image/heif"
      ) {
        inputBuffer = await heicConvert({
          buffer: req.file.buffer,
          format: "JPEG",
          quality: 1,
        });
      }

      // Resize & convert
      // const resizedBuffer = await sharp(inputBuffer)
      //   .resize(800, 800, {
      //     fit: "contain",
      //     background: { r: 255, g: 255, b: 255, alpha: 1 }
      //   })
      //   .jpeg({ quality: 90 })
      //   .toBuffer();

      // Upload to Cloudinary
      const result = await uploadOnCloudinary(inputBuffer, {
        resource_type: "image",
      });

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      const image = { url: result.secure_url, publicId: result.public_id, altText: "" };
      product.images.push(image);
      await product.save();

      res.status(200).json({
        message: "File uploaded successfully",
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error while uploading image" });
    }
  }
);


//upload image for add new product
router.post("/",protect,admin,upload.single("image"), async (req, res) => {
    try {

      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let inputBuffer = req.file.buffer;

      // If it's HEIC/HEIF → convert to JPEG first
      if (
        req.file.originalname.toLowerCase().endsWith(".heic") ||
        req.file.mimetype === "image/heic" ||
        req.file.mimetype === "image/heif"
      ) {
        inputBuffer = await heicConvert({
          buffer: req.file.buffer,
          format: "JPEG",
          quality: 1,
        });
      }

      // Resize & convert
      // const resizedBuffer = await sharp(inputBuffer)
      //   .resize(800, 800, {
      //     fit: "contain",
      //     background: { r: 255, g: 255, b: 255, alpha: 1 }
      //   })
      //   .jpeg({ quality: 90 })
      //   .toBuffer();

      // Upload to Cloudinary
      const result = await uploadOnCloudinary(inputBuffer, {
        resource_type: "image",
      });

      res.status(200).json({
        message: "File uploaded successfully",
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error while uploading image" });
    }
  }
);



//Delete Product Image at time of updating
router.delete("/:productId", protect, admin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: "publicId is required" });
    }

    const result = await deleteFromCloudinary(publicId);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.images.length < 1) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }

    product.images = product.images.filter((img) => img.publicId !== publicId);
    await product.save();

    res.json({ message: "Image deleted successfully", result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({ message: "Server error while deleting image" });
  }
});

export default router;
