import api from '../utils/api';

const offerApi = {
    // Get all offers
    getAll: (params) => api.get('/admin/offers', { params }),

    // Get offer by ID
    getById: (id) => api.get(`/admin/offers/${id}`),

    // Create offer
    create: (data) => {
        // Check if data contains file (for FormData)
        if (data instanceof FormData) {
            return api.post('/admin/offers', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.post('/admin/offers', data);
    },

    // Update offer
    update: (id, data) => {
        if (data instanceof FormData) {
            return api.put(`/admin/offers/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.put(`/admin/offers/${id}`, data);
    },

    // Update status (toggle)
    updateStatus: (id) => api.patch(`/admin/offers/${id}/status`),

    // Delete offer
    delete: (id) => api.delete(`/admin/offers/${id}`),
};

export default offerApi;
