import api from '../utils/api';

export const reviewService = {
    /**
   * Get reviews for a product
   */
    getProductReviews: async (productId, page = 1) => {
        const response = await api.get(`/public/reviews/product/${productId}?page=${page}`);
        return response.data;
    },

    /**
     * Create a new review
     */
    createReview: async (reviewData) => {
        const response = await api.post('/public/reviews', reviewData);
        return response.data;
    },

    /**
     * Check if a user is eligible to review a product
     */
    checkEligibility: async (productId) => {
        const response = await api.get(`/public/reviews/check/${productId}`);
        return response.data;
    }
};
