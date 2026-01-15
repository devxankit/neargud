import api from '../utils/api';

export const wishlistApi = {
    getWishlist: () => api.get('/user/wishlist'),
    addToWishlist: (productId) => api.post('/user/wishlist', { productId }),
    removeFromWishlist: (productId) => api.delete(`/user/wishlist/${productId}`),
    clearWishlist: () => api.delete('/user/wishlist'),
    checkWishlist: (productId) => api.get(`/user/wishlist/check/${productId}`),
};
