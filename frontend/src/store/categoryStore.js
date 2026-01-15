import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  fetchCategories,
  fetchCategoryById,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  bulkDeleteCategoriesApi,
  bulkUpdateCategoryOrderApi,
} from '../services/categoryApi';

// Helper function to transform MongoDB _id to id
const transformCategory = (category) => {
  if (!category) return null;
  return {
    ...category,
    id: category._id || category.id,
    parentId: category.parentId || null,
  };
};

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  total: 0,
  page: 1,
  totalPages: 0,

  // Fetch all categories from API
  fetchCategories: async (params = {}) => {
    set({ isLoading: true });
    try {
      const result = await fetchCategories(params);
      const transformedCategories = result.categories.map(transformCategory);
      set({
        categories: transformedCategories,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        isLoading: false,
      });
      return transformedCategories;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch categories');
      throw error;
    }
  },

  // Get all categories (for compatibility with existing code)
  getCategories: () => {
    return get().categories;
  },

  // Get category by ID
  getCategoryById: (id) => {
    // First check in local state
    const category = get().categories.find(
      (cat) => cat.id === id || cat._id === id || cat.id === parseInt(id)
    );
    return category || null;
  },

  // Fetch category by ID from API
  fetchCategoryById: async (id) => {
    set({ isLoading: true });
    try {
      const category = await fetchCategoryById(id);
      const transformed = transformCategory(category);
      set({ isLoading: false });
      return transformed;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Create category
  createCategory: async (categoryData) => {
    set({ isLoading: true });
    try {
      const newCategory = await createCategoryApi(categoryData);
      const transformed = transformCategory(newCategory);
      
      // Add to local state
      set((state) => ({
        categories: [...state.categories, transformed],
        isLoading: false,
      }));
      
      toast.success('Category created successfully');
      return transformed;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to create category');
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    set({ isLoading: true });
    try {
      const updatedCategory = await updateCategoryApi(id, categoryData);
      const transformed = transformCategory(updatedCategory);
      
      // Update in local state
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id || cat._id === id ? transformed : cat
        ),
        isLoading: false,
      }));
      
      toast.success('Category updated successfully');
      return transformed;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to update category');
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    set({ isLoading: true });
    try {
      await deleteCategoryApi(id);
      
      // Remove from local state
      set((state) => ({
        categories: state.categories.filter(
          (cat) => cat.id !== id && cat._id !== id
        ),
        isLoading: false,
      }));
      
      toast.success('Category deleted successfully');
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete category');
      throw error;
    }
  },

  // Bulk delete categories
  bulkDeleteCategories: async (ids) => {
    set({ isLoading: true });
    try {
      const result = await bulkDeleteCategoriesApi(ids);
      
      // Remove from local state
      set((state) => ({
        categories: state.categories.filter(
          (cat) => !ids.includes(cat.id) && !ids.includes(cat._id)
        ),
        isLoading: false,
      }));
      
      if (result.failedIds && result.failedIds.length > 0) {
        toast.success(
          `${result.deletedCount} categories deleted. ${result.failedIds.length} categories could not be deleted (have subcategories).`
        );
      } else {
        toast.success(`${result.deletedCount} categories deleted successfully`);
      }
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete categories');
      throw error;
    }
  },

  // Toggle category status
  toggleCategoryStatus: async (id) => {
    const category = get().getCategoryById(id);
    if (category) {
      await get().updateCategory(id, { isActive: !category.isActive });
    }
  },

  // Get categories by parent
  getCategoriesByParent: (parentId) => {
    return get().categories.filter((cat) => {
      const catParentId = cat.parentId;
      const compareParentId = parentId || null;
      return catParentId === compareParentId;
    });
  },

  // Get root categories
  getRootCategories: () => {
    return get().categories.filter((cat) => !cat.parentId);
  },

  // Reorder categories
  reorderCategories: async (categoryIds) => {
    set({ isLoading: true });
    try {
      const orders = categoryIds.map((id, index) => ({
        id,
        order: index + 1,
      }));
      
      const result = await bulkUpdateCategoryOrderApi(orders);
      const transformedCategories = result.categories.map(transformCategory);
      
      // Update local state
      set((state) => {
        const updatedCategories = state.categories.map((cat) => {
          const updated = transformedCategories.find(
            (tc) => tc.id === cat.id || tc._id === cat.id
          );
          return updated || cat;
        });
        return {
          categories: updatedCategories,
          isLoading: false,
        };
      });
      
      toast.success('Categories reordered successfully');
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to reorder categories');
      throw error;
    }
  },
}));

