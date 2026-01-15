import { create } from 'zustand';
import { vendorOrderService } from '../services/vendorOrderService';
import toast from 'react-hot-toast';

export const useVendorOrderStore = create((set, get) => ({
    orders: [],
    total: 0,
    page: 1,
    totalPages: 1,
    currentOrder: null,
    stats: null,
    earningsStats: null,
    isLoading: false,
    error: null,

    fetchOrders: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await vendorOrderService.getOrders(params);
            set({
                orders: data.orders || [],
                total: data.total || 0,
                page: data.page || 1,
                totalPages: data.totalPages || 1,
                isLoading: false
            });
            return data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            // Toast is already handled by api utility
            throw error;
        }
    },

    fetchOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const order = await vendorOrderService.getOrder(orderId);
            set({ currentOrder: order, isLoading: false });
            return order;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateStatus: async (orderId, status, note = '') => {
        set({ isLoading: true });
        try {
            const updatedOrder = await vendorOrderService.updateOrderStatus(orderId, status, note);

            // Update in local list if it exists
            set((state) => ({
                orders: state.orders.map(o =>
                    (o._id === orderId || o.id === orderId || o.orderCode === orderId)
                        ? { ...o, ...updatedOrder }
                        : o
                ),
                currentOrder: state.currentOrder && (state.currentOrder._id === orderId || state.currentOrder.id === orderId || state.currentOrder.orderCode === orderId)
                    ? { ...state.currentOrder, ...updatedOrder }
                    : state.currentOrder,
                isLoading: false
            }));

            toast.success('Order status updated successfully');
            return updatedOrder;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    fetchStats: async () => {
        try {
            const stats = await vendorOrderService.getStats();
            set({ stats });
            return stats;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    },

    fetchEarningsStats: async () => {
        try {
            const earningsStats = await vendorOrderService.getEarningsStats();
            set({ earningsStats });
            return earningsStats;
        } catch (error) {
            console.error('Error fetching earnings stats:', error);
        }
    },

    clearCurrentOrder: () => {
        set({ currentOrder: null });
    }
}));
