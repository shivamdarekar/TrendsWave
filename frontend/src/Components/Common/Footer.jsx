import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";
import { TbBrandMeta } from "react-icons/tb";
import { FiPhoneCall } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="border-t border-gray-300 py-11">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-7 px-4 lg:px-0">
                
                {/* Newsletter Section */}
                <div>
                    <h3 className="text-lg text-gray-800 mb-4">Newsletter</h3>
                    <p className="text-gray-600 mb-4">
                        Be the first to hear about new products, exclusive events, and online offers.
                    </p>
                    <p className="font-medium text-sm text-gray-600 mb-6">
                        Sign up and get 10% off on your first order.
                    </p>

                    {/* Newsletter Form */}
                    <form className="flex">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="p-3 w-full text-sm border border-gray-400 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>

                {/* Shop Links */}
                <div>
                    <h3 className="text-lg text-gray-800 mb-4">Shop</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>
                            <Link to="/collections/all?gender=Men&category=Top Wear" className="hover:text-gray-500 transition-colors">
                                Men's Top Wear
                            </Link>
                        </li>
                        <li>
                            <Link to="/collections/all?gender=Women&category=Top Wear" className="hover:text-gray-500 transition-colors">
                                Women's Top Wear
                            </Link>
                        </li>
                        <li>
                            <Link to="/collections/all?gender=Men&category=Bottom Wear" className="hover:text-gray-500 transition-colors">
                                Men's Bottom Wear
                            </Link>
                        </li>
                        <li>
                            <Link to="/collections/all?gender=Women&category=Bottom Wear" className="hover:text-gray-500 transition-colors">
                                Women's Bottom Wear
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Support Links */}
                <div>
                    <h3 className="text-lg text-gray-800 mb-4">Support</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>
                            <Link to="#" className="hover:text-gray-500 transition-colors">
                                Contact us
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="hover:text-gray-500 transition-colors">
                                About us
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="hover:text-gray-500 transition-colors">
                                FAQs
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="hover:text-gray-500 transition-colors">
                                Features
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Follow Us Section */}
                <div>
                    <h3 className="text-lg text-gray-800 mb-4">Follow Us</h3>
                    <div className="flex items-center space-x-4 mb-6">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-500">
                            <TbBrandMeta className="h-5 w-5" />
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-500">
                            <IoLogoInstagram className="h-5 w-5" />
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-500">
                            <RiTwitterXLine className="h-5 w-5" />
                        </a>
                    </div>

                    {/* Contact Section */}
                    <p className="text-gray-600 font-medium">Call Us</p>
                    <p className="flex items-center space-x-2 text-gray-700 mt-1">
                        <FiPhoneCall className="h-4 w-4" />
                        <span>0123-456-789</span>
                    </p>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="container mx-auto mt-12 px-4 lg:px-0 border-t border-gray-300 pt-6">
                <p className="text-gray-500 text-sm tracking-tighter text-center">
                    © 2025, CompileTab. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
