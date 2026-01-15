import api from '../utils/api';

export const adminOrderApi = {
    // Get all orders with filtering
    getOrders: (params) => api.get('/admin/orders', { params }),

    // Get order by ID
    getOrder: (orderId) => api.get(`/admin/orders/${orderId}`),

    // Update order status
    updateStatus: (orderId, statusData) => api.put(`/admin/orders/${orderId}/status`, statusData),

    // Cancel order
    cancelOrder: (orderId, reasonData) => api.put(`/admin/orders/${orderId}/cancel`, reasonData),

    // Process refund
    processRefund: (orderId, refundData) => api.put(`/admin/orders/${orderId}/refund`, refundData),

    // Get order statistics
    getStats: () => api.get('/admin/orders/stats'),
};

export default adminOrderApi;
