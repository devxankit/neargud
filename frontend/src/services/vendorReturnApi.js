import api from '../utils/api';

export const vendorReturnApi = {
    // Get all return requests for the vendor
    getReturns: (params) => api.get('/vendor/returns', { params }),

    // Get single return request
    getReturn: (requestId) => api.get(`/vendor/returns/${requestId}`),

    // Update return status
    updateStatus: (requestId, status, note = '') =>
        api.put(`/vendor/returns/${requestId}/status`, { status, note }),
};
