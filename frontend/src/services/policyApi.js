import api from '../utils/api';

const ADMIN_BASE_URL = '/admin/policies';
const PUBLIC_BASE_URL = '/public/policies';

// Get all policies (public)
export const fetchAllPolicies = async () => {
    try {
        const response = await api.get(PUBLIC_BASE_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get policy by key (public)
export const fetchPolicyByKey = async (key) => {
    try {
        const response = await api.get(`${PUBLIC_BASE_URL}/${key}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get policy by key (public)
export const fetchPolicy = async (key) => {
    try {
        const response = await api.get(`${ADMIN_BASE_URL}/${key}`);
        return response; // api instance already returns response.data
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update policy (admin)
export const updatePolicy = async (key, content) => {
    try {
        const response = await api.put(`${ADMIN_BASE_URL}/${key}`, { content });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
