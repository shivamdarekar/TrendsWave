import express from "express";
import { Subscriber } from "../models/subscribe.model.js";

const router = express.Router();

//handle newsletter subscription
router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        //check the email is already subscribed
        const subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            return res.status(400).json({ message: "email is already subscribed" });
        }

        //Create a new subscriber
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        return res.status(201).json({ message: "Successfully subscribe to the newsletter!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while Subscribing the newsletter" });
    }
});

export default router;