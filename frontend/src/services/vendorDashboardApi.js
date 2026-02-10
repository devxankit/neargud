import api from '../utils/api';
export const fetchPerformanceMetrics = async (period = 'all') => {
    try {
        const response = await api.get('/vendor/performance/metrics', { params: { period } });
        return response;
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        throw error;
    }
};

/**
 * Fetch detailed order statistics
 */
export const fetchOrderStats = async () => {
    try {
        const response = await api.get('/vendor/orders/stats');
        return response;
    } catch (error) {
        console.error('Error fetching order stats:', error);
        throw error;
    }
};

export const fetchEarningsStats = async () => {
    try {
        const response = await api.get('/vendor/orders/earnings');
        return response;
    } catch (error) {
        console.error('Error fetching earnings stats:', error);
        throw error;
    }
};

export const fetchWalletTransactions = async () => {
    try {
        const response = await api.get('/vendor/wallet/transactions');
        return response;
    } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        throw error;
    }
};

export const fetchVendorWallet = async () => {
    try {
        const response = await api.get('/vendor/wallet');
        return response;
    } catch (error) {
        console.error('Error fetching vendor wallet:', error);
        throw error;
    }
};

export const requestVendorWithdrawal = async () => {
    try {
        const response = await api.post('/vendor/wallet/withdraw');
        return response;
    } catch (error) {
        console.error('Error requesting vendor withdrawal:', error);
        throw error;
    }
};

export const fetchVendorWithdrawals = async (params = {}) => {
    try {
        const response = await api.get('/vendor/wallet/withdrawals', { params });
        return response;
    } catch (error) {
        console.error('Error fetching vendor withdrawals:', error);
        throw error;
    }
};

export const fetchVendorOrdersList = async (params = {}) => {
    try {
        const response = await api.get('/vendor/orders', { params });
        return response;
    } catch (error) {
        console.error('Error fetching vendor orders list:', error);
        throw error;
    }
};
