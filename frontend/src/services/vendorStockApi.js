import api from '../utils/api';

export const fetchStockStats = async () => {
    try {
        const response = await api.get('/vendor/stock/stats');
        return response; // api returns response.data already
    } catch (error) {
        console.error('Error fetching stock stats:', error);
        throw error;
    }
};

export const fetchStock = async (params = {}) => {
    try {
        const response = await api.get('/vendor/stock', { params });
        return response;
    } catch (error) {
        console.error('Error fetching stock:', error);
        throw error;
    }
};

export const updateStock = async (productId, quantity) => {
    try {
        const response = await api.patch(`/vendor/stock/${productId}`, { stockQuantity: quantity });
        return response;
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};
