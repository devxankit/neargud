import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiClock,
  FiPackage,
  FiNavigation,
  FiCheckCircle,
  FiUser,
  FiTrendingUp,
} from 'react-icons/fi';
import PageTransition from '../../components/PageTransition';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useDeliveryStore } from '../../store/deliveryStore';

const DeliveryOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrder: order, fetchOrderDetails, updateOrderStatus, loading } = useDeliveryStore();

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const openInGoogleMaps = () => {
    const addressStr = order?.shippingAddress?.address + ", " + order?.shippingAddress?.city + ", " + order?.shippingAddress?.zipCode;
    const encodedAddress = encodeURIComponent(addressStr);

    // Universal Maps URL
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapUrl, '_blank');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="px-4 py-6 text-center">
          <p className="text-gray-600">Order not found</p>
          <button onClick={() => navigate('/delivery/orders')} className="text-primary-600 mt-4">Back to Orders</button>
        </div>
      </PageTransition>
    );
  }

  const customerName = order.customerSnapshot?.name || order.customerId?.firstName ? `${order.customerId.firstName} ${order.customerId.lastName}` : 'Customer';
  const customerPhone = order.customerSnapshot?.phone || order.customerId?.phone || 'N/A';
  const customerEmail = order.customerSnapshot?.email || order.customerId?.email || 'N/A';
  const addressString = order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}` : 'N/A';
  const formattedStatus = order.status ? order.status.replace(/_/g, ' ') : '';

  return (
    <PageTransition>
      <div className="px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/delivery/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="text-xl text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">Order #{order.orderCode || order._id?.substring(0, 8)}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} uppercase`}>
              {formattedStatus}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiUser />
            Customer Information
          </h2>
          <div className="space-y-2">
            <p className="text-gray-800 font-semibold">{customerName}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiPhone />
              <a href={`tel:${customerPhone}`} className="hover:text-primary-600">
                {customerPhone}
              </a>
            </div>
            <p className="text-sm text-gray-600">{customerEmail}</p>
          </div>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiMapPin />
            Delivery Address
          </h2>
          <p className="text-gray-700 mb-3">{addressString}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {/* Distance logic requires coordinates or backend calc. For now placeholder or removing if undefined */}
            {order.distance && (
              <div className="flex items-center gap-1">
                <FiNavigation />
                <span>{order.distance}</span>
              </div>
            )}
          </div>
          <div className="mt-3">
            <button
              onClick={openInGoogleMaps}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors"
            >
              <FiNavigation />
              Open in Google Maps
            </button>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiPackage />
            Order Items
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiTrendingUp />
            Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-700">
              <span>Subtotal</span>
              {/* Calculating subtotal since backend might aggregate differently, but order.items usually has prices */}
              <span>{formatPrice(order.items?.reduce((cur, item) => cur + (item.price * item.quantity), 0) || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span className="font-medium text-gray-900">Your Earning</span>
              <span className="font-bold text-green-600">{formatPrice(order.deliveryFee || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span>Total</span>
              <span className="font-bold text-primary-600 text-lg">{formatPrice(order.total || 0)}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 pt-4"
        >
          {(['shipped', 'dispatched', 'ready_to_ship', 'shipped_seller'].includes(order.status)) && (
            <button
              onClick={() => handleUpdateStatus('out_for_delivery')}
              className="w-full gradient-green text-white py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
            >
              <FiCheckCircle />
              Pick Up Order
            </button>
          )}
          {order.status === 'out_for_delivery' && (
            <button
              onClick={() => handleUpdateStatus('delivered')}
              className="w-full gradient-green text-white py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
            >
              <FiCheckCircle />
              Mark as Delivered
            </button>
          )}
          <button
            onClick={() => window.open(`tel:${customerPhone}`, '_self')}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-gray-200"
          >
            <FiPhone />
            Call Customer
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default DeliveryOrderDetail;
