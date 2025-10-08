import { BrowserRouter, Route, Routes } from "react-router-dom"
import UserLayout from "./Components/Layout/UserLayout.jsx"
import Home from "./pages/Home.jsx"
import { Toaster } from "sonner"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Profile from "./pages/Profile.jsx"
import CollectionPage from "./pages/CollectionPage.jsx"
import ProductDetails from "./Components/Products/ProductDetails.jsx"
import Checkout from "./Components/Cart/CheckOut.jsx"
import OrderConfirmation from "./pages/OrderConfirmation.jsx"
import OrderDetails from "./pages/OrderDetails.jsx"
import MyOrdersPage from "./pages/MyOrdersPage.jsx"
import AdminLayout from "./Components/Admin/AdminLayout.jsx"
import AdminHomePage from "./Components/Admin/AdminHomePage.jsx"
import ProductManagement from "./Components/Admin/ProductManagement.jsx"
import EditProductPage from "./Components/Admin/EditProductPage.jsx"
import OrderManagement from "./Components/Admin/OrderManagement.jsx"
import AddProduct from "./Components/Admin/AddProduct.jsx"
import NotFound from "./pages/NotFound.jsx"
import { checkBackendHealth } from "./redux/slices/healthSlice.js";

import { Provider, useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./Components/Common/ProtectedRoute.jsx"
import SellerRegister from "./pages/SellerRegister.jsx"
import { useEffect, useState } from "react"
import { fetchCurrentUser } from "./redux/slices/authSlice.js"

function App() {

   const dispatch = useDispatch();
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const { status: backendStatus } = useSelector(state => state.health);

  // First check if backend is awake
  useEffect(() => {
    const wakeBackend = async () => {
      try {
        // Try to wake backend with health check
        await dispatch(checkBackendHealth()).unwrap();
      } catch {
        console.log('Backend health check failed, will still attempt auth');
      }

      // Continue with authentication regardless of health check result
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch{
        console.log('Auth check failed, continuing as guest');
      } finally {
        setInitialLoadAttempted(true);
      }
    };
    
    wakeBackend();
  }, [dispatch]);

  // Show loading for maximum 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 4000); // Show loading for max 4 seconds
    
    return () => clearTimeout(timer);
  }, []);

  if (showInitialLoading && !initialLoadAttempted) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading TrendsWave...</p>
          {backendStatus === "offline" && (
            <p className="text-sm text-gray-500 mt-2">Waking up server...</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>

          <Route path="/" element={<UserLayout />}>
            {/*User layout */}
            <Route index element={<Home />} />    {/*Loads Home inside <Outlet />*/}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="seller/register" element={<SellerRegister />} />
            <Route path="profile" element={<Profile />} />
            <Route path="collections/:collection" element={<CollectionPage />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            <Route path="order/:id" element={<OrderDetails />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
          </Route>

          {/*Admin layout */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>}>
            <Route index element={<AdminHomePage />} />
            <Route path="addProduct" element={<AddProduct />} />
            <Route path="allProducts" element={<ProductManagement />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />
            <Route path="orders" element={<OrderManagement />} />
          </Route>

          {/* 404 route should be LAST */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      
      </BrowserRouter>
  )
}
export default App