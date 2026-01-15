import { create } from 'zustand';
import * as adminCustomerApi from '../services/adminCustomerApi';
import toast from 'react-hot-toast';

export const useCustomerStore = create((set, get) => ({
  customers: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  isLoading: false,
  error: null,

  // Fetch all customers with filters
  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminCustomerApi.getAllCustomers({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        status: params.status || 'all',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      });

      if (response.success) {
        const { customers, total, page, limit, totalPages } = response.data;
        set({
          customers: customers || [],
          pagination: {
            total: total || 0,
            page: page || 1,
            limit: limit || 10,
            pages: totalPages || 0
          },
          isLoading: false
        });
      } else {
        throw new Error(response.message || 'Failed to fetch customers');
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch customers'
      });
      toast.error(error.message || 'Failed to fetch customers');
    }
  },

  // Get customer by ID
  fetchCustomerById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await adminCustomerApi.getCustomerById(id);
      set({ isLoading: false });
      if (response.success) {
        return response.data.customer;
      }
      throw new Error(response.message || 'Failed to fetch customer');
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to fetch customer');
      return null;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    set({ isLoading: true });
    try {
      const response = await adminCustomerApi.updateCustomer(id, customerData);
      set({ isLoading: false });
      if (response.success) {
        toast.success('Customer updated successfully');
        // Refresh local list if necessary or update specific item
        get().fetchCustomers({
          page: get().pagination.page,
          limit: get().pagination.limit
        });
        return response.data.customer;
      }
      throw new Error(response.message || 'Failed to update customer');
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to update customer');
      throw error;
    }
  },

  // Toggle customer status
  toggleCustomerStatus: async (id) => {
    set({ isLoading: true });
    try {
      const response = await adminCustomerApi.updateCustomerStatus(id);
      set({ isLoading: false });
      if (response.success) {
        toast.success(response.message || 'Status updated');
        get().fetchCustomers({
          page: get().pagination.page,
          limit: get().pagination.limit
        });
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.message || 'Failed to update status');
    }
  },

  // Activities, addresses, orders etc can be fetched on demand
  fetchCustomerDetails: async (id) => {
    try {
      const [addresses, orders, transactions] = await Promise.all([
        adminCustomerApi.getCustomerAddresses(id),
        adminCustomerApi.getCustomerOrders(id),
        adminCustomerApi.getCustomerTransactions(id)
      ]);

      return {
        addresses: addresses.data?.addresses || [],
        orders: orders.data?.orders || [],
        transactions: transactions.data?.transactions || []
      };
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      return { addresses: [], orders: [], transactions: [] };
    }
  }
}));


