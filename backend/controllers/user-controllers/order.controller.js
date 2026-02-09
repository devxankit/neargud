import {
  createOrder as createOrderService,
  updateOrderPayment,
  getOrderById,
  getUserOrders,
  cancelOrder as cancelOrderService,
} from '../../services/order.service.js';
import razorpayService from '../../services/razorpay.service.js';
import notificationHelper from '../../services/notificationHelper.service.js';
import User from '../../models/User.model.js';


/**
 * Create a new order and initialize Razorpay payment (if online payment)
 * POST /api/user/orders/create
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id; // From auth middleware
    const {
      items,
      total,
      paymentMethod,
      shippingAddress,
      subtotal,
      shipping = 0,
      tax = 0,
      discount = 0,
      couponCode = null,
      walletUsed = 0,
      payableAmount = null,
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid total amount is required',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }


    // Determine remaining payable amount and whether Razorpay is needed
    let payable = typeof payableAmount === 'number' ? Math.max(0, payableAmount) : Math.max(0, (total || 0) - Math.max(0, walletUsed));


    // Get socket.io instance
    const io = req.app.get('io');

    // Create orders in database (this now returns an array)
    const orders = await createOrderService({
      customerId: userId,
      items,
      total,
      paymentMethod,
      shippingAddress,
      subtotal,
      shipping,
      tax,
      discount,
      couponCode,
      walletUsed,
      payableAmount: payable,
    }, io);

    // Use the first order for Razorpay reference and main response
    const mainOrder = orders[0];

    let razorpayOrder = null;
    let razorpayKeyId = null;

    // If online payment, create Razorpay order for the total payable amount
    payable = orders.reduce((sum, o) => sum + (o?.pricing?.payableAmount || 0), 0);
    const requiresRazorpay = payable > 0;

    if (requiresRazorpay) {
      try {
        razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        if (!razorpayKeyId) {
          throw new Error('Razorpay key ID not configured');
        }

        if (payable < 1) {
          throw new Error('Order amount must be at least ₹1');
        }

        razorpayOrder = await razorpayService.createOrder(
          payable,
          'INR',
          mainOrder.orderCode,
          {
            orderId: mainOrder._id.toString(),
            customerId: userId,
            couponCode: couponCode || '',
            subOrderIds: orders.map(o => o._id.toString()).join(','),
          }
        );

        if (!razorpayOrder || !razorpayOrder.id) {
          throw new Error('Failed to create Razorpay order - invalid response');
        }

        // Update ALL orders with the SAME Razorpay order ID
        for (const order of orders) {
          order.razorpayOrderId = razorpayOrder.id;
          await order.save();
        }
      } catch (razorpayError) {
        console.error('Razorpay order creation failed:', razorpayError);
        return res.status(500).json({
          success: false,
          message: razorpayError.message || 'Failed to initialize payment gateway.',
        });
      }
    }

    // Send order placed notifications for each order
    try {
      const customer = await User.findById(userId).select('name email');
      if (customer) {
        for (const order of orders) {
          await notificationHelper.sendOrderPlacedNotification(order, customer);
        }
      }
    } catch (notifError) {
      console.error('Failed to send order notification:', notifError);
    }

    // Return main order details (or first order) with Razorpay info
    res.status(201).json({
      success: true,
      message: requiresRazorpay
        ? 'Orders created. Please proceed with payment.'
        : 'Orders created successfully.',
      data: {
        order: {
          id: mainOrder._id,
          orderCode: mainOrder.orderCode,
          total: total, // Still return total of all orders
          paymentMethod: mainOrder.paymentMethod,
          paymentStatus: mainOrder.paymentStatus,
          status: mainOrder.status,
          createdAt: mainOrder.createdAt,
          subOrders: orders.map(o => ({
            id: o._id,
            orderCode: o.orderCode,
            total: o.total,
          })),
        },
        razorpay: requiresRazorpay && razorpayOrder
          ? {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: razorpayKeyId,
          }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment and update order
 * POST /api/user/orders/verify-payment
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Validate required fields
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields',
      });
    }

    // Verify payment signature
    const isValidSignature = razorpayService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    // Get payment details from Razorpay to confirm
    let paymentDetails;
    try {
      paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment with payment gateway',
      });
    }

    // Check if payment is actually successful
    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful',
      });
    }

    // Get socket.io instance
    const io = req.app.get('io');

    // Update orders with payment details
    const updatedOrders = await updateOrderPayment(orderId, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'completed',
    }, io);

    // Send payment success and order confirmed notifications for each order
    try {
      const customer = await User.findById(updatedOrders[0].customerId).select('name email');
      if (customer) {
        for (const order of updatedOrders) {
          await notificationHelper.sendPaymentSuccessNotification(order, customer);
          await notificationHelper.sendOrderConfirmedNotification(order, customer);
        }
      }
    } catch (notifError) {
      console.error('Failed to send payment notification:', notifError);
    }

    const mainOrder = updatedOrders.find(o => o._id.toString() === orderId.toString()) || updatedOrders[0];

    res.status(200).json({
      success: true,
      message: 'Payment verified and orders confirmed successfully',
      data: {
        order: {
          id: mainOrder._id,
          orderCode: mainOrder.orderCode,
          total: mainOrder.total,
          paymentStatus: mainOrder.paymentStatus,
          status: mainOrder.status,
          subOrders: updatedOrders.map(o => ({
            id: o._id,
            orderCode: o.orderCode,
            total: o.total,
            status: o.status,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 * GET /api/user/orders/:orderId
 */
export const getOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { orderId } = req.params;

    const order = await getOrderById(orderId, userId);

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
 * Get all orders for authenticated user
 * GET /api/user/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    console.log('Fetching orders for user:', userId);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found. Please login again.',
      });
    }

    const { status, paymentStatus, page, limit } = req.query;

    const filters = {
      status,
      paymentStatus,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    };

    const result = await getUserOrders(userId, filters);

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
 * Cancel an order
 * POST /api/user/orders/:orderId/cancel
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { orderId } = req.params;

    const cancelledOrder = await cancelOrderService(orderId, userId);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: {
          id: cancelledOrder._id,
          orderCode: cancelledOrder.orderCode,
          status: cancelledOrder.status,
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
    if (error.message.includes('cannot be cancelled')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

