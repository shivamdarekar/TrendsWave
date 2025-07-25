import { useEffect, useState } from "react"
import Hero from "../Components/Layout/Hero.jsx"
import FeaturedCollection from "../Components/Products/FeaturedCollection.jsx"
import FeatureSection from "../Components/Products/FeatureSection.jsx"
import GenderCollectionSection from "../Components/Products/GenderCollectionSection.jsx"
import NewArrivals from "../Components/Products/NewArrivals.jsx"
import ProductDetails from "../Components/Products/ProductDetails.jsx"
import ProductGrid from "../Components/Products/ProductGrid.jsx"
import {useDispatch,useSelector} from "react-redux"
import { fetchProductsByFilters } from "../redux/slices/productsSlice.js"
import axios from "axios"

// const placeholderProducts = [
//     {
//         _id: 1,
//         name: "Product 1",
//         price: 100,
//         images: [{ url: "https://picsum.photos/500/500?random=3" }],
//     },
//     {
//         _id: 2,
//         name: "Product 2",
//         price: 100,
//         images: [{ url: "https://picsum.photos/500/500?random=4" }],
//     },
// ]

const Home = () => {

    const dispatch = useDispatch();

    //use to access data from redux store
    const { products, loading, error } = useSelector((state) => state.products);

    const [bestSellerProduct, setBestSellerProduct] = useState(null)
    
    useEffect(() => {
        //fetch products for specific collection
        dispatch(
            fetchProductsByFilters({
                gender: "Women",
                category: "Bottom Wear",
                limit: 8
            })
        );

        //fetch best seller product
        const fetchBestSeller = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
                );
                setBestSellerProduct(response.data)
            } catch (error) {
                console.error(error);
            }
        };
        fetchBestSeller();
    },[dispatch])

    return (
        <div>
            <Hero />
            <GenderCollectionSection />
            <NewArrivals />
            
            {/* Best seller */}
            <h2 className="text-3xl text-center font-bold text-gray-900 py-4 tracking-tight mt-6">
                Best Seller
            </h2>
            {bestSellerProduct ? (
                <ProductDetails productId={bestSellerProduct._id} />
            ) : (
                    <p className="text-center">Loading best seller product ...</p>
            )}
            
            <div>
                <h2 className="text-3xl text-center font-bold text-gray-900 py-5 tracking-tight">
                    Top Wears for Women
                </h2>
                <ProductGrid products={products} loading={loading} error={error} />
            </div>

            <FeaturedCollection />
            
            <FeatureSection/>
        </div>
    )
}

export default Home

