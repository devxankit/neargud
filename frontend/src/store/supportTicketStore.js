import { create } from 'zustand';
import { supportTicketApi } from '../services/supportTicketApi';
import toast from 'react-hot-toast';

export const useSupportTicketStore = create((set, get) => ({
    tickets: [],
    currentTicket: null,
    isLoading: false,
    error: null,

    // Create ticket
    createTicket: async (ticketData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await supportTicketApi.createTicket(ticketData);
            const ticket = response.data.data || response.data;

            set((state) => ({
                tickets: [ticket, ...state.tickets],
                isLoading: false,
            }));

            toast.success('Support ticket created successfully!');
            return ticket;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Failed to create ticket');
            throw error;
        }
    },

    // Fetch tickets
    fetchTickets: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await supportTicketApi.getTickets(params);
            const ticketsData = response.data.data || response.data;

            set({
                tickets: ticketsData.tickets || ticketsData,
                isLoading: false,
            });

            return ticketsData;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch single ticket
    fetchTicket: async (ticketId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await supportTicketApi.getTicket(ticketId);
            const ticket = response.data.data || response.data;

            set({
                currentTicket: ticket,
                isLoading: false,
            });

            return ticket;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Reply to ticket
    replyToTicket: async (ticketId, message) => {
        set({ isLoading: true, error: null });
        try {
            const response = await supportTicketApi.replyToTicket(ticketId, message);
            const updatedTicket = response.data.data || response.data;

            // Update current ticket if it's the same
            if (get().currentTicket?._id === ticketId || get().currentTicket?.id === ticketId) {
                set({ currentTicket: updatedTicket });
            }

            // Update in tickets list
            set((state) => ({
                tickets: state.tickets.map((ticket) =>
                    ticket._id === ticketId || ticket.id === ticketId ? updatedTicket : ticket
                ),
                isLoading: false,
            }));

            toast.success('Reply sent successfully!');
            return updatedTicket;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Failed to send reply');
            throw error;
        }
    },

    // Clear current ticket
    clearCurrentTicket: () => {
        set({ currentTicket: null });
    },
}));
