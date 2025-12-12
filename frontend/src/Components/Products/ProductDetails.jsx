import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetails, fetchSimilarProducts } from "../../redux/slices/productsSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import namer from "color-namer";


// const selectedProduct = {
//     name: "Stylish Jacket",
//     price: 100,
//     originalPrice: 150,
//     description: "This is a stylish jacket perfect for any occasion",
//     brand: "FashionBrand",
//     material: "Leather",
//     sizes: ["S", "M", "X", "XL"],
//     colors: ["Red", "Black"],
//     images: [
//         {
//             url: "https://picsum.photos/500/500?random=1",
//             altText: "Stylish Jacket 1",
//         },
//         {
//             url: "https://picsum.photos/500/500?random=2",
//             altText: "Stylish Jacket 2",
//         },
//         {
//             url:"https://picsum.photos/500/500?random=3"
//         }
//     ],
// };

// const similarProduct = [
//     {
//         _id: 1,
//         name: "Product 1",
//         price: 100,
//         images: [{ url: "https://picsum.photos/500/500?random=3" }],
//     },
// ];


// Helper: match entered color name to HEX (fallback: raw name)
const getColorHex = (colorName) => {
    // Will return closest match from the palettes
    if (!colorName) return null;
    const result = namer(colorName);
    return result ? result.html[0].hex : colorName;// e.g. "#000080" for "navy blue"
}

const ProductDetails = ({ productId }) => {

    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedProduct, loading, error, similarProduct } = useSelector(
        (state) => state.products
    );
    const { user, guestId } = useSelector((state) => state.auth);

    const [mainImage, setMainImage] = useState();
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isButtonDisabled, setIsButtonDisabled] = useState("");

    const productFetchId = productId || id;

    useEffect(() => {
        if (!productFetchId) {
            return navigate("/404")
        }
        dispatch(fetchProductDetails(productFetchId)).unwrap()
            .then(() => {
                dispatch(fetchSimilarProducts(productFetchId));
            })
            .catch((err) => {
                if (err.status === 404 || err.status === 500) {
                    return navigate("/404", { replace: true });
                }
            });

    }, [dispatch, productFetchId, navigate]);

    //if product has more than one images select 1st image as main image
    //use effect - Iska use tab hota hai jab page load hone ke baad kuch kaam karna ho (jaise default image set karna).

    useEffect(() => {
        if (selectedProduct?.images?.length > 0) {
            setMainImage(selectedProduct.images[0].url);
        }
    }, [selectedProduct]);

    //[selectedProduct] is a dependency → agar product change ho, to image bhi change ho jaye.


    //automatically update the mainImage state when selectedProduct changes.
    //Imagine selectedProduct represents a product that a user selects.
    //When a new product is selected, the effect automatically updates the main image.
    //Without this effect, the image might not change dynamically.


    const handleQuantitychange = (action) => {
        if (action === "plus" && quantity < selectedProduct.countInStock) {
            setQuantity((prev) => prev + 1);
        }
        if (action === "minus" && quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (!selectedColor || !selectedSize) {
            toast.error("Please select size and color before adding to cart.", {
                duration: 1000,
            });
            return
        }

        setIsButtonDisabled(true);

        dispatch(
            addToCart({
                productId: productFetchId,
                quantity,
                size: selectedSize,
                color: selectedColor,
                guestId,
                userId: user?._id,
            })
        ).then(() => {
            toast.success("Product added to cart!", {
                duration: 1000
            });
        })
            .finally(() => {
                setIsButtonDisabled(false);
            });
    };

    if (loading) {
        <p className="text-center">Loading...</p>
    }

    if (error) {
        <p className="text-center">Error: {error}</p>
    }

    return (
        <div className="sm:p-6">
            {selectedProduct && (
                <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg ">
                    <div className="flex flex-col md:flex-row">
                        {/* Left thumbnails */}
                        <div className="hidden md:flex flex-col space-y-4 mr-6">
                            {selectedProduct.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={image.altText || `Thumbnail ${index}`}
                                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition
                                    border ${mainImage === image.url ? "border-black" : "border-gray-300"
                                        }`}
                                    draggable="false"
                                    onClick={() => setMainImage(image.url)}
                                />
                            ))}
                        </div>

                        {/* Main image */}
                        <div className="md:w-1/2">
                            <div className="mb-4 ">
                                <img
                                    src={mainImage}
                                    alt="Main Product"
                                    className="w-full h-auto object-cover rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Mobile thumbnail */}
                        <div className="md:hidden flex overscroll-x-scroll space-x-4 mb-4">
                            {selectedProduct.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={image.altText || `Thumbnail ${index}`}
                                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition
                                    border ${mainImage === image.url ? "border-black" : "border-gray-300"}`}
                                    draggable="false"
                                    onClick={() => setMainImage(image.url)}
                                />
                            ))}
                        </div>

                        {/* Right side */}
                        <div className="md:w-1/2 md:ml-10">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                {selectedProduct.name}
                            </h1>

                            <div className="flex flex-wrap md:flex-row md:flex-nowrap items-baseline gap-x-2 gap-y-1 mb-2">
                                {selectedProduct.discountPrice &&
                                    selectedProduct.discountPrice < selectedProduct.price ? (
                                    <>
                                        {/* Discounted Price */}
                                        <p className="text-2xl font-semibold text-gray-900 whitespace-nowrap">
                                            ₹{selectedProduct.discountPrice.toLocaleString()}
                                        </p>

                                        {/* MRP */}
                                        <p className="text-base text-gray-500 line-through whitespace-nowrap">
                                            MRP ₹{selectedProduct.price.toLocaleString()}
                                        </p>

                                        {/* Discount % */}
                                        <span className="text-base font-semibold text-orange-500 whitespace-nowrap">
                                            ({Math.round(
                                                ((selectedProduct.price - selectedProduct.discountPrice) / selectedProduct.price) * 100
                                            )}% OFF)
                                        </span>
                                    </>
                                ) : (
                                    <p className="text-2xl font-semibold text-gray-900 whitespace-nowrap">
                                        ₹{selectedProduct.price.toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {/* Optional: Taxes note */}
                            <p className="text-sm text-green-600 mb-2">inclusive of all taxes</p>

                            {/* Stock Status - ADDED: Shows availability and low stock warning */}
                            <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                {selectedProduct.countInStock > 0 ? (
                                    <>
                                        <p className="text-sm font-semibold text-green-700">
                                            ✓ In Stock
                                        </p>
                                        {selectedProduct.countInStock <= 5 && selectedProduct.countInStock > 0 && (
                                            <p className="text-xs text-orange-600 mt-1 font-medium">
                                                ⚠️ Only {selectedProduct.countInStock} left - Limited stock!
                                            </p>
                                        )}
                                        {selectedProduct.countInStock > 5 && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {selectedProduct.countInStock} items available
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm font-semibold text-red-700">
                                        ✗ Out of Stock
                                    </p>
                                )}
                            </div>


                            <p className="text-gray-700 mb-4">{selectedProduct.description}</p>

                            {/* Color */}
                            <div className="mb-4">
                                <p className="text-gray-700 font-semibold">Color:</p>
                                <div className="flex gap-2 mt-2">
                                    {selectedProduct.colors.map((color) => {
                                        const hex = getColorHex(color);
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-full border ${selectedColor === color
                                                    ? "border-4 border-black"
                                                    : "border-gray-300"
                                                    }`}
                                                style={{
                                                    backgroundColor: hex,
                                                }}
                                            ></button>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Size */}
                            <div className="mb-4 ">
                                <p className="text-gray-700 font-semibold">Size:</p>
                                <div className="flex gap-2 mt-2">
                                    {selectedProduct.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded border-gray-300 border ${selectedSize === size ? "bg-black text-white" : ""
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-6">
                                <p className="text-gray-700 font-semibold">Quantity:</p>
                                <div className=" flex items-center space-x-4 mt-2">
                                    <button
                                        onClick={() => handleQuantitychange("minus")}
                                        className="px-2 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={quantity === 1}
                                    >
                                        -
                                    </button>

                                    <span className="text-lg">{quantity}</span>

                                    <button
                                        onClick={() => handleQuantitychange("plus")}
                                        className="px-2 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={quantity >= selectedProduct.countInStock}
                                    >
                                        +
                                    </button>
                                </div>
                                {quantity >= selectedProduct.countInStock && selectedProduct.countInStock > 0 && (
                                    <p className="text-xs text-orange-600 mt-2 font-medium">
                                        Maximum quantity reached (Only {selectedProduct.countInStock} in stock)
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={isButtonDisabled || selectedProduct.countInStock === 0}
                                className={`bg-black text-white px-6 py-2 rounded w-full mb-4 
                                ${(isButtonDisabled || selectedProduct.countInStock === 0) ? "cursor-not-allowed opacity-50" : "hover:bg-gray-900"}
                                `}
                            >
                                {selectedProduct.countInStock === 0 
                                    ? "OUT OF STOCK" 
                                    : isButtonDisabled 
                                    ? "Adding..." 
                                    : "ADD TO CART"
                                }
                            </button>

                            <div className="mt-6 text-gray-700">
                                <h3 className="text-xl font-bold mb-4">Characteristics:</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="max-w-sm">
                                        <span className="font-medium">Brand: </span>
                                        <span className="whitespace-nowrap"> {selectedProduct.brand}</span>
                                    </div>
                                    <div className="max-w-sm">
                                        <span className="font-medium">Material: </span>
                                        <span className="whitespace-nowrap"> {selectedProduct.material}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-20">
                        <h2 className="text-2xl text-center font-semibold mb-4 text-gray-900 tracking-tight">
                            You May Also Like
                        </h2>
                        <ProductGrid products={similarProduct} loading={loading} error={error} />
                    </div>
                </div>
            )}
        </div>
    )
};

export default ProductDetails;
