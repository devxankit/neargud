import api from '../utils/api';

// Use public routes for fetching content
const BASE_URL = '/admin/content';

// Get content by key
export const fetchContent = async (key) => {
    try {
        const response = await api.get(`${BASE_URL}/${key}`);
        // The interceptor returns response.data, so we just return response
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update content (admin only)
export const updateContentApi = async (key, data) => {
    try {
        const response = await api.put(`${BASE_URL}/${key}`, { data });
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
