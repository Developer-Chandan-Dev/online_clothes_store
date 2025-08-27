/* eslint-disable no-unused-vars */
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
import OrderCard from "../components/order/OrderCard";
import FilterPanel from "../components/order/FilterPanel";
import Pagination from "../components/order/Pagination";



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
      const response = await axios.get(
        backendUrl + "/api/order/list",
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
      console.log(error, 334);
      toast.error(error.response?.data?.message || error.message);
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
          (order.shippingAddress.firstName + " " + order.shippingAddress.lastName)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.shippingAddress.phone.includes(searchTerm) ||
          order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      result = result.filter((order) => order.paymentStatus === paymentFilter);
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result = result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "amount-high":
        result = result.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case "amount-low":
        result = result.sort((a, b) => a.totalAmount - b.totalAmount);
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
    setCurrentPage(1);
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
        toast.success("Status updated successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleOrderDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        backendUrl + `/api/order/${id}`,
        { headers: { token } }
      );
      if (response?.data?.success) {
        toast.success("Order deleted successfully");
        await fetchAllOrders();
      } else {
        toast.error(response?.data?.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateRange({ start: "", end: "" });
    setSortOption("newest");
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
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

      <FilterPanel
        showFilters={showFilters}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        resetFilters={resetFilters}
      />

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
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          </div>
        )}

        {!isLoading && currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={statusHandler}
              onDelete={handleOrderDelete}
            />
          ))
        ) : (
          !isLoading && (
            <div className="p-8 text-center text-gray-500">
              No orders found matching your criteria
            </div>
          )
        )}
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ordersPerPage={ordersPerPage}
          onOrdersPerPageChange={setOrdersPerPage}
          totalOrders={orders.length}
          filteredOrders={filteredOrders.length}
        />
      )}
    </div>
  );
};

export default Orders;