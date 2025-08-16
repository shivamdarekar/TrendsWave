import { v2 as cloudinaryV2 } from "cloudinary";
import streamifier from "streamifier";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
//cloudinary configuration
cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (input, options = { resource_type: "auto" }) => {
  if (!input) return null;

  try {
    // Buffer case -> use upload_stream
    if (Buffer.isBuffer(input)) {
      return await new Promise((resolve, reject) => {
        const stream = cloudinaryV2.uploader.upload_stream(options, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        streamifier.createReadStream(input).pipe(stream);
      });
    }

    // String (assumed local file path)
    if (typeof input === "string") {
      const result = await cloudinaryV2.uploader.upload(input, options);
      return result;
    }

    throw new Error("Unsupported input type for uploadOnCloudinary");
  } catch (error) {
    // If we were passed a local file path, attempt to unlink it on error
    if (typeof input === "string") {
      try {
        fs.unlinkSync(input);
      } catch (e) {
        // ignore unlink errors
      }
    }
    throw error;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinaryV2.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result !== "ok") {
            console.error("Error deleting from Cloudinary:", result);
            return null;
        }
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary }; // Export the uploadOnCloudinary function
