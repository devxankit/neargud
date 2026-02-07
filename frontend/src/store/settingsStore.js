import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { adminSettingsApi } from '../services/adminSettingsApi';

const defaultSettings = {
  general: {
    storeName: 'Neargud',
    storeLogo: '/images/logos/logo.png',
    favicon: '/images/logos/logo.png',
    contactEmail: 'contact@example.com',
    contactPhone: '+1234567890',
    address: '',
    businessHours: 'Mon-Fri 9AM-6PM',
    timezone: 'UTC',
    currency: 'INR',
    language: 'en',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    accentColor: '#FFE11B',
    storeDescription: '',
  },
  // ... rest of the categories remain as placeholders for now
  payment: {
    paymentMethods: ['cod', 'card', 'wallet'],
    codEnabled: true,
    cardEnabled: true,
    walletEnabled: true,
    upiEnabled: false,
    paymentGateway: 'stripe',
    stripePublicKey: '',
    stripeSecretKey: '',
    paymentFees: { cod: 0, card: 2.5, wallet: 1.5, upi: 0.5 },
  },
  shipping: {
    shippingZones: [],
    freeShippingThreshold: 100,
    defaultShippingRate: 5,
    shippingMethods: ['standard', 'express'],
  },
  orders: {
    cancellationTimeLimit: 24,
    minimumOrderValue: 0,
    orderTrackingEnabled: true,
    orderConfirmationEmail: true,
    orderStatuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  },
  customers: {
    guestCheckoutEnabled: true,
    registrationRequired: false,
    emailVerificationRequired: false,
    customerAccountFeatures: { orderHistory: true, wishlist: true, addresses: true },
  },
  products: {
    itemsPerPage: 12,
    gridColumns: 4,
    defaultSort: 'popularity',
    lowStockThreshold: 10,
    outOfStockBehavior: 'show',
    stockAlertsEnabled: true,
  },
  tax: {
    defaultTaxRate: 18,
    taxCalculationMethod: 'exclusive',
    priceDisplayFormat: 'INR',
  },
  content: { privacyPolicy: '', termsConditions: '', refundPolicy: '' },
  features: {
    wishlistEnabled: true,
    reviewsEnabled: true,
    flashSaleEnabled: true,
    dailyDealsEnabled: true,
    liveChatEnabled: true,
    couponCodesEnabled: true,
  },
  theme: {
    primaryColor: '#10B981',
    secondaryColor: '#3B82F6',
    accentColor: '#FFE11B',
    fontFamily: 'Inter',
  },
  delivery: {
    deliveryPartnerFee: 50,
  },
};

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,

      // Initialize public settings
      initialize: async () => {
        set({ isLoading: true });
        try {
          // Use public settings for initial global load (BrandManager)
          const response = await adminSettingsApi.getPublicSettings();
          if (response.success && response.data.settings) {
            const mergedSettings = { ...get().settings };
            Object.keys(response.data.settings).forEach(key => {
              if (mergedSettings[key]) {
                mergedSettings[key] = {
                  ...mergedSettings[key],
                  ...response.data.settings[key]
                };
              } else {
                mergedSettings[key] = response.data.settings[key];
              }
            });
            set({ settings: mergedSettings });
          }
        } catch (error) {
          // Silent failure for public settings to avoid annoying toasts on login pages
          console.error('Failed to fetch public settings:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch full settings (admin only)
      fetchFullSettings: async () => {
        set({ isLoading: true });
        try {
          const response = await adminSettingsApi.getSettings();
          if (response.success && response.data.settings) {
            const mergedSettings = { ...defaultSettings };
            Object.keys(response.data.settings).forEach(key => {
              if (mergedSettings[key]) {
                mergedSettings[key] = {
                  ...mergedSettings[key],
                  ...response.data.settings[key]
                };
              } else {
                mergedSettings[key] = response.data.settings[key];
              }
            });
            set({ settings: mergedSettings });
          }
        } catch (error) {
          console.error('Failed to fetch full settings:', error);
          // Don't toast here as the api interceptor already does it for protected routes
        } finally {
          set({ isLoading: false });
        }
      },

      // Update settings in backend
      updateSettings: async (category, settingsData) => {
        set({ isLoading: true });
        try {
          const response = await adminSettingsApi.updateSettings(category, settingsData);
          if (response.success && response.data.settings) {
            // Merge the updated settings back into the store
            const mergedSettings = { ...defaultSettings };
            Object.keys(response.data.settings).forEach(key => {
              if (mergedSettings[key]) {
                mergedSettings[key] = {
                  ...mergedSettings[key],
                  ...response.data.settings[key]
                };
              } else {
                mergedSettings[key] = response.data.settings[key];
              }
            });

            set({ settings: mergedSettings });
            toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings updated`);
            return mergedSettings;
          }
        } catch (error) {
          toast.error('Failed to update settings');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'settings-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

