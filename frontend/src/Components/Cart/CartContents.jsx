import { RiDeleteBin3Line } from "react-icons/ri"
import { useDispatch } from "react-redux"
import { removeFromCart, updateCartQuantity } from "../../redux/slices/cartSlice";

const CartContents = ({ cart, userId, guestId }) => {
    
    // const cartProducts = [
    //     {
    //         productId: 1,
    //         name: "T-Shirt",
    //         size: "M",
    //         color: "Red",
    //         quantity: 5,
    //         price: 15000,
    //         image: "https://picsum.photos/200?random=1"
    //     },
    // ]

    const dispatch = useDispatch();

    //handle adding and substrating to cart
    const handleAddCart = (productId, delta, quantity, size, color) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1) {
            dispatch(
                updateCartQuantity({
                    productId,
                    quantity: newQuantity,
                    guestId,
                    userId,
                    size,
                    color,
                })
            )
        }
    };

    const handleRemoveFromCart = (productId, size, color) => {
        dispatch(removeFromCart({ productId, guestId, userId, size, color }));
    }

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
                        <p className="font-medium">$ {product.price.toLocaleString()}</p>
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