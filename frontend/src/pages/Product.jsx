import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import Review from "../components/Review";
import { FavsContext } from "../context/FavsContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Info,
  Check,
  Ban,
} from "lucide-react";
import BuyNowDialog from "../components/BuyNowDialog";
  
const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);

  const { favIds, setFavIds, getFavoritesProducts, setFavsCount } =
    useContext(FavsContext);

  const isOutOfStock = productData?.stockQuantity < 5;

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setSelectedImage(item.image[0]);
        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const isFavorite = favIds.includes(productId);

  const toggleFavorite = async (productId) => {
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (token) {
      try {
        const res = await axios.put(
          backendUrl + "/api/user/favorites",
          { productId },
          { headers: { token } }
        );
        if (res?.data?.success === true) {
          toast.success(res?.data?.message);
          setFavIds(res?.data?.favorites);
          setFavsCount(res?.data?.favorites?.length);
          getFavoritesProducts(token);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    } else {
      toast.info("Please login to add to favorites");
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (!token) {
      toast.error("Please login to proceed with purchase");
      return;
    }

    if (!selectedSize && productData.sizes.length > 0) {
      toast.error("Please select a size");
      return;
    }

    setIsBuyNowOpen(true);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (!selectedSize && productData.sizes.length > 0) {
      toast.error("Please select a size");
      return;
    }
    addToCart(productData._id, selectedSize, selectedColor, quantity);
    toast.success("Added to cart!");
  };

  const incrementQuantity = () => {
    if (quantity < (productData.stockQuantity || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Calculate discount percentage if original price exists
  const discountPercentage = productData?.originalPrice
    ? Math.round(
        ((productData.originalPrice - productData.price) /
          productData.originalPrice) *
          100
      )
    : 0;

  return productData ? (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span>Home</span>
        <ChevronRight size={16} className="mx-2" />
        <span>{productData.category}</span>
        <ChevronRight size={16} className="mx-2" />
        <span>{productData.subCategory}</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">{productData.name}</span>
      </div>
      
      {/* Out of Stock Banner */}
      {isOutOfStock && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <Ban size={20} />
            <span className="font-medium">This product is currently out of stock</span>
          </div>
          <p className="text-red-600 text-sm mt-1">
            We expect more stock soon. Please check back later.
          </p>
        </div>
      )}

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-24">
            {productData.image.map((img, index) => (
              <div
                key={index}
                className={`border-2 rounded-md p-1 cursor-pointer transition-all ${
                  selectedImage === img ? "border-blue-500" : "border-gray-200"
                } ${isOutOfStock ? "opacity-60" : ""}`}
                onClick={() => !isOutOfStock && setSelectedImage(img)}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative flex-1">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => toggleFavorite(productId)}
                disabled={isOutOfStock}
                className={`p-3 rounded-full shadow-lg transition-all ${
                  isFavorite ? "bg-pink-50" : "bg-white"
                } ${isOutOfStock ? "opacity-60 cursor-not-allowed" : "hover:bg-pink-50"}`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite ? "fill-pink-500 text-pink-500" : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            {discountPercentage > 0 && !isOutOfStock && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                -{discountPercentage}%
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                Sold Out
              </div>
            )}

            <div className={`aspect-square overflow-hidden rounded-xl bg-gray-100 ${isOutOfStock ? "opacity-60 grayscale" : ""}`}>
              <img
                src={selectedImage}
                alt={productData.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {productData.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">(122 reviews)</span>
              {productData.bestseller && !isOutOfStock && (
                <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-3">
            <p className={`text-3xl font-bold ${isOutOfStock ? "text-gray-500" : "text-gray-900"}`}>
              {currency}
              {productData.price.toFixed(2)}
            </p>
            {productData.originalPrice && !isOutOfStock && (
              <>
                <p className="text-xl text-gray-500 line-through">
                  {currency}
                  {productData.originalPrice.toFixed(2)}
                </p>
                <span className="text-red-600 font-medium">
                  {discountPercentage}% off
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          {isOutOfStock ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 font-medium">Out of Stock</p>
              <p className="text-red-600 text-sm">This product is currently unavailable</p>
            </div>
          ) : productData.stockQuantity <= 10 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 font-medium">
                Only {productData.stockQuantity} left in stock!
              </p>
              <p className="text-orange-600 text-sm">Order soon to avoid disappointment</p>
            </div>
          )}

          {/* Short Description */}
          <p className="text-gray-600 leading-relaxed">
            {productData.description}
          </p>

          {/* Color Selection */}
          {productData.colors && productData.colors.length > 0 && !isOutOfStock && (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                Color: {selectedColor}
              </p>
              <div className="flex gap-2">
                {productData.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-gray-900 ring-2 ring-offset-2 ring-gray-300"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {productData.sizes && productData.sizes.length > 0 && !isOutOfStock && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">Select Size</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Info size={14} />
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {productData.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 border rounded-md text-center transition-all ${
                      selectedSize === size
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    disabled={quantity >= (productData.stockQuantity || 10)}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {productData.stockQuantity || 10} available
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`sm:flex-1 py-3 px-6 rounded-lg font-medium shadow-md transition-colors ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`px-6 py-3 border rounded-lg font-medium transition-colors ${
                isOutOfStock
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Buy Now
            </button>
          </div>

          {/* Shipping & Returns Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-gray-600" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={20} className="text-gray-600" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-gray-500">30 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-gray-600" />
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rest of the component remains the same */}
      {/* Product Details Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex flex-wrap space-x-3 sm:space-x-8">
          {[
            { id: "description", label: "Description" },
            { id: "details", label: "Product Details" },
            { id: "reviews", label: `Reviews (122)` },
            { id: "shipping", label: "Shipping & Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mb-16">
        {activeTab === "description" && (
          <div className="prose prose-lg max-w-none">
            <h3 className="text-xl font-semibold mb-4">Product Description</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {productData.longDescription || productData.description}
            </p>

            {productData.fabric && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">Fabric & Material</h4>
                <p className="text-gray-600">{productData.fabric}</p>
              </div>
            )}

            {productData.careInstructions && (
              <div>
                <h4 className="font-medium text-gray-900">Care Instructions</h4>
                <p className="text-gray-600">{productData.careInstructions}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Product Details</h3>
            {productData.productDetails &&
            productData.productDetails.length > 0 ? (
              <ul className="space-y-2">
                {productData.productDetails.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <Check
                      size={16}
                      className="text-green-500 mt-1 mr-2 flex-shrink-0"
                    />
                    <span className="text-gray-600">{detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No product details available.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && <Review productId={productId} />}

        {activeTab === "shipping" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Shipping & Returns</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Shipping Information
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Free standard shipping on orders over $50</li>
                  <li>• Express shipping available at additional cost</li>
                  <li>• Usually ships within 1-2 business days</li>
                  <li>• International shipping available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Return Policy
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Easy 30-day return policy</li>
                  <li>• Items must be unworn and in original condition</li>
                  <li>• Free returns for defective items</li>
                  <li>• Return shipping label provided</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Related Products */}
      <RelatedProducts
        category={productData?.category}
        subCategory={productData.subCategory}
        currentProductId={productId}
      />
      
      {/* Buy Now Dialog */}
      <BuyNowDialog
        product={productData}
        isOpen={isBuyNowOpen}
        onClose={() => setIsBuyNowOpen(false)}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
      />
    </div>
  ) : (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-pulse text-gray-500">Loading product...</div>
    </div>
  );
};

export default Product;