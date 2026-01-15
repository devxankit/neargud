import api from '../utils/api';

/**
 * Get all pending withdrawal requests
 */
export const fetchPendingWithdrawals = async () => {
    try {
        const response = await api.get('/admin/vendor-wallet/pending-withdrawals');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        throw error;
    }
};

/**
 * Approve a withdrawal request
 */
export const approveWithdrawal = async (requestId, data) => {
    try {
        const response = await api.post(`/admin/vendor-wallet/withdrawals/${requestId}/approve`, data);
        return response.data;
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        throw error;
    }
};

/**
 * Reject a withdrawal request
 */
export const rejectWithdrawal = async (requestId, data) => {
    try {
        const response = await api.post(`/admin/vendor-wallet/withdrawals/${requestId}/reject`, data);
        return response.data;
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        throw error;
    }
};

/**
 * Get withdrawal reports
 */
export const fetchWithdrawalReports = async (params = {}) => {
    try {
        const response = await api.get('/admin/vendor-wallet/reports', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching withdrawal reports:', error);
        throw error;
    }
};

/**
 * Get all vendor wallets
 */
export const fetchAllVendorWallets = async () => {
    try {
        const response = await api.get('/admin/vendor-wallet/wallets');
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor wallets:', error);
        throw error;
    }
};

/**
 * Get specific vendor wallet
 */
export const fetchVendorWallet = async (vendorId) => {
    try {
        const response = await api.get(`/admin/vendor-wallet/wallets/${vendorId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor wallet:', error);
        throw error;
    }
};
