import { HiOutlineCreditCard, HiShoppingBag } from "react-icons/hi";
import { HiArrowPathRoundedSquare } from "react-icons/hi2";

const FeatureSection = () => {
    return (
        <section className="py-12 px-4 bg-white">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {/* Feature 1 */}
                <div className="flex flex-col items-center">
                    <div className="p-4 rounded-full mb-4">
                        <HiShoppingBag  className="text-xl" />
                    </div>
                    <h4 className="tracking-tight mb-4">FREE INTERNATIONAL SHIPPING</h4>
                    <p className="text-gray-600 text-sm tracking-tight">
                        On all orders over $100.00
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center">
                    <div className="p-4 rounded-full mb-4">
                        <HiArrowPathRoundedSquare  className="text-xl" />
                    </div>
                    <h4 className="tracking-tight mb-4"> 30 DAYS RETURN </h4>
                    <p className="text-gray-600 text-sm tracking-tight">
                        Money back guarantee
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center">
                    <div className="p-4 rounded-full mb-4">
                        <HiOutlineCreditCard  className="text-xl" />
                    </div>
                    <h4 className="tracking-tight mb-4"> SECURE CHECKOUT </h4>
                    <p className="text-gray-600 text-sm tracking-tight">
                        100% secured checkout process
                    </p>
                </div>
            </div>
        </section>
    )
}

export default FeatureSection