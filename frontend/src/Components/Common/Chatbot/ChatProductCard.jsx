import { Link } from "react-router-dom";

const ChatProductCard = ({ product }) => {
  const price = product.discountPrice || product.price;

  return (
    <Link
      to={`/product/${product._id}`}
      className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
          <span>₹{price}</span>
          {product.discountPrice ? (
            <span className="line-through text-gray-400">₹{product.price}</span>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-gray-500">
          {product.category ? <span>{product.category}</span> : null}
          {product.brand ? <span>• {product.brand}</span> : null}
          {typeof product.countInStock === "number" ? <span>• {product.countInStock} in stock</span> : null}
        </div>
      </div>
    </Link>
  );
};

export default ChatProductCard;
