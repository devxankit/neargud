import api from '../../../utils/api';

export const getVendorTickets = async (params = {}) => {
    const response = await api.get('/vendor/support-tickets', { params });
    return response;
};

export const getVendorTicket = async (id) => {
    const response = await api.get(`/vendor/support-tickets/${id}`);
    return response;
};

export const createVendorTicket = async (ticketData) => {
    const response = await api.post('/vendor/support-tickets', ticketData);
    return response;
};

export const replyToTicket = async (id, messageData) => {
    const response = await api.post(`/vendor/support-tickets/${id}/reply`, messageData);
    return response;
};

export const updateTicketStatus = async (id, statusData) => {
    const response = await api.patch(`/vendor/support-tickets/${id}/status`, statusData);
    return response;
};

export const getTicketTypes = async () => {
    const response = await api.get('/vendor/support-tickets/types');
    return response;
};
