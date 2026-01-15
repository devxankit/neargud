import api from '../utils/api';

export const orderApi = {
    // Create order and initialize payment
    createOrder: (orderData) => api.post('/user/orders/create', orderData),

    // Verify payment
    verifyPayment: (paymentData) => api.post('/user/orders/verify-payment', paymentData),

    // Get all orders for authenticated user
    getOrders: (params) => api.get('/user/orders', { params }),

    // Get order by ID
    getOrder: (orderId) => api.get(`/user/orders/${orderId}`),

    // Cancel order
    cancelOrder: (orderId, reason) => api.post(`/user/orders/${orderId}/cancel`, { reason }),

    // Return Request APIs
    getReturnEligibility: (orderId) => api.get(`/user/returns/eligibility/${orderId}`),
    createReturnRequest: (returnData) => api.post('/user/returns', returnData),
    getUserReturns: () => api.get('/user/returns'),
};
