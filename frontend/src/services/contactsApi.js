import api from '../utils/api';

/**
 * Get all vendors for customer to start chat
 */
// Note: api.get returns response.data directly due to interceptor
export const getAvailableVendors = async () => {
    const response = await api.get('/public/vendors');
    // response is { success: true, data: { vendors: [...] } }
    if (response?.data?.vendors) {
        return response.data.vendors;
    }
    return response?.data || response || [];
};

/**
 * Get all customers for vendor (who have ordered from this vendor)
 */
export const getVendorCustomers = async () => {
    const response = await api.get('/vendor/customers');
    // API returns { success: true, data: { customers: [...] } }
    // Or sometimes just { customers: [...] } depending on standardization
    // Safely extract the array
    if (response?.data?.data?.customers) {
        return response.data.data.customers;
    }
    if (response?.data?.customers) {
        return response.data.customers;
    }
    return response?.data || response || [];
};

/**
 * Search vendors by name
 */
export const searchVendors = async (query) => {
    const response = await api.get('/public/vendors', {
        params: { search: query }
    });
    // response is { success: true, data: { vendors: [...] } }
    if (response?.data?.vendors) {
        return response.data.vendors;
    }
    return response?.data || response || [];
};
