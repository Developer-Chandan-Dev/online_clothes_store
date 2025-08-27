/* eslint-disable react/prop-types */

import AddressDisplay from "./AddressDisplay";
import StatusSelector from "./StatusSelector";
import { currency } from "../../App";
import { assets } from "../../assets/assets";
import OrderItem from "./OrderItem";
import { Edit, Trash2 } from "lucide-react";

const OrderCard = ({ order, onStatusChange, onDelete }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_0.5fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700">
    <img className="w-12" src={assets.parcel_icon} alt="Order" />
    
    <div>
      <div>
        {order.items.map((item, index) => (
          <OrderItem key={index} item={item} />
        ))}
      </div>
      <AddressDisplay address={order.shippingAddress} />
    </div>
    
    <div>
      <p className="text-sm sm:text-[15px]">
        Items: {order.items.length}
      </p>
      <p className="mt-3">Method: {order.paymentMethod}</p>
      <p>Payment: {order.paymentStatus}</p>
      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
      <p className="text-sm text-gray-500">
        Type: {order.orderType}
      </p>
    </div>
    
    <p className="text-sm sm:text-[15px] font-semibold">
      {currency}
      {order.totalAmount}
    </p>
    
    <StatusSelector 
      status={order.status} 
      onChange={onStatusChange} 
      orderId={order._id} 
    />
    
    <div className="flex items-center justify-end gap-2">
      <Trash2
        className="size-[20px] transition-all text-red-400 hover:text-red-600 cursor-pointer"
        onClick={() => onDelete(order._id)}
      />
      <Edit className="size-[18px] transition-all text-blue-400 hover:text-blue-600 cursor-pointer" />
    </div>
  </div>
);
export default OrderCard;