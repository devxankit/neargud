import api from '../utils/api';

/**
 * Product API Service for Admin
 */

/**
 * Fetch all products with filters
 * @param {Object} params - { search, stock, categoryId, brandId, page, limit }
 * @returns {Promise<Object>} { products, total, page, totalPages }
 */
export const fetchProducts = async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
};

/**
 * Fetch single product by ID
 * @param {String} id - Product ID
 * @returns {Promise<Object>} Product details
 */
export const fetchProductById = async (id) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
};

/**
 * Create a new product
 * @param {Object} productData - Product data including images
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
};

/**
 * Update existing product
 * @param {String} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
};

/**
 * Delete a product
 * @param {String} id - Product ID
 * @returns {Promise<Object>} Success message
 */
export const deleteProduct = async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
};
