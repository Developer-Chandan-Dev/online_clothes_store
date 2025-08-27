/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import {
  Trash2,
  Edit,
  EyeIcon,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import UpdateProductPopup from "../components/UpdateProductPopup";
import PreviewProduct from "../components/ProductPreview";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [preview, setPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        const products = response.data.products;
        setList(products);
        setFilteredList(products);
        // Calculate max price for range filter
        const maxPrice = Math.max(...products.map((p) => p.price), 1000);
        setPriceRange([0, maxPrice]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...list];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter);
    }

    // Apply price range filter
    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result = result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        result = result.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "price-high":
        result = result.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        result = result.sort((a, b) => a.price - b.price);
        break;
      case "name-asc":
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result = result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredList(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [list, searchTerm, categoryFilter, priceRange, sortOption]);

  // Get current products for the current page
  const currentProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredList.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredList, currentPage, productsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredList.length / productsPerPage);
  }, [filteredList.length, productsPerPage]);

  const removeProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsPopupOpen(true);
  };

  const handlePreviewClick = (product) => {
    setSelectedProduct(product);
    setPreview(true);
  };

  // Get unique categories for filter dropdown
  const categories = ["all", ...new Set(list.map((item) => item.category))];

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setPriceRange([0, Math.max(...list.map((p) => p.price), 1000)]);
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
    const maxVisibleButtons = 5; // Maximum number of visible page buttons

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page button
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

    // Page buttons
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

    // Last page button
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
    fetchList();
  }, []);

  return (
    <>
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">All Products List</h2>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
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
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range: {currency}
                {priceRange[0]} - {currency}
                {priceRange[1]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={Math.max(...list.map((p) => p.price), 1000)}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max={Math.max(...list.map((p) => p.price), 1000)}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
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

      {/* Results Count and Products Per Page Selector */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-sm text-gray-500">
          Showing {currentProducts.length} of {filteredList.length} products
          {filteredList.length !== list.length &&
            ` (filtered from ${list.length} total)`}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Products per page:</span>
          <select
            value={productsPerPage}
            onChange={(e) => {
              setProductsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-2 mb-4">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {/* Product Items */}
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        )}
        {!isLoading && currentProducts.length > 0 ? (
          currentProducts.map((item, index) => (
            <div
              className={`grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm ${
                item?.stockQuantity < 5 ? "bg-red-200 border border-red-500" : ""
              }`}
              key={index}
            >
              <>
                <img className="w-12" src={item.image[0]} alt={item.name} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>
                  {currency}
                  {item.price}
                </p>
                <p className="text-right md:text-center text-lg flex items-center justify-center gap-2">
                  <EyeIcon
                    onClick={() => handlePreviewClick(item)}
                    className="size-[20px] transition-all text-indigo-400 hover:text-indigo-600 cursor-pointer"
                  />
                  <Trash2
                    onClick={() => removeProduct(item._id)}
                    className="size-[20px] transition-all text-red-400 hover:text-red-600 cursor-pointer"
                  />
                  <Edit
                    onClick={() => handleEditClick(item)}
                    className="size-[18px] transition-all text-blue-400 mt-[2px] hover:text-blue-600 cursor-pointer"
                  />
                </p>
              </>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No products found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredList.length > 0 && (
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

      {/* Update Product Popup */}
      {isPopupOpen && selectedProduct && (
        <UpdateProductPopup
          token={token}
          product={selectedProduct}
          onClose={() => {
            setIsPopupOpen(false);
            setSelectedProduct(null);
          }}
          onUpdate={fetchList}
        />
      )}

      {/* Product Preview */}
      {preview && (
        <PreviewProduct
          product={selectedProduct}
          onClose={() => setPreview(false)}
        />
      )}
    </>
  );
};

export default List;
