import api from '../../../utils/api';

export const fetchProductFAQs = async (params = {}) => {
    const response = await api.get('/vendor/faqs', { params });
    return response.data;
};

export const fetchProductFAQById = async (id) => {
    const response = await api.get(`/vendor/faqs/${id}`);
    return response.data;
};

export const createProductFAQ = async (data) => {
    const response = await api.post('/vendor/faqs', data);
    return response.data;
};

export const updateProductFAQ = async (id, data) => {
    const response = await api.put(`/vendor/faqs/${id}`, data);
    return response.data;
};

export const deleteProductFAQ = async (id) => {
    const response = await api.delete(`/vendor/faqs/${id}`);
    return response.data;
};
