import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartApi } from '../services/cartApi';
import toast from 'react-hot-toast';

export const useCartStore = create(
    persist(
        (set, get) => ({
            cart: null,
            items: [],
            isLoading: false,
            error: null,

            // Fetch cart
            fetchCart: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await cartApi.getCart();
                    const cartData = response.data.data || response.data;
                    set({
                        cart: cartData,
                        items: cartData.items || [],
                        isLoading: false,
                    });
                    return cartData;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Add to cart
            addToCart: async (productData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await cartApi.addToCart(productData);
                    const cartData = response.data.data || response.data;
                    set({
                        cart: cartData,
                        items: cartData.items || [],
                        isLoading: false,
                    });
                    toast.success('Added to cart!');
                    return cartData;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    toast.error(error.message || 'Failed to add to cart');
                    throw error;
                }
            },

            // Update cart item
            updateCartItem: async (productId, quantity) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await cartApi.updateCartItem(productId, quantity);
                    const cartData = response.data.data || response.data;
                    set({
                        cart: cartData,
                        items: cartData.items || [],
                        isLoading: false,
                    });
                    return cartData;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    toast.error(error.message || 'Failed to update cart');
                    throw error;
                }
            },

            // Remove from cart
            removeFromCart: async (productId) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await cartApi.removeFromCart(productId);
                    const cartData = response.data.data || response.data;
                    set({
                        cart: cartData,
                        items: cartData.items || [],
                        isLoading: false,
                    });
                    toast.success('Removed from cart');
                    return cartData;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    toast.error(error.message || 'Failed to remove from cart');
                    throw error;
                }
            },

            // Clear cart
            clearCart: async () => {
                set({ isLoading: true, error: null });
                try {
                    await cartApi.clearCart();
                    set({
                        cart: null,
                        items: [],
                        isLoading: false,
                    });
                    toast.success('Cart cleared');
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    toast.error(error.message || 'Failed to clear cart');
                    throw error;
                }
            },

            // Get cart item count
            getItemCount: () => {
                const state = get();
                return state.items.reduce((total, item) => total + (item.quantity || 1), 0);
            },

            // Get cart total
            getCartTotal: () => {
                const state = get();
                return state.cart?.total || 0;
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
