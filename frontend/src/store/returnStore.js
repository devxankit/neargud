import { create } from 'zustand';
import { returnApi } from '../services/returnApi';
import toast from 'react-hot-toast';

export const useReturnStore = create((set, get) => ({
    returns: [],
    returnEligibility: null,
    isLoading: false,
    error: null,

    // Create return request
    createReturnRequest: async (returnData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await returnApi.createReturnRequest(returnData);
            const returnRequest = response.data.data || response.data;

            set((state) => ({
                returns: [returnRequest, ...state.returns],
                isLoading: false,
            }));

            toast.success('Return request created successfully!');
            return returnRequest;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Failed to create return request');
            throw error;
        }
    },

    // Fetch return requests
    fetchReturns: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await returnApi.getUserReturns(params);
            const returnsData = response.data.data || response.data;

            set({
                returns: returnsData.returns || returnsData,
                isLoading: false,
            });

            return returnsData;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Check return eligibility
    checkReturnEligibility: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await returnApi.getReturnEligibility(orderId);
            const eligibility = response.data.data || response.data;

            set({
                returnEligibility: eligibility,
                isLoading: false,
            });

            return eligibility;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Clear eligibility
    clearEligibility: () => {
        set({ returnEligibility: null });
    },
}));
