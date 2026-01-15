import api from '../utils/api';

export const adminSettingsApi = {
    // Get all settings
    getSettings: async () => {
        const response = await api.get('/admin/settings');
        return response; // api instance already returns response.data
    },

    // Get public settings (no auth required)
    getPublicSettings: async () => {
        const response = await api.get('/public/settings');
        return response;
    },

    // Update settings by category
    updateSettings: async (category, data) => {
        const response = await api.put(`/admin/settings/${category}`, data);
        return response; // api instance already returns response.data
    },
};
