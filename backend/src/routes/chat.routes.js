import express from "express";
import { buildChatResponse } from "../services/chatbot.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, context, limit } = req.body || {};

    const result = await buildChatResponse({
      message,
      context,
      limit,
    });

    return res.json(result);
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({
      message: "Unable to process chat request right now.",
    });
  }
});

export default router;
