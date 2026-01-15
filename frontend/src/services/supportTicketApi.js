import api from '../utils/api';

export const supportTicketApi = {
    // Create support ticket
    createTicket: (ticketData) => api.post('/user/support-tickets', ticketData),

    // Get all tickets
    getTickets: (params) => api.get('/user/support-tickets', { params }),

    // Get ticket by ID
    getTicket: (ticketId) => api.get(`/user/support-tickets/${ticketId}`),

    // Reply to ticket
    replyToTicket: (ticketId, message) => api.post(`/user/support-tickets/${ticketId}/reply`, { message }),
};
