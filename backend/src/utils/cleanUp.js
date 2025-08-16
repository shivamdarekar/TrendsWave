import cron from "node-cron";
import { tempUpload } from "../models/tempUpload.model.js";
import { deleteFromCloudinary } from "./cloudinary.js";

cron.schedule("0 3 * * *", async () => {
  console.log("Running cleanup job for unused temp uploads...");

  const oldImages = await tempUpload.find({
    isUsed: false,
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  for (let img of oldImages) {
    try {
      await deleteFromCloudinary(img.publicId);
      await img.deleteOne();
    } catch (err) {
      console.error("Cleanup error:", err.message);
    }
  }

  console.log("Cleanup finished.");

  // if projects goes in production and has power to make a big gaint
  
});