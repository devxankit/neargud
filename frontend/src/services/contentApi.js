import api from '../utils/api';

const BASE_URL = '/admin/content';

// Get content by key
export const fetchContent = async (key) => {
    try {
        const response = await api.get(`${BASE_URL}/${key}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update content
export const updateContentApi = async (key, data) => {
    try {
        const response = await api.put(`${BASE_URL}/${key}`, { data });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
