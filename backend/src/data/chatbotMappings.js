export const chatbotColorMappings = [
  { canonical: "red", aliases: ["red", "maroon", "crimson", "burgundy"] },
  { canonical: "blue", aliases: ["blue", "navy", "indigo", "sky blue"] },
  { canonical: "black", aliases: ["black"] },
  { canonical: "white", aliases: ["white", "off white", "ivory"] },
  { canonical: "gray", aliases: ["gray", "grey", "charcoal"] },
  { canonical: "green", aliases: ["green", "olive", "mint"] },
  { canonical: "yellow", aliases: ["yellow", "mustard"] },
  { canonical: "pink", aliases: ["pink", "rose"] },
  { canonical: "brown", aliases: ["brown", "beige", "tan"] },
];

export const chatbotCategoryMappings = [
  {
    canonical: "Top Wear",
    aliases: ["shirt", "t-shirt", "tee", "top", "hoodie", "jacket", "tshirt"],
  },
  {
    canonical: "Bottom Wear",
    aliases: ["jeans", "denim", "pant", "pants", "trouser", "trousers", "bottom", "shorts", "skirt"],
  },
  {
    canonical: "Footwear",
    aliases: ["shoe", "shoes", "sneaker", "sneakers", "footwear", "boot", "boots", "sandals", "slipper"],
  },
  {
    canonical: "Accessories",
    aliases: ["bag", "watch", "belt", "cap", "sunglasses", "accessory", "accessories"],
  },
];

export const chatbotCollectionMappings = [
  {
    canonical: "Casual Wear",
    aliases: ["casual", "everyday", "daily", "day out", "weekend", "relaxed", "informal"],
  },
  {
    canonical: "Formal Wear",
    aliases: ["formal", "occasion", "occasional", "party", "wedding", "ceremony", "event", "dressy"],
  },
  {
    canonical: "Business Wear",
    aliases: ["office", "work", "professional", "corporate", "meeting", "business"],
  },
  {
    canonical: "Vacation Wear",
    aliases: ["summer", "vacation", "holiday", "beach", "travel", "resort", "hot weather"],
  },
  {
    canonical: "Winter Essentials",
    aliases: ["winter", "cold", "cool weather", "layering", "thermal", "autumn", "fall"],
  },
  {
    canonical: "Streetwear",
    aliases: ["streetwear", "street style", "urban", "trend", "trendy", "casual street"],
  },
  {
    canonical: "Basics",
    aliases: ["basic", "basics", "plain", "simple", "everyday basic"],
  },
];

export const chatbotQueryLimits = {
  defaultLimit: 4,
  maxLimit: 6,
};
