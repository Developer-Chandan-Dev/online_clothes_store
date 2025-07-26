/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import {
  Trash2,
  Edit,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from "lucide-react";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortOption, setSortOption] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  const fetchAllOrders = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const ordersData = response.data.orders;
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          (order.address.firstName + " " + order.address.lastName)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.address.phone.includes(searchTerm) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      result = result.filter((order) =>
        paymentFilter === "paid" ? order.payment : !order.payment
      );
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      result = result.filter((order) => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result = result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        result = result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "amount-high":
        result = result.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-low":
        result = result.sort((a, b) => a.amount - b.amount);
        break;
      case "items-high":
        result = result.sort((a, b) => b.items.length - a.items.length);
        break;
      case "items-low":
        result = result.sort((a, b) => a.items.length - b.items.length);
        break;
      default:
        break;
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange, sortOption]);

  // Get current orders for the current page
  const currentOrders = useMemo(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  }, [filteredOrders, currentPage, ordersPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / ordersPerPage);
  }, [filteredOrders.length, ordersPerPage]);

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOrderDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        backendUrl + `/api/order/userorders/${id}`,
        { headers: { token } }
      );
      if (response?.data?.success) {
        toast.success("Order deleted successfully");
        await fetchAllOrders();
      } else {
        toast.error(response?.data?.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get unique statuses for filter dropdown
  const statuses = [
    "all",
    "Order Placed",
    "Packing",
    "Shipped",
    "Out for delivery",
    "Delivered",
  ];

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateRange({ start: "", end: "" });
    setSortOption("newest");
  };

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => goToPage(1)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 border rounded ${
            currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key="last"
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Order Management</h2>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
            <option value="items-high">Items: High to Low</option>
            <option value="items-low">Items: Low to High</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count and Orders Per Page Selector */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-sm text-gray-500">
          Showing {currentOrders.length} of {filteredOrders.length} orders
          {filteredOrders.length !== orders.length &&
            ` (filtered from ${orders.length} total)`}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Orders per page:</span>
          <select
            value={ordersPerPage}
            onChange={(e) => {
              setOrdersPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="mb-4">
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        )}

        {!isLoading && currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <div
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_0.5fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
              key={order._id}
            >
              <img className="w-12" src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, index) => (
                    <p className="py-0.5" key={index}>
                      {item.name} x {item.quantity} {item.size}
                      {index !== order.items.length - 1 && ","}
                    </p>
                  ))}
                </div>
                <p className="mt-3 mb-2 font-medium">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>
                    {order.address.city +
                      ", " +
                      order.address.state +
                      ", " +
                      order.address.country +
                      ", " +
                      order.address.zipcode}
                  </p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className="text-sm sm:text-[15px]">
                  Items: {order.items.length}
                </p>
                <p className="mt-3">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className="text-sm sm:text-[15px]">
                {currency}
                {order.amount}
              </p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold border rounded"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
              <div className="flex items-center justify-end gap-2">
                <Trash2
                  className="size-[20px] transition-all text-red-400 hover:text-red-600 cursor-pointer"
                  onClick={() => handleOrderDelete(order._id)}
                />
                <Edit className="size-[18px] transition-all text-blue-400 hover:text-blue-600 cursor-pointer" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No orders found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            {/* First Page Button */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous Page Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Number Buttons */}
            <div className="flex gap-1">{renderPaginationButtons()}</div>

            {/* Next Page Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
