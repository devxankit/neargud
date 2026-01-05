import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      products: [],
      videos: [],

      // --- Product Favorites ---
      addProduct: (product) =>
        set((state) => {
          const exists = state.products.find((p) => p.id === product.id);
          if (exists) return state;
          return { products: [...state.products, product] };
        }),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      isInProducts: (id) => get().products.some((p) => p.id === id),

      // --- Video Favorites ---
      addVideo: (video) =>
        set((state) => {
          const exists = state.videos.find((v) => v.id === video.id);
          if (exists) return state;
          return { videos: [...state.videos, video] };
        }),

      removeVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((v) => v.id !== id),
        })),

      isInVideos: (id) => get().videos.some((v) => v.id === id),

      // --- General ---
      clearAll: () => set({ products: [], videos: [] }),
      
      getItemCount: () => get().products.length + get().videos.length,

      moveToCart: (id) => {
        const state = get();
        const product = state.products.find((p) => p.id === id);
        if (product) {
          set({
            products: state.products.filter((p) => p.id !== id),
          });
          return product;
        }
        return null;
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
