import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../../../store/vendorAuthStore';
import { useOrderStore } from '../../../store/orderStore';
import { getProductById } from '../../../data/products';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { vendor } = useVendorAuthStore();
  const { getOrder, updateOrderStatus } = useOrderStore();
  const [order, setOrder] = useState(null);
  const [vendorOrderData, setVendorOrderData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');

  const vendorId = vendor?.id;

  useEffect(() => {
    if (!vendorId) {
      toast.error('Please log in to view orders');
      navigate('/vendor/login');
      return;
    }

    const foundOrder = getOrder(id);
    
    if (!foundOrder) {
      toast.error('Order not found');
      navigate('/vendor/orders');
      return;
    }

    // Check if order contains vendor's products
    const hasVendorItems = foundOrder.vendorItems?.some(
      (vi) => vi.vendorId === vendorId
    ) || foundOrder.items?.some(
      (item) => item.vendorId === vendorId
    );

    if (!hasVendorItems) {
      toast.error('You do not have permission to view this order');
      navigate('/vendor/orders');
      return;
    }

    // Get vendor-specific order data
    const vendorItem = foundOrder.vendorItems?.find(
      (vi) => vi.vendorId === vendorId
    );

    if (vendorItem) {
      setVendorOrderData({
        items: vendorItem.items || [],
        subtotal: vendorItem.subtotal || 0,
        shipping: vendorItem.shipping || 0,
        tax: vendorItem.tax || 0,
        discount: vendorItem.discount || 0,
        total: (vendorItem.subtotal || 0) + (vendorItem.shipping || 0) + (vendorItem.tax || 0) - (vendorItem.discount || 0),
        commission: vendorItem.commission || 0,
      });
    } else {
      // Fallback: filter items by vendorId
      const vendorItems = foundOrder.items?.filter(
        (item) => item.vendorId === vendorId
      ) || [];
      const subtotal = vendorItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      setVendorOrderData({
        items: vendorItems,
        subtotal,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: subtotal,
        commission: 0,
      });
    }

    setOrder(foundOrder);
    setStatus(foundOrder.status);
  }, [id, vendorId, navigate, getOrder]);

  const handleStatusUpdate = () => {
    if (!order) return;

    try {
      updateOrderStatus(order.id, status);
      setOrder({ ...order, status });
      setIsEditing(false);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  if (!order || !vendorOrderData || !vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Get product image
  const getProductImage = (item) => {
    if (item.image) return item.image;
    const product = getProductById(item.productId || item.id);
    return product?.image || 'https://via.placeholder.com/100x100?text=Product';
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{order.id}</h1>
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
                options={statusOptions.map((s) => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                }))}
                className="min-w-[140px]"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
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
                    {formatPrice(vendorOrderData.total)}
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
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Tracking Number</p>
                <p className="font-semibold text-gray-800">{order.trackingNumber}</p>
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
                    {formatPrice(vendorOrderData.commission)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-purple-200">
                  <span className="text-purple-700 font-semibold">Your Earnings</span>
                  <span className="font-bold text-purple-800">
                    {formatPrice(vendorOrderData.total - vendorOrderData.commission)}
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

