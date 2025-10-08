import { configureStore } from "@reduxjs/toolkit"; //help to create redux store to manage state
import authReducer from "./slices/authSlice.js";
import productReducer from "./slices/productsSlice.js";
import cartReducer from "./slices/cartSlice.js"
import checkoutReducer from "./slices/checkoutSlice.js"
import orderReducer from "./slices/orderSlice.js"
import adminProductReducer from "./slices/adminProductSlice.js"
import adminOrderReducer from "./slices/adminOrderSlice.js";
import uploadReducer from "./slices/uploadSlice.js"
import healthReducer from "./slices/healthSlice.js"

const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
        orders: orderReducer,
        adminProducts: adminProductReducer,
        adminOrders: adminOrderReducer,
        upload: uploadReducer,
        health: healthReducer,
    }
});

export default store;
