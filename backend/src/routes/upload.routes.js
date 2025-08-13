import express from "express";
import sharp from "sharp";
import { upload } from "../../utils/multer.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const router = express.Router();

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 🔹 Resize & convert image to a consistent format (e.g., 800x800 JPG)
    const resizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: "contain", // keeps full product visible
    background: { r: 255, g: 255, b: 255, alpha: 1 } // white background
      })
      .jpeg({ quality: 90 }) // you can also keep it png or webp
      .toBuffer();

    // Upload resized buffer to Cloudinary
    const result = await uploadOnCloudinary(resizedBuffer, { resource_type: "image" });

    return res.status(200).json({
      message: "File uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Error while uploading image" });
  }
});

export default router;
