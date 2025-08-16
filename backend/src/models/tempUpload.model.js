import mongoose from "mongoose";

const tempUploadSchema = new mongoose.Schema({

    url:
    {
        type: String,
        required: true
    },
    publicId:
    {
        type: String,
        required: true
    },
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isUsed:
    {
        type: Boolean,
        default: false
    },
    createdAt:
    {
        type: Date,
        default: Date.now,
        expires: 86400
    } // auto delete in 24h
});

export const tempUpload =  mongoose.model("tempUpload", tempUploadSchema);
