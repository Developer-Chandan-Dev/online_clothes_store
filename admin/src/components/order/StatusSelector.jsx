/* eslint-disable react/prop-types */
const StatusSelector = ({ status, onChange, orderId }) => (
  <select
    onChange={(event) => onChange(event, orderId)}
    value={status}
    className="p-2 font-semibold border rounded text-sm"
  >
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="processing">Processing</option>
    <option value="shipped">Shipped</option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
  </select>
);

export default StatusSelector;