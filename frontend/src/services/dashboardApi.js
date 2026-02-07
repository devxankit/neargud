import api from '../utils/api';

export const fetchDashboardStats = async (period = 'month') => {
    try {
        const response = await api.get('/admin/dashboard/stats', {
            params: { period },
        });
        return response;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};
