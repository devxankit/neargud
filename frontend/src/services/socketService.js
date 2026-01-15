import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/constants';

// Remove '/api' from base URL for socket connection if it ends with /api
const SOCKET_URL = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL;

class SocketService {
    socket = null;

    connect(token) {
        if (this.socket) {
            return this.socket;
        }

        console.log('Initializing socket connection to:', SOCKET_URL);

        this.socket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('Socket disconnected manually');
        }
    }

    getSocket() {
        return this.socket;
    }

    // Helper to join a chat room
    joinChat(conversationId) {
        if (this.socket) {
            this.socket.emit('join_chat_room', { conversationId });
        }
    }

    // Helper to leave a chat room
    leaveChat(conversationId) {
        if (this.socket) {
            this.socket.emit('leave_chat_room', { conversationId });
        }
    }

    // Helper for typing indicators
    emitTyping(conversationId) {
        if (this.socket) {
            this.socket.emit('typing_start', { conversationId });
        }
    }

    emitStopTyping(conversationId) {
        if (this.socket) {
            this.socket.emit('typing_stop', { conversationId });
        }
    }
}

export default new SocketService();
