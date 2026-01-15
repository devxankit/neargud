import api from '../utils/api';

export const adminReturnApi = {
    // Get all return requests
    getReturns: (params) => api.get('/admin/returns', { params }),

    // Get single return request
    getReturn: (requestId) => api.get(`/admin/returns/${requestId}`),

    // Update return status
    updateStatus: (requestId, status, note = '') =>
        api.put(`/admin/returns/${requestId}/status`, { status, note }),

    // Process refund
    processRefund: (requestId) =>
        api.put(`/admin/returns/${requestId}/refund`),

    // Get return policy
    getPolicy: () => api.get('/admin/returns/policy'),

    // Update return policy
    updatePolicy: (policyData) => api.put('/admin/returns/policy', policyData),
};
