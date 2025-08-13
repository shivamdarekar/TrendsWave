import { useEffect, useRef, useState } from "react"
import { FaFilter } from "react-icons/fa"
import FilterSidebar from "../Components/Products/FilterSidebar"
import SortOptions from "../Components/Products/SortOptions"
import ProductGrid from "../Components/Products/ProductGrid"
import { useParams, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchProductsByFilters } from "../redux/slices/productsSlice"

const CollectionPage = () => {

    const { collection } = useParams();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.products);
    const queryParams = Object.fromEntries([...searchParams]);

    const sidebarRef = useRef(null)          // holds a reference to the sidebar element to detect clicks outside of it.
    const [IsSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchProductsByFilters({ collection, ...queryParams }));
    }, [dispatch, collection, searchParams.toString()]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!IsSidebarOpen)
    }

    const handleClickedOutside = (e) => {
        //closed the sidebar if user clicked outside
        if (sidebarRef.current && !sidebarRef.current.contains(e.target))   //do not closed if user clicked inside the sidebar
        {
            setIsSidebarOpen(false)
        }
    };

    //sidebarRef.current → Ensures the sidebar exists.
    //!sidebarRef.current.contains(e.target) → Checks if the clicked area is outside the sidebar.
    //setIsSidebarOpen(false) → Closes the sidebar when clicking outside.


    useEffect(() => {
        // add event listner for clicks
        document.addEventListener("mousedown", handleClickedOutside)  // Listens for mouse clicks anywhere on the page.

        // Return cleanup function
        return () => {
            document.removeEventListener("mousedown", handleClickedOutside);
        };
    }, [])

    //handleClickedOutside detects if the user clicks outside.
    //If true, setIsSidebarOpen(false) closes the sidebar.
    //When the component unmounts, useEffect removes the event listener.

    //dummy products at time of testing
    // useEffect(() => {
    //     setTimeout(() => {
    //         const fetchedProducts = [
    //             {
    //                 _id: 1,
    //                 name: "Product 1",
    //                 price: 100,
    //                 images: [{ url: "https://picsum.photos/500/500?random=3" }],
    //             },
    //         ] setProducts(fetchedProducts)
    //     }, 1000)
    // }, []);


    return (
        <div className="flex flex-col lg:flex-row">
            {/* Mobile filter button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden border p-2 flex justify-center items-center">
                <FaFilter className="mr-2" />
                Filters
            </button>

            {/* Filter sidebar */}
            <div
                ref={sidebarRef}
                className={`
                    ${IsSidebarOpen ? "translate-x-0" : "-translate-x-full"}   
                    fixed inset-y-0 z-50 left-0 w-64 lg:w-80  bg-white overflow-y-auto transition-transform duration-300
                    lg:static lg:translate-x-0
                `}
            >
                <FilterSidebar />
            </div>

            {/* translate-x-0 → Sidebar visible (when IsSidebarOpen is true). 
            -translate-x-full → Sidebar hidden (when IsSidebarOpen is false). */}


            <div className="flex-grow p-4">
                <h2 className="text-2xl uppercase mb-4 font-medium">
                    All Collections
                </h2>

                {/* Sort options */}
                <SortOptions />

                {/* product Grid */}
                <ProductGrid products={products} loading={loading} error={error} />
            </div>
        </div>
    )
}


export default CollectionPage