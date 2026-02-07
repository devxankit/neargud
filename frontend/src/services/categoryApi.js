import api from '../utils/api';

/**
 * Category API Service
 * Handles all category-related API calls
 */

/**
 * Get all categories with filters
 * @param {Object} params - { search, isActive, page, limit, sortBy, sortOrder }
 * @returns {Promise<Object>} { categories, total, page, totalPages }
 */
export const fetchCategories = async (params = {}) => {
  const response = await api.get('/public/categories', { params });
  return response.data;
};

/**
 * Get all categories for Admin (Unfiltered)
 * @param {Object} params - { search, isActive, page, limit, sortBy, sortOrder }
 * @returns {Promise<Object>} { categories, total, page, totalPages }
 */
export const fetchAdminCategories = async (params = {}) => {
  const response = await api.get('/admin/categories', { params });
  return response.data;
};

/**
 * Get category by ID
 * @param {String} id - Category ID
 * @returns {Promise<Object>} Category object
 */
export const fetchCategoryById = async (id) => {
  const response = await api.get(`/public/categories/${id}`);
  return response.data.category;
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category
 */
export const createCategoryApi = async (categoryData) => {
  const response = await api.post('/admin/categories', categoryData);
  return response.data.category;
};

/**
 * Update category
 * @param {String} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategoryApi = async (id, categoryData) => {
  const response = await api.put(`/admin/categories/${id}`, categoryData);
  return response.data.category;
};

/**
 * Delete category
 * @param {String} id - Category ID
 * @returns {Promise<Boolean>} Success status
 */
export const deleteCategoryApi = async (id) => {
  await api.delete(`/admin/categories/${id}`);
  return true;
};

/**
 * Bulk delete categories
 * @param {Array<String>} ids - Array of category IDs
 * @returns {Promise<Object>} { deletedCount, failedIds }
 */
export const bulkDeleteCategoriesApi = async (ids) => {
  const response = await api.delete('/admin/categories/bulk', { data: { ids } });
  return response.data;
};

/**
 * Bulk update category order
 * @param {Array<Object>} orders - Array of { id, order }
 * @returns {Promise<Object>} { updatedCount, categories }
 */
export const bulkUpdateCategoryOrderApi = async (orders) => {
  const response = await api.put('/admin/categories/bulk-order', { orders });
  return response.data;
};
