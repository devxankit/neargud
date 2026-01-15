import firebaseService from './firebase.service.js';

class NotificationServiceHelper {
    /**
     * Send order placed notification
     */
    async sendOrderPlacedNotification(order, customer) {
        return await firebaseService.sendPushNotification({
            userId: customer._id || customer.id,
            userModel: 'User',
            title: '🎉 Order Placed Successfully!',
            message: `Your order #${order.orderCode} has been placed. Total: ₹${order.total}`,
            type: 'order_placed',
            priority: 'high',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
                total: order.total.toString(),
            },
            clickAction: `/app/orders/${order._id}`,
        });
    }

    /**
     * Send order confirmed notification
     */
    async sendOrderConfirmedNotification(order, customer) {
        return await firebaseService.sendPushNotification({
            userId: customer._id || customer.id,
            userModel: 'User',
            title: '✅ Order Confirmed!',
            message: `Your order #${order.orderCode} has been confirmed and is being processed.`,
            type: 'order_confirmed',
            priority: 'high',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
            },
            clickAction: `/app/orders/${order._id}`,
        });
    }

    /**
     * Send order shipped notification
     */
    async sendOrderShippedNotification(order, customer, trackingInfo = {}) {
        return await firebaseService.sendPushNotification({
            userId: customer._id || customer.id,
            userModel: 'User',
            title: '🚚 Order Shipped!',
            message: `Your order #${order.orderCode} has been shipped${trackingInfo.trackingNumber ? ` (Tracking: ${trackingInfo.trackingNumber})` : ''}.`,
            type: 'order_shipped',
            priority: 'high',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
                ...trackingInfo,
            },
            clickAction: `/app/orders/${order._id}`,
        });
    }

    /**
     * Send order delivered notification
     */
    async sendOrderDeliveredNotification(order, customer) {
        return await firebaseService.sendPushNotification({
            userId: customer._id || customer.id,
            userModel: 'User',
            title: '🎊 Order Delivered!',
            message: `Your order #${order.orderCode} has been delivered. Enjoy your purchase!`,
            type: 'order_delivered',
            priority: 'high',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
            },
            clickAction: `/app/orders/${order._id}`,
        });
    }

    /**
     * Send order cancelled notification
     */
    async sendOrderCancelledNotification(order, customer, reason = '') {
        return await firebaseService.sendPushNotification({
            userId: customer._id || customer.id,
            userModel: 'User',
            title: '❌ Order Cancelled',
            message: `Your order #${order.orderCode} has been cancelled${reason ? `: ${reason}` : ''}.`,
            type: 'order_cancelled',
            priority: 'high',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
                reason,
            },
            clickAction: `/app/orders/${order._id}`,
        });
    }

    /**
     * Send payment success notification
     */
    async sendPaymentSuccessNotification(order, customer) {
        return await firebaseService.sendPushNotification({
            userId: customer._id || customer.id,
            userModel: 'User',
            title: '💳 Payment Successful!',
            message: `Payment of ₹${order.total} received for order #${order.orderCode}.`,
            type: 'payment_success',
            priority: 'high',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
                amount: order.total.toString(),
            },
            clickAction: `/app/orders/${order._id}`,
        });
    }

    /**
     * Send payment failed notification
     */
    async sendPaymentFailedNotification(order, customer, reason = '') {
        return await firebaseService.sendPushNotification({
            userId: customer._id || customer.id,
            userModel: 'User',
            title: '❌ Payment Failed',
            message: `Payment failed for order #${order.orderCode}${reason ? `: ${reason}` : ''}. Please try again.`,
            type: 'payment_failed',
            priority: 'urgent',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
                reason,
            },
            clickAction: `/app/orders/${order._id}`,
        });
    }

    /**
     * Send new order notification to vendor
     */
    async sendNewOrderNotificationToVendor(order, vendor) {
        return await firebaseService.sendPushNotification({
            userId: vendor._id || vendor.id,
            userModel: 'Vendor',
            title: '🔔 New Order Received!',
            message: `You have a new order #${order.orderCode} worth ₹${order.total}.`,
            type: 'new_order',
            priority: 'high',
            data: {
                orderId: order._id.toString(),
                orderCode: order.orderCode,
                total: order.total.toString(),
            },
            clickAction: `/vendor/orders/${order._id}`,
        });
    }

    /**
     * Send chat message notification
     */
    async sendChatMessageNotification(recipientId, senderName, message, userModel = 'User') {
        return await firebaseService.sendPushNotification({
            userId: recipientId,
            userModel,
            title: `💬 New message from ${senderName}`,
            message: message.substring(0, 100),
            type: 'chat_message',
            priority: 'medium',
            data: {
                senderId: senderName,
            },
            clickAction: `/app/chat`,
        });
    }

    /**
     * Send custom notification
     */
    async sendCustomNotification(userId, title, message, options = {}) {
        return await firebaseService.sendPushNotification({
            userId,
            title,
            message,
            userModel: options.userModel || 'User',
            type: options.type || 'custom',
            priority: options.priority || 'medium',
            data: options.data || {},
            clickAction: options.clickAction,
        });
    }
}

export default new NotificationServiceHelper();
