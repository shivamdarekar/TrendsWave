import { RiDeleteBin3Line } from "react-icons/ri"
import { useDispatch } from "react-redux"
import { removeFromCart, updateCartQuantity, optimisticUpdateQuantity, optimisticRemoveItem } from "../../redux/slices/cartSlice";
import { toast } from "sonner";

const CartContents = ({ cart, userId, guestId }) => {

    const dispatch = useDispatch();

    const handleAddCart = (productId, delta, quantity, size, color) => {
        const newQuantity = quantity + delta;
        if (newQuantity < 1) return;

        // 1. Update UI instantly
        dispatch(optimisticUpdateQuantity({ productId, quantity: newQuantity, size, color }));

        // 2. Sync with server in background, revert on failure
        dispatch(updateCartQuantity({ productId, quantity: newQuantity, guestId, userId, size, color }))
            .unwrap()
            .catch(() => {
                // Revert optimistic update
                dispatch(optimisticUpdateQuantity({ productId, quantity, size, color }));
                toast.error("Failed to update quantity", { duration: 1500 });
            });
    };

    const handleRemoveFromCart = (productId, size, color) => {
        // 1. Remove from UI instantly
        dispatch(optimisticRemoveItem({ productId, size, color }));

        // 2. Sync with server in background
        dispatch(removeFromCart({ productId, guestId, userId, size, color }))
            .unwrap()
            .catch(() => {
                toast.error("Failed to remove item. Please refresh.", { duration: 1500 });
            });
    };

    return (
        <div>
            {cart.products.map((product, index) => (   //Loops through each product in the cartProducts array.
                <div
                    key={index}
                    className="flex items-start justify-between py-4 border-b"
                >
                    <div className="flex items-start">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-24 object-cover mr-4 rounded"
                        />

                        <div>
                            <h3>{product.name}</h3>
                            <p className="text-sm text-gray-700">
                                size: {product.size} | color: {product.color}
                            </p>

                            <div className="flex items-center mt-2">
                                <button
                                    aria-label="Decrease quantity"
                                    onClick={() => 
                                        handleAddCart(
                                            product.productId,
                                            -1,
                                            product.quantity,
                                            product.size,
                                            product.color
                                        )
                                    }
                                    className="border rounded px-2 py-1 text-xl font-medium">
                                    -
                                </button>

                                <span className="mx-4">{product.quantity}</span>

                                <button
                                    aria-label="Increase quantity"
                                    onClick={() => 
                                        handleAddCart(
                                            product.productId,
                                            1,
                                            product.quantity,
                                            product.size,
                                            product.color
                                        )
                                    }
                                    className="border rounded px-2 py-1 text-xl font-medium">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-medium">₹{((product.discountPrice ?? product.price) * product.quantity).toFixed(2)}</p>
                        <button
                            onClick={() => handleRemoveFromCart(
                                product.productId,
                                product.size,
                                product.color
                            )}
                        >
                            <RiDeleteBin3Line className="h-6 w-6 mt-2 text-red-600" />
                        </button>
                    </div>

                </div>
            ))}
        </div>
    )
}


export default CartContents