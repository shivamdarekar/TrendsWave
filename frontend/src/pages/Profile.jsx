import { useDispatch, useSelector } from "react-redux";
import MyOrdersPage from "./MyOrdersPage";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { clearCart } from "../redux/slices/cartSlice";
import { logoutUser } from "../redux/slices/authSlice";
import { clearOrders } from "../redux/slices/orderSlice";
import { Link } from "react-router-dom";

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const { orders } = useSelector((state) => state.orders)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logoutUser());
        dispatch(clearCart());
        dispatch(clearOrders());
        navigate("/login",{replace:true});
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow container mx-auto p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:space-x-6 space-y-6 md:space-y-0 w-full">

                    {/* Left section: User Info + Logout */}
                    <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6 ">
                        <h1 className="text-2xl md:text-3xl font-bold mb-4">
                            {user?.name}
                        </h1>
                        <p className="text-lg text-gray-600 mb-4">
                            {user?.email}
                        </p>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>

                        {user && user.role === "customer" && (
                            <button
                                type="button"
                                onClick={() => navigate("/seller/register")}
                                className="w-full mb-2 mt-6 text-purple-600 font-semibold hover:underline"
                            >
                                Become a Seller
                            </button>
                        )}

                    </div>

                    {/* Right section: My Orders */}
                    <div className="w-full md:w-2/3 lg:w-3/4">
                        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                            <MyOrdersPage limit={4} />

                            <div className="mt-4 text-center">
                                {orders.length > 4 && (
                                    <Link
                                        to="/my-orders"
                                        className="text-purple-600 font-semibold hover:underline"
                                    >
                                        View All Orders →
                                    </Link>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
