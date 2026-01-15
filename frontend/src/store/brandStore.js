import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  fetchBrands,
  fetchBrandById,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
  bulkDeleteBrandsApi,
  toggleBrandStatusApi,
} from '../services/brandApi';

// Helper function to transform MongoDB _id to id
const transformBrand = (brand) => {
  if (!brand) return null;
  return {
    ...brand,
    id: brand._id || brand.id,
  };
};

export const useBrandStore = create((set, get) => ({
  brands: [],
  isLoading: false,
  total: 0,
  page: 1,
  totalPages: 0,

  // Fetch all brands from API
  fetchBrands: async (params = {}) => {
    set({ isLoading: true });
    try {
      const result = await fetchBrands(params);
      // Handle both cases: if API returns array directly or { brands, total ... }
      const brandsData = Array.isArray(result) ? result : (result.brands || []);
      const transformedBrands = brandsData.map(transformBrand);

      set({
        brands: transformedBrands,
        total: result.total || brandsData.length,
        page: result.page || 1,
        totalPages: result.totalPages || 1,
        isLoading: false,
      });
      return transformedBrands;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch brands');
      throw error;
    }
  },

  // Get all brands (alias for compatibility)
  getBrands: () => {
    return get().brands;
  },

  // Get brand by ID
  getBrandById: (id) => {
    const brand = get().brands.find(
      (b) => b.id === id || b._id === id || b.id === parseInt(id)
    );
    return brand || null;
  },

  // Fetch brand by ID from API
  fetchBrandById: async (id) => {
    set({ isLoading: true });
    try {
      const brand = await fetchBrandById(id);
      const transformed = transformBrand(brand);
      set({ isLoading: false });
      return transformed;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Create brand
  createBrand: async (brandData) => {
    set({ isLoading: true });
    try {
      const newBrand = await createBrandApi(brandData);
      const transformed = transformBrand(newBrand);

      set((state) => ({
        brands: [...state.brands, transformed],
        isLoading: false,
      }));

      toast.success('Brand created successfully');
      return transformed;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to create brand');
      throw error;
    }
  },

  // Update brand
  updateBrand: async (id, brandData) => {
    set({ isLoading: true });
    try {
      const updatedBrand = await updateBrandApi(id, brandData);
      const transformed = transformBrand(updatedBrand);

      set((state) => ({
        brands: state.brands.map((b) =>
          b.id === id || b._id === id ? transformed : b
        ),
        isLoading: false,
      }));

      toast.success('Brand updated successfully');
      return transformed;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to update brand');
      throw error;
    }
  },

  // Delete brand
  deleteBrand: async (id) => {
    set({ isLoading: true });
    try {
      await deleteBrandApi(id);

      set((state) => ({
        brands: state.brands.filter(
          (b) => b.id !== id && b._id !== id
        ),
        isLoading: false,
      }));

      toast.success('Brand deleted successfully');
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete brand');
      throw error;
    }
  },

  // Bulk delete brands
  bulkDeleteBrands: async (ids) => {
    set({ isLoading: true });
    try {
      const result = await bulkDeleteBrandsApi(ids);

      set((state) => ({
        brands: state.brands.filter(
          (b) => !ids.includes(b.id) && !ids.includes(b._id)
        ),
        isLoading: false,
      }));

      if (result.failedIds && result.failedIds.length > 0) {
        toast.success(`${result.deletedCount} brands deleted. Some could not be deleted.`);
      } else {
        toast.success('Brands deleted successfully');
      }
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete brands');
      throw error;
    }
  },

  // Toggle brand status
  toggleBrandStatus: async (id) => {
    const brand = get().getBrandById(id);
    if (!brand) return;

    // Optimistic update
    const originalStatus = brand.isActive;

    set((state) => ({
      brands: state.brands.map((b) =>
        b.id === id || b._id === id ? { ...b, isActive: !b.isActive } : b
      )
    }));

    try {
      await toggleBrandStatusApi(id);
      toast.success('Brand status updated');
    } catch (error) {
      // Revert on failure
      set((state) => ({
        brands: state.brands.map((b) =>
          b.id === id || b._id === id ? { ...b, isActive: originalStatus } : b
        )
      }));
      toast.error('Failed to update status');
    }
  },

  // Initialize (alias for fetchBrands to ease migration, but preferred to use fetchBrands)
  initialize: async () => {
    return get().fetchBrands();
  }
}));

