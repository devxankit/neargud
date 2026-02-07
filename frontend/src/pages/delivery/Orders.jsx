import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiNavigation, FiPlusCircle, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/PageTransition';
import { formatPrice } from '../../utils/helpers';

import { useDeliveryStore } from '../../store/deliveryStore';
import toast from 'react-hot-toast';

const DeliveryOrders = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('available'); // 'available' or 'my-orders'
  const [filter, setFilter] = useState('all'); // all, pending, in-transit, completed
  const {
    assignedOrders,
    availableOrders,
    fetchAssignedOrders,
    fetchAvailableOrders,
    updateOrderStatus,
    claimOrder,
    updateLocation,
    loading
  } = useDeliveryStore();

  const [coords, setCoords] = useState({ lat: null, lng: null });

  // Get location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback or leave as null (backend defaults to show all if not strict)
        }
      );
    }
  }, []);

  useEffect(() => {
    if (view === 'my-orders') {
      let status = '';
      if (filter === 'pending') status = 'ready_to_ship';
      else if (filter === 'in-transit') status = 'active';
      else if (filter === 'completed') status = 'history';
      else if (filter !== 'all') status = filter;

      fetchAssignedOrders(status);
    } else {
      fetchAvailableOrders(coords.lat, coords.lng);
    }
  }, [view, filter, coords]);

  const handleClaim = async (orderId) => {
    try {
      await claimOrder(orderId);
      toast.success('Order assigned to you!');
      setView('my-orders');
      setFilter('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim order');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'out_for_delivery');
      toast.success('Order picked up!');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      toast.success('Order delivered!');
    } catch (error) {
      toast.error('Failed to complete order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'ready_to_ship':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_transit':
      case 'out_for_delivery':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const OrderCard = ({ order, isAvailable }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      onClick={() => navigate(`/delivery/orders/${order._id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FiPackage className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Order #{order.orderCode?.slice(-8) || order._id.slice(-8)}</p>
            <p className="text-sm font-bold text-gray-800">
              {order.vendorBreakdown?.[0]?.vendorId?.storeName || 'Vendor'}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {/* Pickup Location */}
        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
          <div className="p-1.5 bg-red-100 rounded-lg">
            <FiMapPin className="text-red-600" size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Pickup From</span>
            <p className="text-xs text-gray-800 font-semibold leading-tight">
              {(() => {
                const addr = order.vendorBreakdown?.[0]?.vendorId?.address;
                if (!addr) return 'Address not specified';
                if (typeof addr === 'string') return addr;
                // Handle object format if exists
                const parts = [addr.street, addr.city].filter(Boolean);
                return parts.length > 0 ? parts.join(', ') : 'Indore, MP';
              })()}
            </p>
            {order.distance !== undefined && (
              <span className="text-[10px] text-primary-600 font-bold mt-0.5">
                {order.distance} km from your current location
              </span>
            )}
          </div>
        </div>

        {/* Drop Location */}
        <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <FiNavigation className="text-blue-600" size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Drop To</span>
            <p className="text-xs text-gray-800 font-bold leading-tight">
              {order.shippingAddress?.address ? `${order.shippingAddress.address}, ${order.shippingAddress.city}` : 'Customer Address'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Delivery Charge</span>
            <span className="text-sm font-black text-primary-600 font-outfit">{formatPrice(order.deliveryFee || 0)}</span>
          </div>
          <div className="flex flex-col border-l border-gray-100 pl-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Order Total</span>
            <span className="text-sm font-bold text-gray-800 font-outfit">{formatPrice(order.total)}</span>
          </div>
          <div className="flex flex-col border-l border-gray-100 pl-4">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Items</span>
            <span className="text-sm font-bold text-gray-800">{order.items?.length || 0}</span>
          </div>
        </div>

        {isAvailable ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClaim(order._id);
            }}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all"
          >
            Accept Request
          </button>
        ) : (
          <div className="flex gap-2">
            {['ready_to_ship', 'shipped_seller'].includes(order.status) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptOrder(order._id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Pick Up
              </button>
            )}
            {order.status === 'out_for_delivery' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteOrder(order._id);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold"
              >
                Delivered
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="pb-24">
        {/* Header Section */}
        <div className="bg-white px-6 pt-16 pb-6 rounded-b-[40px] shadow-sm sticky top-0 z-20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 font-outfit">Orders</h1>
              <p className="text-xs text-gray-500">Manage your delivery tasks</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
              <FiTruck className="text-primary-600 text-xl" />
            </div>
          </div>

          {/* View Switcher */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 mb-4">
            <button
              onClick={() => setView('available')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${view === 'available' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                }`}
            >
              <FiPlusCircle />
              New Requests
            </button>
            <button
              onClick={() => setView('my-orders')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${view === 'my-orders' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                }`}
            >
              <FiPackage />
              My Orders
            </button>
          </div>

          {/* Filter (only for My Orders) */}
          <AnimatePresence>
            {view === 'my-orders' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex gap-2 overflow-x-auto no-scrollbar pt-2"
              >
                {['all', 'pending', 'in-transit', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${filter === tab
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-400 border-gray-100'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orders Content */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-gray-500">Scanning for orders...</p>
            </div>
          ) : (
            <div className="grid gap-4 mt-2">
              <AnimatePresence mode="popLayout">
                {view === 'available' ? (
                  availableOrders?.length > 0 ? (
                    availableOrders.map(order => (
                      <OrderCard key={order._id} order={order} isAvailable={true} />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20"
                    >
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <FiNavigation className="text-gray-300 text-2xl animate-pulse text-primary-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-400 mb-1">No requests nearby</p>
                      <p className="text-xs text-gray-400 px-10">We couldn't find any orders in your area. Stay online to get alerts.</p>
                    </motion.div>
                  )
                ) : (
                  assignedOrders?.length > 0 ? (
                    assignedOrders.map(order => (
                      <OrderCard key={order._id} order={order} isAvailable={false} />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20"
                    >
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <FiPackage className="text-gray-200 text-2xl" />
                      </div>
                      <p className="text-sm font-bold text-gray-400 mb-1">No active tasks</p>
                      <p className="text-xs text-gray-400">Accept a request from the "New Requests" tab to start working.</p>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default DeliveryOrders;
