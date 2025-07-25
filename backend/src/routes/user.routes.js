import express from "express"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ⚠️ allow role only for trusted registration
        const userRole = ["admin", "customer"].includes(role) ? role : "customer";

        user = new User({ name, email, password, role: userRole });
        await user.save();

        const payload = { user: { id: user._id, role: user.role } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "40h" },
            (err, token) => {
                if (err) throw err;

                res.status(201).json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    token,
                });
            }
        );
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});



router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        //find user by email
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        //create jwt payload
        const payload = { user: { id: user._id, role: user.role } };

        //signin and return the token along with user data
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "40h" },
            (err, token) => {
                if (err) throw err;
                
                //send the user and token in res
                res.json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    token,
                })
            }
        )

    } catch (error) {
        console.error(error)
        return res.status(500).send("Server Error..")
    }
});


router.get("/profile", protect, async (req, res) => {
    return res.json(req.user);
})

export default router;