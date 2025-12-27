import { products } from "../../../data/products";

// Mock API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getVendorProducts = async (filters = {}) => {
    await delay(500);
    // Return mock products
    // In a real app we'd filter by vendorId from auth context
    // Here we just return all mock products or filter by vendorId 1
    const vendorProducts = products;
    return {
        success: true,
        data: { products: vendorProducts },
        products: vendorProducts // Fallback for different response structures
    };
};
