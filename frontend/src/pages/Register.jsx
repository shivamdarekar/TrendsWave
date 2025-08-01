import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import register from "../assets/register.webp"
import { registerUser } from '../redux/slices/authSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { mergeCart } from '../redux/slices/cartSlice.js';

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();  //Ye hook current URL ke baare me info deta hai, including search parameters, pathname etc.
    const { user, guestId, loading } = useSelector((state) => state.auth);
    const { cart } = useSelector((state) => state.cart);

    //Get redirect parameter and check if it's checkout or something else
    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    const isCheckoutRedirect = redirect.includes("checkout");

    useEffect(() => {
        if (user) {
            if (cart?.products.length > 0 && guestId) {
                dispatch(mergeCart({ guestId, user })).then(() => {
                    navigate(isCheckoutRedirect ? "/checkout" : "/");
                });
            } else {
                navigate(isCheckoutRedirect ? "/checkout" : "/");
            }
        }
    }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);


    const handleSubmit = async (e) => {   //e.preventDefault() prevents page reload
        e.preventDefault();
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            return;
        } 
        
        setPasswordError("");
        setEmailError("");

        try {
            await dispatch(registerUser({ name, email, password })).unwrap();
        } catch (error) {
            console.error("Registration failed:", error);

            // Handle known error cases
            if (error.message?.toLowerCase().includes("user already exists")) {
                setEmailError("This email is already registered. Please login or use another.");
            } else {
                setEmailError("Registration failed. Please try again.");
            }
        }
    }

    return (
        <div className="flex">
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md bg-white p-8 rounded-lg border shadow-lg" >
                    <div className="flex justify-center mb-6">
                        <h2 className="text-xl font-semibold tracking-wide text-black font-serif">
                            Trends<span className="text-gray-700 italic font-light">Wave</span>
                        </h2>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Hey there! 👋
                    </h2>
                    <p className="text-center mb-6">
                        Enter your details to Register
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter your email address"
                            required
                        />
                        {emailError && (
                        <p className="text-red-500 text-sm mt-2">{emailError}</p>
                    )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? "Loading..." : "Sign Up"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/seller/register")}
                        className="w-full mt-4 text-purple-600 font-semibold text-sm hover:underline"
                    >
                        Want to sell on TrendsWave? Become a Seller
                    </button>


                    <p className="mt-6 text-center text-sm">
                        Already registered? {""}
                        <Link
                            to={`/login?redirect=${encodeURIComponent(redirect)}`}
                            className="text-blue-500"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>

            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img
                        src={register}
                        alt="Login to Account"
                        className="h-[700px] w-full object-cover"
                    />
                </div>
            </div>
        </div>
    )

}

export default Register