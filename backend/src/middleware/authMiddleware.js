import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

//middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")  //hum check kar rahe hain ki kya request ke header me token hai ya nahi.
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //Token ko verify karte hain using the secret key.
            // Agar token valid hai → decoded info milta hai (e.g., user id).

            req.user = await User.findById(decoded.user.id).select("-password") //exclude password
            next();

        } catch (error) {
            console.error("Token verification failed", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorize, no token provided" })
    }
};

//middleware to check if the user is an admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorize as a admin" })
    }
};

export { protect, admin };