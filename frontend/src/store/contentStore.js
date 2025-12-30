import { create } from 'zustand';

// Default content structure
const defaultContent = {
    homepage: {
        heroTitle: 'Welcome to Our Store',
        heroSubtitle: 'Discover Amazing Products',
        aboutUs: 'About us content...',
        promoStrip: {
            housefullText: 'HOUSEFULL',
            saleDateText: '30TH NOV, 2025 - 7TH DEC, 2025',
            crazyDealsText: {
                line1: 'CRAZY',
                line2: 'DEALS'
            }
        },
        lowestPrices: {
            title: 'LOWEST PRICES EVER'
        }
    },
    terms: 'Terms and conditions content...',
    privacy: 'Privacy policy content...',
    faq: [],
};

const getInitialContent = () => {
    try {
        const saved = localStorage.getItem('admin-content');
        if (saved) {
            // Merge saved content with default content structure to ensure new fields exist
            const parsed = JSON.parse(saved);
            return {
                ...defaultContent,
                ...parsed,
                homepage: {
                    ...defaultContent.homepage,
                    ...(parsed.homepage || {}),
                    promoStrip: {
                        ...defaultContent.homepage.promoStrip,
                        ...(parsed.homepage?.promoStrip || {})
                    },
                    lowestPrices: {
                        ...defaultContent.homepage.lowestPrices,
                        ...(parsed.homepage?.lowestPrices || {})
                    }
                }
            };
        }
    } catch (e) {
        console.error('Failed to load content settings', e);
    }
    return defaultContent;
};

export const useContentStore = create((set, get) => ({
    content: getInitialContent(),

    updateContent: (newContent) => {
        // Deep merge or replacement strategy
        // For simplicity, we assume the caller provides the updated partial or full structure.
        // But since state updates are usually shallow merged in React, here we update the whole object.
        set((state) => {
            const updated = { ...state.content, ...newContent };
            try {
                localStorage.setItem('admin-content', JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to save content settings', e);
            }
            return { content: updated };
        });
    },

    updateSection: (section, data) => {
        set((state) => {
            const updated = {
                ...state.content,
                [section]: {
                    ...state.content[section],
                    ...data
                }
            };
            try {
                localStorage.setItem('admin-content', JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to save content settings', e);
            }
            return { content: updated };
        });
    },

    updateHomepageSection: (sectionKey, data) => {
        set((state) => {
            const updatedHomepage = {
                ...state.content.homepage,
                [sectionKey]: {
                    ...state.content.homepage[sectionKey],
                    ...data
                }
            };
            const updated = { ...state.content, homepage: updatedHomepage };
            try {
                localStorage.setItem('admin-content', JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to save content settings', e);
            }
            return { content: updated };
        });
    },

    reset: () => {
        set({ content: defaultContent });
        localStorage.removeItem('admin-content');
    }
}));
