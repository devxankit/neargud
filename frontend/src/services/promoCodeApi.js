import api from '../utils/api';

const BASE_URL = '/admin/promocodes';

// Get all promo codes
export const fetchPromoCodes = async (params = {}) => {
    try {
        const response = await api.get(BASE_URL, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get promo code by ID
export const fetchPromoCodeById = async (id) => {
    try {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Create new promo code
export const createPromoCode = async (data) => {
    try {
        const response = await api.post(BASE_URL, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update promo code
export const updatePromoCode = async (id, data) => {
    try {
        const response = await api.put(`${BASE_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update promo code status
export const updatePromoCodeStatus = async (id, status) => {
    try {
        const response = await api.patch(`${BASE_URL}/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete promo code
export const deletePromoCode = async (id) => {
    try {
        const response = await api.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
