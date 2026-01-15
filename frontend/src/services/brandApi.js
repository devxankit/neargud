import api from '../utils/api';

/**
 * Brand API Service
 * Handles all brand-related API calls
 */

/**
 * Get all brands
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} { brands, total, page, totalPages }
 */
export const fetchBrands = async (params = {}) => {
    const response = await api.get('/admin/brands', { params });
    return response.data;
};

/**
 * Get brand by ID
 * @param {String} id - Brand ID
 * @returns {Promise<Object>} Brand object
 */
export const fetchBrandById = async (id) => {
    const response = await api.get(`/admin/brands/${id}`);
    return response.data;
};

/**
 * Create a new brand
 * @param {Object} brandData - Brand data
 * @returns {Promise<Object>} Created brand
 */
export const createBrandApi = async (brandData) => {
    const response = await api.post('/admin/brands', brandData);
    return response.data;
};

/**
 * Update brand
 * @param {String} id - Brand ID
 * @param {Object} brandData - Updated brand data
 * @returns {Promise<Object>} Updated brand
 */
export const updateBrandApi = async (id, brandData) => {
    const response = await api.put(`/admin/brands/${id}`, brandData);
    return response.data;
};

/**
 * Delete brand
 * @param {String} id - Brand ID
 * @returns {Promise<Boolean>} Success status
 */
export const deleteBrandApi = async (id) => {
    await api.delete(`/admin/brands/${id}`);
    return true;
};

/**
 * Bulk delete brands
 * @param {Array<String>} ids - Array of brand IDs
 * @returns {Promise<Object>} { deletedCount, failedIds }
 */
export const bulkDeleteBrandsApi = async (ids) => {
    const response = await api.delete('/admin/brands/bulk', { data: { ids } });
    return response.data;
};

/**
 * Toggle brand status
 * @param {String} id - Brand ID
 * @returns {Promise<Object>} Updated brand
 */
export const toggleBrandStatusApi = async (id) => {
    const response = await api.put(`/admin/brands/${id}/toggle-status`);
    return response.data;
};
