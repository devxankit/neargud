import api from '../utils/api';

/**
 * Fetch all customers for a vendor
 * @param {Object} params - { search, page, limit }
 */
export const fetchVendorCustomers = async (params = {}) => {
    try {
        const response = await api.get('/vendor/customers', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor customers:', error);
        throw error;
    }
};

/**
 * Fetch a single customer detail for a vendor
 * @param {String} customerId
 */
export const fetchVendorCustomerById = async (customerId) => {
    try {
        const response = await api.get(`/vendor/customers/${customerId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching vendor customer ${customerId}:`, error);
        throw error;
    }
};
