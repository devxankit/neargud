import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('vendor-token');
    return { Authorization: `Bearer ${token}` };
};

export const fetchVendorPromotions = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/vendor/promotions`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor promotions:', error);
        throw error;
    }
};

export const fetchVendorActiveCoupons = async () => {
    try {
        const response = await axios.get(`${API_URL}/vendor/promotions/active-coupons`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching active coupons:', error);
        throw error;
    }
};
