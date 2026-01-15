import { create } from 'zustand';
import { vendorReviewService } from '../services/vendorReviewService';
import toast from 'react-hot-toast';

export const useVendorReviewStore = create((set, get) => ({
    reviews: [],
    total: 0,
    page: 1,
    totalPages: 1,
    isLoading: false,
    error: null,

    fetchReviews: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await vendorReviewService.getReviews(params);

            // Handle different potential response structures safely
            const data = response.data || response;
            const pagination = response.pagination || {};

            set({
                reviews: data.reviews || [],
                total: pagination.total || (data.reviews ? data.reviews.length : 0),
                page: pagination.page || 1,
                totalPages: pagination.pages || 1,
                isLoading: false
            });
            return response;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    respond: async (reviewId, responseText) => {
        set({ isLoading: true });
        try {
            const response = await vendorReviewService.respondToReview(reviewId, responseText);
            const updatedReview = (response.data && response.data.review) ? response.data.review : response.review;

            set((state) => ({
                reviews: state.reviews.map(r =>
                    (r._id === reviewId || r.id === reviewId) ? updatedReview : r
                ),
                isLoading: false
            }));

            toast.success('Response added successfully');
            return updatedReview;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    moderate: async (reviewId, action) => {
        set({ isLoading: true });
        try {
            const response = await vendorReviewService.moderateReview(reviewId, action);
            const updatedReview = (response.data && response.data.review) ? response.data.review : response.review;

            set((state) => ({
                reviews: state.reviews.map(r =>
                    (r._id === reviewId || r.id === reviewId) ? updatedReview : r
                ),
                isLoading: false
            }));

            toast.success(action === 'hide' ? 'Review hidden' : 'Review approved');
            return updatedReview;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    }
}));
