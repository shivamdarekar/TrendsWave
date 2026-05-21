import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    name: String,
    image: String,
    price: Number,
    discountPrice: Number,
    size: String,
    color: String,

    quantity: {
        type: Number,
        default: 1,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required:true
    }
},
    { _id: false }
);


const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    guestId: {
        type: String
    },

    products: [cartItemSchema],

    totalPrice: {
        type: Number,
        required: true,
        default:0,
    },
},
    {timestamps:true}
);

cartSchema.index({ user: 1 });
cartSchema.index({ guestId: 1 });

export const Cart = mongoose.model("Cart",cartSchema)


