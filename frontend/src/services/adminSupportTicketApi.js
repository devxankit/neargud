import api from '../utils/api';

export const getAllTickets = async (params = {}) => {
    const response = await api.get('/admin/support-tickets', { params });
    return response;
};

export const getTicket = async (id) => {
    const response = await api.get(`/admin/support-tickets/${id}`);
    return response;
};

export const respondToTicket = async (id, responseData) => {
    const response = await api.post(`/admin/support-tickets/${id}/respond`, responseData);
    return response;
};

export const updateTicketStatus = async (id, statusData) => {
    const response = await api.patch(`/admin/support-tickets/${id}/status`, statusData);
    return response;
};

export const getTicketStats = async (params = {}) => {
    const response = await api.get('/admin/support-tickets/stats', { params });
    return response;
};

// Ticket Type Management
export const getAllTicketTypes = async () => {
    const response = await api.get('/admin/support-tickets/types');
    return response;
};

export const createTicketType = async (typeData) => {
    const response = await api.post('/admin/support-tickets/types', typeData);
    return response;
};

export const updateTicketType = async (id, typeData) => {
    const response = await api.put(`/admin/support-tickets/types/${id}`, typeData);
    return response;
};

export const deleteTicketType = async (id) => {
    const response = await api.delete(`/admin/support-tickets/types/${id}`);
    return response;
};
