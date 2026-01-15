import api from '../utils/api';

/**
 * Product Rating/Review API Service
 */

/**
 * Fetch all reviews
 * @param {Object} params - { status, productId, page, limit }
 * @returns {Promise<Object>} reviews list
 */
export const fetchRatings = async (params = {}) => {
    const response = await api.get('/admin/product-ratings', { params });
    return response.data;
};

/**
 * Update review status
 * @param {String} id - Review ID
 * @param {Object} data - { status }
 * @returns {Promise<Object>} updated review
 */
export const updateRatingStatus = async (id, data) => {
    const response = await api.put(`/admin/product-ratings/${id}`, data);
    return response.data;
};

/**
 * Delete review
 * @param {String} id - Review ID
 * @returns {Promise<Object>} success message
 */
export const deleteRating = async (id) => {
    const response = await api.delete(`/admin/product-ratings/${id}`);
    return response.data;
};
