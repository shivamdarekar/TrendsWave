import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slices/checkoutSlice.js";
import axios from "axios";
import { getAllStates, getDistricts } from "india-state-district";

// helper to load Razorpay script once
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        const src = "https://checkout.razorpay.com/v1/checkout.js";
        if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const Checkout = () => {
    const navigate = useNavigate();
    const [checkoutId, setCheckoutId] = useState(null);
    const [rzpOrder, setRzpOrder] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false); // ADDED: Prevent double checkout

    const dispatch = useDispatch();
    const { cart, loading, error } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    // User's shipping info
    const [shippingAddress, setShippingAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        district: "",
        postalCode: "",
        country: "India",
        state: "",
        phone: "",
        shippingMethod: "Standard",
    });

    // Load states list on mount
    useEffect(() => {
        const stateList = getAllStates(); // returns array of { code, name }
        setStates(stateList);
    }, []);

    // Load districts when state changes
    useEffect(() => {
        if (shippingAddress.state) {
            const districtList = getDistricts(shippingAddress.state);
            setDistricts(districtList);
        } else {
            setDistricts([]);
        }
    }, [shippingAddress.state]);

    // Ensure cart is valid and user logged in
    useEffect(() => {
        if (!cart || !cart.products || cart.products.length === 0) {
            return navigate("/", { replace: true });
        }
        if (!user) {
            return navigate("/login", { replace: true });
        }
    }, [cart, navigate, user]);

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        
        // FIXED: Prevent multiple simultaneous checkout creations
        if (processing || isCreatingCheckout) {
            alert("Checkout already in progress");
            return;
        }

        setIsCreatingCheckout(true);
        setProcessing(true);
        
        try {
            if (cart && cart.products.length > 0) {
                const res = await dispatch(
                    createCheckout({
                        checkoutItems: cart.products,
                        shippingAddress,
                        paymentMethod: "Razorpay",
                        totalPrice: cart.totalPrice,
                    })
                );
                if (res.payload && res.payload._id) {
                    setCheckoutId(res.payload._id);

                    const { data } = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/razorpay/order`,
                        { checkoutId: res.payload._id },
                        { withCredentials: true }
                    );
                    setRzpOrder(data);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsCreatingCheckout(false);
            setProcessing(false);
        }
    };

    const handlePayWithRazorpay = async () => {
        setProcessing(true);
        const ok = await loadRazorpayScript();
        if (!ok) {
            alert("Failed to load Razorpay. Check your network.");
            setProcessing(false);
            return;
        }
        if (!rzpOrder) {
            alert("Payment order not ready. Please try again.");
            setProcessing(false);
            return;
        }

        const options = {
            key: rzpOrder.keyId,
            amount: rzpOrder.amount,      // in paise
            currency: rzpOrder.currency,  // "INR"
            name: "TrendsWave",
            description: "Order payment",
            order_id: rzpOrder.orderId,
            prefill: {
                name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                email: user?.email || "",
                contact: shippingAddress.phone || "",
            },
            notes: { checkoutId },
            theme: { color: "#000000" },

            handler: async function (response) {
                // Verify on backend
                try {
                    const verifyRes = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/razorpay/verify`,
                        {
                            checkoutId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                        { withCredentials: true }
                    );

                    //Finalize -> creates Order in your DB
                    if (verifyRes.data.success) {
                        const finalizeRes = await axios.post(
                            `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
                            {},
                            { withCredentials: true }
                        );

                        if (finalizeRes.status === 201) {
                            // pass orderId to confirmation page; it will fetch fresh data by ID
                            navigate("/order-confirmation", {
                                replace: true,
                                state: { orderId: finalizeRes.data.order._id },
                            });
                        } else {
                            alert("There was an issue confirming your order.");
                        }
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                } catch (err) {
                    console.error(err);
                    alert("Payment verification failed.");
                } finally {
                    setProcessing(false);
                }
            },

            modal: {
                ondismiss: function () {
                    // User closed popup
                    console.log("Payment popup closed");
                    setProcessing(false);
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };


    if (loading) return <p>Loading Cart...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!cart?.products?.length) return <p>Your cart is empty</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
            {/* Left section */}
            <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl mb-6 uppercase">Checkout</h2>
                <form onSubmit={handleCreateCheckout}>
                    {/* Email */}
                    <h3 className="text-lg mb-4">Contact Details</h3>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            className="w-full p-2 border rounded"
                            disabled
                        />
                    </div>

                    {/* Delivery */}
                    <h3 className="text-lg mb-4">Delivery</h3>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700">First Name</label>
                            <input
                                type="text"
                                value={shippingAddress.firstName}
                                onChange={(e) =>
                                    setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Last Name</label>
                            <input
                                type="text"
                                value={shippingAddress.lastName}
                                onChange={(e) =>
                                    setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Address</label>
                        <input
                            type="text"
                            value={shippingAddress.address}
                            onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, address: e.target.value })
                            }
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {/* Country (Fixed to India) */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Country</label>
                        <input
                            type="text"
                            value="India"
                            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                            disabled
                        />
                    </div>

                    {/* State Dropdown */}
                    <div className="mb-4">
                        <label className="block text-gray-700">State</label>
                        <select
                            value={shippingAddress.state}
                            onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, state: e.target.value, district: "" })
                            }
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Select State</option>
                            {states.map((s) => (
                                <option key={s.code} value={s.code}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* District Dropdown */}
                    <div className="mb-4">
                        <label className="block text-gray-700">District</label>
                        <select
                            value={shippingAddress.district}
                            onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, district: e.target.value })
                            }
                            className="w-full p-2 border rounded"
                            required
                            disabled={!shippingAddress.state}
                        >
                            <option value="">Select District</option>
                            {districts.map((d, idx) => (
                                <option key={idx} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Pin Code */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Pin Code</label>
                        <input
                            type="number"
                            value={shippingAddress.postalCode}
                            onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                            }
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Phone</label>
                        <input
                            type="number"
                            value={shippingAddress.phone}
                            onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, phone: e.target.value })
                            }
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {/* Shipping Method */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Shipping Method</label>
                        <select
                            value={shippingAddress.shippingMethod}
                            onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, shippingMethod: e.target.value })
                            }
                            className="w-full p-2 border rounded"
                        >
                            <option value="Standard">Standard</option>
                            <option value="Express">Express</option>
                        </select>
                    </div>

                    {/* Payment */}
                    <div className="mt-6">
                        {!checkoutId ? (
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-3 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing || isCreatingCheckout}
                            >
                                {processing || isCreatingCheckout ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    "Continue to Payment"
                                )}
                            </button>
                        ) : (
                            <div>
                                <h3 className="text-lg mb-4">Pay with Razorpay</h3>
                                <button
                                    type="button"
                                    onClick={handlePayWithRazorpay}
                                    className="w-full bg-black text-white py-3 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={processing || isCreatingCheckout}
                                >
                                    {processing || isCreatingCheckout ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Processing Payment...</span>
                                        </div>
                                    ) : (
                                        "Pay Now"
                                    )}
                                </button>
                            </div>
                        )}

                    </div>
                </form>
            </div>

            {/* Right Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg mb-4">Order Summary</h3>
                <div className="border-t py-4 mb-4">
                    {cart.products.map((product, index) => (
                        <div
                            key={index}
                            className="flex items-start justify-between py-2 border-b"
                        >
                            <div className="flex items-start">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-20 h-24 object-cover mr-4 rounded-md"
                                />
                                <div>
                                    <h3 className="text-md">{product.name}</h3>
                                    <p className="text-gray-500">Size: {product.size}</p>
                                    <p className="text-gray-500">Color: {product.color}</p>
                                </div>
                            </div>
                            <div>
                                <p className="md:text-xl ">
                                    ₹{(product.discountPrice ?? product.price)}
                                </p>
                                <p className="text-gray-600 py-1">Quantity: {product.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center text-lg mb-4">
                    <p>Subtotal</p>
                    <p>₹{cart.totalPrice?.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center text-lg">
                    <p>Shipping</p>
                    <p>Free</p>
                </div>
                <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
                    <p>Total</p>
                    <p>₹{cart.totalPrice?.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
