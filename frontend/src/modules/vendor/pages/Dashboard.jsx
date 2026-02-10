import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { formatPrice } from '../../../utils/helpers';
import { fetchPerformanceMetrics, fetchOrderStats } from '../../../services/vendorDashboardApi';
import { fetchStockStats } from '../../../services/vendorStockApi';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Run all fetch requests in parallel
        const [performanceRes, orderStatsRes, stockStatsRes] = await Promise.all([
          fetchPerformanceMetrics('all'),
          fetchOrderStats(),
          fetchStockStats()
        ]);
        console.log(performanceRes, "JBJBIJB");
        // Process Performance Metrics
        if (performanceRes && performanceRes.success && performanceRes.data) {
          const { metrics, earnings, recentOrders: apiRecentOrders, topProducts: apiTopProducts } = performanceRes.data;

          setStats(prev => ({
            ...prev,
            totalEarnings: earnings.totalEarnings || 0,
            pendingEarnings: earnings.pendingEarnings || 0,
            totalProducts: metrics.totalProducts || 0, // Fallback if stockStats fails
          }));

          setRecentOrders(apiRecentOrders || []);
          setTopProducts(apiTopProducts || []);
        }

        // Process Order Stats
        if (orderStatsRes && orderStatsRes.success && orderStatsRes.data) {
          const orderData = orderStatsRes.data;
          setStats(prev => ({
            ...prev,
            totalOrders: orderData.total || 0,
            pendingOrders: (orderData.pending || 0) + (orderData.processing || 0), // Pending typically includes processing
          }));
        }

        // Process Stock Stats
        if (stockStatsRes && stockStatsRes.success && stockStatsRes.data) {
          const stockStats = stockStatsRes.data.stats;
          setStats(prev => ({
            ...prev,
            totalProducts: stockStats.totalProducts || prev.totalProducts,
            inStockProducts: stockStats.inStock || 0,
          }));
        }

      } catch (error) {
        console.error('Failed to load dashboard data', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (vendor?.id) {
      loadDashboardData();
    }
  }, [vendor]);

  const statCards = [
    {
      icon: FiPackage,
      label: 'Total Products',
      value: stats.totalProducts,
      subValue: `${stats.inStockProducts} In Stock`,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      link: '/vendor/products',
    },
    {
      icon: FiShoppingBag,
      label: 'Total Orders',
      value: stats.totalOrders,
      subValue: 'Lifetime',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      link: '/vendor/orders/all-orders',
    },
    {
      icon: FiTrendingUp,
      label: 'Pending Orders',
      value: stats.pendingOrders,
      subValue: 'Needs Attention',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      link: '/vendor/orders/pending-orders',
    },
    {
      icon: FiDollarSign,
      label: 'Total Earnings',
      value: formatPrice(stats.totalEarnings || 0),
      subValue: `Pending: ${formatPrice(stats.pendingEarnings || 0)}`,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      link: '/vendor/earnings',
    },
  ];

  if (!vendor) {
    return <div className="p-8 text-center text-gray-500">Please log in to view dashboard.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back, {vendor?.storeName || vendor?.name}! Here's your store overview.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => stat.link && navigate(stat.link)}
            className={`${stat.bgColor} rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow border border-transparent hover:border-${stat.textColor.split('-')[1]}-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                <stat.icon className="text-white text-xl" />
              </div>
              <FiArrowRight className={`${stat.textColor} text-lg opacity-60`} />
            </div>
            <h3 className={`${stat.textColor} text-sm font-medium mb-1`}>{stat.label}</h3>
            <p className={`${stat.textColor} text-2xl font-bold`}>{stat.value}</p>
            {stat.subValue && (
              <p className={`text-xs ${stat.textColor} opacity-80 mt-1`}>{stat.subValue}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/vendor/products/add-product')}
            className="flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-left border border-primary-100"
          >
            <div className="bg-primary-500 p-2 rounded-lg shadow-sm">
              <FiPackage className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Add New Product</h3>
              <p className="text-sm text-gray-600">Create a new product listing</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/vendor/orders/all-orders')}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left border border-green-100"
          >
            <div className="bg-green-500 p-2 rounded-lg shadow-sm">
              <FiShoppingBag className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">View Orders</h3>
              <p className="text-sm text-gray-600">Manage your orders</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/vendor/earnings')}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left border border-purple-100"
          >
            <div className="bg-purple-500 p-2 rounded-lg shadow-sm">
              <FiDollarSign className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">View Earnings</h3>
              <p className="text-sm text-gray-600">Check your earnings</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Orders & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/vendor/orders/${order.id}`)}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 text-sm">{formatPrice(order.total || 0)}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'pending' || order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}
                    >
                      {(order.status || 'unknown').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">No orders yet</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Top Products</h2>
            <button
              onClick={() => navigate('/vendor/products')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/vendor/products/${product.id}`)}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg bg-white"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/40?text=Prod';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} sold • {formatPrice(product.revenue || 0)} Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">No products data available</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VendorDashboard;
