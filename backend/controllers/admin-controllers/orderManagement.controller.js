import {
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder as cancelOrderService,
} from '../../services/order.service.js';
import Order from '../../models/Order.model.js';
import Transaction from '../../models/Transaction.model.js';
import User from '../../models/User.model.js';
import DeliveryPartner from '../../models/DeliveryPartner.model.js';
import mongoose from 'mongoose';

/**
 * Get all orders (admin)
 * GET /api/admin/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      customerId,
      vendorId,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const filters = {
      status,
      paymentStatus,
      customerId,
      vendorId,
      search,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    };

    const result = await getAdminOrders(filters);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID (admin)
 * GET /api/admin/orders/:orderId
 */
export const getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await getOrderById(orderId);

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: {
        order,
      },
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    next(error);
  }
};

/**
 * Update order status (admin - can update to any status)
 * PUT /api/admin/orders/:orderId/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const adminId = req.user.adminId || req.user.id;
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    // Get socket.io instance
    const io = req.app.get('io');

    const updatedOrder = await updateOrderStatus(
      orderId,
      status,
      adminId,
      'admin',
      note,
      io
    );

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order: {
          id: updatedOrder._id,
          orderCode: updatedOrder.orderCode,
          status: updatedOrder.status,
          statusHistory: updatedOrder.statusHistory,
        },
      },
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Cancel order (admin)
 * PUT /api/admin/orders/:orderId/cancel
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const adminId = req.user.adminId || req.user.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { _id: orderId }
      : { orderCode: orderId };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Get socket.io instance
    const io = req.app.get('io');

    // Update order to cancelled status (admin can cancel any order)
    const cancelledOrder = await updateOrderStatus(
      orderId,
      'cancelled',
      adminId,
      'admin',
      reason || 'Order cancelled by admin',
      io
    );

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: {
          id: cancelledOrder._id,
          orderCode: cancelledOrder.orderCode,
          status: cancelledOrder.status,
          cancellation: cancelledOrder.cancellation,
        },
      },
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    next(error);
  }
};

/**
 * Process refund (admin)
 * PUT /api/admin/orders/:orderId/refund
 */
export const processRefund = async (req, res, next) => {
  try {
    const adminId = req.user.adminId || req.user.id;
    const { orderId } = req.params;
    const { refundAmount, refundTransactionId, note } = req.body;

    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { _id: orderId }
      : { orderCode: orderId };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!order.cancellation) {
      return res.status(400).json({
        success: false,
        message: 'Order must be cancelled before processing refund',
      });
    }

    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order payment was not completed, no refund needed',
      });
    }

    const refundAmt = refundAmount || order.total;

    // Update cancellation with refund info
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        'cancellation.refundStatus': 'completed',
        'cancellation.refundAmount': refundAmt,
        'cancellation.refundTransactionId': refundTransactionId || null,
        paymentStatus: 'refunded',
        $push: {
          statusHistory: {
            status: 'refunded',
            changedBy: adminId,
            changedByRole: 'admin',
            timestamp: new Date(),
            note: note || `Refund processed: ₹${refundAmt}`,
          },
        },
      },
      { new: true }
    )
      .populate('shippingAddress')
      .populate('items.productId', 'name images slug')
      .populate('vendorBreakdown.vendorId', 'name storeName');

    // Create refund transaction record
    const transactionCode = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    await Transaction.create({
      transactionCode,
      orderId: order._id,
      customerId: order.customerId,
      amount: refundAmt,
      type: 'refund',
      status: 'completed',
      method: order.paymentMethod,
      paymentGateway: order.razorpayPaymentId ? 'razorpay' : 'manual',
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        order: {
          id: updatedOrder._id,
          orderCode: updatedOrder.orderCode,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          cancellation: updatedOrder.cancellation,
        },
      },
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    next(error);
  }
};

/**
 * Get order statistics (admin)
 * GET /api/admin/orders/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform to object format
    const statusStats = {
      total: 0,
      pending: 0,
      processing: 0,
      ready_to_ship: 0,
      dispatched: 0,
      shipped_seller: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      on_hold: 0,
    };

    stats.forEach((stat) => {
      if (stat._id) {
        statusStats[stat._id] = stat.count;
        statusStats.total += stat.count;
      }
    });

    const paymentStatsObj = {
      pending: 0,
      completed: 0,
      failed: 0,
      refunded: 0,
    };

    paymentStats.forEach((stat) => {
      if (stat._id && paymentStatsObj.hasOwnProperty(stat._id)) {
        paymentStatsObj[stat._id] = stat.count;
      }
    });

    // Get total revenue (completed orders only)
    const revenueStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const revenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const completedOrderCount = revenueStats.length > 0 ? revenueStats[0].orderCount : 0;

    res.status(200).json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        status: statusStats,
        payment: paymentStatsObj,
        revenue: {
          total: revenue,
          orderCount: completedOrderCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get cash collections (admin)
 * GET /api/admin/orders/cash-collections
 */
export const getCashCollections = async (req, res, next) => {
  try {
    const { status, search, deliveryPartnerId, page = 1, limit = 50 } = req.query;

    const query = {
      paymentMethod: { $in: ['cash', 'cod'] },
    };

    if (deliveryPartnerId) {
      query.deliveryPartnerId = deliveryPartnerId;
    }

    if (status && status !== 'all') {
      if (status === 'collected') {
        query.paymentStatus = 'completed';
      } else if (status === 'pending') {
        query.paymentStatus = 'pending';
      }
    }

    if (search) {
      query.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total, stats] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'firstName lastName')
        .populate('deliveryPartnerId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query),
      Order.aggregate([
        { $match: { paymentMethod: { $in: ['cash', 'cod'] } } },
        {
          $group: {
            _id: '$paymentStatus',
            totalAmount: { $sum: '$total' }
          }
        }
      ])
    ]);

    const totalCollected = stats.find(s => s._id === 'completed')?.totalAmount || 0;
    const totalPending = stats.find(s => s._id === 'pending')?.totalAmount || 0;
    console.log("ordersorders", orders)
    // Format data for frontend
    const collections = orders.map((order) => {
      // Find collection date from status history if delivered/completed
      const deliveredEntry = order.statusHistory?.find(
        (h) => (h.status === 'delivered' || h.status === 'completed')
      );

      return {
        id: order._id,
        orderId: order.orderCode,
        customerName: order.customerSnapshot?.name ||
          (order.customerId ? `${order.customerId.firstName || ''} ${order.customerId.lastName || ''}`.trim() : null) ||
          'Unknown',
        amount: order.total,
        deliveryBoy: order.deliveryPartnerId
          ? `${order.deliveryPartnerId.firstName || ''} ${order.deliveryPartnerId.lastName || ''}`.trim() || 'Assigned'
          : 'Not Assigned',
        status: order.paymentStatus === 'completed' ? 'collected' : 'pending',
        collectionDate: order.paymentStatus === 'completed'
          ? (order.tracking?.deliveredAt || deliveredEntry?.timestamp)
          : null,
        orderDate: order.orderDate,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        collections,
        totalCollected,
        totalPending,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark cash as collected (admin)
 * PUT /api/admin/orders/:orderId/mark-collected
 */
export const markCashAsCollected = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const adminId = req.user.adminId || req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already marked as completed',
      });
    }

    order.paymentStatus = 'completed';
    order.statusHistory.push({
      status: order.status, // Keep same status, just update payment
      changedBy: adminId,
      changedByRole: 'admin',
      timestamp: new Date(),
      note: 'Payment marked as collected by admin',
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Cash marked as collected successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
