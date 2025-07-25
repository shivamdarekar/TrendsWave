import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../redux/slices/authSlice.js';
import { useDispatch, useSelector } from 'react-redux';

const SellerRegister = () => {
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        // Clear field-specific errors when user starts typing
        if (e.target.name === "email") setEmailError("");
        if (e.target.name === "password") setPasswordError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password } = formData;

        // Validate password length
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            return;
        }

        setPasswordError("");
        setEmailError("");

        try {
            await dispatch(registerUser({ name, email, password, role: "admin" })).unwrap();
            navigate("/");
        } catch (error) {
            console.error("Registration failed:", error);

            // Handle known error cases
            if (error.message?.toLowerCase().includes("user already exists")) {
                setEmailError("This email is already registered. Please login or use another.");
            } else {
                setEmailError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row items-center justify-center px-4 py-10">
            {/* Info Section */}
            <div className="w-full md:w-1/2 max-w-md mb-10 md:mb-0 md:mr-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Sell on TrendsWave</h1>
                <p className="text-gray-600 mb-4">
                    Join our growing network of sellers and start showcasing your products to thousands of daily visitors.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Reach a wider audience across India</li>
                    <li>Easy product management dashboard</li>
                    <li>Get real-time order tracking & payments</li>
                    <li>24/7 support from our seller team</li>
                </ul>
            </div>

            {/* Seller Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full md:w-1/2 max-w-md bg-white p-8 rounded-lg border shadow-lg"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Become a Seller</h2>
                <p className="text-center mb-6 text-gray-600">Enter your details to register</p>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your name"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your email address"
                        required
                    />
                    {emailError && (
                        <p className="text-red-500 text-sm mt-2">{emailError}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your password"
                        required
                    />
                    {passwordError && (
                        <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                    {loading ? "Loading..." : "Register as Seller"}
                </button>

                <p className="mt-6 text-center text-sm">
                    Already registered?{" "}
                    <Link to="/login" className="text-blue-500">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default SellerRegister;
