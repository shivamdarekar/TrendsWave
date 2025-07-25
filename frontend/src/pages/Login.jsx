import { useState,useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom";
import login from "../assets/login.webp"
import { loginUser } from "../redux/slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, mergeCart } from "../redux/slices/cartSlice.js";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();  //Stops the page from refreshing when the form is submitted.
        setLoginError("");
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            return;
        } else {
            setPasswordError("");
        }
        try {
            const result = await dispatch(loginUser({ email, password })).unwrap();
            // Fetch cart for the logged-in user
            if (result && result._id) {
                dispatch(fetchCart({ userId: result._id, guestId }))
            }
        } catch {
            setLoginError("Invalid email or password.");
        }
    }

    // The loginUser thunk makes a POST request to your backend. The backend verifies credentials.
    //It sends the user's email and password to the backend API using axios.post.
    // If successful:
    // It sends back user data and sets cookies. Your Redux state (state.auth.user) gets updated with that user info.
    // If failed:
    // Redux sets an error state, which you can display using a toast or message.

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
                        Enter your username and password to Login
                    </p>

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

                    {loginError && (
                        <p className="text-red-500 text-sm mb-2">{loginError}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                        {loading ? "Loading..." : "Sign In"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/seller/register")}
                        className="w-full mt-4 text-purple-600 font-semibold text-sm hover:underline"
                    >
                        Want to sell on TrendsWave? Become a Seller
                    </button>

                    <p className="mt-6 text-center text-sm">
                        Don't have an account? {""}
                        <Link
                            to={`/register?redirect=${encodeURIComponent(redirect)}`}
                            className="text-blue-500"
                        >
                            Register
                        </Link>
                    </p>
                </form>
            </div>

            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img
                        src={login}
                        alt="Login to Account"
                        className="h-[700px] w-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

export default Login