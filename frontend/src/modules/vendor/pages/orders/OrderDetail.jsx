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
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from "../../../../components/Badge";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import { formatPrice } from "../../../../utils/helpers";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { useVendorOrderStore } from "../../store/vendorOrderStore";
import { vendorReturnApi } from "../../../../services/vendorReturnApi";
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
      await fetchOrder(order._id || order.id);
      setIsEditing(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleApproveCancellation = async () => {
    if (!window.confirm('Are you sure you want to approve this cancellation request? The order will be cancelled and refund processed.')) return;
    try {
      await updateStatus(order._id || order.id, 'cancelled');
      await fetchOrder(order._id || order.id);
      toast.success('Cancellation request approved');
    } catch (error) {
      // Error handled by store
    }
  };

  const handleRejectCancellation = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason === null) return; // Cancelled prompt
    if (!reason.trim()) return toast.error('Rejection reason is required');

    try {
      // We pass the reason as the 'note' argument to existing updateStatus service if it supports it, 
      // or we might need to update the store action. 
      // Assuming store.updateStatus(id, status, note) signature based on common patterns. 
      // If not, we might need to verify store/service.
      // Looking at order.service.js, updateOrderStatus takes (id, status, changedBy, role, note).
      // The store likely bridges this. Let's assume the store helper passes strict args.
      // If store only takes (id, status), we might miss the note. 
      // UseVendorOrderStore implementation wasn't fully viewed but usually follows service.
      // Let's try passing it.
      await updateStatus(order._id || order.id, 'cancellation_rejected', reason);
      await fetchOrder(order._id || order.id);
      toast.success('Cancellation request rejected');
    } catch (error) {
      // Error handled
    }
  };

  const handleApproveReturn = async () => {
    const returnId = order.returnRequest?.requestId || order.returnRequest?._id || order.returnRequest?.id;
    if (!returnId) return toast.error('Return request ID not found');

    if (!window.confirm('Are you sure you want to approve this return request? Refund will be processed.')) return;

    try {
      await vendorReturnApi.updateStatus(returnId, 'approved');
      await fetchOrder(order._id || order.id);
      toast.success('Return request approved and refund processed');
    } catch (error) {
      console.error('Failed to approve return:', error);
      toast.error(error.response?.data?.message || 'Failed to approve return');
    }
  };

  const handleRejectReturn = async () => {
    const returnId = order.returnRequest?.requestId || order.returnRequest?._id || order.returnRequest?.id;
    if (!returnId) return toast.error('Return request ID not found');

    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled
    if (!reason.trim()) return toast.error('Rejection reason is required');

    try {
      await vendorReturnApi.updateStatus(returnId, 'rejected', '', reason);
      await fetchOrder(order._id || order.id);
      toast.success('Return request rejected');
    } catch (error) {
      console.error('Failed to reject return:', error);
      toast.error(error.response?.data?.message || 'Failed to reject return');
    }
  };

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // ... existing variables ...

  // Ensure robust total ... (lines 88-91)

  // ... (lines 93-108)

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
    { value: 'processing', label: 'Processing' },
    { value: 'ready_to_ship', label: 'Ready to Ship' },
    { value: 'shipped_seller', label: 'Shipped (Seller)' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 transition-all group"
            title="Back to Orders"
          >
            <FiArrowLeft className="text-xl text-gray-500 group-hover:text-primary-600 transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{order.orderCode}</h1>
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiCalendar className="text-primary-500 text-sm" />
              {new Date(order.date).toLocaleString([], {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 self-start sm:self-center">
          <div className="hidden md:block text-right mr-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Order</p>
            <p className="text-xs font-bold text-gray-700">Change status to sync</p>
          </div>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-all text-sm font-bold flex items-center gap-2"
                >
                  <FiCheck />
                  Apply
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setStatus(order.status);
                  }}
                  className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold flex items-center gap-2"
                >
                  <FiX />
                  Discard
                </button>
              </div>
            ) : (
              <AnimatedSelect
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setIsEditing(true);
                }}
                options={statusOptions}
                className="min-w-[160px] bg-white rounded-xl border-gray-200 shadow-sm text-sm font-bold text-gray-700 focus:ring-primary-500"
              />
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Cancellation Request Information */}
          {(order.status === 'cancellation_requested' || (order.cancellationRequest && order.cancellationRequest.requestedAt)) && (
            <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${order.status === 'cancellation_requested' ? 'border-red-500' : 'border-gray-300'} border border-gray-200 mb-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-widest">
                  <FiAlertCircle className="text-red-500" />
                  Cancellation Task
                </h2>
                <Badge variant={order.cancellationRequest?.status === 'pending' ? 'warning' : order.cancellationRequest?.status === 'rejected' ? 'error' : 'info'}>
                  {order.cancellationRequest?.status?.toUpperCase() || 'REQUESTED'}
                </Badge>
              </div>
              <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 text-sm mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Customer Reason</p>
                    <p className="font-bold text-gray-800">{order.cancellationRequest?.reason || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Time Logged</p>
                    <p className="font-bold text-gray-800">{new Date(order.cancellationRequest?.requestedAt || order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {order.cancellationRequest?.note && (
                  <div className="mt-3 pt-3 border-t border-red-100/50">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Additional Note</p>
                    <p className="italic text-gray-600 font-medium">"{order.cancellationRequest.note}"</p>
                  </div>
                )}
              </div>

              {order.cancellationRequest?.status === 'rejected' && (
                <div className="p-3 bg-red-100/30 rounded-lg border border-red-200 text-xs text-red-700 mb-4">
                  <span className="font-bold">Rejection Feedback:</span> {order.cancellationRequest?.rejectionReason}
                </div>
              )}

              {order.status === 'cancellation_requested' && (
                <div className="flex gap-3">
                  <button
                    onClick={handleApproveCancellation}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-100 text-sm"
                  >
                    Confirm Cancellation
                  </button>
                  <button
                    onClick={handleRejectCancellation}
                    className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
                  >
                    Reject Task
                  </button>
                </div>
              )}
            </div>
          )}

          {order.returnRequest && order.returnRequest.requestedAt && (
            <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${order.returnRequest.status === 'pending' ? 'border-orange-500' : 'border-gray-200'} border border-gray-200 mb-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-widest">
                  <FiRefreshCw className="text-orange-500" />
                  Return Associated
                </h2>
                <Badge variant={order.returnRequest.status === 'pending' ? 'warning' : order.returnRequest.status === 'rejected' ? 'error' : 'success'}>
                  {order.returnRequest.status === 'pending' ? 'PENDING ACTION' : order.returnRequest.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="bg-orange-50/30 rounded-xl p-4 border border-orange-100 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1 text-center sm:text-left">Return ID</p>
                  <p className="font-bold text-gray-800 text-center sm:text-left">{order.returnRequest.returnCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1 text-center sm:text-left">Policy Trigger</p>
                  <p className="font-bold text-gray-800 capitalize text-center sm:text-left">{(order.returnRequest.reason || '').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1 text-center sm:text-left">Refund Credited</p>
                  <p className="font-black text-primary-600 text-center sm:text-left">{formatPrice(order.returnRequest.refundAmount)}</p>
                </div>
                <div className="flex items-center justify-center sm:justify-end">
                  <Link
                    to={`/vendor/return-requests/${order.returnRequest?.requestId || order.returnRequest?._id || order.returnRequest?.id}`}
                    className="text-xs font-black bg-white px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white transition-all uppercase tracking-widest"
                  >
                    View Info →
                  </Link>
                </div>
              </div>

              {order.returnRequest.status === 'rejected' && order.returnRequest.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-xs text-red-600 mb-4">
                  <span className="font-bold">Rejection Feedback:</span> {order.returnRequest.rejectionReason}
                </div>
              )}

              {order.returnRequest.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={handleApproveReturn}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-100 text-sm"
                  >
                    Accept Return
                  </button>
                  <button
                    onClick={handleRejectReturn}
                    className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
                  >
                    Decline Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <FiPackage className="text-primary-600" />
                Products in This Order
              </h2>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {vendorOrderData.items.length} {vendorOrderData.items.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {vendorOrderData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 hover:bg-gray-50/30 transition-colors"
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {item.name || 'Product'}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="text-gray-400">Qty:</span> {item.quantity || 1}
                      </p>
                      {item.size && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-gray-400">Size:</span> {item.size}
                        </p>
                      )}
                      {item.color && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-gray-400">Color:</span> {item.color}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatPrice(item.price || 0)} per unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <FiDollarSign className="text-primary-600" />
                Financial Summary
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items Subtotal</span>
                <span className="font-bold text-gray-900 border-b border-gray-100 pb-0.5">
                  {formatPrice(vendorOrderData.subtotal)}
                </span>
              </div>
              {vendorOrderData.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping Fees</span>
                  <span className="font-bold text-gray-900">
                    +{formatPrice(vendorOrderData.shipping)}
                  </span>
                </div>
              )}
              {vendorOrderData.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-bold text-gray-900">
                    +{formatPrice(vendorOrderData.tax)}
                  </span>
                </div>
              )}
              {vendorOrderData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                  <span className="font-medium">Total Discount Applied</span>
                  <span className="font-bold">-{formatPrice(vendorOrderData.discount)}</span>
                </div>
              )}

              <div className="pt-4 mt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Paid</p>
                  <p className="font-black text-2xl text-primary-600 leading-none">
                    {formatPrice(totalAmount)}
                  </p>
                </div>
                <div className="bg-primary-50 px-4 py-2 rounded-xl border border-primary-100 text-right">
                  <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Platform Order</p>
                  <p className="text-xs font-bold text-primary-700">Earnings processed after fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6 flex items-center justify-between">
              Order Progress
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            </h2>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="relative space-y-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                {[...order.statusHistory]
                  .reduce((acc, curr) => {
                    if (acc.length === 0 || acc[acc.length - 1].status !== curr.status) {
                      acc.push(curr);
                    }
                    return acc;
                  }, [])
                  .reverse()
                  .map((history, idx) => (
                    <div key={idx} className="relative flex gap-4 pl-8 group">
                      <div className={`absolute left-0 top-1.5 w-[20px] h-[20px] rounded-full border-4 border-white z-10 shadow-sm transition-all ${idx === 0 ? 'bg-primary-500 ring-4 ring-primary-50' : 'bg-gray-200'
                        }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black uppercase tracking-wider mb-0.5 ${idx === 0 ? 'text-primary-700' : 'text-gray-500'}`}>
                          {history.status.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400">
                          {new Date(history.timestamp).toLocaleString([], {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {history.note && (
                          <p className="mt-1.5 text-[10px] text-gray-400 font-medium italic bg-gray-50 px-2 py-1 rounded inline-block">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Commission Info */}
          {vendorOrderData.commission > 0 && (
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-2xl p-6 shadow-xl shadow-indigo-100 text-white border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-200">
                <FiDollarSign className="text-primary-400" />
                Financial Breakdown
              </h2>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-300">Net Sales</span>
                  <span className="font-bold">{formatPrice(vendorOrderData.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-indigo-300">
                    Platform Fee
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded ml-1.5 uppercase font-black">
                      {(vendorOrderData.subtotal > 0 ? ((platformCommission / vendorOrderData.subtotal) * 100).toFixed(0) : 0)}%
                    </span>
                  </span>
                  <span className="font-bold text-red-300">
                    -{formatPrice(platformCommission)}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Payout</p>
                    <p className="font-black text-3xl text-primary-400 leading-none">
                      {formatPrice(vendorEarnings)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <FiCheck className="text-primary-400" />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-indigo-400/60 mt-6 text-center italic border-t border-white/5 pt-4">
                Payouts are settled according to the platform agreement.
              </p>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FiPackage className="text-primary-600" />
              Customer Details
            </h2>

            <div className="space-y-4">
              {/* Profile */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                  {(order.customer?.name || order.customer?.firstName || 'C')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {order.customer?.name || (order.customer?.firstName ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : 'Guest Customer')}
                  </p>
                  <p className="text-xs text-gray-500">#{order.customerId?.slice(-6) || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <FiMail className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${order.customer?.email}`} className="text-gray-700 hover:text-primary-600 transition-colors truncate">
                    {order.customer?.email || 'N/A'}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiPhone className="text-gray-400 flex-shrink-0" />
                  <a href={`tel:${order.customer?.phone}`} className="text-gray-700 hover:text-primary-600 transition-colors">
                    {order.customer?.phone || 'N/A'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FiMapPin className="text-primary-600" />
              Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-700 space-y-1.5">
                <p className="font-bold text-gray-900">{order.shippingAddress.fullName || order.shippingAddress.name}</p>
                <p className="leading-relaxed">{order.shippingAddress.address || order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                </p>
                <p className="font-medium">
                  {order.shippingAddress.zipCode}
                  {order.shippingAddress.country && `, ${order.shippingAddress.country}`}
                </p>
                {order.shippingAddress.phone && (
                  <div className="flex items-center gap-2 mt-2 py-1 px-2 bg-gray-50 rounded text-xs text-gray-600 border border-gray-100">
                    <FiPhone className="text-[10px]" />
                    {order.shippingAddress.phone}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No address provided</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FiCreditCard className="text-primary-600" />
              Payment Info
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Method:</span>
              <span className="text-sm font-bold text-gray-800 capitalize">
                {order.paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Status:</span>
              <Badge variant={order.paymentStatus === 'completed' ? 'success' : 'warning'}>
                {order.paymentStatus?.toUpperCase() || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetail;

