/* eslint-disable react/prop-types */
import { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const UpdateProductPopup = ({ token, product, onClose, onUpdate }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || '');
  const [category, setCategory] = useState(product?.category || 'Men');
  const [subCategory, setSubCategory] = useState(product?.subCategory || 'Topwear');
  const [bestseller, setBestseller] = useState(product?.bestseller || false);
  const [sizes, setSizes] = useState(product?.sizes || []);

  const productId = product?._id;

//   const handleImagePreview = (index) => {
//     return (
//       product.image?.[index] && ![image1, image2, image3, image4][index]
//         ? product.image[index]
//         : URL.createObjectURL([image1, image2, image3, image4][index])
//     );
//   };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.put(
        `${backendUrl}/api/product/update/${productId}`,
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        onUpdate(); // trigger refetch or update parent state
        onClose();  // close the popup
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-lg max-w-lg w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl mb-4 font-semibold">Update Product</h2>

        {/* Image Upload */}
        <div className="mb-4">
          <p className="mb-2">Update Images</p>
          <div className="flex gap-2">
            {[image1, image2, image3, image4].map((img, index) => (
              <label key={index} htmlFor={`image${index + 1}`}>
                <img
                  className="w-20 h-20 object-cover"
                  src={
                    img
                      ? URL.createObjectURL(img)
                      : product.image?.[index]
                      ? product.image[index]
                      : assets.upload_area
                  }
                  alt=""
                />
                <input
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                  onChange={(e) => {
                    const setImage = [setImage1, setImage2, setImage3, setImage4][index];
                    setImage(e.target.files[0]);
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-3 p-2 border" type="text" placeholder="Product Name" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mb-3 p-2 border" placeholder="Description" required />
        
        <div className="flex gap-3 mb-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>

          <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="p-2 border">
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
            <option value="Fullwear">Fullwear</option>
          </select>

          <input value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 border w-24" type="number" placeholder="Price" />
        </div>

        {/* Sizes */}
        <div className="mb-3">
          <p className="mb-1">Sizes</p>
          <div className="flex gap-2">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <div
                key={size}
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes(size)
                      ? prev.filter((s) => s !== size)
                      : [...prev, size]
                  )
                }
                className={`cursor-pointer px-3 py-1 rounded ${
                  sizes.includes(size) ? "bg-pink-100" : "bg-gray-200"
                }`}
              >
                {size}
              </div>
            ))}
          </div>
        </div>

        {/* Bestseller */}
        <div className="flex items-center mb-4">
          <input type="checkbox" id="bestseller" checked={bestseller} onChange={() => setBestseller((prev) => !prev)} />
          <label htmlFor="bestseller" className="ml-2 cursor-pointer">Add to Bestseller</label>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Update</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProductPopup;
