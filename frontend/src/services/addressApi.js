import api from '../utils/api';

export const addressApi = {
    getAddresses: () => api.get('/user/addresses'),
    getAddress: (id) => api.get(`/user/addresses/${id}`),
    createAddress: (data) => api.post('/user/addresses', data),
    updateAddress: (id, data) => api.put(`/user/addresses/${id}`, data),
    deleteAddress: (id) => api.delete(`/user/addresses/${id}`),
    setDefaultAddress: (id) => api.put(`/user/addresses/${id}/default`),
};
