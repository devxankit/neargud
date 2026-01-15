import api from '../utils/api';

/**
 * Fetch performance metrics for a vendor
 * @param {String} period - Time period (week, month, year, all)
 */
export const fetchPerformanceMetrics = async (period = 'all') => {
    try {
        const response = await api.get('/vendor/performance/metrics', {
            params: { period }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        throw error;
    }
};
