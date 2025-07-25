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
import UserManagement from "./Components/Admin/UserManagement.jsx"
import ProductManagement from "./Components/Admin/ProductManagement.jsx"
import EditProductPage from "./Components/Admin/EditProductPage.jsx"
import OrderManagement from "./Components/Admin/OrderManagement.jsx"

import { Provider } from "react-redux";
import store from "./redux/store.js"
import ProtectedRoute from "./Components/Common/ProtectedRoute.jsx"


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>

          <Route path="/" element={<UserLayout />}>
            {/*User layout */}
            <Route index element={<Home />} />    {/*Loads Home inside <Outlet />*/}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
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
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />
            <Route path="orders" element={<OrderManagement />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
export default App



