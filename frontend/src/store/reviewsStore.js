import { create } from 'zustand';
import { reviewService } from '../services/reviewService';
import toast from 'react-hot-toast';

export const useReviewsStore = create((set, get) => ({
  reviewsByProduct: {}, // { productId: { reviews: [], total: 0, page: 1, pages: 1 } }
  isLoading: false,
  error: null,

  fetchReviews: async (productId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const data = await reviewService.getProductReviews(productId, page);
      // data is already the inner data object { reviews, total, page, pages }
      set((state) => ({
        reviewsByProduct: {
          ...state.reviewsByProduct,
          [productId]: {
            reviews: data.reviews || [],
            total: data.total || 0,
            page: data.page || 1,
            pages: data.pages || 1
          }
        },
        isLoading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addReview: async (reviewData) => {
    set({ isLoading: true });
    try {
      const data = await reviewService.createReview(reviewData);

      // Refresh reviews for this product
      // This will now work without crashing since fetchReviews is fixed
      await get().fetchReviews(reviewData.productId);

      toast.success('Review submitted successfully');
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to submit review');
      throw error;
    }
  },

  getReviews: (productId) => {
    return get().reviewsByProduct[productId]?.reviews || [];
  },

  checkEligibility: async (productId) => {
    try {
      const data = await reviewService.checkEligibility(productId);
      return data.data; // { canReview: boolean, orderId?: string, message?: string }
    } catch (error) {
      return { canReview: false, message: 'Could not verify eligibility' };
    }
  }
}));
