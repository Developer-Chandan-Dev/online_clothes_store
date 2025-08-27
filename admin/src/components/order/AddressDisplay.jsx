/* eslint-disable react/prop-types */
const AddressDisplay = ({ address }) => (
  <div>
    <p className="mt-3 mb-2 font-medium">
      {address.firstName + " " + address.lastName}
    </p>
    <div>
      <p>
        {address.street}
        {address.apartment && `, ${address.apartment}`}
      </p>
      <p>
        {address.city +
          (address.state ? `, ${address.state}` : "") +
          ", " +
          address.country +
          ", " +
          address.zipcode}
      </p>
    </div>
    <p>{address.phone}</p>
    <p className="text-sm text-gray-500">{address.email}</p>
  </div>
);

export default AddressDisplay;
