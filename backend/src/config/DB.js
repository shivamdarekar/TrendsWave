import mongoose from "mongoose";

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connected successfully !");
    } catch (error) {
        console.error("MongoDB connection failed..");
        process.exit(1);
    }
};

export default connectdb;