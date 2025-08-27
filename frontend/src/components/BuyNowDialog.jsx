/* eslint-disable react/prop-types */
import { useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, CreditCard, Truck, BadgeDollarSign, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const BuyNowDialog = ({
  product,
  isOpen,
  onClose,
  selectedSize,
  selectedColor,
  quantity,
}) => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "street",
      "city",
      "zipcode",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !shippingAddress[field]
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedSize && product.sizes.length > 0) {
      toast.error("Please select a size");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
        shippingAddress,
        paymentMethod,
      };

      const response = await axios.post(
        `${backendUrl}/api/order/direct-order`,
        orderData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order placed successfully!");
        onClose();
        navigate("/orders"); // Redirect to orders page
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = product.price * quantity;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={loading ? () => {} : onClose}
        static={loading}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-gray-900"
                  >
                    Complete Your Order
                  </Dialog.Title>
                  {!loading && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader
                      size={48}
                      className="animate-spin text-blue-600 mb-4"
                    />
                    <p className="text-gray-600">Processing your order...</p>
                  </div>
                ) : (
                  <>
                    {/* Product Summary */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex gap-4">
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedSize && `Size: ${selectedSize} • `}
                            {selectedColor && `Color: ${selectedColor} • `}
                            Qty: {quantity}
                          </p>
                          <p className="font-semibold text-gray-900 mt-2">
                            ${totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={shippingAddress.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={shippingAddress.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={shippingAddress.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={shippingAddress.street}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment
                        </label>
                        <input
                          type="text"
                          name="apartment"
                          value={shippingAddress.apartment}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipcode"
                          value={shippingAddress.zipcode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={shippingAddress.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Payment Method</h4>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="mr-3"
                          />
                          <Truck size={16} className="mr-2" />
                          Cash on Delivery
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="stripe"
                            checked={paymentMethod === "stripe"}
                            onChange={() => setPaymentMethod("stripe")}
                            className="mr-3"
                          />
                          <CreditCard size={16} className="mr-2" />
                          Credit Card
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="razorpay"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                            className="mr-3"
                          />
                          <BadgeDollarSign size={16} className="mr-2" />
                          Razorpay
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Place Order - ${totalPrice.toFixed(2)}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BuyNowDialog;
