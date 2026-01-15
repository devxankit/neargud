import api from '../utils/api';

export const fetchStockStats = async () => {
    try {
        const response = await api.get('/vendor/stock/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching stock stats:', error);
        throw error;
    }
};

export const fetchStock = async (params = {}) => {
    try {
        const response = await api.get('/vendor/stock', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching stock:', error);
        throw error;
    }
};

export const updateStock = async (productId, quantity) => {
    try {
        const response = await api.patch(`/vendor/stock/${productId}`, { stockQuantity: quantity });
        return response.data;
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};
