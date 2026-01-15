import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('admin-token');
    return { Authorization: `Bearer ${token}` };
};

export const fetchDashboardStats = async (period = 'month') => {
    try {
        const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
            headers: getAuthHeader(),
            params: { period },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};
