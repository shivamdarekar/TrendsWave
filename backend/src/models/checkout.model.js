import mongoose from "mongoose";

const checkoutItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    name: {
        type: String,
        required: true
    },

    image: {
        type: String, //url
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    discountPrice: {
        type: Number,
    },


    quantity: {
        type: Number,
        required: true
    },
    size: String,
    color: String,

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required:true
    }
},
    { _id: false }
);

const checkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    checkoutItems: [checkoutItemSchema],

    shippingAddress: {
        address: { type: String, requires: true },
        state: { type: String, requires: true },
        district: { type: String, requires: true },
        postalCode: { type: String, requires: true },
        country: { type: String, requires: true },
    },

    paymentMethod: {
        type: String,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    paidAt: {
        type: Date,
    },

    paymentStatus: {
        type: String,
        default: "pending"
    },

    paymentDetails: {
        type: mongoose.Schema.Types.Mixed, //store payment related details(transaction ID, paypal response)
    },

    isFinalized: {
        type: Boolean,
        default: false
    },

    finalizeAt: {
        type: Date,
    },
},
    { timestamps: true }
);

export const Checkout = mongoose.model("Checkout", checkoutSchema);