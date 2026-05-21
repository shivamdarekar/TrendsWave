import { Link } from "react-router-dom";
import Spinner from "../Common/Spinner";

const ProductGrid = ({ products, loading, error }) => {

  if (loading) return <Spinner />;

  if (error) {
    return <p className="text-center">Error: {error}</p>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
      {products.map((product, index) => (
        <Link key={index} to={`/product/${product._id}`} className="block">
          <div className="bg-white rounded-lg p-3">
            <div className="w-full aspect-[3/4] relative mb-3">
              <img
                src={product.images[0].url}
                alt={product.images[0]?.altText || product.name}
                loading="lazy"
                className="w-full h-full object-cover rounded-lg"
              />
              {/* Overlay for Name & Price */}
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 sm:p-3 rounded-b-lg">
                <h3 className="text-xs sm:text-sm font-semibold truncate">{product.name}</h3>
                <p className="text-[10px] sm:text-xs font-medium">
                  ₹ {(product.discountPrice ?? product.price)}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
