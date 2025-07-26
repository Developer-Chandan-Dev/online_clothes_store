import { useContext } from "react";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { FavsContext } from "../context/FavsContext";

const Favorites = () => {

  const { favs } = useContext(FavsContext)

  return (
    <div className="border-t pt-14">
      <div className=" text-2xl mb-3">
        <Title text1={"YOUR"} text2={"FAVORITES"} />
      </div>
      {/* Rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {favs?.favorites &&
          favs?.favorites.length > 0 &&
          favs?.favorites.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          ))}
      </div>
    </div>
  );
};

export default Favorites;
