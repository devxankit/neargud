import api from '../utils/api';

export const cartApi = {
    // Get cart
    getCart: () => api.get('/user/cart'),

    // Add product to cart
    addToCart: (productData) => api.post('/user/cart', productData),

    // Update cart item quantity
    updateCartItem: (productId, quantity) => api.put(`/user/cart/${productId}`, { quantity }),

    // Remove product from cart
    removeFromCart: (productId) => api.delete(`/user/cart/${productId}`),

    // Clear entire cart
    clearCart: () => api.delete('/user/cart'),
};
