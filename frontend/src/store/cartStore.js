import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartApi } from "../services/cartApi";
import toast from "react-hot-toast";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      items: [],
      isLoading: false,
      error: null,

      // Fetch cart
      fetchCart: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          // For guests, we just use the persisted items in localStorage
          // which are already handled by zustand/persist
          return { items: get().items || [] };
        }

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
        const token = localStorage.getItem("token");
        if (!token) {
          // Handle guest cart locally
          const currentItems = [...(get().items || [])];
          const existingItemIndex = currentItems.findIndex(
            (item) =>
              (item.productId?._id || item.productId || item.id) ===
              (productData._id || productData.id),
          );

          if (existingItemIndex > -1) {
            currentItems[existingItemIndex].quantity +=
              productData.quantity || 1;
          } else {
            currentItems.push({
              productId: productData._id || productData.id,
              name: productData.name,
              price: productData.price,
              image: productData.image,
              quantity: productData.quantity || 1,
              vendorId: productData.vendorId,
            });
          }

          const subtotal = currentItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
          );
          const cartData = { items: currentItems, subtotal, total: subtotal };

          set({
            cart: cartData,
            items: currentItems,
            isLoading: false,
          });
          toast.success("Added to cart!");
          return cartData;
        }

        set({ isLoading: true, error: null });
        try {
          const payload = {
            ...productData,
            productId: productData.productId || productData._id || productData.id,
          };
          const response = await cartApi.addToCart(payload);
          const cartData = response.data.data || response.data;
          set({
            cart: cartData,
            items: cartData.items || [],
            isLoading: false,
          });
          toast.success("Added to cart!");
          return cartData;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || "Failed to add to cart");
          throw error;
        }
      },

      // Update cart item
      updateCartItem: async (productId, quantity) => {
        const token = localStorage.getItem("token");
        if (!token) {
          const currentItems = [...(get().items || [])];
          const itemIndex = currentItems.findIndex(
            (item) =>
              (item.productId?._id || item.productId || item.id) === productId,
          );

          if (itemIndex > -1) {
            if (quantity <= 0) {
              currentItems.splice(itemIndex, 1);
            } else {
              currentItems[itemIndex].quantity = quantity;
            }
          }

          const subtotal = currentItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
          );
          const cartData = { items: currentItems, subtotal, total: subtotal };

          set({
            cart: cartData,
            items: currentItems,
            isLoading: false,
          });
          return cartData;
        }

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
          toast.error(error.message || "Failed to update cart");
          throw error;
        }
      },

      // Remove from cart
      removeFromCart: async (productId) => {
        const token = localStorage.getItem("token");
        if (!token) {
          const currentItems = (get().items || []).filter(
            (item) =>
              (item.productId?._id || item.productId || item.id) !== productId,
          );

          const subtotal = currentItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
          );
          const cartData = { items: currentItems, subtotal, total: subtotal };

          set({
            cart: cartData,
            items: currentItems,
            isLoading: false,
          });
          toast.success("Removed from cart");
          return cartData;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await cartApi.removeFromCart(productId);
          const cartData = response.data.data || response.data;
          set({
            cart: cartData,
            items: cartData.items || [],
            isLoading: false,
          });
          toast.success("Removed from cart");
          return cartData;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || "Failed to remove from cart");
          throw error;
        }
      },

      // Clear cart
      clearCart: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({
            cart: null,
            items: [],
            isLoading: false,
          });
          toast.success("Cart cleared");
          return;
        }

        set({ isLoading: true, error: null });
        try {
          await cartApi.clearCart();
          set({
            cart: null,
            items: [],
            isLoading: false,
          });
          toast.success("Cart cleared");
        } catch (error) {
          set({ error: error.message, isLoading: false });
          toast.error(error.message || "Failed to clear cart");
          throw error;
        }
      },

      // Get cart item count
      getItemCount: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + (item.quantity || 1),
          0,
        );
      },

      // Get cart total
      getCartTotal: () => {
        const state = get();
        return state.cart?.total || 0;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
