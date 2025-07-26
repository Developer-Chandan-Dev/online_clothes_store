import { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

const Collection = () => {
  const { products, currency } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortType, setSortType] = useState("relavent");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    return [...new Set(products.map((item) => item.category))];
  }, [products]);

  const subCategories = useMemo(() => {
    return [...new Set(products.map((item) => item.subCategory))];
  }, [products]);

  // Calculate max price
  const maxPrice = useMemo(() => {
    return Math.max(...products.map((item) => item.price), 1000);
  }, [products]);

  // Apply filters and sorting
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      let result = [...products];

      // Apply search filter
      if (searchTerm) {
        result = result.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (category.length > 0) {
        result = result.filter((item) => category.includes(item.category));
      }

      // Apply subcategory filter
      if (subCategory.length > 0) {
        result = result.filter((item) => subCategory.includes(item.subCategory));
      }

      // Apply price range filter
      result = result.filter(
        (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
      );

      // Apply sorting
      switch (sortType) {
        case "low-high":
          result.sort((a, b) => a.price - b.price);
          break;
        case "high-low":
          result.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case "rating":
          result.sort((a, b) => b.rating - a.rating);
          break;
        default:
          // Default sorting (relevant)
          break;
      }

      setFilteredProducts(result);
      setCurrentPage(1); // Reset to first page when filters change
      setIsLoading(false);
    }, 500); // 500ms delay to prevent flickering on fast filters

    return () => clearTimeout(timer);
  }, [products, searchTerm, category, subCategory, priceRange, sortType]);

  // Get current products for pagination
  const currentProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, currentPage, productsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / productsPerPage);
  }, [filteredProducts.length, productsPerPage]);

  // Toggle category filter
  const toggleCategory = (cat) => {
    setCategory((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  // Toggle subcategory filter
  const toggleSubCategory = (subCat) => {
    setSubCategory((prev) =>
      prev.includes(subCat)
        ? prev.filter((item) => item !== subCat)
        : [...prev, subCat]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategory([]);
    setSubCategory([]);
    setPriceRange([0, maxPrice]);
    setSortType("relavent");
  };

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter Options */}
      <div className="min-w-60">
        <div className="flex justify-between items-center">
          <p
            onClick={() => setShowFilter(!showFilter)}
            className="my-2 text-xl flex items-center cursor-pointer gap-2"
          >
            FILTERS
            <FiFilter
              className={`h-4 w-4 ${showFilter ? "text-blue-500" : ""}`}
            />
          </p>
          {showFilter && (
            <button
              onClick={resetFilters}
              className="text-sm text-blue-500 hover:underline"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Mobile Search (visible only when filters are shown) */}
        {showFilter && (
          <div className="sm:hidden mb-4 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <FiX
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
        )}

        {/* Filter Sections */}
        <div className={`${showFilter ? "" : "hidden"} sm:block`}>
          {/* Category Filter */}
          <div className="border border-gray-300 pl-5 py-3 mt-6">
            <p className="mb-3 text-sm font-medium">CATEGORIES</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={category.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* SubCategory Filter */}
          <div className="border border-gray-300 pl-5 py-3 my-5">
            <p className="mb-3 text-sm font-medium">TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {subCategories.map((subCat) => (
                <label
                  key={subCat}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={subCategory.includes(subCat)}
                    onChange={() => toggleSubCategory(subCat)}
                  />
                  {subCat}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border border-gray-300 pl-5 py-3 my-5">
            <p className="mb-3 text-sm font-medium">PRICE RANGE</p>
            <div className="pr-5">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{currency} {priceRange[0]}</span>
                <span>{currency} {priceRange[1]}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        {/* Desktop Search and Sort */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <FiX
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {filteredProducts.length} products
            </div>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border-2 border-gray-300 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Loading and Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
              {currentProducts.map((item) => (
                <ProductItem
                  key={item._id}
                  name={item.name}
                  id={item._id}
                  price={item.price}
                  image={item.image}
                />
              ))}
            </div>

            {/* Pagination */}
            {filteredProducts.length > productsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="text-sm text-gray-500">
                  Showing {currentProducts.length} of {filteredProducts.length}{" "}
                  products
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronsLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronLeft className="h-4 w-4" />
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
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <FiChevronsRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Show:</span>
                  <select
                    value={productsPerPage}
                    onChange={(e) => {
                      setProductsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                    <option value="48">48</option>
                  </select>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No products found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;