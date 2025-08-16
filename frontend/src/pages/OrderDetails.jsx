// OrderDetails.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import { useSelector } from "react-redux";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id))
      .unwrap()
      .catch((err) => {
        if (err?.status === 403 || err?.status === 404) {
          navigate("/404", { replace: true });
        }
      });
  }, [dispatch, id, navigate]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-center">Error: {error}</p>;
  }

  const calcOrderTotalFromItems = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
      {!orderDetails ? (
        <p>No Order Details Found</p>
      ) : (
        <div className="p-4 sm:p-6 rounded-lg border mb-3">
          {/* order Info */}
          <div className="flex flex-col sm:flex-row justify-between mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-semibold">
                Order ID: #{orderDetails._id}
              </h3>
              <p className="text-gray-600">
                {new Date(orderDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
              <span
                className={`${
                  orderDetails.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                } px-3 py-1 rounded-full text-sm font-medium mb-2`}
              >
                {orderDetails.isPaid ? "Approved" : "Pending"}
              </span>
              <span
                className={`${
                  orderDetails.isDelivered ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                } px-3 py-1 rounded-full text-sm font-medium mb-2`}
              >
                {orderDetails.isDelivered ? "Delivered" : "Pending"}
              </span>
            </div>
          </div>

          {/* Coustomer, Payment, Shipping info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-2">Payment Info</h4>
              <p>Payment Method : {orderDetails.paymentMethod}</p>
              <p>Status: {orderDetails.isPaid ? "Paid" : "Unpaid"}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Shipping Info</h4>
              <p>Shipping Method : {orderDetails.shippingAddress?.shippingMethod || "N/A"}</p>
              <p>
                Address:{" "}
                {orderDetails.shippingAddress && orderDetails.shippingAddress.district && orderDetails.shippingAddress.state && orderDetails.shippingAddress.country
                  ? `${orderDetails.shippingAddress.address}, ${orderDetails.shippingAddress.district}, ${orderDetails.shippingAddress.state}`
                  : "No shipping address"}
              </p>
            </div>
          </div>

          {/* Product List */}
          <div className="overflow-x-auto">
            <h4 className="text-lg font-semibold mb-4">Products</h4>
            <table className="min-w-full text-gray-600 mb-4 text-center">
              <thead className="bg-gray-100 text-sm text-gray-700 uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-center">Unit Price</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Total</th>
                </tr>
              </thead>

              <tbody>
                {orderDetails.orderItems.map((item) => (
                  <tr key={item.productId} className="border-b">
                    <td className="py-2 px-2 sm:py-4 sm:px-4">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    </td>

                    <td className="py-3 px-4 text-left whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Link to={`/product/${item.productId}`} className="text-blue-500 hover:underline">
                          {item.name}
                        </Link>
                      </div>
                    </td>

                    {/* Use the frozen price stored in order item */}
                    <td className="py-3 px-4 text-center">₹{(item.price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-center">₹{(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-3 text-right mb-">
            <div className="md:text-lg font-semibold">
              Order Total: ₹{(calcOrderTotalFromItems(orderDetails.orderItems))}
            </div>
          </div>

          {/* Back to Orders Link */}
          
        </div>
      )}
      <Link to="/my-orders" className="text-blue-600 hover:underline">
            Back to My Orders
          </Link>
    </div>
  );
};

export default OrderDetails;
