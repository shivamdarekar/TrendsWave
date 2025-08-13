import { FaBoxOpen, FaClipboardList, FaSignOutAlt, FaStore, FaPlusCircle   } from 'react-icons/fa'
import { useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/slices/cartSlice';
import { logoutUser } from '../../redux/slices/authSlice';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
        dispatch(clearCart());
        navigate("/")
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link to="/admin" className="text-2xl font-medium">
                    TrendsWave
                </Link>
            </div>
            <h2 className="text-xl font-medium mb-6 text-center">Admin Dashboard</h2>

            <nav className="flex flex-col space-y-2">
                <NavLink
                    to="/admin/addProduct"
                    className={({ isActive }) => 
                        isActive
                            ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                    }
                >
                    <FaPlusCircle   />
                    <span>Add Product</span>
                </NavLink>

                {/* NavLink ek special version hota hai Link ka (React Router se).
                Link kya karta hai? — Page change karta hai without reload.
                NavLink kya extra karta hai? —
                Woh automatically batata hai kaunsa page active (open) hai aur us link ko highlight karta hai.*/ }

                {/* issmai kya hoga jab user products wale option pe click karga aur cuurent page url and to="" wala url match hoga
                tab isactive = true hoga then products wale option pe bg-gray rahega and baaki saare option pe hover rahega  */}

                <NavLink
                    to="/admin/allProducts"
                    className={({ isActive }) => 
                        isActive
                            ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                    }
                >
                    <FaBoxOpen />
                    <span>Manage Products</span>
                </NavLink>

                <NavLink
                    to="/admin/orders"
                    className={({ isActive }) => 
                        isActive
                            ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                    }
                >
                    <FaClipboardList />
                    <span>Orders</span>
                </NavLink>

                <NavLink
                    to="/"
                    className={({ isActive }) => 
                        isActive
                            ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
                    }
                >
                    <FaStore />
                    <span>Shop</span>
                </NavLink>
            </nav>

            <div className='mt-6'>
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default AdminSidebar
