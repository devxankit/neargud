import Order from '../models/Order.model.js';
import Transaction from '../models/Transaction.model.js';
import Address from '../models/Address.model.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Vendor from '../models/Vendor.model.js';
import mongoose from 'mongoose';
import { createWalletTransaction, getWalletBalance } from './wallet.service.js';
import { getVendorOrdersTransformed } from './vendorOrders.service.js';
import vendorWalletService from './vendorWallet.service.js';
import notificationService from './notification.service.js';
import { incrementPromoCodeUsage, decrementPromoCodeUsage } from './promoCode.service.js';
import Settings from '../models/Settings.model.js';

/**
 * Generate unique order code
 * @returns {String} Order code
 */
const generateOrderCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate unique transaction code
 * @returns {String} Transaction code
 */
const generateTransactionCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN-${timestamp}-${random}`;
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {String} orderData.customerId - Customer ID
 * @param {Array} orderData.items - Order items
 * @param {Number} orderData.total - Total amount
 * @param {String} orderData.paymentMethod - Payment method
 * @param {Object} orderData.shippingAddress - Shipping address data or address ID
 * @param {Number} orderData.subtotal - Subtotal
 * @param {Number} orderData.shipping - Shipping charges
 * @param {Number} orderData.tax - Tax amount
 * @param {Number} orderData.discount - Discount amount
 * @param {String} orderData.couponCode - Coupon code (optional)
 * @param {Object} io - Socket.io instance (optional, for real-time notifications)
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (orderData, io = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerId,
      items,
      total,
      paymentMethod,
      shippingAddress,
      subtotal,
      shipping = 0,
      tax = 0,
      discount = 0,
      couponCode = null,
    } = orderData;

    // Validate required fields
    if (!customerId || !items || !Array.isArray(items) || items.length === 0 || !total) {
      throw new Error('Missing required order fields');
    }

    // Get customer info for snapshot
    const customer = await User.findById(customerId).select('name email phone').lean();
    const customerSnapshot = customer ? {
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
    } : {};

    // Handle shipping address
    let addressId = null;
    if (shippingAddress) {
      if (mongoose.Types.ObjectId.isValid(shippingAddress)) {
        addressId = shippingAddress;
      } else {
        const address = await Address.create(
          [
            {
              userId: customerId,
              name: shippingAddress.name || 'Default',
              address: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zipCode: shippingAddress.zipCode,
              country: shippingAddress.country || 'India',
              phone: shippingAddress.phone,
              isDefault: false,
              type: 'home',
            },
          ],
          { session }
        );
        addressId = address[0]._id;
      }
    }

    // Fetch products for vendor identification
    const productIds = items
      .map(item => item.productId || item.id)
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    let products = await Product.find({ _id: { $in: productIds } })
      .populate('vendorId', 'name storeName commissionRate')
      .select('_id vendorId vendorName taxRate taxIncluded price')
      .lean();



    // Group items by vendor
    const vendorItemsMap = {};

    // Fetch global settings for commission rate
    const settings = await Settings.findOne();
    const globalCommissionRate = settings?.general?.defaultCommissionRate
      ? settings.general.defaultCommissionRate / 100
      : 0.1; // Default to 10% if settings not found

    items.forEach((item) => {
      const productId = item.productId || item.id;
      const product = products.find(p => p._id.toString() === productId.toString());
      if (!product || !product.vendorId) return;

      const vendorId = product.vendorId._id || product.vendorId;
      const vendorIdStr = vendorId.toString();

      if (!vendorItemsMap[vendorIdStr]) {
        // ALWAYS use the global setting for commission rate as per requirement
        let commissionRate = globalCommissionRate;

        vendorItemsMap[vendorIdStr] = {
          vendorId: vendorId,
          vendorName: product.vendorName || product.vendorId.name || product.vendorId.storeName || 'Unknown Vendor',
          items: [],
          subtotal: 0,
          commissionRate: commissionRate || globalCommissionRate,
        };
      }
      vendorItemsMap[vendorIdStr].items.push(item);
      vendorItemsMap[vendorIdStr].subtotal += (item.price * item.quantity);
    });

    const vendorGroups = Object.values(vendorItemsMap);
    if (vendorGroups.length === 0) {
      throw new Error('No valid products or vendors found for the items in your cart. Some items may have been removed or updated.');
    }
    const totalSubtotal = vendorGroups.reduce((sum, v) => sum + v.subtotal, 0);

    // Wallet usage
    let requestedWalletUsed = Math.max(0, Number(orderData.walletUsed || 0));
    let availableWalletBalance = 0;
    if (requestedWalletUsed > 0) {
      try {
        const balanceInfo = await getWalletBalance(customerId);
        availableWalletBalance = Math.max(0, Number(balanceInfo.balance || 0));
      } catch (e) {
        availableWalletBalance = 0;
      }
    }
    const totalWalletUsedFinal = Math.min(requestedWalletUsed, availableWalletBalance, total);

    const createdOrders = [];

    // Create a separate order for each vendor
    for (const group of vendorGroups) {
      const ratio = totalSubtotal > 0 ? group.subtotal / totalSubtotal : 0;

      const vSubtotal = group.subtotal;
      const vShipping = shipping * ratio;
      const vTax = tax * ratio;
      const vDiscount = discount * ratio;
      const vWalletUsed = totalWalletUsedFinal * ratio;
      const vTotal = vSubtotal + vShipping + vTax - vDiscount;
      const vPayable = Math.max(vTotal - vWalletUsed, 0);

      // Generate unique order code
      let orderCode = generateOrderCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await Order.findOne({ orderCode }).session(session);
        if (!existing) break;
        orderCode = generateOrderCode();
        attempts++;
      }

      const orderDataForVendor = {
        orderCode,
        customerId,
        items: group.items.map((item) => ({
          productId: item.productId || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
        })),
        total: vTotal,
        paymentMethod: vPayable === 0 ? 'wallet' : paymentMethod,
        paymentStatus: vPayable === 0 ? 'completed' : 'pending',
        // status: vPayable === 0 ? 'processing' : 'pending', // Removed auto-processing
        status: 'pending',
        shippingAddress: addressId,
        pricing: {
          subtotal: vSubtotal,
          tax: vTax,
          discount: vDiscount,
          shipping: vShipping,
          total: vTotal,
          walletUsed: vWalletUsed,
          payableAmount: vPayable,
          couponCode: couponCode || null,
        },
        customerSnapshot,
        vendorBreakdown: [{
          vendorId: group.vendorId,
          vendorName: group.vendorName,
          subtotal: vSubtotal,
          shipping: vShipping,
          tax: vTax,
          discount: vDiscount,
          commission: vSubtotal * group.commissionRate,
        }],
        statusHistory: [
          {
            status: 'pending',
            changedByRole: 'user',
            timestamp: new Date(),
            note: vPayable === 0 ? 'Payment completed via wallet' : 'Order placed',
          },
        ],
      };

      const [order] = await Order.create([orderDataForVendor], { session });
      createdOrders.push(order);

      // Handle wallet deduction if wallet used for this order
      if (vWalletUsed > 0) {
        const itemNames = group.items.map(i => i.name).join(', ');
        const displayNames = itemNames.length > 40 ? itemNames.substring(0, 40) + '...' : itemNames;

        await createWalletTransaction(
          customerId.toString(),
          'debit',
          vWalletUsed,
          `Payment for ${displayNames} (${orderCode})`,
          order._id.toString(),
          'order'
        );

        await Transaction.create(
          [
            {
              transactionCode: generateTransactionCode(),
              orderId: order._id,
              customerId: customerId,
              amount: vWalletUsed,
              type: 'payment',
              status: 'completed',
              method: 'wallet',
              paymentGateway: 'wallet',
            },
          ],
          { session }
        );
      }

      // Notifications for vendors
      try {
        await notificationService.createBulkNotifications([{
          recipientId: group.vendorId,
          recipientType: 'vendor',
          type: 'new_order',
          title: 'New Order Received',
          message: `You have received a new order #${orderCode} from ${customerSnapshot.name || 'Customer'}`,
          orderId: order._id,
          actionUrl: `/vendor/orders/${order._id}`,
        }], io);
      } catch (notifError) {
        console.error('Error creating vendor notification:', notifError);
      }
    }

    // Global order notification for user (summary if multiple orders)
    try {
      const summaryMsg = createdOrders.length > 1
        ? `Your orders #${createdOrders.map(o => o.orderCode).join(', ')} have been placed. Total: ₹${total.toFixed(2)}`
        : `Your order #${createdOrders[0].orderCode} has been placed. Total: ₹${total.toFixed(2)}`;

      await notificationService.createBulkNotifications([{
        recipientId: customerId,
        recipientType: 'user',
        type: 'order_placed',
        title: 'Order Placed Successfully',
        message: summaryMsg,
        orderId: createdOrders[0]._id, // Use the first order as reference
        actionUrl: `/app/orders/${createdOrders[0]._id}`,
      }], io);
    } catch (notifError) {
      console.error('Error creating user notification:', notifError);
    }

    // Increment promo code usage if applicable
    if (couponCode) {
      await incrementPromoCodeUsage(couponCode, session);
    }

    await session.commitTransaction();
    return createdOrders;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update order with payment details
 * @param {String} orderId - Order ID
 * @param {Object} paymentData - Payment data
 * @param {String} paymentData.razorpayOrderId - Razorpay order ID
 * @param {String} paymentData.razorpayPaymentId - Razorpay payment ID
 * @param {String} paymentData.razorpaySignature - Payment signature
 * @param {String} paymentData.status - Payment status ('completed' or 'failed')
 * @param {Object} io - Socket.io instance (optional, for real-time notifications)
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderPayment = async (orderId, paymentData, io = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, status } = paymentData;

    // Find all orders sharing this Razorpay Order ID
    const orders = await Order.find({ razorpayOrderId }).session(session);
    if (orders.length === 0) {
      // Fallback: if no razorpayOrderId match, try by orderId
      const singleOrder = await Order.findById(orderId).session(session);
      if (!singleOrder) throw new Error('Order not found');
      orders.push(singleOrder);
    }

    const updatedOrders = [];

    for (const order of orders) {
      // Update order payment details
      const updateData = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: status === 'completed' ? 'completed' : 'failed',
        $push: {
          statusHistory: {
            status: status === 'completed' ? 'processing' : order.status,
            changedByRole: 'system',
            timestamp: new Date(),
            note: status === 'completed' ? 'Payment completed, order processing' : 'Payment failed',
          },
        },
      };

      // If payment completed, update payment status but keep order status as pending
      // Vendor will manually move it to processing
      if (status === 'completed') {
        // updateData.status = 'processing'; // User requested manual transition
        updateData.status = 'pending';
      }

      const updatedOrder = await Order.findByIdAndUpdate(order._id, updateData, {
        new: true,
        session,
      }).populate('shippingAddress');

      updatedOrders.push(updatedOrder);

      // Create transaction record
      if (status === 'completed') {
        const transactionCode = generateTransactionCode();
        const walletPaid = (order.pricing && typeof order.pricing.walletUsed === 'number') ? order.pricing.walletUsed : 0;
        const payableLeft = Math.max(order.total - walletPaid, 0);
        await Transaction.create(
          [
            {
              transactionCode,
              orderId: order._id,
              customerId: order.customerId,
              amount: payableLeft,
              type: 'payment',
              status: 'completed',
              method: order.paymentMethod,
              paymentGateway: 'razorpay',
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
            },
          ],
          { session }
        );
      }
    }

    await session.commitTransaction();
    return updatedOrders;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get order by ID
 * @param {String} orderId - Order ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} Order details
 */
export const getOrderById = async (orderId, userId = null) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { _id: orderId }
      : { orderCode: orderId };

    if (userId) {
      query.customerId = userId;
    }

    const order = await Order.findOne(query)
      .populate('customerId', 'name email phone')
      .populate('shippingAddress')
      .populate('items.productId', 'name images slug vendorId vendorName cancelable returnable')
      .populate('vendorBreakdown.vendorId', 'name storeName')
      .lean();

    if (!order) {
      throw new Error('Order not found');
    }

    // Check for associated return request
    const ReturnRequest = mongoose.model('ReturnRequest');
    const returnRequest = await ReturnRequest.findOne({ orderId: order._id }).lean();
    order.returnRequest = returnRequest;

    // Enhance order object for frontend
    order.customer = {
      firstName: order.customerId?.firstName || '',
      lastName: order.customerId?.lastName || '',
      name: order.customerSnapshot?.name ||
        (order.customerId?.firstName || order.customerId?.lastName ?
          `${order.customerId.firstName || ''} ${order.customerId.lastName || ''}`.trim() :
          order.customerId?.name || 'N/A'),
      email: order.customerSnapshot?.email || order.customerId?.email || 'N/A',
      phone: order.customerSnapshot?.phone || order.customerId?.phone || '',
    };

    // Root level pricing fallback
    order.subtotal = order.pricing?.subtotal || order.subtotal || 0;
    order.shipping = order.pricing?.shipping || order.shipping || 0;
    order.tax = order.pricing?.tax || order.tax || 0;
    order.discount = order.pricing?.discount || order.discount || 0;

    // Root level dates fallback
    order.deliveredDate = order.tracking?.deliveredAt || null;
    order.cancelledDate = order.cancellation?.cancelledAt || null;
    // Find shipped date from history
    const shippedEntry = order.statusHistory?.find(h => ['shipped', 'dispatched'].includes(h.status));
    order.shippedDate = shippedEntry ? shippedEntry.timestamp : null;

    // Transform vendorBreakdown to vendorItems for frontend compatibility
    if (order.vendorBreakdown && order.vendorBreakdown.length > 0) {
      order.vendorItems = order.vendorBreakdown.map((vb) => {
        // Get items for this vendor
        const vendorItems = order.items.filter((item) => {
          const productVendorId = item.productId?.vendorId?._id || item.productId?.vendorId || item.productId?.vendorId;
          const vendorIdStr = (vb.vendorId?._id || vb.vendorId)?.toString();
          return vendorIdStr && productVendorId && productVendorId.toString() === vendorIdStr;
        });

        return {
          vendorId: vb.vendorId?._id || vb.vendorId,
          vendorName: vb.vendorName || vb.vendorId?.name || vb.vendorId?.storeName || 'Unknown Vendor',
          items: vendorItems.map((item) => ({
            id: item.productId?._id || item.productId || item._id,
            productId: item.productId?._id || item.productId,
            name: item.name || item.productId?.name,
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.originalPrice,
            image: item.image || item.productId?.images?.[0],
            cancelable: item.productId?.cancelable !== undefined ? item.productId.cancelable : true,
            returnable: item.productId?.returnable !== undefined ? item.productId.returnable : true,
          })),
          subtotal: vb.subtotal || 0,
          shipping: vb.shipping || 0,
          tax: vb.tax || 0,
          discount: vb.discount || 0,
          commission: vb.commission || 0,
        };
      });
    }

    return order;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders for a user
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of orders
 */
export const getUserOrders = async (userId, filters = {}) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    // Convert userId to ObjectId if it's a string
    // Handle both string and ObjectId formats
    let customerIdQuery;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      customerIdQuery = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      customerIdQuery = userId;
    } else {
      customerIdQuery = userId;
    }

    const query = { customerId: customerIdQuery };
    console.log('Querying Database with:', query);

    if (status) {
      query.status = status;
    }

    // If specific paymentStatus filter provided, use it
    // Otherwise, exclude pending/failed payments (except COD orders which have pending payment by default)
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    } else {
      // Show orders where:
      // 1. Payment is completed/refunded, OR
      // 2. Payment method is COD (Cash on Delivery) - these have pending payment until delivered
      query.$or = [
        { paymentStatus: { $in: ['completed', 'refunded'] } },
        { paymentMethod: { $in: ['cod', 'cash'] } }
      ];
    }

    const orders = await Order.find(query)
      .populate('shippingAddress')
      .populate('items.productId', 'name images slug vendorId vendorName cancelable returnable')
      .populate('vendorBreakdown.vendorId', 'name storeName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform orders to include vendorItems from vendorBreakdown
    const transformedOrders = orders.map((order) => {
      const orderObj = { ...order };

      // Enhance order object for frontend
      orderObj.customer = {
        firstName: order.customerId?.firstName || '',
        lastName: order.customerId?.lastName || '',
        name: order.customerSnapshot?.name ||
          (order.customerId?.firstName || order.customerId?.lastName ?
            `${order.customerId.firstName || ''} ${order.customerId.lastName || ''}`.trim() :
            order.customerId?.name || 'N/A'),
        email: order.customerSnapshot?.email || order.customerId?.email || 'N/A',
        phone: order.customerSnapshot?.phone || order.customerId?.phone || '',
      };

      // Root level pricing fallback
      orderObj.subtotal = order.pricing?.subtotal || order.subtotal || 0;
      orderObj.shipping = order.pricing?.shipping || order.shipping || 0;
      orderObj.tax = order.pricing?.tax || order.tax || 0;
      orderObj.discount = order.pricing?.discount || order.discount || 0;

      // Root level dates fallback
      orderObj.deliveredDate = order.tracking?.deliveredAt || null;
      orderObj.cancelledDate = order.cancellation?.cancelledAt || null;
      const shippedEntry = order.statusHistory?.find(h => ['shipped', 'dispatched'].includes(h.status));
      orderObj.shippedDate = shippedEntry ? shippedEntry.timestamp : null;

      return orderObj;
    });

    const total = await Order.countDocuments(query);

    return {
      orders: transformedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel an order
 * @param {String} orderId - Order ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} Cancelled order
 */
export const cancelOrder = async (orderId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { _id: orderId }
      : { orderCode: orderId };

    query.customerId = userId;

    const order = await Order.findOne(query).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    // Only allow cancellation request if order is pending or processing
    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // New Flow: Update order status to cancellation_requested
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 'cancellation_requested',
        cancellationRequest: {
          reason: 'Order cancellation requested by user',
          status: 'pending',
          originalStatus: order.status, // Save current status to revert to if rejected
          requestedAt: new Date(),
          note: 'Order cancellation requested'
        },
        $push: {
          statusHistory: {
            status: 'cancellation_requested',
            changedBy: userId,
            changedByRole: 'user',
            timestamp: new Date(),
            note: 'Cancellation requested by user',
          },
        },
      },
      { new: true, session }
    );

    // NOTE: Refund logic is now moved to 'processCancellationRequest' or 'updateOrderStatus' (when status becomes 'cancelled')

    await session.commitTransaction();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Validate status transition based on role
 */
export const validateStatusTransition = (currentStatus, newStatus, role) => {
  const validTransitions = {
    user: {
      pending: ['cancellation_requested'],
      processing: ['cancellation_requested'],
    },
    vendor: {
      pending: ['processing', 'cancelled', 'on_hold', 'cancellation_requested'],
      processing: ['ready_to_ship', 'on_hold', 'dispatched', 'cancelled', 'cancellation_requested'],
      ready_to_ship: ['dispatched', 'shipped_seller'],
      dispatched: ['shipped_seller', 'delivered'],
      shipped_seller: ['delivered'],
      on_hold: ['processing', 'ready_to_ship'],
      cancellation_requested: ['cancelled', 'cancellation_rejected', 'processing'],
      cancellation_rejected: ['processing', 'cancelled'],
    },
    admin: { '*': '*' },
  };

  if (role === 'admin') return true;
  const roleTransitions = validTransitions[role];
  if (!roleTransitions) return false;
  const allowedStatuses = roleTransitions[currentStatus];
  if (!allowedStatuses) return false;
  return allowedStatuses.includes(newStatus);
};

/**
 * Update order status with validation and history tracking
 * @param {String} orderId - Order ID
 * @param {String} newStatus - New status
 * @param {String} changedBy - User/Vendor/Admin ID who changed the status
 * @param {String} changedByRole - Role of who changed the status
 * @param {String} note - Optional note
 * @param {Object} io - Socket.io instance (optional, for real-time notifications)
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, newStatus, changedBy, changedByRole, note = '', io = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { _id: orderId }
      : { orderCode: orderId };

    const order = await Order.findOne(query).session(session);
    if (!order) throw new Error('Order not found');

    if (!validateStatusTransition(order.status, newStatus, changedByRole)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus} for role ${changedByRole}`);
    }

    const updateData = {
      status: newStatus,
      $push: {
        statusHistory: {
          status: newStatus,
          changedBy,
          changedByRole,
          timestamp: new Date(),
          note: note || `Status changed to ${newStatus} by ${changedByRole}`,
        },
      },
    };

    if (newStatus === 'cancelled') {
      // If not already cancelled in DB
      if (!order.cancellation) {
        updateData.cancellation = {
          cancelledAt: new Date(),
          cancelledBy: changedBy,
          cancelledByRole,
          reason: note || (order.cancellationRequest ? order.cancellationRequest.reason : 'Order cancelled'),
          refundStatus: order.paymentStatus === 'completed' ? 'pending' : undefined,
          refundAmount: order.paymentStatus === 'completed' ? order.total : undefined,
        };

        // Decrement promo code usage if applicable
        const couponCode = order.pricing?.couponCode;
        if (couponCode) {
          await decrementPromoCodeUsage(couponCode, session);
        }
      }

      // Mark request as approved if existing
      if (order.cancellationRequest && order.cancellationRequest.status === 'pending') {
        updateData['cancellationRequest.status'] = 'approved';
        updateData['cancellationRequest.processedAt'] = new Date();
      }
    }

    if (newStatus === 'cancellation_rejected') {
      updateData.status = order.cancellationRequest?.originalStatus || 'processing'; // Revert to original status
      updateData['cancellationRequest.status'] = 'rejected';
      updateData['cancellationRequest.processedAt'] = new Date();
      updateData['cancellationRequest.rejectionReason'] = note;

      // Add specific history entry for rejection
      updateData.$push.statusHistory = {
        status: updateData.status,
        changedBy,
        changedByRole,
        timestamp: new Date(),
        note: `Cancellation rejected. Reason: ${note}. Order status reverted to ${updateData.status}.`
      };
    }



    // Check for delivery logic... (continuing with existing code)

    if (newStatus === 'delivered' && !order.tracking?.deliveredAt) {
      const deliveredAt = new Date();
      updateData.tracking = { ...order.tracking, deliveredAt };

      // Direct settlement (no 7-day wait window as per user request)
      updateData.returnWindowExpiresAt = new Date(deliveredAt);
      updateData.fundsReleased = true;

      // Credit vendor wallets (direct to available balance)
      if (order.vendorBreakdown && order.vendorBreakdown.length > 0) {
        try {
          for (const vb of order.vendorBreakdown) {
            if (vb.vendorId) {
              // Calculate earnings: Subtotal - Commission
              const earnings = (vb.subtotal || 0) - (vb.commission || 0);

              if (earnings > 0) {
                // Use creditWallet for direct availability
                await vendorWalletService.creditWallet(
                  vb.vendorId,
                  earnings,
                  `Order #${order.orderCode} settlement`,
                  order._id
                );
              }
            }
          }
        } catch (walletError) {
          console.error('Error crediting vendor wallet:', walletError);
          throw walletError;
        }
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(order._id, updateData, {
      new: true,
      session,
    })
      .populate('shippingAddress')
      .populate('items.productId', 'name images slug')
      .populate('vendorBreakdown.vendorId', 'name storeName');

    // Trigger Refund if Cancelled & Payment Completed
    if (newStatus === 'cancelled' && order.status !== 'cancelled' && order.paymentStatus === 'completed') {
      try {
        const transactionCode = generateTransactionCode();
        await Transaction.create(
          [
            {
              transactionCode,
              orderId: order._id,
              customerId: order.customerId,
              amount: order.total,
              type: 'refund',
              status: 'completed', // Refund completed via wallet
              method: 'wallet', // Refunded to wallet
              paymentGateway: 'wallet',
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: order.razorpayPaymentId,
            },
          ],
          { session }
        );

        // Create wallet transaction for refund (credit) - ALWAYS credit wallet
        await createWalletTransaction(
          order.customerId.toString(),
          'credit',
          order.total,
          `Order Refund - ${order.orderCode} (Cancellation Approved)`,
          order._id.toString(),
          'order' // Using 'order' as refModel similar to other places, or 'Order'
        );
      } catch (err) {
        console.error('Error initiating refund during status update:', err);
      }
    }

    // Create notifications for status change
    try {
      const notifications = [];
      const statusMessages = {
        processing: 'Your order is being processed',
        ready_to_ship: 'Your order is ready to ship',
        dispatched: 'Your order has been dispatched',
        shipped_seller: 'Your order has been shipped',
        shipped: 'Your order has been shipped',
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled',
        on_hold: 'Your order is on hold',
        cancellation_requested: 'Order cancellation requested',
        cancellation_rejected: 'Order cancellation request rejected',
      };

      const statusTitle = {
        processing: 'Order Processing',
        ready_to_ship: 'Order Ready to Ship',
        dispatched: 'Order Dispatched',
        shipped_seller: 'Order Shipped',
        shipped: 'Order Shipped',
        delivered: 'Order Delivered',
        cancelled: 'Order Cancelled',
        on_hold: 'Order On Hold',
        cancellation_requested: 'Cancellation Requested',
        cancellation_rejected: 'Cancellation Rejected',
      };

      const notificationType = {
        processing: 'order_confirmed',
        ready_to_ship: 'order_status_change',
        dispatched: 'order_status_change',
        shipped_seller: 'order_shipped',
        shipped: 'order_shipped',
        delivered: 'order_delivered',
        cancelled: 'order_cancelled',
        on_hold: 'order_status_change',
        cancellation_requested: 'order_status_change',
        cancellation_rejected: 'order_status_change',
      };

      // Notification for user
      notifications.push({
        recipientId: order.customerId,
        recipientType: 'user',
        type: notificationType[newStatus] || 'order_status_change',
        title: statusTitle[newStatus] || 'Order Status Updated',
        message: `${statusMessages[newStatus] || `Order status changed to ${newStatus}`} - Order #${order.orderCode}`,
        orderId: order._id,
        actionUrl: `/app/orders/${order._id}`,
      });

      // Notifications for vendors
      if (order.vendorBreakdown && order.vendorBreakdown.length > 0) {
        order.vendorBreakdown.forEach((vb) => {
          const vendorId = vb.vendorId?._id || vb.vendorId;
          if (vendorId) {
            notifications.push({
              recipientId: vendorId,
              recipientType: 'vendor',
              type: 'order_status_change',
              title: 'Order Status Updated',
              message: `Order #${order.orderCode} status changed to ${newStatus}`,
              orderId: order._id,
              actionUrl: `/vendor/orders/${order._id}`,
            });
          }
        });
      }

      // Notification for admin (optional - can be added if needed)
      // You can add admin notifications here if you want to notify admins about all status changes

      // Create notifications in bulk
      if (notifications.length > 0) {
        await notificationService.createBulkNotifications(notifications, io);
      }
    } catch (notifError) {
      console.error('Error creating status change notifications:', notifError);
    }

    await session.commitTransaction();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get vendor orders with filtering
 */
export const getVendorOrders = async (vendorId, filters = {}) => {
  try {
    return await getVendorOrdersTransformed(vendorId, filters);
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders for admin with advanced filtering
 */
export const getAdminOrders = async (filters = {}) => {
  try {
    const { status, paymentStatus, customerId, vendorId, search, startDate, endDate, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;
    const query = {};

    console.log('getAdminOrders - Filters:', filters); // Debug log

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) query.customerId = customerId;

    if (vendorId) {
      // Convert vendorId to ObjectId if needed
      let vendorIdQuery = vendorId;
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        vendorIdQuery = new mongoose.Types.ObjectId(vendorId);
      }
      // Remove isActive check to show orders for all products
      const vendorProducts = await Product.find({ vendorId: vendorIdQuery }).select('_id').lean();
      // Convert product IDs to ObjectIds for proper query matching
      const vendorProductIds = vendorProducts.map((p) => {
        const productId = p._id;
        if (typeof productId === 'string' && mongoose.Types.ObjectId.isValid(productId)) {
          return new mongoose.Types.ObjectId(productId);
        }
        return productId;
      });
      if (vendorProductIds.length > 0) {
        query['items.productId'] = { $in: vendorProductIds };
      } else {
        return { orders: [], total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 };
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };

      // Find orders by orderCode
      const orderCodeMatches = await Order.find({ orderCode: searchRegex }).select('_id').lean();

      // Find orders by customerSnapshot
      const customerSnapshotMatches = await Order.find({
        $or: [{ 'customerSnapshot.name': searchRegex }, { 'customerSnapshot.email': searchRegex }],
      }).select('_id').lean();

      // Find users by firstName/lastName/email
      const User = mongoose.model('User');
      const userMatches = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id').lean();
      const userIds = userMatches.map(u => u._id);

      // Find orders by matched user IDs
      const orderUserMatches = await Order.find({ customerId: { $in: userIds } }).select('_id').lean();

      const searchIds = [...new Set([
        ...orderCodeMatches.map(o => o._id),
        ...customerSnapshotMatches.map(o => o._id),
        ...orderUserMatches.map(o => o._id)
      ])];

      if (searchIds.length > 0) {
        query._id = { $in: searchIds };
      } else {
        return { orders: [], total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 };
      }
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    console.log('getAdminOrders - Query:', JSON.stringify(query, null, 2)); // Debug log

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('shippingAddress')
      .populate('items.productId', 'name images slug vendorId vendorName')
      .populate('vendorBreakdown.vendorId', 'name storeName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(query);

    console.log(`getAdminOrders - Found ${orders.length} orders out of ${total} total`); // Debug log

    // Transform orders for frontend
    const transformedOrders = orders.map(order => {
      const orderObj = { ...order };

      orderObj.customer = {
        firstName: order.customerId?.firstName || '',
        lastName: order.customerId?.lastName || '',
        name: order.customerSnapshot?.name ||
          (order.customerId?.firstName || order.customerId?.lastName ?
            `${order.customerId.firstName || ''} ${order.customerId.lastName || ''}`.trim() :
            order.customerId?.name || 'N/A'),
        email: order.customerSnapshot?.email || order.customerId?.email || 'N/A',
        phone: order.customerSnapshot?.phone || order.customerId?.phone || '',
      };

      orderObj.subtotal = order.pricing?.subtotal || order.subtotal || 0;
      orderObj.shipping = order.pricing?.shipping || order.shipping || 0;
      orderObj.tax = order.pricing?.tax || order.tax || 0;
      orderObj.discount = order.pricing?.discount || order.discount || 0;

      orderObj.deliveredDate = order.tracking?.deliveredAt || null;
      orderObj.cancelledDate = order.cancellation?.cancelledAt || null;
      const shippedEntry = order.statusHistory?.find(h => ['shipped', 'dispatched'].includes(h.status));
      orderObj.shippedDate = shippedEntry ? shippedEntry.timestamp : null;

      return orderObj;
    });

    return { orders: transformedOrders, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) };
  } catch (error) {
    throw error;
  }
};

