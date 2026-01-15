import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiPackage, FiTruck, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from "../../../../components/Badge";
import { formatPrice } from "../../../../utils/helpers";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { useVendorOrderStore } from "../../store/vendorOrderStore";

const OrderTracking = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const {
    orders,
    fetchOrders,
    isLoading
  } = useVendorOrderStore();

  const [searchQuery, setSearchQuery] = useState('');

  const vendorId = vendor?.id || vendor?._id;

  // Fetch orders from API
  useEffect(() => {
    if (vendorId) {
      const params = {};
      if (searchQuery) params.search = searchQuery;

      const debounceTimer = setTimeout(() => {
        fetchOrders(params);
      }, searchQuery ? 500 : 0);

      return () => clearTimeout(debounceTimer);
    }
  }, [vendorId, searchQuery, fetchOrders]);

  const filteredOrders = orders;

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FiClock className="text-yellow-600" />;
      case 'processing':
        return <FiPackage className="text-indigo-600" />;
      case 'shipped':
        return <FiTruck className="text-cyan-600" />;
      case 'delivered':
        return <FiCheckCircle className="text-green-600" />;
      case 'cancelled':
      case 'canceled':
        return <FiX className="text-red-600" />;
      default:
        return <FiClock className="text-gray-600" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-cyan-100 text-cyan-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get vendor order data
  const getVendorOrderData = (order) => {
    if (order.vendorItems && Array.isArray(order.vendorItems)) {
      const vendorItem = order.vendorItems.find((vi) => vi.vendorId === vendorId);
      if (vendorItem) {
        return {
          itemCount: vendorItem.items?.length || 0,
          subtotal: vendorItem.subtotal || 0,
          firstItem: vendorItem.items?.[0] || null,
        };
      }
    }
    const vendorItems = order.items?.filter((item) => item.vendorId === vendorId) || [];
    return {
      itemCount: vendorItems.length,
      subtotal: vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      firstItem: vendorItems[0] || null,
    };
  };

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to track orders</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Order Tracking
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track the status of your orders
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or Tracking Number..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const vendorData = getVendorOrderData(order);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header Section */}
                <div
                  onClick={() => navigate(`/vendor/orders/${order.id}`)}
                  className="p-4 sm:p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 truncate">{order.orderCode || order.id}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Product Content Preview */}
                      <div className="flex items-center gap-3 mt-4">
                        {vendorData.firstItem?.image ? (
                          <img
                            src={vendorData.firstItem.image}
                            alt={vendorData.firstItem.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/48x48?text=P'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiPackage className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {vendorData.firstItem?.name || 'Order Details'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {vendorData.itemCount} items • {formatPrice(vendorData.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          order.status === 'delivered'
                            ? 'success'
                            : order.status === 'pending'
                              ? 'warning'
                              : order.status === 'cancelled' || order.status === 'canceled'
                                ? 'error'
                                : 'info'
                        }>
                        {order.status?.toUpperCase() || 'N/A'}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vendor/orders/${order.id}`);
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-semibold">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="bg-gray-50/50 p-4 sm:p-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Status History</h4>
                    <div className="relative space-y-4">
                      {/* Vertical Line */}
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                      {order.statusHistory.slice().reverse().map((history, idx) => (
                        <div key={idx} className="relative flex gap-4 pl-8">
                          {/* Dot */}
                          <div className={`absolute left-0 top-1.5 w-[20px] h-[20px] rounded-full border-4 border-white z-10 ${idx === 0 ? 'bg-primary-500' : 'bg-gray-300'
                            }`}></div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <p className={`text-sm font-bold capitalize ${idx === 0 ? 'text-primary-700' : 'text-gray-700'}`}>
                                {history.status.replace(/_/g, ' ')}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium">
                                {new Date(history.timestamp).toLocaleString([], {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {history.note && (
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed italic">
                                "{history.note}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No orders found</p>
            <p className="text-sm text-gray-400">
              {searchQuery
                ? 'Try a different search term'
                : 'Orders containing your products will appear here'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderTracking;

