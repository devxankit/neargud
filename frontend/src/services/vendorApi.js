import api from '../utils/api';

/**
 * Vendor API Service
 * Handles all vendor-related API calls for Admin
 */

/**
 * Get all vendors
 * @param {Object} params - Query parameters (page, limit, search, status, etc.)
 * @returns {Promise<Object>} { vendors, total, page, totalPages }
 */
export const fetchVendors = async (params = {}) => {
    const response = await api.get('/admin/vendors', { params });
    return response;
};

/**
 * Get pending vendors
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} { vendors, total, ... }
 */
export const fetchPendingVendors = async (params = {}) => {
    const response = await api.get('/admin/vendors/pending', { params });
    return response;
};

/**
 * Get approved vendors
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} { vendors, total, ... }
 */
export const fetchApprovedVendors = async (params = {}) => {
    const response = await api.get('/admin/vendors/approved', { params });
    return response;
};

/**
 * Get vendor by ID
 * @param {String} id - Vendor ID
 * @returns {Promise<Object>} Vendor object
 */
export const fetchVendorById = async (id) => {
    const response = await api.get(`/admin/vendors/${id}`);
    return response;
};

/**
 * Update vendor status
 * @param {String} id - Vendor ID
 * @param {String} status - New status (approved, suspended, etc.)
 * @returns {Promise<Object>} Updated vendor
 */
export const updateVendorStatusApi = async (id, status) => {
    const response = await api.put(`/admin/vendors/${id}/status`, { status });
    return response;
};

/**
 * Update vendor commission rate
 * @param {String} id - Vendor ID
 * @param {Number} commissionRate - New commission rate (0-1)
 * @returns {Promise<Object>} Updated vendor
 */
export const updateVendorCommissionApi = async (id, commissionRate) => {
    const response = await api.put(`/admin/vendors/${id}/commission`, { commissionRate });
    return response;
};

/**
 * Get vendor analytics
 * @param {String} id - Vendor ID (optional, if not provided returns all vendors analytics summary)
 * @returns {Promise<Object>} Analytics data
 */
export const fetchVendorAnalytics = async (id = null) => {
    const url = id ? `/admin/vendors/analytics/${id}` : '/admin/vendors/analytics';
    const response = await api.get(url);
    return response;
};

/**
 * Get vendor orders
 * @param {String} id - Vendor ID
 * @param {Object} params - Query params
 * @returns {Promise<Object>} Orders list
 */
export const fetchVendorOrders = async (id, params = {}) => {
    const response = await api.get(`/admin/vendors/${id}/orders`, { params });
    return response;
};

/**
 * Toggle vendor active status
 * @param {String} id - Vendor ID
 * @param {Boolean} isActive - New active status
 * @returns {Promise<Object>} Updated vendor
 */
export const updateVendorActiveStatusApi = async (id, isActive) => {
    const response = await api.put(`/admin/vendors/${id}/active`, { isActive });
    return response;
};
