import { create } from 'zustand';
import {
    fetchProductFAQs,
    createProductFAQ,
    updateProductFAQ,
    deleteProductFAQ
} from '../modules/vendor/services/productFaqService';

export const useProductFaqStore = create((set, get) => ({
    faqs: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    },

    setFaqs: (faqs) => set({ faqs }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    getFAQs: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await fetchProductFAQs(params);
            // Backend returns { faqs, pagination: { total, page, limit, totalPages } }
            const faqs = response.faqs || [];
            const pagination = response.pagination || {};
            set({
                faqs,
                pagination: {
                    total: pagination.total || faqs.length,
                    page: pagination.page || 1,
                    limit: pagination.limit || 10,
                    totalPages: pagination.totalPages || 1
                }
            });
        } catch (error) {
            set({ error: error.message || 'Failed to fetch FAQs' });
        } finally {
            set({ loading: false });
        }
    },

    addFAQ: async (data) => {
        set({ loading: true, error: null });
        try {
            const newFAQ = await createProductFAQ(data);
            set((state) => ({ faqs: [newFAQ.faq, ...state.faqs] }));
            return newFAQ;
        } catch (error) {
            set({ error: error.message || 'Failed to create FAQ' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    editFAQ: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const updatedFAQ = await updateProductFAQ(id, data);
            set((state) => ({
                faqs: state.faqs.map((f) => (f._id === id ? updatedFAQ.faq : f))
            }));
            return updatedFAQ;
        } catch (error) {
            set({ error: error.message || 'Failed to update FAQ' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    removeFAQ: async (id) => {
        set({ loading: true, error: null });
        try {
            await deleteProductFAQ(id);
            set((state) => ({
                faqs: state.faqs.filter((f) => f._id !== id)
            }));
        } catch (error) {
            set({ error: error.message || 'Failed to delete FAQ' });
            throw error;
        } finally {
            set({ loading: false });
        }
    }
}));
