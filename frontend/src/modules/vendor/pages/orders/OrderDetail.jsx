import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCalendar,
  FiPackage,
  FiMail,
  FiDollarSign,
  FiRefreshCw
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from "../../../../components/Badge";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import { formatPrice } from "../../../../utils/helpers";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { useVendorOrderStore } from "../../store/vendorOrderStore";
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { vendor } = useVendorAuthStore();
  const {
    currentOrder: order,
    fetchOrder,
    updateStatus,
    isLoading
  } = useVendorOrderStore();

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');

  const vendorId = vendor?.id || vendor?._id;

  useEffect(() => {
    if (!vendorId) {
      toast.error('Please log in to view orders');
      navigate('/vendor/login');
      return;
    }

    if (id) {
      fetchOrder(id).then(data => {
        if (data) setStatus(data.status);
      }).catch(() => {
        navigate('/vendor/orders');
      });
    }
  }, [id, vendorId, navigate, fetchOrder]);

  const handleStatusUpdate = async () => {
    if (!order) return;

    try {
      await updateStatus(order._id || order.id, status);
      setIsEditing(false);
    } catch (error) {
      // Error handled by store
    }
  };

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const vendorOrderData = order.vendorItems?.[0] || {
    items: order.items || [],
    subtotal: order.total || 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: order.total || 0,
    commission: 0,
    vendorEarnings: 0
  };

  // Ensure robust total and earnings calculation
  const totalAmount = vendorOrderData.total || (vendorOrderData.subtotal + (vendorOrderData.shipping || 0) + (vendorOrderData.tax || 0) - (vendorOrderData.discount || 0));
  const platformCommission = vendorOrderData.commission || 0;
  const vendorEarnings = vendorOrderData.vendorEarnings || (totalAmount - platformCommission);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready_to_ship', label: 'Ready to Ship' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'shipped_seller', label: 'Shipped (Seller)' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  // Get product image
  const getProductImage = (item) => {
    if (item.image) return item.image;
    // Fallback mentioned in existing code
    return 'https://via.placeholder.com/100x100?text=Product';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{order.orderCode}</h1>
            <p className="text-xs text-gray-500">
              {new Date(order.date).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleStatusUpdate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <FiCheck className="text-sm" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setStatus(order.status);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <FiX className="text-sm" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <AnimatedSelect
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setIsEditing(true);
                }}
                options={statusOptions}
                className="min-w-[140px]"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Return Information (if exists) */}
          {order.returnRequest && (
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-primary-500 border border-gray-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FiRefreshCw className="text-primary-600" />
                  Return Request Associated
                </h2>
                <Badge variant={order.returnRequest.status}>{order.returnRequest.status}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Return ID</p>
                  <p className="font-semibold">{order.returnRequest.returnCode}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reason</p>
                  <p className="font-semibold capitalize">{order.returnRequest.reason.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Refund Amount</p>
                  <p className="font-bold text-sm">{formatPrice(order.returnRequest.refundAmount)}</p>
                </div>
                <div className="flex items-end">
                  <Link
                    to={`/vendor/return-requests/${order.returnRequest?._id || order.returnRequest?.id || order.returnRequest}`}
                    className="text-primary-600 hover:text-primary-700 font-bold hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiPackage className="text-primary-600" />
              Your Products in This Order
            </h2>
            <div className="space-y-3">
              {vendorOrderData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {item.name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity || 1}
                    </p>
                    {item.size && (
                      <p className="text-xs text-gray-500">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-xs text-gray-500">Color: {item.color}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.price || 0)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-800">
                  {formatPrice(vendorOrderData.subtotal)}
                </span>
              </div>
              {vendorOrderData.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-800">
                    {formatPrice(vendorOrderData.shipping)}
                  </span>
                </div>
              )}
              {vendorOrderData.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-800">
                    {formatPrice(vendorOrderData.tax)}
                  </span>
                </div>
              )}
              {vendorOrderData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatPrice(vendorOrderData.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-primary-600 text-lg">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order Status */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Status</h2>
            <div className="flex items-center gap-3 mb-4">
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
            </div>
            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Status History</p>
                <div className="relative space-y-4">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                  {order.statusHistory.map((history, idx) => (
                    <div key={idx} className="relative flex gap-3 pl-6">
                      <div className={`absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full border-2 border-white z-10 ${idx === 0 ? 'bg-primary-500' : 'bg-gray-300'
                        }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold capitalize ${idx === 0 ? 'text-primary-700' : 'text-gray-700'}`}>
                          {history.status.replace('_', ' ')}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(history.timestamp).toLocaleString([], {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )).reverse()}
                </div>
              </div>
            )}
          </div>

          {/* Commission Info */}
          {vendorOrderData.commission > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm border border-purple-200">
              <h2 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                <FiDollarSign className="text-purple-600" />
                Commission
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700">Platform Commission</span>
                  <span className="font-semibold text-purple-800">
                    {formatPrice(platformCommission)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-purple-200">
                  <span className="text-purple-700 font-semibold">Your Earnings</span>
                  <span className="font-bold text-purple-800">
                    {formatPrice(vendorEarnings)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Info</h2>
            <div className="space-y-3">
              {order.shippingAddress && (
                <div>
                  <div className="flex items-start gap-2 mb-1">
                    <FiMapPin className="text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-800">
                        {order.shippingAddress.street || 'N/A'}
                        {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                        {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                        {order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FiCreditCard className="text-gray-400" />
                  <p className="text-xs text-gray-600">Payment Method</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {order.paymentMethod || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetail;

