import express, { Router } from "express";
import multer from "multer";
import { v2 as cloudinaryV2 } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

//cloudinary configuration
cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//multer setup using memory storage
const storage = multer.memoryStorage(); //store buffer data(image). buffer data -> image store in binary form
const upload = multer({ storage });

//A stream is a way to send large data chunks in small pieces. Useful for large files (like videos/images)
//Yeh buffer ko ek readable stream me convert karta hai, taki Cloudinary upload_stream me use kar sake

router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        //function handle the stream upload to cloudinary
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinaryV2.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });

                //use streamifier to convert file buffer to a stream
                //createReadStream() converts your image buffer to a stream. pipe() sends that stream to Cloudinary.
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        //call the streamUpload function
        const result = await streamUpload(req.file.buffer);

        //respond with the uploaded image url
        res.json({ imageUrl: result.secure_url });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while uploading Image" });
        
    }
});

export default router;

