import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const NewArrivals = () => {
  // const newArrivals = [
  //   {
  //     _id: "1",
  //     name: "Stylish Jacket",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=1",
  //         altText: "Stylish Jacket",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "2",
  //     name: "Trendy Hoodie",
  //     price: 150,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=2",
  //         altText: "Trendy Hoodie",
  //       },
  //     ],
  //   },
  // ];

  const [newArrivals, setNewArrivals] = useState([]);

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
    fetchNewArrivals()
  }, []);

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" }); // moves the content left.
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" }); // moves the content right.
  };

  return (
    <section className="relative py-7 px-4 lg:px-6">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Explore New Arrivals
        </h2>
        <p className="text-lg text-gray-600 mb-8 ">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>

        {/* Scroll Buttons */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2 ">
          <button
            onClick={scrollLeft}
            className="p-2 rounded border bg-white text-black"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded border bg-white text-black"
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="container mx-auto overflow-x-scroll scrollbar-hide flex space-x-6 scroll-smooth"
      >
        {newArrivals.map((product) => (
          <div
            key={product._id}
            className="min-w-[90%] sm:min-w-[50%] lg:min-w-[28%] relative  overflow-hidden shadow-lg bg-white group"
          >
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.altText || product.name}
              className="w-full h-[400px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              draggable="false"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white p-4 ">
              <Link to={`/product/${product._id}`} className="block">
                <h4 className="font-semibold ">{product.name}</h4>
                <p className="mt-1 ">$ {product.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
