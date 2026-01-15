import { create } from 'zustand';
import { addressApi } from '../services/addressApi';

export const useAddressStore = create((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  // Fetch all addresses
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await addressApi.getAddresses();
      // Handle different response structures
      const addressesData = response.data?.data?.addresses ||
        response.data?.addresses ||
        response.data ||
        [];
      set({
        addresses: Array.isArray(addressesData) ? addressesData : [],
        isLoading: false
      });
    } catch (error) {
      set({
        addresses: [], // Ensure it's always an array
        error: error.response?.data?.message || error.message,
        isLoading: false
      });
    }
  },

  // Add a new address
  addAddress: async (addressData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await addressApi.createAddress(addressData);
      const newAddress = response.data?.data?.address ||
        response.data?.address ||
        response.data ||
        response;
      set((state) => ({
        addresses: [...state.addresses, newAddress],
        isLoading: false
      }));
      return newAddress;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Update an existing address
  updateAddress: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await addressApi.updateAddress(id, updatedData);
      const updatedAddress = response.data || response;
      set((state) => ({
        addresses: state.addresses.map((addr) =>
          (addr._id === id || addr.id === id) ? updatedAddress : addr
        ),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Delete an address
  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await addressApi.deleteAddress(id);
      set((state) => ({
        addresses: state.addresses.filter((addr) => addr._id !== id && addr.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Set default address
  setDefaultAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await addressApi.setDefaultAddress(id);
      set((state) => ({
        addresses: state.addresses.map((addr) => ({
          ...addr,
          isDefault: (addr._id === id || addr.id === id),
        })),
        isLoading: false
      }));
      return response.data || response;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  // Get default address
  getDefaultAddress: () => {
    const state = get();
    return state.addresses.find((addr) => addr.isDefault) || state.addresses[0] || null;
  },
}));


