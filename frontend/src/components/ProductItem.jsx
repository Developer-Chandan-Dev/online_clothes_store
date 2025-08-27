/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { FavsContext } from "../context/FavsContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Heart, Eye, ShoppingCart, Star, Ban } from "lucide-react";
import { Link } from "react-router-dom";

const ProductItem = ({
  id,
  name,
  image,
  price,
  originalPrice,
  category,
  bestseller,
  colors,
  sizes,
  stockQuantity
}) => {
  const { currency, addToCart, token, backendUrl, navigate } =
    useContext(ShopContext);
  const { favIds, setFavIds, setFavsCount } = useContext(FavsContext);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isFavorite = favIds.includes(id);
  const isOutOfStock = stockQuantity < 5;

  // Calculate discount percentage
  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (token) {
      try {
        const res = await axios.put(
          `${backendUrl}/api/user/favorites`,
          { productId: id },
          { headers: { token } }
        );
        if (res?.data?.success === true) {
          toast.success(res?.data?.message);
          setFavIds(res?.data?.favorites);
          setFavsCount(res?.data?.favorites?.length);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    } else {
      toast.info("Please login to add to favorites");
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    
    addToCart(id, sizes?.[0] || "", colors?.[0] || "", 1);
    toast.success("Added to cart!");
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden aspect-square">
        {/* Main Image */}
        <img
          src={image[0]}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          } ${isImageLoaded ? "opacity-100" : "opacity-0"} ${
            isOutOfStock ? "opacity-70 grayscale" : ""
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* Loading Skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white/90 px-3 py-2 rounded-lg text-center">
              <Ban className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <span className="text-sm font-medium text-red-600">Out of Stock</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
              Sold Out
            </span>
          )}
          {!isOutOfStock && bestseller && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
              Bestseller
            </span>
          )}
          {!isOutOfStock && discountPercentage > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          disabled={isOutOfStock}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isFavorite
              ? "bg-pink-50 text-pink-500"
              : isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white/90 text-gray-600 hover:bg-pink-50 hover:text-pink-500"
          } shadow-md`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Hover Actions - Only show if not out of stock */}
        {!isOutOfStock && (
          <div
            className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2`}
          >
            <button
              onClick={handleAddToCart}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 p-3 bg-white rounded-full hover:bg-blue-50 hover:text-blue-600"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              onClick={handleQuickView}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200 p-3 bg-white rounded-full hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <Link 
        to={`/product/${id}`} 
        className={`block p-4 ${isOutOfStock ? "opacity-70" : ""}`}
      >
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {category}
        </p>

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* Stock Status */}
        {isOutOfStock ? (
          <div className="mb-3">
            <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
              Out of Stock
            </span>
          </div>
        ) : stockQuantity <= 10 && (
          <div className="mb-3">
            <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
              Only {stockQuantity} left!
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={`${
                  star <= 4
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">(122)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold ${isOutOfStock ? "text-gray-500" : "text-gray-900"}`}>
            {currency}
            {price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {currency}
              {originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color Options (if available) */}
        {colors && colors.length > 0 && !isOutOfStock && (
          <div className="flex gap-1 mt-3">
            {colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {colors.length > 4 && (
              <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                +{colors.length - 4}
              </div>
            )}
          </div>
        )}
      </Link>
    </div>
  );
};

export default ProductItem;