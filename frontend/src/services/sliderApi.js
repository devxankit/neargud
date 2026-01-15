import api from '../utils/api';

const sliderApi = {
    // Get all sliders
    getAll: (params) => api.get('/admin/sliders', { params }),

    // Get slider by ID
    getById: (id) => api.get(`/admin/sliders/${id}`),

    // Create slider
    create: (data) => {
        if (data instanceof FormData) {
            return api.post('/admin/sliders', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.post('/admin/sliders', data);
    },

    // Update slider
    update: (id, data) => {
        if (data instanceof FormData) {
            return api.put(`/admin/sliders/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.put(`/admin/sliders/${id}`, data);
    },

    // Delete slider
    delete: (id) => api.delete(`/admin/sliders/${id}`),
};

export default sliderApi;
