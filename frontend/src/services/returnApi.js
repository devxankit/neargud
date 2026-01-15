import api from '../utils/api';

export const returnApi = {
    // Create return request
    createReturnRequest: (returnData) => api.post('/user/returns', returnData),

    // Get all return requests
    getUserReturns: (params) => api.get('/user/returns', { params }),

    // Get return eligibility for an order
    getReturnEligibility: (orderId) => api.get(`/user/returns/eligibility/${orderId}`),
};
