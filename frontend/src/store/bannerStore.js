import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import sliderApi from '../services/sliderApi';

export const useBannerStore = create(
  persist(
    (set, get) => ({
      banners: [],
      isLoading: false,
      error: null,

      // Initialize banners
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await sliderApi.getAll();
          if (response.success) {
            const banners = (response.data.sliders || response.data || []).map(b => ({ ...b, id: b._id || b.id }));
            set({ banners });
          }
          set({ isLoading: false });
        } catch (error) {
          // If 404/error, just set empty to prevent constant loading loop or maybe defaults
          set({ banners: [], isLoading: false, error: error.message });
          // Optional: initialize defaults via API call or keep empty
          console.error("Failed to fetch banners", error);
        }
      },

      // Get all banners
      getBanners: () => {
        const state = get();
        if (state.banners.length === 0 && !state.isLoading && !state.error) {
          // Maybe auto-fetch if empty?
          // state.initialize();
          // Careful with infinite loop
        }
        return get().banners;
      },

      // Get banner by ID
      getBannerById: (id) => {
        return get().banners.find((banner) => banner.id === id || banner._id === id);
      },

      // Get banners by type
      getBannersByType: (type) => {
        return get().banners.filter((banner) => banner.type === type);
      },

      // Create banner
      createBanner: async (bannerData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await sliderApi.create(bannerData);

          if (response.success) {
            const rawBanner = response.data.slider || response.data;
            const newBanner = { ...rawBanner, id: rawBanner._id || rawBanner.id };
            set(state => ({
              banners: [...state.banners, newBanner],
              isLoading: false
            }));
            toast.success('Slider created successfully');
            return newBanner;
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          toast.error(error.message || 'Failed to create banner');
          throw error;
        }
      },

      // Update banner
      updateBanner: async (id, bannerData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await sliderApi.update(id, bannerData);

          if (response.success) {
            const rawBanner = response.data.slider || response.data;
            const updatedBanner = { ...rawBanner, id: rawBanner._id || rawBanner.id };
            set(state => ({
              banners: state.banners.map(b => (b.id === id || b._id === id) ? updatedBanner : b),
              isLoading: false
            }));
            toast.success('Slider updated successfully');
            return updatedBanner;
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          toast.error(error.message || 'Failed to update banner');
          throw error;
        }
      },

      // Delete banner
      deleteBanner: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await sliderApi.delete(id);

          set(state => ({
            banners: state.banners.filter(b => b.id !== id && b._id !== id),
            isLoading: false
          }));
          toast.success('Slider deleted successfully');
          return true;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          toast.error(error.message || 'Failed to delete banner');
          throw error;
        }
      },

      // Reorder banners (Backend usually handles sort order via update, or specific reorder endpoint)
      // For now, let's assume manual update of 'order' field one by one or bulk? 
      // Simplified: We'll implement reorder by iterating updates, or add a bulk endpoint later.
      // Current usage: reorderBanners(bannerIds)
      reorderBanners: async (bannerIds) => {
        // This is complex without a bulk endpoint.
        // For now, let's just update local state and maybe warn user? 
        // Or strictly, we should call update for each.
        // Let's defer strict implementation or do a loop.
        set({ isLoading: true });
        try {
          // Mock optimistic update
          const banners = get().banners;
          const updatedBanners = banners.map((banner) => {
            const newOrder = bannerIds.indexOf(banner._id || banner.id);
            return newOrder !== -1 ? { ...banner, order: newOrder + 1 } : banner;
          });

          // In real world, we need to save this.
          // Assuming we might have a bulk update endpoint, or just loop.
          // Loop for now (inefficient but works for small numbers)
          // Only update changed ones
          for (const b of updatedBanners) {
            const original = banners.find(old => (old._id || old.id) === (b._id || b.id));
            if (original.order !== b.order) {
              await sliderApi.update(b._id || b.id, { order: b.order });
            }
          }

          set({ banners: updatedBanners, isLoading: false });
          toast.success('Banners reordered successfully');
          return true;
        } catch (error) {
          set({ isLoading: false });
          toast.error("Failed to reorder");
        }
      },

      // Toggle banner status
      toggleBannerStatus: async (id) => {
        // We can use update for this
        const banner = get().getBannerById(id);
        if (banner) {
          try {
            await get().updateBanner(id, { isActive: !banner.isActive });
          } catch (err) {
            // handled in update
          }
        }
      },
    }),
    {
      name: 'banner-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ banners: state.banners }),
    }
  )
);

