import { Link } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import { useState } from 'react';
import {
    HiOutlineUser,
    HiOutlineShoppingBag,
    HiBars3BottomRight
} from "react-icons/hi2";
import CartDrawer from '../Layout/CartDrawer.jsx';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [navDrawerOpen, setNavDrawerOpen] = useState(false)

    const { cart } = useSelector((state) => state.cart);

    const cartItemCount =
        cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;

    const toggleCartDrawer = () => {
        setDrawerOpen(!drawerOpen)
    };

    const toggleNavDrawer = () => {
        setNavDrawerOpen(!navDrawerOpen)
    }

    const { user } = useSelector((state) => state.auth);

    return (
        <>
            {/* The `gap-4` class was added here to ensure spacing on mobile */}
            <nav className="container mx-auto flex items-center justify-between gap-4 py-4 px-6">

                {/* left-logo */}
                <div>
                    <Link to="/" className=" text-xl sm:text-2xl font-medium md:mr-auto mr-4 traking- ">
                        TrendsWave
                    </Link>
                </div>

                {/* center - navigation links */}
                <div className='hidden md:flex space-x-6'>
                    <Link
                        to="collections/all?gender=Men"
                        className='text-gray-700 hover:text-black text-sm font-semibold uppercase'
                    >
                        Men
                    </Link>

                    <Link
                        to="collections/all?gender=Women"
                        className='text-gray-700 hover:text-black text-sm font-semibold uppercase'>
                        Women
                    </Link>

                    <Link
                        to="collections/all?category=Top Wear"
                        className='text-gray-700 hover:text-black text-sm font-semibold uppercase'>
                        Top Wear
                    </Link>

                    <Link
                        to="collections/all?category=Bottom Wear"
                        className='text-gray-700 hover:text-black text-sm font-semibold uppercase'
                    >
                        Bottom Wear
                    </Link>
                </div>

                {/* Right-icons */}
                <div className='flex items-center  gap-3 sm:gap-4'>
                    {user && user.role === "admin" && (
                        <Link to="/admin" className="block bg-black px-2 rounded text-sm text-white ">
                            Admin
                        </Link>
                    )}

                    <Link to="/profile" className='hover:text-black'>
                        <HiOutlineUser className='h-6 w-6 text-gray-7000' />
                    </Link>

                    <button
                        onClick={toggleCartDrawer}
                        className='relative hover:text-black' >
                        <HiOutlineShoppingBag className='h-6 w-6 text-gray-800' />
                        {cartItemCount > 0 && (
                            <span className='absolute -top-1 bg-rabbit-red text-white text-xs rounded-full px-2 py-0.5'>
                                {cartItemCount}
                            </span>)}
                    </button>

                    {/* search */}
                    <div className='overflow-hidden'>
                        <SearchBar />
                    </div>

                    <button onClick={toggleNavDrawer} className='md:hidden'>
                        <HiBars3BottomRight className='h-6 w-6 text-gray-700' />
                    </button>
                </div>

            </nav>
            <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

            {/* Mobile Navigation */}
            <div className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform
                         transition-transform duration-300 z-50 ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex justify-end p-4">
                    <button onClick={toggleNavDrawer}>
                        <IoMdClose className="h-6 w-6 text-gray-700" />
                    </button>
                </div>

                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Menu</h2>
                    <nav className="space-y-4">
                        <Link
                            to="collections/all?gender=Men"
                            onClick={toggleNavDrawer}
                            className="block text-gray-700 hover:text-black"
                        >
                            Men
                        </Link>

                        <Link
                            to="collections/all?gender=Women"
                            onClick={toggleNavDrawer}
                            className="block text-gray-700 hover:text-black"
                        >
                            Women
                        </Link>

                        <Link
                            to="collections/all?category=Top Wear"
                            onClick={toggleNavDrawer}
                            className="block text-gray-700 hover:text-black"
                        >
                            Top Wear
                        </Link>

                        <Link
                            to="collections/all?category=Bottom Wear"
                            onClick={toggleNavDrawer}
                            className="block text-gray-700 hover:text-black"
                        >
                            Bottom Wear
                        </Link>
                    </nav>
                </div>
            </div>

        </>
    )
}

export default Navbar;
