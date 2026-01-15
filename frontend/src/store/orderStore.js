import { create } from 'zustand';
import { orderApi } from '../services/orderApi';
import toast from 'react-hot-toast';

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  // Create a new order
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.createOrder(orderData);
      const order = response.data.data || response.data;

      set((state) => ({
        orders: [order, ...state.orders],
        currentOrder: order,
        isLoading: false,
      }));

      toast.success('Order created successfully!');
      return order;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message || 'Failed to create order');
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.verifyPayment(paymentData);
      const result = response.data.data || response.data;

      // Refresh orders after payment verification
      await get().fetchOrders();

      toast.success('Payment verified successfully!');
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message || 'Payment verification failed');
      throw error;
    }
  },

  // Fetch all orders
  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrders(params);
      const ordersData = response.data.data || response.data;

      set({
        orders: ordersData.orders || ordersData,
        isLoading: false,
      });

      return ordersData;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get a single order by ID
  fetchOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrder(orderId);
      const order = response.data.data || response.data;

      set((state) => ({
        currentOrder: order,
        orders: state.orders.some(o => (o._id || o.id) === (order._id || order.id))
          ? state.orders.map(o => (o._id || o.id) === (order._id || order.id) ? order : o)
          : [order, ...state.orders],
        isLoading: false,
      }));

      return order;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get order from local state
  getOrder: (orderId) => {
    const state = get();
    return state.orders.find((order) =>
      order._id === orderId || order.id === orderId
    );
  },

  // Get all orders from state, optionally filtered by user ID
  getAllOrders: (userId) => {
    const state = get();
    if (!userId) return state.orders;
    return state.orders.filter((order) => {
      const orderUserId = order.userId || order.customerId;
      const customerId = order.customer?._id || order.customer?.id;
      return (
        String(orderUserId) === String(userId) ||
        String(customerId) === String(userId) ||
        !orderUserId // If no ID is present on order, include it anyway (legacy/fallback)
      );
    });
  },

  // Cancel an order
  cancelOrder: async (orderId, reason = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.cancelOrder(orderId, reason);
      const result = response.data.data || response.data;

      // Update order in local state
      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === orderId || order.id === orderId
            ? { ...order, status: 'cancelled', cancellationReason: reason }
            : order
        ),
        isLoading: false,
      }));

      toast.success('Order cancelled successfully');
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message || 'Failed to cancel order');
      throw error;
    }
  },

  // Update order status locally (for real-time updates)
  updateOrderStatus: (orderId, newStatus) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order._id === orderId || order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ),
    }));
  },

  // Clear current order
  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },

  // Get orders by status
  getOrdersByStatus: (status) => {
    const state = get();
    return state.orders.filter((order) => order.status === status);
  },

  // Get vendor orders
  getVendorOrders: (vendorId) => {
    const state = get();
    if (!vendorId) return [];

    return state.orders.filter((order) => {
      // Check order level vendorId
      if (order.vendorId && String(order.vendorId) === String(vendorId)) return true;

      // Check items level vendorId
      if (order.items && Array.isArray(order.items)) {
        return order.items.some(item =>
          item.vendorId && String(item.vendorId) === String(vendorId)
        );
      }

      return false;
    });
  },

  // Get order count
  getOrderCount: () => {
    const state = get();
    return state.orders.length;
  },

  // Check return eligibility
  checkReturnEligibility: async (orderId) => {
    try {
      const response = await orderApi.getReturnEligibility(orderId);
      return response.data;
    } catch (error) {
      console.error('Eligibility check failed:', error);
      return { eligible: false, reason: error.response?.data?.message || 'Check failed' };
    }
  },

  // Create return request
  createReturnRequest: async (returnData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.createReturnRequest(returnData);
      const result = response.data;

      toast.success('Return request submitted successfully!');
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(error.message || 'Failed to submit return request');
      throw error;
    }
  },
}));

