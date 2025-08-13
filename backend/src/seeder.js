import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./models/product.model.js";
import { User } from "./models/user.model.js";
import products from "./data/products.js";
import { Cart } from "./models/cart.model.js";
import { Checkout } from "./models/checkout.model.js";
import { Order } from "./models/order.model.js";

dotenv.config();

//connect to database
mongoose.connect(process.env.MONGODB_URI);

//function to seed data

const seedData = async () => {
    try {
        //clear existing data
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();
        await Order.deleteMany();
        await Checkout.deleteMany();


        //create a default admin user
        const createdUser = await User.create({
            name: "Admin user",
            email: "admin@example.com",
            password: "123456",
            role: "admin"
        });

        //assign the default user ID to each product
        const userID = createdUser._id;

        const sampleProducts = products.map((product) => {
            return { ...product, owner:userID }
        });

        //insert the product data in databse
        await Product.insertMany(sampleProducts);

        console.log("Product data seeded successfully");
        process.exit();  //existed successfully

    } catch (error) {
        console.error("Error while seeding the data",error);
        process.exit(1); //exit with error
        
    }
}

seedData();