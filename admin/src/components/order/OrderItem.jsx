/* eslint-disable react/prop-types */
const OrderItem = ({ item }) => (
  <p className="py-0.5">
    {item.name} x {item.quantity}
    {item.size && ` (Size: ${item.size})`}
    {item.color && ` (Color: ${item.color})`}
  </p>
);

export default OrderItem;