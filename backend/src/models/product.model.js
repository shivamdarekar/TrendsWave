import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default:null
    },

    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },

    sku: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
    },

    sizes: {
      type: [String],
      required: true,
    },

    colors: {
      type: [String],
      required: true,
    },

    collections: {
      type: String,
      required: true,
    },

    material: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        altText: {
          type: String,
        },
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    tags: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    metaTitle: {
      type: String,
    },

    metaDescription: {
      type: String,
    },

    metaKeyword: {
      type: String,
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: Number,
  },
  { timestamps: true }
);

productSchema.index({ gender: 1, category: 1 });
productSchema.index({ collections: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ brand: 1 });
productSchema.index({ material: 1 });
productSchema.index({ name: 1 });
productSchema.index({ owner: 1 });

export const Product = mongoose.model("Product", productSchema);
