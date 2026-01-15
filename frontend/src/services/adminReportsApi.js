import api from '../utils/api';

/**
 * Get sales report with optional date filters
 * @param {Object} params - { startDate, endDate }
 * @returns {Promise} - Sales report data
 */
export const getSalesReport = async (params = {}) => {
    const response = await api.get('/admin/reports/sales', { params });
    return response;
};

/**
 * Get inventory report
 * @returns {Promise} - Inventory report data
 */
export const getInventoryReport = async () => {
    const response = await api.get('/admin/reports/inventory');
    return response;
};

/**
 * Get dashboard summary
 * @param {String} period - 'week', 'month', 'year'
 * @returns {Promise} - Dashboard summary data
 */
export const getDashboardSummary = async (period = 'month') => {
    const response = await api.get('/admin/reports/dashboard-summary', { params: { period } });
    return response;
};
