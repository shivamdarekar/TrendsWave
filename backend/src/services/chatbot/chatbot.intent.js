import {
  chatbotCategoryMappings,
  chatbotColorMappings,
  chatbotQueryLimits,
} from "../../data/chatbotMappings.js";

function clampLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return chatbotQueryLimits.defaultLimit;
  }

  return Math.min(parsed, chatbotQueryLimits.maxLimit);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectColor(message) {
  const normalized = message.toLowerCase();

  for (const mapping of chatbotColorMappings) {
    if (mapping.aliases.some((alias) => normalized.includes(alias))) {
      return mapping.canonical;
    }
  }

  return null;
}

function detectCategory(message) {
  const normalized = message.toLowerCase();

  for (const mapping of chatbotCategoryMappings) {
    if (mapping.aliases.some((alias) => normalized.includes(alias))) {
      return mapping.canonical;
    }
  }

  return null;
}

function detectGender(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes("women") || normalized.includes("woman") || normalized.includes("female")) {
    return "Women";
  }

  if (normalized.includes("men") || normalized.includes("man") || normalized.includes("male")) {
    return "Men";
  }

  return null;
}

function detectIntent(message) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("available") ||
    normalized.includes("do you have") ||
    normalized.includes("is there") ||
    normalized.includes("stock")
  ) {
    return "availability";
  }

  if (
    normalized.includes("look good") ||
    normalized.includes("go with") ||
    normalized.includes("match") ||
    normalized.includes("recommend") ||
    normalized.includes("style")
  ) {
    return "recommendation";
  }

  return "search";
}

function buildLocalPlan(message, context = {}) {
  const color = detectColor(message);
  const category = detectCategory(message);
  const gender = detectGender(message);
  const intent = detectIntent(message);
  const isStyleQuestion = intent === "recommendation" && /\b(this|that|these|those)\b/i.test(message);

  // pattern: "which <target> ... with <context>" -> target is what to retrieve (e.g. jeans),
  // context contains the item to match against (e.g. black shirt)
  const compatMatch = message.match(/\bwhich\s+([a-zA-Z0-9-]+)[\w\s]*\bwith\b\s+(.+?)(?:\s+for\s+|$)/i);

  const filters = {};

  // If the user asked "which <target> with <context>", prefer the explicit target as the
  // retrieval category and extract color from the context side (e.g. "black shirt").
  if (compatMatch) {
    const targetRaw = compatMatch[1].toLowerCase();
    const contextRaw = (compatMatch[2] || "").toLowerCase().trim();
    const targetCategory = detectCategory(targetRaw);
    const contextColor = detectColor(contextRaw);

    if (targetCategory) {
      filters.category = targetCategory;
    }

    if (contextColor) {
      // mark as context-derived color; buildMongoQuery will expand to compatible colors
      filters.contextColor = contextColor;
    }
  }

  // fallbacks: direct detections from full message
  if (color && !filters.contextColor && !filters.colors) {
    filters.colors = color;
  }

  if (category && !filters.category) {
    filters.category = category;
  }

  if (gender) {
    filters.gender = gender;
  }

  if (context.gender && !filters.gender) {
    filters.gender = context.gender;
  }

  if (context.category && !filters.category && intent === "recommendation") {
    filters.category = context.category;
  }

  if (context.colors?.length && !filters.colors && intent === "recommendation") {
    filters.colors = context.colors[0];
  }

  const needsFollowUp = intent === "recommendation" && !filters.category && !filters.colors && isStyleQuestion;

  return {
    intent,
    filters,
    search: message,
    needsFollowUp,
    followUpQuestion: needsFollowUp
      ? "Which jeans are you referring to? Share the color or a product link so I can match shirts properly."
      : null,
  };
}

function parseGeminiJson(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  const rawJson = fencedMatch ? fencedMatch[1] : trimmed;
  const firstBrace = rawJson.indexOf("{");
  const lastBrace = rawJson.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini did not return JSON");
  }

  return JSON.parse(rawJson.slice(firstBrace, lastBrace + 1));
}

function buildMongoQuery(plan) {
  const query = {};
  const filters = plan.filters || {};

  if (filters.category) {
    query.$or = [
      { category: new RegExp(`^${escapeRegex(filters.category)}$`, "i") },
      { category: new RegExp(escapeRegex(filters.category), "i") },
      { name: new RegExp(escapeRegex(filters.category), "i") },
      { description: new RegExp(escapeRegex(filters.category), "i") },
    ];
  }

  // Expand color matching: prefer explicit filters.colors; otherwise if a color was
  // derived from the context (filters.contextColor) expand to compatible colors.
  function colorsForCompatibility(color) {
    const map = {
      black: ["blue", "gray", "black", "white"],
      white: ["blue", "black", "khaki"],
      blue: ["black", "white", "gray"],
      gray: ["black", "blue"],
      brown: ["khaki", "blue"],
    };

    return map[color] || [color];
  }

  if (filters.colors) {
    query.colors = { $in: [new RegExp(`^${escapeRegex(filters.colors)}$`, "i")] };
  } else if (filters.contextColor) {
    const compatibles = colorsForCompatibility(filters.contextColor);
    query.colors = { $in: compatibles.map((c) => new RegExp(`^${escapeRegex(c)}$`, "i")) };
  }

  if (filters.gender) {
    query.gender = new RegExp(`^${escapeRegex(filters.gender)}$`, "i");
  }

  if (filters.brand) {
    query.brand = new RegExp(escapeRegex(filters.brand), "i");
  }

  if (filters.material) {
    query.material = new RegExp(escapeRegex(filters.material), "i");
  }

  if (filters.collection) {
    query.collections = new RegExp(escapeRegex(filters.collection), "i");
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) {
      query.price.$gte = Number(filters.minPrice);
    }
    if (filters.maxPrice) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  if (plan.search && !query.$or) {
    const search = escapeRegex(plan.search.trim());
    query.$or = [
      { name: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { category: new RegExp(search, "i") },
      { brand: new RegExp(search, "i") },
    ];
  }

  return query;
}

function buildSort(plan) {
  if (plan.intent === "availability") {
    return { countInStock: -1, rating: -1, createdAt: -1 };
  }

  if (plan.intent === "recommendation") {
    return { rating: -1, countInStock: -1, createdAt: -1 };
  }

  return { rating: -1, createdAt: -1 };
}

function formatAnswer(plan, products) {
  if (plan.needsFollowUp) {
    return plan.followUpQuestion;
  }

  if (!products.length) {
    if (plan.intent === "availability") {
      return "I could not find an exact match right now. Try a different color or category and I will check again.";
    }

    if (plan.intent === "recommendation") {
      return "I could not find a strong style match. Share the jeans color or a product link and I will narrow it down.";
    }

    return "I could not find a matching product. Try a shorter search or add a color/category.";
  }

  if (plan.intent === "availability") {
    return `Yes, I found ${products.length} matching product${products.length > 1 ? "s" : ""}.`;
  }

  if (plan.intent === "recommendation") {
    return `I found ${products.length} option${products.length > 1 ? "s" : ""} that should work well.`;
  }

  return `I found ${products.length} matching product${products.length > 1 ? "s" : ""}.`;
}

function getProjectedProduct(product) {
  return {
    _id: product._id,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    countInStock: product.countInStock,
    category: product.category,
    brand: product.brand,
    gender: product.gender,
    colors: product.colors,
    sizes: product.sizes,
    rating: product.rating,
    image: product.images?.[0]?.url || null,
  };
}

export {
  buildLocalPlan,
  buildMongoQuery,
  buildSort,
  clampLimit,
  formatAnswer,
  getProjectedProduct,
  parseGeminiJson,
};
