import { Link } from "react-router-dom";
import mensCollectionImage from "../../assets/mens-collection.webp";
import womensCollectionImage from "../../assets/womens-collection.webp";

const GenderCollectionSection = () => {
    return (
        <section className="py-16 px-4 lg:px-6">
            <div className="container mx-auto flex flex-col md:flex-row gap-6">

                {/* Women's Collection */}
                <div className="relative group flex-1 overflow-hidden rounded-xl">
                    <img
                        src={womensCollectionImage}
                        alt="Women's Collection"
                        // --- MODIFIED THIS LINE ---
                        className="w-full h-[400px] md:h-[550px] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                            Women's Collection
                        </h2>
                        <Link to="/collections/all?gender=Women" className="text-gray-700 font-medium underline">
                            Shop Now →
                        </Link>
                    </div>
                </div>

                {/* Men's Collection */}
                <div className="relative group flex-1 overflow-hidden rounded-xl">
                    <img
                        src={mensCollectionImage}
                        alt="Men's Collection"
                        className="w-full h-[400px] md:h-[550px] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                            Men's Collection
                        </h2>
                        <Link to="/collections/all?gender=Men" className="text-gray-700 font-medium underline">
                            Shop Now →
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default GenderCollectionSection;
