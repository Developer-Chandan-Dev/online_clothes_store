/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState(""); // New: Long description
  const [productDetails, setProductDetails] = useState([""]); // New: Product details as array
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [fabric, setFabric] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [sku, setSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);

  // Available color options
  const colorOptions = [
    { name: "Black", value: "black", hex: "#000000" },
    { name: "White", value: "white", hex: "#FFFFFF" },
    { name: "Red", value: "red", hex: "#FF0000" },
    { name: "Blue", value: "blue", hex: "#0000FF" },
    { name: "Green", value: "green", hex: "#008000" },
    { name: "Gray", value: "gray", hex: "#808080" },
    { name: "Navy", value: "navy", hex: "#000080" },
    { name: "Pink", value: "pink", hex: "#FFC0CB" },
    { name: "Yellow", value: "yellow", hex: "#FFFF00" },
    { name: "Brown", value: "brown", hex: "#A52A2A" },
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("longDescription", longDescription);
      formData.append("productDetails", JSON.stringify(productDetails.filter(detail => detail.trim() !== "")));
      formData.append("price", price);
      formData.append("originalPrice", originalPrice);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      formData.append("fabric", fabric);
      formData.append("careInstructions", careInstructions);
      formData.append("sku", sku);
      formData.append("stockQuantity", stockQuantity);

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset all form fields
        setName("");
        setDescription("");
        setLongDescription("");
        setProductDetails([""]);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setOriginalPrice("");
        setSizes([]);
        setColors([]);
        setFabric("");
        setCareInstructions("");
        setSku("");
        setStockQuantity(0);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleColor = (colorValue) => {
    setColors(prev => 
      prev.includes(colorValue) 
        ? prev.filter(c => c !== colorValue) 
        : [...prev, colorValue]
    );
  };

  // Function to handle product details input
  const handleDetailChange = (index, value) => {
    const updatedDetails = [...productDetails];
    updatedDetails[index] = value;
    setProductDetails(updatedDetails);
  };

  // Function to add a new detail field
  const addDetailField = () => {
    setProductDetails([...productDetails, ""]);
  };

  // Function to remove a detail field
  const removeDetailField = (index) => {
    if (productDetails.length > 1) {
      const updatedDetails = [...productDetails];
      updatedDetails.splice(index, 1);
      setProductDetails(updatedDetails);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-4 p-6 bg-white rounded-lg shadow-sm max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Add New Product</h2>
      
      <div className="w-full">
        <p className="mb-2 font-medium">Upload Images</p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((num) => (
            <label key={num} htmlFor={`image${num}`} className="cursor-pointer">
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={!eval(`image${num}`) ? assets.upload_area : URL.createObjectURL(eval(`image${num}`))}
                  alt={`Preview ${num}`}
                />
              </div>
              <input
                onChange={(e) => eval(`setImage${num}(e.target.files[0])`)}
                type="file"
                id={`image${num}`}
                hidden
                accept="image/*"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <label className="block mb-2 font-medium">Product name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            type="text"
            placeholder="e.g., Classic Cotton T-Shirt"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">SKU (Stock Keeping Unit)</label>
          <input
            onChange={(e) => setSku(e.target.value)}
            value={sku}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            type="text"
            placeholder="e.g., M-TS-BLK-01"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="block mb-2 font-medium">Short Description</label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          rows="2"
          placeholder="Brief product description for product cards..."
          required
        />
      </div>

      <div className="w-full">
        <label className="block mb-2 font-medium">Long Description</label>
        <textarea
          onChange={(e) => setLongDescription(e.target.value)}
          value={longDescription}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          rows="4"
          placeholder="Detailed product description for the product page..."
        />
      </div>

      <div className="w-full">
        <label className="block mb-2 font-medium">Product Details</label>
        <p className="text-sm text-gray-500 mb-2">Each entry will be displayed as a list item on the product page</p>
        <div className="space-y-2">
          {productDetails.map((detail, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-gray-500">{index + 1}.</span>
              <input
                type="text"
                value={detail}
                onChange={(e) => handleDetailChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., 100% cotton fabric"
              />
              {productDetails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDetailField(index)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDetailField}
            className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            + Add Another Detail
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div>
          <label className="block mb-2 font-medium">Product category</label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Sub category</label>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
            <option value="Fullwear">Fullwear</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Current Price ($)</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            type="number"
            min="0"
            step="0.01"
            placeholder="25.00"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Original Price ($)</label>
          <input
            onChange={(e) => setOriginalPrice(e.target.value)}
            value={originalPrice}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            type="number"
            min="0"
            step="0.01"
            placeholder="35.00"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="block mb-2 font-medium">Available Sizes</label>
        <div className="flex gap-2 flex-wrap">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
              className="cursor-pointer"
            >
              <p
                className={`px-4 py-2 rounded ${
                  sizes.includes(size)
                    ? "bg-pink-100 border border-pink-300"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <label className="block mb-2 font-medium">Available Colors</label>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map((color) => (
            <div
              key={color.value}
              onClick={() => toggleColor(color.value)}
              className="cursor-pointer"
            >
              <div 
                className={`w-10 h-10 rounded-full border-2 ${colors.includes(color.value) ? 'border-black' : 'border-gray-300'}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <label className="block mb-2 font-medium">Fabric/Material</label>
          <input
            onChange={(e) => setFabric(e.target.value)}
            value={fabric}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            type="text"
            placeholder="e.g., 100% Cotton"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Stock Quantity</label>
          <input
            onChange={(e) => setStockQuantity(e.target.value)}
            value={stockQuantity}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            type="number"
            min="0"
            placeholder="50"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="block mb-2 font-medium">Care Instructions</label>
        <textarea
          onChange={(e) => setCareInstructions(e.target.value)}
          value={careInstructions}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          rows="2"
          placeholder="e.g., Machine wash cold, tumble dry low"
        />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
          className="w-4 h-4"
        />
        <label className="cursor-pointer font-medium" htmlFor="bestseller">
          Mark as Bestseller
        </label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-40 py-3 mt-4 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-50 font-medium"
      >
        {loading ? "Adding Product..." : "ADD PRODUCT"}
      </button>
    </form>
  );
};

export default Add;