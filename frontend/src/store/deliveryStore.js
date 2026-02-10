import { create } from 'zustand';
import api from '../utils/api';

export const useDeliveryStore = create((set, get) => ({
    stats: null,
    assignedOrders: [],
    availableOrders: [],
    currentOrder: null,
    transactions: [],
    walletBalance: 0,
    loading: false,
    error: null,

    fetchStats: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/delivery/dashboard/stats');
            set({ stats: response.data, loading: false });
        } catch (error) {
            set({ error: error.message || 'Failed to fetch stats', loading: false });
            console.error('Fetch Stats Error:', error);
        }
    },

    fetchAssignedOrders: async (status = '') => {
        set({ loading: true, error: null });
        try {
            const queryString = status ? `?status=${status}` : '';
            const response = await api.get(`/delivery/orders/assigned${queryString}`);
            set({ assignedOrders: response.data, loading: false });
        } catch (error) {
            set({ error: error.message || 'Failed to fetch assigned orders', loading: false });
            console.error('Fetch Assigned Orders Error:', error);
        }
    },

    fetchAvailableOrders: async (lat, lng) => {
        set({ loading: true, error: null });
        try {
            const queryString = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
            const response = await api.get(`/delivery/orders/available${queryString}`);
            set({ availableOrders: response.data, loading: false });
        } catch (error) {
            set({ error: error.message || 'Failed to fetch available orders', loading: false });
            console.error('Fetch Available Orders Error:', error);
        }
    },

    fetchOrderDetails: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/delivery/orders/${id}`);
            set({ currentOrder: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message || 'Failed to fetch order details', loading: false });
            throw error;
        }
    },

    updateOrderStatus: async (id, status) => {
        set({ loading: true });
        try {
            const response = await api.patch(`/delivery/orders/${id}/status`, { status });

            // Update assigned orders list
            const currentAssigned = get().assignedOrders;
            const updatedAssigned = currentAssigned.map(o =>
                o._id === id ? { ...o, status: status } : o
            );

            // Update current order if viewing it
            const currentOrder = get().currentOrder;
            const updatedCurrentOrder = currentOrder && currentOrder._id === id
                ? { ...currentOrder, status: status, ...response.data }
                : currentOrder;

            set({ assignedOrders: updatedAssigned, currentOrder: updatedCurrentOrder, loading: false });
            return response.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    claimOrder: async (id) => {
        set({ loading: true });
        try {
            const response = await api.post(`/delivery/orders/${id}/claim`);

            // Remove from available
            const updatedAvailable = get().availableOrders.filter(o => o._id !== id);

            // Add to assigned
            const updatedAssigned = [response.data, ...get().assignedOrders];

            set({
                availableOrders: updatedAvailable,
                assignedOrders: updatedAssigned,
                loading: false
            });
            return response.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    updateLocation: async (lat, lng) => {
        try {
            await api.post('/delivery/location', { lat, lng });
        } catch (error) {
            console.error('Update Location Error:', error);
        }
    },

    fetchWalletData: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/delivery/wallet/transactions');
            if (response.success) {
                set({
                    transactions: response.data.transactions,
                    walletBalance: response.data.balance,
                    loading: false
                });
            }
        } catch (error) {
            set({ error: error.message || 'Failed to fetch wallet data', loading: false });
            console.error('Fetch Wallet Data Error:', error);
        }
    },

    requestWithdrawal: async (amount) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/delivery/wallet/withdraw', { amount });
            if (response.success) {
                // Refresh wallet data after withdrawal
                await get().fetchWalletData();
                return response;
            }
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    }
}));
