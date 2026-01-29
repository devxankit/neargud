import { create } from 'zustand';
import toast from 'react-hot-toast';
import { fetchPolicy, updatePolicy } from '../services/policyApi';
import { fetchContent, updateContentApi } from '../services/contentApi';

// Default content structure
const defaultContent = {
    homepage: {
        heroTitle: '',
        heroSubtitle: '',
        promoStrip: {
            housefullText: '',
            saleText: '',
            saleDateText: '',
            crazyDealsText: {
                line1: '',
                line2: ''
            }
        },
        lowestPrices: {
            title: ''
        },
        trendingTitle: 'Trending Now'
    },
    about: 'About us content...',
    terms: 'Terms and conditions content...',
    privacy: 'Privacy policy content...',
    refund: 'Refund policy content...',
    faq: [],
};

export const useContentStore = create((set, get) => ({
    content: defaultContent,
    isLoading: false,

    // Fetch All Content
    fetchAllContent: async () => {
        set({ isLoading: true });
        try {
            await Promise.all([
                get().fetchHomepageContent(),
                get().fetchAboutContent(),
                get().fetchFAQContent(),
                get().fetchPolicyContent('terms'),
                get().fetchPolicyContent('privacy')
            ]);
            set({ isLoading: false });
        } catch (error) {
            console.error('Failed to fetch all content:', error);
            set({ isLoading: false });
        }
    },

    // Fetch HomepageContent
    fetchHomepageContent: async () => {
        try {
            const response = await fetchContent('homepage');
            // The response structure is { success: true, data: { key: 'homepage', data: { ... } } }
            // Sometimes data might be double-nested due to previous update bugs
            let fetchedData = response?.data?.data || response?.data || {};

            // Recursively unwrap if we find a nested 'data' property that looks like our content
            while (fetchedData && fetchedData.data && typeof fetchedData.data === 'object' && !Array.isArray(fetchedData.data)) {
                fetchedData = fetchedData.data;
            }

            set((state) => ({
                content: {
                    ...state.content,
                    homepage: {
                        ...state.content.homepage,
                        ...(typeof fetchedData === 'object' ? fetchedData : {}),
                    }
                }
            }));
        } catch (error) {
            console.error('Failed to fetch homepage content:', error);
        }
    },

    // Update Homepage Content
    updateHomepageContent: async (data) => {
        set({ isLoading: true });
        try {
            await updateContentApi('homepage', data);
            set((state) => ({
                content: {
                    ...state.content,
                    homepage: {
                        ...state.content.homepage,
                        ...data,
                    }
                },
                isLoading: false,
            }));
            toast.success('Homepage content updated successfully');
        } catch (error) {
            set({ isLoading: false });
            toast.error('Failed to update homepage content');
            throw error;
        }
    },

    // Fetch About Us Content
    fetchAboutContent: async () => {
        try {
            const response = await fetchContent('about');
            const aboutContent = response?.data?.data || response?.data || '';
            set((state) => ({
                content: {
                    ...state.content,
                    about: aboutContent
                }
            }));
        } catch (error) {
            console.error('Failed to fetch about content:', error);
        }
    },

    // Update About Us Content
    updateAboutContent: async (data) => {
        set({ isLoading: true });
        try {
            await updateContentApi('about', data);
            set((state) => ({
                content: {
                    ...state.content,
                    about: data
                },
                isLoading: false,
            }));
            toast.success('About Us content updated successfully');
        } catch (error) {
            set({ isLoading: false });
            toast.error('Failed to update About Us content');
            throw error;
        }
    },

    // Fetch FAQ Content
    fetchFAQContent: async () => {
        try {
            const response = await fetchContent('faq');
            const faqContent = response?.data?.data || response?.data || [];
            set((state) => ({
                content: {
                    ...state.content,
                    faq: Array.isArray(faqContent) ? faqContent : []
                }
            }));
        } catch (error) {
            console.error('Failed to fetch FAQ content:', error);
        }
    },

    // Update FAQ Content
    updateFAQContent: async (data) => {
        set({ isLoading: true });
        try {
            await updateContentApi('faq', data);
            set((state) => ({
                content: {
                    ...state.content,
                    faq: data
                },
                isLoading: false,
            }));
            toast.success('FAQ content updated successfully');
        } catch (error) {
            set({ isLoading: false });
            toast.error('Failed to update FAQ content');
            throw error;
        }
    },

    // Fetch Policy (Privacy, Terms, Refund)
    fetchPolicyContent: async (key) => {
        try {
            const response = await fetchPolicy(key);
            const policyContent = response?.policy?.content || '';
            set((state) => ({
                content: {
                    ...state.content,
                    [key]: policyContent,
                }
            }));
            return policyContent;
        } catch (error) {
            console.error(`Failed to fetch ${key} policy:`, error);
            return '';
        }
    },

    // Update Policy
    updatePolicyContent: async (key, content) => {
        set({ isLoading: true });
        try {
            await updatePolicy(key, content);
            set((state) => ({
                content: {
                    ...state.content,
                    [key]: content,
                },
                isLoading: false,
            }));
            toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} policy updated successfully`);
        } catch (error) {
            set({ isLoading: false });
            toast.error(`Failed to update ${key} policy`);
            throw error;
        }
    },

    // Legacy support
    updateContent: (newContent) => {
        set((state) => ({
            content: { ...state.content, ...newContent }
        }));
    },

    reset: () => {
        set({ content: defaultContent });
    }
}));

