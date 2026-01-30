import api from '../utils/api';

/**
 * Public API Service for Customer App
 */

// Products
export const fetchPublicProducts = async (params = {}) => {
    const response = await api.get('/public/products', { params });
    return response;
};

export const fetchPublicProductById = async (id) => {
    const response = await api.get(`/public/products/${id}`);
    return response;
};

export const fetchRecommendedProducts = async () => {
    const response = await api.get('/public/products/recommended');
    return response;
};

// Categories
export const fetchPublicCategories = async () => {
    const response = await api.get('/public/categories');
    return response;
};

// Vendors
export const fetchPublicVendors = async () => {
    const response = await api.get('/public/vendors');
    return response;
};

export const fetchPublicVendorById = async (id) => {
    const response = await api.get(`/public/vendors/${id}`);
    return response;
};

// Hero Banners
export const fetchActiveBanners = async (params = {}) => {
    const response = await api.get('/public/hero-banners/active', { params });
    return response;
};

// Get cities that have active sliders
export const fetchSliderCities = async () => {
    const response = await api.get('/public/hero-banners/cities');
    return response;
};

// Brands
export const fetchPublicBrands = async () => {
    const response = await api.get('/public/brands');
    return response.data;
};

// Reels
export const fetchPublicReels = async () => {
    const response = await api.get('/user/reels?limit=10'); // /user/reels is public
    return response.data;
};
