/* eslint-disable react/prop-types */
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { FavsContext } from "../context/FavsContext";

const ProductItem = ({ id, image, name, price }) => {
  const { favIds, setFavIds, getFavoritesProducts, setFavsCount } =
    useContext(FavsContext);
  const { currency, token, backendUrl } = useContext(ShopContext);

  const match = favIds.includes(id);

  const toggleFavorites = async (productId) => {
    if (token) {
      try {
        const res = await axios.put(
          backendUrl + "/api/user/favorites",
          { productId },
          { headers: { token } }
        );
        console.log(res);
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
    }
  };

  return (
    <div className="text-gray-700 cursor-pointer">
      <div className=" overflow-hidden relative">
        <Link
          onClick={() => scrollTo(0, 0)}
          className="text-gray-700 cursor-pointer"
          to={`/product/${id}`}
        >
          <img
            className="hover:scale-110 transition ease-in-out"
            src={image[0]}
            alt=""
          />
        </Link>

        <div className="absolute top-2 right-2 rounded-full h-7 w-7 drop-shadow bg-white flex items-center justify-center">
          <Heart
            className={`size-5 ${
              match && "fill-pink-600"
            } text-pink-600 cursor-pointer`}
            onClick={() => toggleFavorites(id)}
          />
        </div>
      </div>
      <Link
        onClick={() => scrollTo(0, 0)}
        className="text-gray-700 cursor-pointer"
        to={`/product/${id}`}
      >
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className=" text-sm font-medium">
          {currency}
          {price}
        </p>
      </Link>
    </div>
  );
};

export default ProductItem;
