// OrderConfirmation.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import { clearCart } from "../redux/slices/cartSlice";

const OrderConfirmation = () => {
    const { state } = useLocation(); // { orderId }
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { orderDetails, loading, error } = useSelector((s) => s.orders);

    useEffect(() => {
        if (!state?.orderId) {
            navigate("/my-orders", { replace: true });
            return;
        }
        dispatch(fetchOrderDetails(state.orderId));
        dispatch(clearCart());
    }, [dispatch, state, navigate]);

    if (!state?.orderId) return null;
    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center">Error: {error}</p>;
    if (!orderDetails) return null;

    const calculateEstimatedDelivery = (createdAt) => {
        const d = new Date(createdAt);
        d.setDate(d.getDate() + 6);
        return d.toLocaleDateString();
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white">
            <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
                Thank You for Your Order!
            </h1>

            <div className="p-6 rounded-lg border">
                <div className="flex flex-col md:flex-row md:justify-between mb-20">
                    <div className="mb-2 md:mb-0">
                        <h2 className="text-xl font-semibold">Order ID: {orderDetails._id}</h2>
                        <p className="text-gray-500">
                            Order date: {new Date(orderDetails.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-emerald-700 text-sm">
                            Estimated Delivery: {calculateEstimatedDelivery(orderDetails.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="mb-20">
                    {orderDetails.orderItems.map((item) => (
                        <div key={item.productId} className="flex items-center mb-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                            <div>
                                <h4 className="text-md font-semibold">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.color} | {item.size}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-sm text-gray-600 whitespace-nowrap">Quantity: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Payment</h4>
                        <p className="text-gray-600">{orderDetails.paymentMethod || "N/A"}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Delivery</h4>
                        <p className="text-gray-600">{orderDetails.shippingAddress.address}</p>
                        <p className="text-gray-600">
                            {orderDetails.shippingAddress.district}, {orderDetails.shippingAddress.state}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
