import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeliveryAuthStore } from '../../store/deliveryAuthStore';
import { useDeliveryStore } from '../../store/deliveryStore';
import { FiPackage, FiCheckCircle, FiClock, FiTrendingUp, FiMapPin, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/PageTransition';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const DeliveryDashboard = () => {
  const { deliveryBoy, updateStatus } = useDeliveryAuthStore();
  const { stats, fetchStats, assignedOrders, fetchAssignedOrders } = useDeliveryStore();
  const navigate = useNavigate();
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAssignedOrders(''); // Fetch all to show recent
  }, []);

  const displayStats = stats || {
    activeOrders: 0,
    completedToday: 0,
    totalDelivered: 0,
    earnings: 0,
    avgRating: 0,
    totalRatings: 0
  };

  const statCards = [
    {
      icon: FiPackage,
      label: 'Total Orders',
      value: (displayStats.activeOrders || 0) + (displayStats.totalDelivered || 0),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      icon: FiCheckCircle,
      label: 'Completed Today',
      value: displayStats.completedToday || 0,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      icon: FiClock,
      label: 'Active',
      value: displayStats.activeOrders || 0,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      icon: FiTrendingUp,
      label: 'Earnings',
      value: formatPrice(displayStats.earnings || 0),
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  const recentOrdersList = assignedOrders ? assignedOrders.slice(0, 3) : [];

  const handleStatusChange = (newStatus) => {
    updateStatus(newStatus);
    toast.success(`Status updated to ${newStatus}`);
    setStatusMenuOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_to_ship':
      case 'dispatched':
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusButtonColor = (status) => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'busy':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-b-[40px] px-6 pt-20 pb-8 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">Welcome back, {deliveryBoy?.firstName || 'Partner'}!</h1>
              <p className="text-primary-100 text-sm">
                {deliveryBoy?.status === 'available'
                  ? 'You are available for new orders'
                  : deliveryBoy?.status === 'busy'
                    ? 'You are currently busy'
                    : 'You are offline'}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: getStatusButtonColor(deliveryBoy?.status) }}
              >
                <span className="w-2 h-2 rounded-full bg-white"></span>
                {deliveryBoy?.status || 'offline'}
              </button>

              <AnimatePresence>
                {statusMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    <button
                      onClick={() => handleStatusChange('available')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-700"
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleStatusChange('busy')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-700"
                    >
                      Busy
                    </button>
                    <button
                      onClick={() => handleStatusChange('offline')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                    >
                      Offline
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiTruck className="text-lg" />
              <span className="text-sm">{deliveryBoy?.vehicleType || 'Bike'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{deliveryBoy?.vehicleNumber || 'N/A'}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 px-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bgColor} rounded-xl p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`${stat.textColor} text-xl`} />
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white text-lg" />
                  </div>
                </div>
                <p className={`${stat.textColor} text-xs font-medium mb-1`}>{stat.label}</p>
                <p className={`${stat.textColor} text-xl font-bold`}>{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm mx-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <button
              onClick={() => navigate('/delivery/orders')}
              className="text-primary-600 text-sm font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentOrdersList.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              recentOrdersList.map((order, index) => (
                <motion.div
                  key={order._id || order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => navigate(`/delivery/orders/${order._id || order.id}`)}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{order.orderCode || order._id || order.id}</p>
                      <p className="text-sm text-gray-600">{order.customerSnapshot?.name || 'Customer'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FiMapPin className="text-primary-600" />
                    <span className="truncate max-w-[200px]">
                      {(() => {
                        const shipAddr = order.shippingAddress;
                        const vendorAddr = order.vendorBreakdown?.[0]?.vendorId?.address;
                        if (shipAddr?.address) return `${shipAddr.address}, ${shipAddr.city}`;
                        if (vendorAddr) {
                          if (typeof vendorAddr === 'string') return vendorAddr;
                          return `${vendorAddr.street || ''}, ${vendorAddr.city || ''}`.replace(/^, /, '') || 'Address available';
                        }
                        return 'Address not available';
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Items: {order.items?.length || 0}</span>
                    <span className="font-bold text-primary-600">{formatPrice(order.total || order.amount || 0)}</span>
                  </div>
                </motion.div>
              )))}
          </div>
        </motion.div>

      </div>
    </PageTransition>
  );
};

export default DeliveryDashboard;
