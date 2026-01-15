import api from '../utils/api';

export const getAllCustomers = (params) => api.get('/admin/customers', { params });

export const getCustomerById = (id) => api.get(`/admin/customers/${id}`);

export const updateCustomer = (id, data) => api.patch(`/admin/customers/${id}`, data);

export const updateCustomerStatus = (id) => api.patch(`/admin/customers/${id}/status`);

export const getCustomerAddresses = (id) => api.get(`/admin/customers/${id}/addresses`);

export const getAllCustomerAddresses = (params) => api.get('/admin/customers/addresses', { params });

export const deleteCustomerAddress = (customerId, addressId) => api.delete(`/admin/customers/${customerId}/addresses/${addressId}`);

export const getCustomerOrders = (id) => api.get(`/admin/customers/${id}/orders`);

export const getCustomerTransactions = (id) => api.get(`/admin/customers/${id}/transactions`);

export const getAllCustomerTransactions = (params) => api.get('/admin/customers/transactions', { params });
