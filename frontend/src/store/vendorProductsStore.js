import { create } from 'zustand';
import {
    getVendorProducts,
    getVendorProductById,
    createVendorProduct,
    updateVendorProduct,
    deleteVendorProduct,
    updateVendorProductStatus
} from '../modules/vendor/services/productService';

export const useVendorProductsStore = create((set, get) => ({
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    },

    setProducts: (products) => set({ products }),
    setCurrentProduct: (product) => set({ currentProduct: product }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    /**
     * Fetch all products for the logged-in vendor
     * @param {Object} params - { search, stock, categoryId, brandId, page, limit }
     */
    fetchVendorProducts: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await getVendorProducts(params);
            const products = response.data?.products || response.products || [];
            const pagination = response.pagination || response.data?.pagination || {
                total: products.length,
                page: params.page || 1,
                limit: params.limit || 10,
                totalPages: Math.ceil(products.length / (params.limit || 10))
            };

            // Normalize products to ensure consistent ID field
            const normalizedProducts = products.map(p => ({
                ...p,
                id: p._id || p.id
            }));

            set({
                products: normalizedProducts,
                pagination: {
                    total: pagination.total,
                    page: pagination.page,
                    limit: pagination.limit,
                    totalPages: pagination.pages || pagination.totalPages
                }
            });
            return normalizedProducts;
        } catch (error) {
            set({ error: error.message || 'Failed to fetch products' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Fetch a single product by ID
     * @param {String} id - Product ID
     */
    fetchProductById: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await getVendorProductById(id);
            const product = response.data?.product || response.product || response;

            // Normalize product ID
            const normalizedProduct = {
                ...product,
                id: product._id || product.id
            };

            set({ currentProduct: normalizedProduct });
            return normalizedProduct;
        } catch (error) {
            set({ error: error.message || 'Failed to fetch product' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Create a new product
     * @param {Object} productData - Product data
     */
    addProduct: async (productData) => {
        set({ loading: true, error: null });
        try {
            const response = await createVendorProduct(productData);
            const newProduct = response.data?.product || response.product || response;

            // Normalize product ID
            const normalizedProduct = {
                ...newProduct,
                id: newProduct._id || newProduct.id
            };

            set((state) => ({
                products: [normalizedProduct, ...state.products]
            }));
            return normalizedProduct;
        } catch (error) {
            set({ error: error.message || 'Failed to create product' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Update an existing product
     * @param {String} id - Product ID
     * @param {Object} productData - Updated product data
     */
    editProduct: async (id, productData) => {
        set({ loading: true, error: null });
        try {
            const response = await updateVendorProduct(id, productData);
            const updatedProduct = response.data?.product || response.product || response;

            // Normalize product ID
            const normalizedProduct = {
                ...updatedProduct,
                id: updatedProduct._id || updatedProduct.id
            };

            set((state) => ({
                products: state.products.map((p) =>
                    (p._id === id || p.id === id) ? normalizedProduct : p
                ),
                currentProduct: state.currentProduct?.id === id ? normalizedProduct : state.currentProduct
            }));
            return normalizedProduct;
        } catch (error) {
            set({ error: error.message || 'Failed to update product' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Delete a product
     * @param {String} id - Product ID
     */
    removeProduct: async (id) => {
        set({ loading: true, error: null });
        try {
            await deleteVendorProduct(id);
            set((state) => ({
                products: state.products.filter((p) => p._id !== id && p.id !== id),
                currentProduct: (state.currentProduct?.id === id || state.currentProduct?._id === id)
                    ? null
                    : state.currentProduct
            }));
        } catch (error) {
            set({ error: error.message || 'Failed to delete product' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Update product status (visibility)
     * @param {String} id - Product ID
     * @param {Object} statusData - { isVisible: boolean }
     */
    updateProductStatus: async (id, statusData) => {
        set({ loading: true, error: null });
        try {
            const response = await updateVendorProductStatus(id, statusData);
            const updatedProduct = response.data?.product || response.product || response;

            // Normalize product ID
            const normalizedProduct = {
                ...updatedProduct,
                id: updatedProduct._id || updatedProduct.id
            };

            set((state) => ({
                products: state.products.map((p) =>
                    (p._id === id || p.id === id) ? normalizedProduct : p
                ),
                currentProduct: state.currentProduct?.id === id ? normalizedProduct : state.currentProduct
            }));
            return normalizedProduct;
        } catch (error) {
            set({ error: error.message || 'Failed to update product status' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    /**
     * Reset the store state
     */
    reset: () => set({
        products: [],
        currentProduct: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1
        }
    })
}));
