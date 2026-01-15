import api from '../../../utils/api';

/**
 * Vendor Product API Service
 */

/**
 * Fetch all products for the logged-in vendor
 * @param {Object} params - { search, stock, categoryId, brandId, page, limit }
 * @returns {Promise<Object>} { products, total, page, totalPages }
 */
export const getVendorProducts = async (params = {}) => {
    const response = await api.get('/vendor/products', { params });
    // Normalize response structure if needed, but interceptor returns data
    return response;
};

/**
 * Fetch a single product by ID (must belong to vendor)
 * @param {String} id - Product ID
 */
export const getVendorProductById = async (id) => {
    const response = await api.get(`/vendor/products/${id}`);
    return response;
};

/**
 * Create a new product for the vendor
 * @param {Object} productData - Product data including images
 */
export const createVendorProduct = async (productData) => {
    const response = await api.post('/vendor/products', productData);
    return response;
};

/**
 * Update vendor's product
 * @param {String} id - Product ID
 * @param {Object} productData - Updated data
 */
export const updateVendorProduct = async (id, productData) => {
    const response = await api.put(`/vendor/products/${id}`, productData);
    return response;
};

/**
 * Delete vendor's product
 * @param {String} id - Product ID
 */
export const deleteVendorProduct = async (id) => {
    const response = await api.delete(`/vendor/products/${id}`);
    return response;
};

/**
 * Update product status (e.g. visibility)
 * @param {String} id - Product ID
 * @param {Object} statusData - { isVisible: boolean }
 */
export const updateVendorProductStatus = async (id, statusData) => {
    const response = await api.patch(`/vendor/products/${id}/status`, statusData);
    return response;
};
