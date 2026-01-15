import api from '../utils/api';

/**
 * Fetch inventory report for a vendor
 */
export const fetchInventoryReport = async () => {
    try {
        const response = await api.get('/vendor/inventory/reports');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory report:', error);
        throw error;
    }
};
