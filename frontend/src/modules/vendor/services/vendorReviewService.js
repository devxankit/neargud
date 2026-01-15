import api from '../../../utils/api';

export const vendorReviewService = {
    /**
     * Get all reviews for vendor's products
     * @param {Object} params - { search, rating, productId, page, limit }
     */
    getReviews: async (params = {}) => {
        const response = await api.get('/vendor/reviews', { params });
        return response; // response is already the JSON body from api.js interceptor
    },

    /**
     * Get a single review by ID
     * @param {string} reviewId 
     */
    getReview: async (reviewId) => {
        const response = await api.get(`/vendor/reviews/${reviewId}`);
        return response;
    },

    /**
     * Respond to a review
     * @param {string} reviewId 
     * @param {string} response 
     */
    respondToReview: async (reviewId, responseText) => {
        const response = await api.post(`/vendor/reviews/${reviewId}/respond`, { response: responseText });
        return response;
    },

    /**
     * Moderate a review (hide or approve)
     * @param {string} reviewId 
     * @param {string} action - 'hide' | 'approve'
     */
    moderateReview: async (reviewId, action) => {
        const response = await api.patch(`/vendor/reviews/${reviewId}/moderate`, { action });
        return response;
    }
};
