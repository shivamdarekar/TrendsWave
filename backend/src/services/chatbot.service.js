import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from "../models/product.model.js";
import {
  buildLocalPlan,
  buildMongoQuery,
  buildSort,
  clampLimit,
  formatAnswer,
  getProjectedProduct,
  parseGeminiJson,
} from "./chatbot/chatbot.intent.js";

async function extractPlanWithGemini(message, context = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!apiKey) {
    return buildLocalPlan(message, context);
  }

  const prompt = [
    "You are an ecommerce intent parser.",
    "Return only valid JSON with these keys: intent, filters, needsFollowUp, followUpQuestion, search.",
    "Allowed intents: availability, recommendation, search.",
    "filters can include category, colors, gender, brand, material, size, collection, minPrice, maxPrice.",
    "Use concise lowercase values where possible, but preserve product category names like Top Wear or Bottom Wear.",
    "If the user asks a style question but the reference product is unclear, set needsFollowUp=true.",
    `User message: ${message}`,
    `Context JSON: ${JSON.stringify(context)}`,
  ].join("\n");

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });
  const result = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
    },
  });

  const text = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini response was empty");
  }

  const parsed = parseGeminiJson(text);

  return {
    intent: parsed.intent || "search",
    filters: parsed.filters || {},
    search: parsed.search || message,
    needsFollowUp: Boolean(parsed.needsFollowUp),
    followUpQuestion: parsed.followUpQuestion || null,
  };
}

export async function buildChatResponse({ message, context = {}, limit }) {
  const normalizedMessage = String(message || "").trim();

  if (!normalizedMessage) {
    return {
      answer: "Please type what you are looking for.",
      intent: "search",
      products: [],
      needsFollowUp: false,
    };
  }

  let plan;
  try {
    plan = await extractPlanWithGemini(normalizedMessage, context);
  } catch (error) {
    plan = buildLocalPlan(normalizedMessage, context);
  }

  if (plan.needsFollowUp) {
    return {
      answer: plan.followUpQuestion,
      intent: plan.intent,
      products: [],
      needsFollowUp: true,
    };
  }

  const query = buildMongoQuery(plan);
  const fetchLimit = clampLimit(limit);

  const products = await Product.find(query)
    .select({
      name: 1,
      price: 1,
      discountPrice: 1,
      countInStock: 1,
      category: 1,
      brand: 1,
      gender: 1,
      colors: 1,
      sizes: 1,
      rating: 1,
      images: 1,
    })
    .sort(buildSort(plan))
    .limit(fetchLimit)
    .lean();

  const projectedProducts = products.map(getProjectedProduct);

  return {
    answer: formatAnswer(plan, projectedProducts),
    intent: plan.intent,
    products: projectedProducts,
    needsFollowUp: false,
  };
}
