/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ShopContext } from "./ShopContext";

export const FavsContext = createContext();

const FavsContextProvider = (props) => {
  const [favs, setFavs] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [favsCount, setFavsCount] = useState(0);

  const { backendUrl, token } = useContext(ShopContext);

  const getFavoritesProducts = async (token) => {
    try {
      const response = await axios.get(backendUrl + "/api/user/favorites", {
        headers: { token },
      });

      if (response?.data?.success) {
        setFavs(response.data.favorites);
        setFavIds(response.data.favoriteIds);
        setFavsCount(response?.data?.favoriteIds?.length);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      getFavoritesProducts(localStorage.getItem("token"));
    }
    if (token) {
      getFavoritesProducts(token);
    }
  }, [token]);

  const value = {
    setFavs,
    favs,
    favIds,
    setFavIds,
    favsCount,
    setFavsCount,
    getFavoritesProducts,
  };

  return (
    <FavsContext.Provider value={value}>{props.children}</FavsContext.Provider>
  );
};

export default FavsContextProvider;
