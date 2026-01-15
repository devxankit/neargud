import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import offerApi from '../services/offerApi';

// Helper function to generate URL-friendly slug (kept for optimistic updates if needed or helper usage)
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
};

export const useCampaignStore = create(
  persist(
    (set, get) => ({
      campaigns: [],
      isLoading: false,
      error: null,

      // Initialize campaigns (fetch from API)
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await offerApi.getAll();
          if (response.success) {
            set({ campaigns: response.data.campaigns || response.data });
          }
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error.message });
          console.error("Failed to fetch campaigns", error);
        }
      },

      // Get all campaigns
      getCampaigns: () => {
        return get().campaigns;
      },

      // Get campaigns by type
      getCampaignsByType: (type) => {
        return get().campaigns.filter((campaign) => campaign.type === type);
      },

      // Create campaign
      createCampaign: async (campaignData) => {
        set({ isLoading: true, error: null });
        try {
          // Prepare data (handle FormData if image exists or JSON)
          // The component usually sends a plain object or FormData.
          // If it sends object, we might need to convert for file upload in the service or here.
          // But our service handles FormData check. 

          // Note: Backend expects 'productIds' as JSON string if sending via FormData

          const response = await offerApi.create(campaignData);

          if (response.success) {
            const newCampaign = response.data.campaign;
            set(state => ({
              campaigns: [...state.campaigns, newCampaign],
              isLoading: false
            }));
            toast.success('Campaign created successfully');
            return newCampaign;
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          toast.error(error.message || 'Failed to create campaign');
          throw error;
        }
      },

      // Update campaign
      updateCampaign: async (id, campaignData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await offerApi.update(id, campaignData);

          if (response.success) {
            const updatedCampaign = response.data.campaign;
            set(state => ({
              campaigns: state.campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c),
              isLoading: false
            }));
            toast.success('Campaign updated successfully');
            return updatedCampaign;
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          toast.error(error.message || 'Failed to update campaign');
          throw error;
        }
      },

      // Delete campaign
      deleteCampaign: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await offerApi.delete(id);
          set(state => ({
            campaigns: state.campaigns.filter(c => c.id !== id && c._id !== id), // Check both ID types just in case
            isLoading: false
          }));
          toast.success('Campaign deleted successfully');
        } catch (error) {
          set({ isLoading: false, error: error.message });
          toast.error(error.message || 'Failed to delete campaign');
          throw error;
        }
      },

      // Toggle campaign status (using specific endpoint if available, or update)
      toggleCampaignStatus: async (id) => {
        try {
          const response = await offerApi.updateStatus(id);
          if (response.success) {
            const updatedCampaign = response.data.campaign;
            set(state => ({
              campaigns: state.campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c)
            }));
            toast.success(`Campaign ${updatedCampaign.status}`);
          }
        } catch (error) {
          toast.error(error.message || "Failed to update status");
        }
      },
    }),
    {
      name: 'campaign-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ campaigns: state.campaigns }), // Don't persist loading/error
    }
  )
);

// Export slug generation function for use in other components
export { generateSlug };

