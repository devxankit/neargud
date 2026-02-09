import api from '../utils/api';

export const promoApi = {
    /**
     * Validate a promo code against the backend
     * @param {string} code - The promo code to validate
     * @param {number} cartTotal - The total amount of the cart
     * @param {Array} cartItems - The items in the cart
     * @returns {Promise<Object>}
     */
    validatePromoCode: (code, cartTotal, cartItems) => api.post('/public/promocodes/validate', { code, cartTotal, cartItems }),

    /**
     * Get available coupons for the current context
     * @returns {Promise<Object>}
     */
    getAvailableCoupons: () => api.get('/public/promocodes/available'),
};
