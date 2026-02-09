import { create } from 'zustand';
import { wishlistApi } from '../services/wishlistApi';

export const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  // Fetch wishlist from server
  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistApi.getWishlist();
      // Ensure we extract the product array correctly from the response
      const wishlistData = response.data?.products || response.products || response.data || [];
      // Normalize items if they are populated objects or just IDs
      const items = wishlistData.map(item => item.productId || item);
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add item to wishlist
  addItem: async (product) => {
    const productId = product._id || product.id;
    set({ isLoading: true, error: null });
    try {
      await wishlistApi.addToWishlist(productId);
      // Fetch updated wishlist to ensure sync
      await get().fetchWishlist();
      set((state) => {
        const existingItem = state.items.find((i) => String(i._id || i.id) === String(productId));
        if (existingItem) return { isLoading: false };
        return {
          items: [...state.items, product],
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Remove item from wishlist
  removeItem: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      await wishlistApi.removeFromWishlist(productId);
      set((state) => ({
        items: state.items.filter((item) => String(item._id || item.id) !== String(productId)),
        isLoading: false,
      }));
      // Fetch updated wishlist to ensure sync
      await get().fetchWishlist();
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Check if item is in wishlist
  isInWishlist: (productId) => {
    const state = get();
    return state.items.some((item) => String(item._id || item.id) === String(productId));
  },

  // Clear wishlist
  clearWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      await wishlistApi.clearWishlist();
      set({ items: [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get wishlist count
  getItemCount: () => {
    const state = get();
    return state.items.length;
  },

  // Toggle wishlist (Convenience method)
  toggleWishlist: async (product) => {
    const productId = product._id || product.id;
    const isWishlisted = get().isInWishlist(productId);
    if (isWishlisted) {
      await get().removeItem(productId);
    } else {
      await get().addItem(product);
    }
  }
}));


