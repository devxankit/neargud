import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
    fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    updatePromoCodeStatus,
    deletePromoCode,
} from '../services/promoCodeApi';

// Helper to transform _id to id
const transformPromoCode = (promo) => {
    if (!promo) return null;
    return {
        ...promo,
        id: promo._id || promo.id,
    };
};

export const usePromoCodeStore = create((set, get) => ({
    promoCodes: [],
    isLoading: false,
    total: 0,
    page: 1,
    currentPage: 1, // Add alias for easier binding if needed
    totalPages: 1,

    // Fetch Promo Codes
    fetchPromoCodes: async (params = {}) => {
        set({ isLoading: true });
        try {
            const response = await fetchPromoCodes(params);
            const promos = response?.promoCodes || [];
            const transformedPromos = promos.map(transformPromoCode);

            set({
                promoCodes: transformedPromos,
                // Assuming API structure might return pagination metadata later, 
                // for now just mapping the list. If API doesn't return paging, we might need client side paging or update API.
                // Based on controller it just returns { promoCodes: [...] }, no pagination meta yet.
                total: transformedPromos.length,
                isLoading: false,
            });
            return transformedPromos;
        } catch (error) {
            console.error('Failed to fetch promo codes:', error);
            set({ isLoading: false });
            toast.error(error.message || 'Failed to fetch promo codes');
        }
    },

    // Create Promo Code
    createPromoCode: async (data) => {
        set({ isLoading: true });
        try {
            await createPromoCode(data);
            toast.success('Promo code created successfully');
            // Refresh list
            await get().fetchPromoCodes();
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.message || 'Failed to create promo code');
            throw error;
        }
    },

    // Update Promo Code
    updatePromoCode: async (id, data) => {
        set({ isLoading: true });
        try {
            await updatePromoCode(id, data);
            toast.success('Promo code updated successfully');
            // Refresh list
            await get().fetchPromoCodes();
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.message || 'Failed to update promo code');
            throw error;
        }
    },

    // Toggle Status
    toggleStatus: async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await updatePromoCodeStatus(id, newStatus);
            toast.success(`Promo code ${newStatus === 'active' ? 'activated' : 'deactivated'}`);

            // Optimistic update
            set((state) => ({
                promoCodes: state.promoCodes.map((p) =>
                    p.id === id ? { ...p, status: newStatus } : p
                )
            }));
        } catch (error) {
            toast.error('Failed to update status');
            // Revert or refresh on error could be added
            get().fetchPromoCodes();
        }
    },

    // Delete Promo Code
    deletePromoCode: async (id) => {
        try {
            await deletePromoCode(id);
            toast.success('Promo code deleted successfully');
            // Optimistic update
            set((state) => ({
                promoCodes: state.promoCodes.filter((p) => p.id !== id)
            }));
        } catch (error) {
            toast.error('Failed to delete promo code');
            get().fetchPromoCodes();
        }
    }
}));
