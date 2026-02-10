import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminOrderApi } from '../../services/adminOrderApi';
import {
  FiArrowLeft,
  FiEdit,
  FiCheck,
  FiX,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCalendar,
  FiTag,
  FiPackage,
  FiClock,
  FiMail,
  FiRefreshCw
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from '../../components/Badge';
import AnimatedSelect from '../../components/Admin/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../../utils/adminHelpers';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await adminOrderApi.getOrder(id);
      if (response?.success) {
        const orderData = response.data.order;
        setOrder(orderData);
        setStatus(orderData.status || '');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Order not found');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      const response = await adminOrderApi.updateStatus(id, {
        status,
        note: `Status updated by Admin`
      });
      if (response?.success) {
        setOrder(response.data);
        setIsEditing(false);
        toast.success('Order status updated successfully');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  const statusOptions = ['pending', 'processing', 'ready_to_ship', 'shipped_seller', 'shipped', 'delivered', 'cancelled'];

  // Handle items - could be a number or an array
  const itemsCount = Array.isArray(order.items) ? order.items.length : (typeof order.items === 'number' ? order.items : 0);
  const itemsArray = Array.isArray(order.items) ? order.items : [];

  // Calculate order breakdown
  const subtotal = order.pricing?.subtotal || order.subtotal || 0;
  const shipping = order.pricing?.shipping || order.shipping || 0;
  const tax = order.pricing?.tax || order.tax || 0;
  const discount = order.pricing?.discount || order.discount || 0;

  // Get payment method display name
  const getPaymentMethodName = (method) => {
    if (!method) return 'N/A';
    const methods = {
      card: 'Credit/Debit Card',
      cash: 'Cash on Delivery',
      upi: 'UPI',
      wallet: 'Digital Wallet',
      bank: 'Bank Transfer'
    };
    return methods[method.toLowerCase()] || method;
  };

  // Get product image - try item.image, then product by ID, then product by name, then placeholder
  const getProductImage = (item) => {
    if (item.image) {
      return item.image;
    }

    // Try to find product by ID
    if (item.productId || item.id) {
      const product = getProductById(item.productId || item.id);
      if (product?.image) {
        return product.image;
      }
    }

    // Try to find product by name
    if (item.name) {
      const product = products.find(p =>
        p.name.toLowerCase() === item.name.toLowerCase()
      );
      if (product?.image) {
        return product.image;
      }
    }

    // Return placeholder
    return 'https://via.placeholder.com/100x100?text=Product';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Compact Header */}
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
            <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            isEditing ? (
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
                <Badge variant={order.status || 'unknown'}>{(order.status || 'unknown').replace(/_/g, ' ')}</Badge>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  <FiEdit className="text-sm" />
                  Edit
                </button>
              </>
            )
          )}
          {(order.status === 'delivered' || order.status === 'cancelled') && (
            <Badge variant={order.status}>{order.status.replace(/_/g, ' ')}</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Overview Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            {isEditing ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Order Status
                </label>
                <AnimatedSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={statusOptions.map((option) => ({
                    value: option,
                    label: option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                  }))}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total</p>
                  <p className="font-bold text-gray-800 text-lg">{formatCurrency(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Items</p>
                  <p className="font-semibold text-gray-800">{itemsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Payment</p>
                  <p className="text-xs font-semibold text-gray-800 capitalize">
                    {getPaymentMethodName(order.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Payment Status</p>
                  <Badge variant={order.paymentStatus === 'completed' ? 'delivered' : order.paymentStatus === 'pending' ? 'pending' : 'cancelled'} className="text-xs">
                    {order.paymentStatus === 'completed' ? 'Paid' : order.paymentStatus === 'pending' ? 'Pending' : order.paymentStatus}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Return Information (if exists) */}
          {order.returnRequest && (
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-primary-500 border border-gray-200">
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
                  <p className="font-semibold capitalize">{(order.returnRequest.reason || 'unknown').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Refund Amount</p>
                  <p className="font-bold text-sm">{formatCurrency(order.returnRequest.refundAmount)}</p>
                </div>
                <div className="flex items-end">
                  <Link
                    to={`/admin/return-requests/${order.returnRequest?._id || order.returnRequest?.id || order.returnRequest}`}
                    className="text-primary-600 hover:text-primary-700 font-bold hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          {itemsArray.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiPackage className="text-primary-600 text-base" />
                Order Items ({itemsCount})
              </h2>
              <div className="space-y-2">
                {itemsArray.map((item) => (
                  <div key={item.id || item.name} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                    <img
                      src={getProductImage(item)}
                      alt={item.name || 'Product'}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{item.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(item.price || 0)} × {item.quantity || 1}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-gray-800">
                      {formatCurrency((item.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer & Shipping Combined Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div>
                <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <FiMail className="text-primary-600 text-base" />
                  Customer
                </h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-semibold text-sm text-gray-800">{order.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-xs text-gray-800 break-all">{order.customer?.email || 'N/A'}</p>
                  </div>
                  {(order.customer?.phone || order.shippingAddress?.phone) && (
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FiPhone className="text-xs" />
                        Phone
                      </p>
                      <p className="font-semibold text-sm text-gray-800">{order.customer?.phone || order.shippingAddress?.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div>
                  <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                    <FiMapPin className="text-primary-600 text-base" />
                    Shipping Address
                  </h2>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-gray-800">{order.shippingAddress.name || 'N/A'}</p>
                    {order.shippingAddress.address && (
                      <p className="text-gray-700">{order.shippingAddress.address}</p>
                    )}
                    {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.zipCode) && (
                      <p className="text-gray-700">
                        {[
                          order.shippingAddress.city,
                          order.shippingAddress.state,
                          order.shippingAddress.zipCode
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {order.shippingAddress.country && (
                      <p className="text-gray-700">{order.shippingAddress.country}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tracking & Delivery Compact */}
          {(order.trackingNumber || order.estimatedDelivery || order.deliveredDate) && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <FiTruck className="text-primary-600 text-base" />
                Tracking & Delivery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {order.trackingNumber && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Tracking Number</p>
                    <p className="font-semibold text-xs text-gray-800 font-mono">{order.trackingNumber}</p>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FiClock className="text-xs" />
                      Est. Delivery
                    </p>
                    <p className="font-semibold text-xs text-gray-800">{formatDateTime(order.estimatedDelivery)}</p>
                  </div>
                )}
                {order.deliveredDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FiPackage className="text-xs" />
                      Delivered
                    </p>
                    <p className="font-semibold text-xs text-gray-800">{formatDateTime(order.deliveredDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <FiTag className="text-xs" />
                    Discount
                    {order.couponCode && (
                      <span className="text-xs bg-green-100 px-1.5 py-0.5 rounded">({order.couponCode})</span>
                    )}
                  </span>
                  <span className="font-semibold">-{formatCurrency(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">{formatCurrency(shipping)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-lg text-gray-800">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <FiCalendar className="text-primary-600 text-base" />
              Timeline
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">Order Placed</p>
                  <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
              {order.status === 'processing' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Processing</p>
                    <p className="text-xs text-gray-500">Being prepared</p>
                  </div>
                </div>
              )}
              {order.status === 'shipped' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Shipped</p>
                    {order.shippedDate && (
                      <p className="text-xs text-gray-500">{formatDateTime(order.shippedDate)}</p>
                    )}
                  </div>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Delivered</p>
                    {order.deliveredDate && (
                      <p className="text-xs text-gray-500">{formatDateTime(order.deliveredDate)}</p>
                    )}
                  </div>
                </div>
              )}
              {order.status === 'cancelled' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Cancelled</p>
                    {order.cancelledDate && (
                      <p className="text-xs text-gray-500">{formatDateTime(order.cancelledDate)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {order.trackingNumber && (
                <button
                  onClick={() => window.open(`/track-order/${order._id || order.id}`, '_blank')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-semibold"
                >
                  <FiTruck className="text-sm" />
                  Track Order
                </button>
              )}
              {order.customer?.email && (
                <button
                  onClick={() => window.location.href = `mailto:${order.customer.email}`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold"
                >
                  <FiMail className="text-sm" />
                  Email Customer
                </button>
              )}
              {(order.customer?.phone || order.shippingAddress?.phone) && (
                <button
                  onClick={() => window.location.href = `tel:${order.customer?.phone || order.shippingAddress?.phone}`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold"
                >
                  <FiPhone className="text-sm" />
                  Call Customer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetail;

