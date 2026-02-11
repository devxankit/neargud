import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPackage, FiTruck, FiMapPin, FiCreditCard, FiRotateCw, FiArrowLeft, FiShoppingBag, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import MobileLayout from '../../../components/Layout/Mobile/MobileLayout';
import { useOrderStore } from '../../../store/orderStore';
import { useCartStore } from '../../../store/useStore';
import { formatPrice } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import PageTransition from '../../../components/PageTransition';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Badge from '../../../components/Badge';
import LazyImage from '../../../components/LazyImage';
import ReviewModal from '../components/ReviewModal';
import ReturnModal from '../../../components/Orders/ReturnModal';
import { FiRefreshCcw } from 'react-icons/fi';

const MobileOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder, fetchOrder, checkReturnEligibility, cancelOrder } = useOrderStore();
  const { addItem } = useCartStore();
  const order = getOrder(orderId);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [eligibility, setEligibility] = useState({ eligible: false });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fetching, setFetching] = useState(false);

  const isOrderCancelable = useMemo(() => {
    if (!order) return false;

    // 1. Check order status (only pending/processing can be cancelled)
    const isStatusCancelable = ['pending', 'processing'].includes(order.status);
    if (!isStatusCancelable) return false;

    // 2. Check if ANY item in the order is non-cancelable
    const items = order.items || [];
    const vendorItems = order.vendorItems?.flatMap(v => v.items) || [];
    const allItems = vendorItems.length > 0 ? vendorItems : items;

    const hasNonCancelableProduct = allItems.some(item => {
      // The backend now provides 'cancelable' property on items
      // Fallback to true if property is missing
      const cancelable = item.cancelable !== undefined
        ? item.cancelable
        : (item.productId?.cancelable !== undefined ? item.productId.cancelable : true);
      return cancelable === false;
    });

    return !hasNonCancelableProduct;
  }, [order]);

  const isOrderReturnable = useMemo(() => {
    if (!order) return false;

    // 1. Check if ANY item in the order is non-returnable
    const items = order.items || [];
    const vendorItems = order.vendorItems?.flatMap(v => v.items) || [];
    const allItems = vendorItems.length > 0 ? vendorItems : items;

    const hasNonReturnableProduct = allItems.some(item => {
      // The backend now provides 'returnable' property on items
      const returnable = item.returnable !== undefined
        ? item.returnable
        : (item.productId?.returnable !== undefined ? item.productId.returnable : true);
      return returnable === false;
    });

    return !hasNonReturnableProduct;
  }, [order]);

  const handleOpenReview = (product) => {
    setSelectedProduct(product);
    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    const loadOrder = async () => {
      setFetching(true);
      try {
        await fetchOrder(orderId);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setFetching(false);
      }
    };
    loadOrder();
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (order && order.status === 'delivered') {
      const checkEligibility = async () => {
        try {
          const res = await checkReturnEligibility(order._id || order.id);
          setEligibility(res);
        } catch (error) {
          console.error("Error checking return eligibility:", error);
        }
      };
      checkEligibility();
    }
  }, [order, checkReturnEligibility]);

  if (fetching) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading order details...</p>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-gray-300 text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
              <button
                onClick={() => navigate('/app/orders')}
                className="gradient-green text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-green-100"
              >
                Back to My Orders
              </button>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      });
    });
    toast.success('Items added to cart!');
    navigate('/app/checkout');
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      if (isOrderCancelable) {
        cancelOrder(order._id || order.id);
        toast.success('Order cancelled successfully');
        navigate('/app/orders');
      } else {
        toast.error('This order cannot be cancelled');
      }
    }
  };

  return (
    <MobileLayout showBottomNav={false} showCartBar={true} showHeader={false}>
      <div className="w-full pb-24">
        {/* Header */}
        <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-1 z-30">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
              <p className="text-sm text-gray-600">Order #{order.orderCode || order._id}</p>
            </div>
            <Badge variant={order?.status}>{order?.status?.toUpperCase()}</Badge>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Return Information (if exists) */}
          {order.returnRequest && order.returnRequest.returnCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 border-l-4 border-primary-500 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FiRefreshCcw className="text-primary-600" />
                  Return Details
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.returnRequest.status === 'completed' ? 'bg-green-100 text-green-700' :
                  order.returnRequest.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                  {order.returnRequest.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-3 text-xs mb-3">
                <div>
                  <p className="text-gray-500">Return ID</p>
                  <p className="font-semibold text-gray-800">{order.returnRequest.returnCode}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reason</p>
                  <p className="font-semibold capitalize text-primary-700">
                    {(order.returnRequest.reason || '').replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Refund</p>
                  <p className="font-bold text-primary-600">{formatPrice(order.returnRequest.refundAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Requested</p>
                  <p className="font-semibold text-gray-800">{formatDate(order.returnRequest.requestedAt || order.returnRequest.createdAt || order.createdAt)}</p>
                </div>
              </div>
              {order.returnRequest.note && (
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-[10px] text-gray-400 mb-0.5 font-medium uppercase tracking-wider">Comment</p>
                  <p className="text-xs text-gray-700 italic leading-relaxed">"{order.returnRequest.note}"</p>
                </div>
              )}
              {order.returnRequest.status === 'rejected' && order.returnRequest.rejectionReason && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-[10px] text-red-500 mb-0.5 font-bold uppercase tracking-wider">Rejection Reason</p>
                  <p className="text-xs text-red-700 leading-relaxed font-medium">{order.returnRequest.rejectionReason}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Order Items */}
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-base font-bold text-gray-800 mb-4">Order Items</h2>
            {order.vendorItems && order.vendorItems.length > 0 ? (
              <div className="space-y-4">
                {order.vendorItems.map((vendorGroup) => (
                  <div key={vendorGroup.vendorId} className="space-y-2">
                    {/* Vendor Header */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200/50">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                        <FiShoppingBag className="text-white text-[10px]" />
                      </div>
                      <span className="text-sm font-bold text-primary-700 flex-1">
                        {vendorGroup.vendorName}
                      </span>
                      <span className="text-xs font-semibold text-primary-600 bg-white px-2 py-0.5 rounded-md">
                        {formatPrice(vendorGroup.subtotal)}
                      </span>
                    </div>
                    {/* Vendor Items */}
                    <div className="space-y-2 pl-2">
                      {vendorGroup.items.map((item, idx) => (
                        <div key={item._id || item.id || idx} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <LazyImage
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.name}</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-600">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <p className="text-[10px] text-gray-400 line-through">
                                  {formatPrice(item.originalPrice)}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-gray-800 text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => handleOpenReview(item)}
                              className="ml-2 p-2 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors flex items-center gap-1"
                            >
                              <FiStar className="fill-current" />
                              Review
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={item._id || item.id || idx} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <LazyImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-[10px] text-gray-400 line-through">
                            {formatPrice(item.originalPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="ml-2 p-2 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors flex items-center gap-1"
                      >
                        <FiStar className="fill-current" />
                        Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="glass-card rounded-2xl p-4">
              <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiMapPin className="text-primary-600" />
                Shipping Address
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiCreditCard className="text-primary-600" />
              Payment Information
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {order.paymentMethod}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span>Tracking Number:</span>
                  <span className="font-semibold text-gray-800">{order.trackingNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span className="font-semibold text-gray-800">{formatDate(order.orderDate || order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-base font-bold text-gray-800 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {order.status === 'delivered' && eligibility.eligible && isOrderReturnable && (!order.returnRequest || !order.returnRequest.returnCode) && (
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="w-full py-3 bg-white border-2 border-orange-500 text-orange-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
              >
                <FiRefreshCcw className="text-lg" />
                Return Items
              </button>
            )}
            {isOrderCancelable && (
              <button
                onClick={handleCancel}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                Cancel Order
              </button>
            )}
            {!['cancelled', 'return_approved', 'returned', 'refunded'].includes(order.status) && order.returnRequest?.status !== 'rejected' && (
              <>
                <button
                  onClick={handleReorder}
                  className="w-full py-3 gradient-green text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-glow-green transition-all"
                >
                  <FiRotateCw className="text-lg" />
                  Reorder
                </button>
                <button
                  onClick={() => navigate(`/app/track-order/${order._id || order.id}`)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <FiTruck className="text-lg" />
                  Track Order
                </button>
              </>
            )}
          </div>
        </div>

        {/* Return Modal */}
        <ReturnModal
          order={order}
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
        />

        {/* Review Modal */}
        {selectedProduct && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            product={selectedProduct}
            orderId={order._id || order.id}
          />
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileOrderDetail;
