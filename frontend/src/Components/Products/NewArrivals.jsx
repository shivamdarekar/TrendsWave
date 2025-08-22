import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const NewArrivals = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );
        setNewArrivals(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNewArrivals();
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section className="relative py-7 px-4 lg:px-6">
      {/* Title & Subtitle */}
      <div className="container mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Explore New Arrivals
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>
      </div>

      {/* Carousel Section */}
      <div className="relative">
        {/* Left Button */}
        <button
          onClick={scrollLeft}
          className="absolute top-1/2 -translate-y-1/2 left-2 p-2 rounded-full shadow bg-white text-black z-10"
        >
          <FiChevronLeft className="text-2xl" />
        </button>

        {/* Right Button */}
        <button
          onClick={scrollRight}
          className="absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-full shadow bg-white text-black z-10"
        >
          <FiChevronRight className="text-2xl" />
        </button>

        {/* Scrollable Products */}
        <div
          ref={scrollRef}
          className="container mx-auto overflow-x-scroll scrollbar-hide flex space-x-6 scroll-smooth"
        >
          {newArrivals.map((product) => (
            <div
              key={product._id}
              className="min-w-[90%] sm:min-w-[50%] lg:min-w-[28%] relative overflow-hidden shadow-lg bg-white group rounded-lg"
            >
              <img
                src={product.images[0]?.url}
                alt={product.images[0]?.altText || product.name}
                className="w-full h-[400px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                draggable="false"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white p-4">
                <Link to={`/product/${product._id}`} className="block">
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="mt-1">
                    ₹
                    {product.discountPrice
                      ? product.discountPrice
                      : product.price}
                  </p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
