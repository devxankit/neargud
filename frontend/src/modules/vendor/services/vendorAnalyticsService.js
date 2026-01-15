import api from '../../../utils/api';

export const vendorAnalyticsService = {
    getSummary: async (period = 'month') => {
        const response = await api.get(`/vendor/analytics/summary?period=${period}`);
        return response;
    },

    getChartData: async (period = 'month') => {
        const response = await api.get(`/vendor/analytics/charts?period=${period}`);
        return response;
    },

    getDashboardData: async (period = 'month') => {
        const response = await api.get(`/vendor/analytics/dashboard?period=${period}`);
        return response;
    }
};
