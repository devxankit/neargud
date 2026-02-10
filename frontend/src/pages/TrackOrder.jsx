import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiMapPin, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useOrderStore } from '../store/orderStore';
import { formatPrice } from '../utils/helpers';
import PageTransition from '../components/PageTransition';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import Badge from '../components/Badge';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder, fetchOrder } = useOrderStore();
  const order = getOrder(orderId);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      setFetching(true);
      try {
        await fetchOrder(orderId);
      } catch (error) {
        console.error("Error fetching order tracking:", error);
      } finally {
        setFetching(false);
      }
    };
    if (!order) {
      loadOrder();
    }
  }, [orderId, fetchOrder, order]);

  if (!order && fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order && !fetching) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 w-full overflow-x-hidden">
          <main className="w-full overflow-x-hidden flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
              <button
                onClick={() => navigate('/orders')}
                className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
              >
                Back to Orders
              </button>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  const getStatusTimestamp = (targetStatuses) => {
    if (!order.statusHistory || !Array.isArray(order.statusHistory)) return null;
    const history = [...order.statusHistory].reverse().find(h => targetStatuses.includes(h.status));
    return history ? history.timestamp : null;
  };

  const getTrackingSteps = () => {
    const steps = [
      {
        label: 'Order Placed',
        icon: FiCheckCircle,
        completed: true,
        date: order.date || order.createdAt,
        description: 'Your order has been confirmed',
      },
      {
        label: order.status === 'ready_to_ship' ? 'Ready to Ship' : 'Processing',
        icon: FiPackage,
        // Completed when ready to ship or later
        completed: ['processing', 'ready_to_ship', 'dispatched', 'shipped_seller', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status),
        // Use ready_to_ship date if available, otherwise processing date
        date: getStatusTimestamp(['ready_to_ship', 'processing']),
        description: order.status === 'ready_to_ship' ? 'Your order is packed and ready for pickup' : 'We are preparing your order',
      },
      {
        label: 'Shipped',
        icon: FiTruck,
        // Completed when actually shipped
        completed: ['shipped', 'shipped_seller', 'dispatched', 'out_for_delivery', 'delivered'].includes(order.status),
        date: getStatusTimestamp(['shipped', 'shipped_seller', 'dispatched', 'out_for_delivery']),
        description: 'Your order is on the way',
      },
      {
        label: 'Delivered',
        icon: FiCheckCircle,
        completed: order.status === 'delivered' || ['return_requested', 'return_approved', 'return_rejected', 'returned'].includes(order.status),
        date: order.status === 'delivered' ? (getStatusTimestamp(['delivered']) || order.estimatedDelivery) : getStatusTimestamp(['delivered']),
        description: 'Your order has been delivered',
      },
    ];

    if (order.returnRequest || ['return_requested', 'return_approved', 'return_rejected', 'returned'].includes(order.status)) {
      const returnStatus = order.returnRequest?.status || order.status;
      steps.push({
        label: (returnStatus === 'approved' || order.status === 'return_approved') ? 'Return Approved' :
          (returnStatus === 'rejected' || order.status === 'return_rejected') ? 'Return Rejected' :
            (returnStatus === 'completed' || order.status === 'returned') ? 'Returned' : 'Return Requested',
        icon: FiRefreshCw,
        completed: ['approved', 'completed', 'returned', 'return_approved'].includes(returnStatus) || ['return_approved', 'returned'].includes(order.status),
        date: getStatusTimestamp(['return_requested', 'return_approved', 'return_rejected', 'returned']),
        description: (returnStatus === 'rejected' || order.status === 'return_rejected') ? `Your return request was rejected. Reason: ${order.returnRequest?.rejectionReason || 'N/A'}` :
          (returnStatus === 'approved' || order.status === 'return_approved') ? 'Return approved, pickup scheduled' :
            (returnStatus === 'completed' || order.status === 'returned') ? 'Return process completed' :
              'Return request submitted',
      });
    }

    return steps;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDeliveryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const trackingSteps = getTrackingSteps();

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 w-full overflow-x-hidden">
          <main className="w-full overflow-x-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
              <Breadcrumbs />

              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      Track Order #{order.orderCode || order._id || order.id}
                    </h1>
                    <p className="text-gray-600">
                      Estimated delivery: {formatDeliveryDate(order.estimatedDelivery)}
                    </p>
                  </div>
                  <Badge variant={order.status === 'delivered' ? 'success' : 'info'}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Tracking Number */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 mb-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Tracking Number</h3>
                      <p className="text-2xl font-bold text-primary-600 font-mono">
                        {order.trackingNumber}
                      </p>
                    </div>
                    <div className="p-4 bg-primary-100 rounded-xl">
                      <FiPackage className="text-3xl text-primary-600" />
                    </div>
                  </div>
                </motion.div>

                {/* Tracking Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 mb-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status</h2>
                  <div className="relative">
                    {trackingSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={index} className="relative pb-8 last:pb-0">
                          {/* Timeline Line */}
                          {index < trackingSteps.length - 1 && (
                            <div
                              className={`absolute left-6 top-12 w-0.5 h-full ${step.completed ? 'bg-primary-600' : 'bg-gray-200'
                                }`}
                            />
                          )}

                          {/* Step Content */}
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-400'
                                }`}
                            >
                              <Icon className="text-xl" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3
                                  className={`font-bold ${step.completed ? 'text-gray-800' : 'text-gray-400'
                                    }`}
                                >
                                  {step.label}
                                </h3>
                                {step.date && (
                                  <span className="text-sm text-gray-500">
                                    {formatDate(step.date)}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'
                                  }`}
                              >
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Delivery Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6 mb-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiMapPin className="text-green-500" />
                    Delivery Address
                  </h2>
                  <div className="space-y-1 text-gray-700">
                    <p className="font-semibold">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </motion.div>

                {/* Order Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(item.originalPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-bold text-gray-800">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-primary-600">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Back Button */}
                <div className="mt-6">
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <FiArrowLeft />
                    Back to Orders
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
};

export default TrackOrder;

