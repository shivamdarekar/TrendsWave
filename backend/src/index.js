//const express = require("express"); //common.js syntax not applicable in ES module 
//const cors = require("cors");
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./config/DB.js";

//cors => It is a security feature built into browsers that controls how websites from different domains can talk to each other.
//agar hamara frontend alag port pe hai & backend alag port pe to wo frontend api access karne ke liye cors use karte hai
//cors mai hum define karenge ki konse port se data accept karna hai. dusre aur kisi port se data ane pr error show karega.

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

const port = process.env.PORT || 3000;

//connect to DB
connectdb()

app.get("/", (req, res) => {
    res.send("welcome to our app")
});

//import routes
import userRoutes from "./routes/user.routes.js"
import productRoutes from "./routes/products.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import checkoutRoutes from "./routes/checkout.routes.js"
import orderRoutes from "./routes/order.routes.js"
import uploadRoutes from "./routes/upload.routes.js"
import subscribeRoutes from "./routes/subscribe.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import productAdminRoutes from "./routes/adminProductsRoutes.js"
import orderAdminRoutes from "./routes/adminOrderRoutes.js"


//setup routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", subscribeRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", orderAdminRoutes);


app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
    
})