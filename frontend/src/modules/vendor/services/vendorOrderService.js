import api from '../../../utils/api';

/**
 * Vendor Order Service
 * Handles order-related API calls for Vendor Dashboard
 */
export const vendorOrderService = {
    /**
     * Get vendor orders
     * @param {Object} params - Query parameters (page, limit, status, search)
     * @returns {Promise<Object>} { orders, total, page, totalPages }
     */
    getOrders: async (params = {}) => {
        const res = await api.get('/vendor/orders', { params });
        return res.data;
    },

    /**
     * Get single vendor order details
     * @param {String} orderId - Order ID or code
     * @returns {Promise<Object>} Order object
     */
    getOrder: async (orderId) => {
        const res = await api.get(`/vendor/orders/${orderId}`);
        return res.data.order;
    },

    /**
     * Update order status
     * @param {String} orderId - Order ID or code
     * @param {String} status - New status
     * @param {String} note - Optional note
     * @returns {Promise<Object>} Updated order summary
     */
    updateOrderStatus: async (orderId, status, note = '') => {
        const res = await api.put(`/vendor/orders/${orderId}/status`, { status, note });
        return res.data.order;
    },

    /**
     * Get vendor order statistics
     * @returns {Promise<Object>} Statistics object
     */
    getStats: async () => {
        const res = await api.get('/vendor/orders/stats');
        return res.data;
    },

    /**
     * Get vendor earnings statistics
     * @returns {Promise<Object>} Earnings data
     */
    getEarningsStats: async () => {
        const res = await api.get('/vendor/orders/earnings');
        return res.data;
    }
};
