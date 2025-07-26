/* eslint-disable react/prop-types */
import { FiShoppingBag, FiUsers, FiDollarSign, FiPieChart, FiPackage, FiTruck } from 'react-icons/fi';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FiDollarSign className="text-blue-500" size={24} />} 
            title="Total Revenue" 
            value="$24,780" 
            change="+12% from last month" 
            changePositive={true} 
          />
          <StatCard 
            icon={<FiShoppingBag className="text-green-500" size={24} />} 
            title="Total Orders" 
            value="1,245" 
            change="+8% from last month" 
            changePositive={true} 
          />
          <StatCard 
            icon={<FiUsers className="text-purple-500" size={24} />} 
            title="Total Customers" 
            value="845" 
            change="+5% from last month" 
            changePositive={true} 
          />
          <StatCard 
            icon={<FiPackage className="text-orange-500" size={24} />} 
            title="Low Stock Items" 
            value="12" 
            change="3 critical" 
            changePositive={false} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sales Overview</h2>
              <select className="bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm">
                <option>Last 7 Days</option>
                <option>Last Month</option>
                <option>Last Year</option>
              </select>
            </div>
            <SalesChart />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Revenue Sources</h2>
            <RevenuePieChart />
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrdersTable />
          <TopProductsTable />
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, changePositive }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-gray-100">
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-sm ${changePositive ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </p>
    </div>
  );
};

// Sales Chart Component (placeholder - you'd use Chart.js or similar)
const SalesChart = () => {
  return (
    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
      <p className="text-gray-400">Sales chart will appear here</p>
    </div>
  );
};

// Revenue Pie Chart Component (placeholder)
const RevenuePieChart = () => {
  return (
    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
      <p className="text-gray-400">Revenue pie chart will appear here</p>
    </div>
  );
};

// Recent Orders Table Component
const RecentOrdersTable = () => {
  const orders = [
    { id: '#ORD-001', customer: 'John Doe', date: '2023-05-15', amount: '$120', status: 'Completed' },
    { id: '#ORD-002', customer: 'Jane Smith', date: '2023-05-14', amount: '$85', status: 'Processing' },
    { id: '#ORD-003', customer: 'Robert Johnson', date: '2023-05-14', amount: '$240', status: 'Completed' },
    { id: '#ORD-004', customer: 'Emily Davis', date: '2023-05-13', amount: '$65', status: 'Shipped' },
    { id: '#ORD-005', customer: 'Michael Wilson', date: '2023-05-12', amount: '$175', status: 'Completed' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <button className="text-blue-500 text-sm font-medium">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Order ID</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Customer</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 text-sm">{order.id}</td>
                <td className="py-3 px-2 text-sm">{order.customer}</td>
                <td className="py-3 px-2 text-sm">{order.date}</td>
                <td className="py-3 px-2 text-sm">{order.amount}</td>
                <td className="py-3 px-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Top Products Table Component
const TopProductsTable = () => {
  const products = [
    { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: '$99', stock: 45, sales: 120 },
    { id: 2, name: 'Running Shoes', category: 'Sports', price: '$75', stock: 32, sales: 98 },
    { id: 3, name: 'Smart Watch', category: 'Electronics', price: '$199', stock: 18, sales: 85 },
    { id: 4, name: 'Cotton T-Shirt', category: 'Fashion', price: '$25', stock: 67, sales: 76 },
    { id: 5, name: 'Bluetooth Speaker', category: 'Electronics', price: '$59', stock: 23, sales: 65 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Top Selling Products</h2>
        <button className="text-blue-500 text-sm font-medium">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Product</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Category</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Price</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Stock</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Sales</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 text-sm font-medium">{product.name}</td>
                <td className="py-3 px-2 text-sm text-gray-500">{product.category}</td>
                <td className="py-3 px-2 text-sm">{product.price}</td>
                <td className="py-3 px-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.stock < 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stock} left
                  </span>
                </td>
                <td className="py-3 px-2 text-sm">{product.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;