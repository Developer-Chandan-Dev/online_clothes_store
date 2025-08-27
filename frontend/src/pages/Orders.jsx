import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import {
  Loader2,
  Package,
  CreditCard,
  // Calendar,
  Truck,
  CheckCircle,
  X,
  RotateCcw,
  ShoppingCart,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import EnhancedOrderTimeline from "../components/EnhancedOrderTimeline";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadOrders = async (page = 1, status = statusFilter) => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/order/userorders?page=${page}&limit=5&status=${status}`,
        { headers: { token } }
      );
      console.log("Response: ", response);


      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalOrders(response.data.totalOrders);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setIsProcessing(true);
    try {
      const response = await axios.put(
        `${backendUrl}/api/order/${orderId}/cancel`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        loadOrders(currentPage, statusFilter);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeOrder = async (orderId) => {
    setIsProcessing(true);
    try {
      const response = await axios.put(
        `${backendUrl}/api/order/${orderId}/resume`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order resumed successfully");
        loadOrders(currentPage, statusFilter);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error resuming order:", error);
      toast.error(error.response?.data?.message || "Failed to resume order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReorder = async (orderId) => {
    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/${orderId}/reorder`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Reorder placed successfully!");
        // Redirect to the new order or reload orders
        loadOrders(currentPage, statusFilter);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(error.response?.data?.message || "Failed to reorder");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

    setIsProcessing(true);
    try {
      const response = await axios.delete(
        `${backendUrl}/api/order/${orderId}/soft-delete`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order deleted successfully");
        loadOrders(currentPage, statusFilter);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Package className="h-4 w-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "processing":
        return <Package className="h-4 w-4 text-orange-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancelOrder = (status) => {
    return ["pending", "confirmed", "processing"].includes(status);
  };

  const canResumeOrder = (status) => {
    return status === "cancelled";
  };

  const canDeleteOrder = (status) => {
    return ["delivered", "cancelled"].includes(status);
  };

  const canReorder = (status) => {
    return ["delivered", "cancelled"].includes(status);
  };

  if (isLoading) {
    return (
      <div className="border-t pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-16 min-h-screen">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Filter and Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              loadOrders(1, e.target.value);
            }}
            className="border rounded-md px-3 py-1 text-sm"
            disabled={isProcessing}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {totalOrders > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {(currentPage - 1) * 5 + 1} - {Math.min(currentPage * 5, totalOrders)} of {totalOrders} orders
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => loadOrders(currentPage - 1, statusFilter)}
                disabled={currentPage === 1 || isProcessing}
                className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => loadOrders(currentPage + 1, statusFilter)}
                disabled={currentPage === totalPages || isProcessing}
                className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === "all" ? "No orders yet" : `No ${statusFilter} orders`}
          </h3>
          <p className="text-gray-600">
            {statusFilter === "all" 
              ? "Your orders will appear here once you make a purchase."
              : `You don't have any ${statusFilter} orders.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-6 bg-white shadow-sm relative"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b">
                <div>
                  <h3 className="font-semibold text-lg">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.toUpperCase()}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <Link to={`/product/${item?.product?._id}`}>
                      <img
                        className="w-16 h-16 object-cover rounded border-2 transition-all border-transparent hover:border-blue-500"
                        src={item.product?.image?.[0] || "/placeholder-image.jpg"}
                        alt={item.name}
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/product/${item?.product?._id}`}>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600">
                          {item.name}
                        </h4>
                      </Link>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <p>
                          {currency}
                          {item.price}
                        </p>
                        <p>Quantity: {item.quantity}</p>
                        {item.size && <p>Size: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping Address
                  </h4>
                  <div className="text-gray-600 space-y-1">
                    <p>
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.street}</p>
                    {order.shippingAddress.apartment && (
                      <p>{order.shippingAddress.apartment}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipcode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </h4>
                  <div className="text-gray-600 space-y-2">
                    <p>Method: {order.paymentMethod.toUpperCase()}</p>
                    <p>
                      Total Amount: {currency}
                      {order.totalAmount}
                    </p>
                    <p>Status: {order.paymentStatus}</p>
                    {order.paymentId && (
                      <p>Transaction ID: {order.paymentId.slice(-12)}</p>
                    )}
                  </div>
                </div>
              </div>

              <EnhancedOrderTimeline {...order}/>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {canCancelOrder(order.status) && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                  >
                    <X size={16} />
                    Cancel Order
                  </button>
                )}

                {canResumeOrder(order.status) && (
                  <button
                    onClick={() => handleResumeOrder(order._id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Resume Order
                  </button>
                )}

                {canReorder(order.status) && (
                  <button
                    onClick={() => handleReorder(order._id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                  >
                    <ShoppingCart size={16} />
                    Reorder
                  </button>
                )}

                {canDeleteOrder(order.status) && (
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete Order
                  </button>
                )}

                <button
                  onClick={() => loadOrders(currentPage, statusFilter)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 ml-auto"
                >
                  <RotateCcw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          ))}

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => loadOrders(currentPage - 1, statusFilter)}
                disabled={currentPage === 1 || isProcessing}
                className="flex items-center gap-1 px-3 py-2 border rounded-md disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => loadOrders(pageNum, statusFilter)}
                      disabled={isProcessing}
                      className={`w-8 h-8 rounded-md ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => loadOrders(currentPage + 1, statusFilter)}
                disabled={currentPage === totalPages || isProcessing}
                className="flex items-center gap-1 px-3 py-2 border rounded-md disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;