import mongoose, { mongo } from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    image: {
        type: String, //clodinary url
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    size: String,
    color: String,

    quantity: {
        type: Number,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required:true
    }
},
    { _id: false }
);

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        shippingMethod: { type: String, required: true, default: "Standard" },
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
        type: Date
    },

    isDelivered: {
        type: Boolean,
        default: false
    },

    deliveredAt: {
        type: Date
    },

    paymentStatus: {
        type: String,
        default: "pending"
    },

    paymentDetails: {
           type: mongoose.Schema.Types.Mixed, //store payment related details(transaction ID, paypal response)
       },

    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default:"Processing"
    },
    //enum ka matlab kuch specific values hi allow hongi
},
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);