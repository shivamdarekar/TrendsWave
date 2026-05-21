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

export const chatbotQueryLimits = {
  defaultLimit: 4,
  maxLimit: 6,
};
