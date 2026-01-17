import { create } from 'zustand';
import { fetchConversations, fetchMessages, sendMessage, markAllRead, createOrGetUserChat, clearChatHistory } from '../services/chatApi';
import socketService from '../utils/socket';

export const useChatStore = create((set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    error: null,
    activeChatId: null,
    typingUsers: {},
    isSocketConnected: false,

    // Add computed/derived state for filtering (optional, can be done in component)
    // Actually, just keep conversations separate? 
    // No, single list is fine, components filter.

    // Initialize socket connection
    initializeSocket: (token) => {
        try {
            const socket = socketService.connect(token);

            // Remove old listeners to prevent duplicates
            socket.off('receive_message');
            socket.off('new_chat_message');
            socket.off('user_typing');
            socket.off('user_stopped_typing');
            socket.off('message_read');

            // Listen for new messages in current chat
            socket.on('receive_message', (message) => {
                console.log('📨 Received message:', message);
                get().addMessage(message);
            });

            // Listen for new messages in other chats (for notifications)
            socket.on('new_chat_message', (message) => {
                console.log('🔔 New chat message notification:', message);
                get().addMessage(message);
            });


            // Typing indicators
            socket.on('user_typing', ({ conversationId, userId, userRole }) => {
                console.log('⌨️ User typing:', userId);
                set(state => ({
                    typingUsers: {
                        ...state.typingUsers,
                        [conversationId]: { userId, userRole, isTyping: true }
                    }
                }));
            });

            socket.on('user_stopped_typing', ({ conversationId }) => {
                console.log('⏸️ User stopped typing');
                set(state => ({
                    typingUsers: {
                        ...state.typingUsers,
                        [conversationId]: { isTyping: false }
                    }
                }));
            });

            // Message read receipts
            socket.on('message_read', ({ messageId, conversationId }) => {
                console.log('✓✓ Message read:', messageId);
                get().markMessageAsRead(messageId);
            });

            set({ isSocketConnected: true });
            console.log('✅ Socket initialized successfully');
        } catch (error) {
            console.error('❌ Socket initialization failed:', error);
            set({ error: error.message, isSocketConnected: false });
        }
    },

    // Disconnect socket
    disconnectSocket: () => {
        socketService.disconnect();
        set({ isSocketConnected: false, typingUsers: {} });
    },

    // Load conversations
    loadConversations: async (role) => {
        set({ isLoading: true, error: null });
        try {
            const data = await fetchConversations(role);
            console.log('📋 Loaded conversations:', data);
            set({ conversations: data || [], isLoading: false });
        } catch (err) {
            console.error('Failed to load conversations:', err);
            set({ error: err.message, isLoading: false });
        }
    },

    // Select and load conversation
    selectConversation: async (conversationId, role) => {
        const prevId = get().activeChatId;

        // Leave previous chat room
        if (prevId && prevId !== conversationId) {
            socketService.leaveChatRoom(prevId);
        }

        set({ activeChatId: conversationId, isLoading: true, error: null });

        try {
            const data = await fetchMessages(conversationId, role);
            const conversation = get().conversations.find(c => c._id === conversationId);

            set({
                currentConversation: conversation || null,
                messages: data.messages || [],
                isLoading: false
            });

            // Join new chat room
            socketService.joinChatRoom(conversationId);

            // Mark all messages as read
            try {
                await markAllRead(conversationId, role);
                // Update conversation unread count
                set(state => ({
                    conversations: state.conversations.map(c =>
                        c._id === conversationId ? { ...c, unreadCount: 0 } : c
                    )
                }));
            } catch (error) {
                console.error('Failed to mark messages as read:', error);
            }

        } catch (err) {
            console.error('Failed to load messages:', err);
            set({ error: err.message, isLoading: false });
        }
    },

    // Send message
    // Send message (Via Socket.IO)
    sendChatMessage: async (text, receiverId, receiverRole, role, messageType = 'text', productData = null) => {
        const { activeChatId, messages, isSocketConnected } = get();
        if (!activeChatId || (!text.trim() && !productData)) return;

        if (!isSocketConnected) {
            console.warn('Socket not connected, falling back to API or queuing not implemented');
            throw new Error('Chat connection lost. Please refresh.');
        }

        try {
            // Emitting via socket with acknowledgement
            const msg = await new Promise((resolve, reject) => {
                socketService.sendMessage({
                    conversationId: activeChatId,
                    receiverId,
                    message: text,
                    receiverRole,
                    messageType,
                    productData
                }, (response) => {
                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.error));
                    }
                });
            });

            // Add message if not already present (socket broadcast might race with this)
            // But since this is the sender, we can optimistically add it or rely on the ack.
            // The ack returns the populated message from server.
            const exists = get().messages.some(m => m._id === msg._id);
            if (!exists) {
                set(state => ({ messages: [...state.messages, msg] }));
            }

            // Update conversation preview
            get().updateConversationPreview(msg);

            return msg;
        } catch (err) {
            console.error('Failed to send message via socket:', err);
            throw err;
        }
    },

    // Add message from socket
    addMessage: (message) => {
        const { activeChatId, messages } = get();

        // If message belongs to active chat, append it
        if (activeChatId === message.conversationId) {
            // Check for duplicate
            if (!messages.some(m => m._id === message._id)) {
                set({ messages: [...messages, message] });
            }
        }

        // Update conversation preview
        get().updateConversationPreview(message);
    },

    // Update conversation preview with latest message
    updateConversationPreview: (message) => {
        set(state => ({
            conversations: state.conversations.map(c => {
                if (c._id === message.conversationId) {
                    return {
                        ...c,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        // Increment unread if not in active chat
                        unreadCount: state.activeChatId === message.conversationId
                            ? 0
                            : (c.unreadCount || 0) + 1
                    };
                }
                return c;
            }).sort((a, b) => {
                // Sort by last message time
                const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
                const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
                return timeB - timeA;
            })
        }));
    },

    // Mark message as read locally
    markMessageAsRead: (messageId) => {
        set(state => ({
            messages: state.messages.map(m =>
                m._id === messageId ? { ...m, readStatus: true } : m
            )
        }));
    },

    // Typing indicators
    startTyping: () => {
        const { activeChatId } = get();
        if (activeChatId) {
            socketService.startTyping(activeChatId);
        }
    },

    stopTyping: () => {
        const { activeChatId } = get();
        if (activeChatId) {
            socketService.stopTyping(activeChatId);
        }
    },

    // Create or get conversation with vendor
    createConversationWithVendor: async (vendorId, role = 'user') => {
        try {
            const conversation = await createOrGetUserChat(vendorId);

            // Add to conversations list if not present
            set(state => {
                const exists = state.conversations.some(c => c._id === conversation._id);
                if (!exists) {
                    return {
                        conversations: [conversation, ...state.conversations]
                    };
                }
                return state;
            });

            return conversation;
        } catch (error) {
            console.error('Failed to create conversation:', error);
            throw error;
        }
    },

    // Clear chat history for the user
    clearChatMessages: async (conversationId, role) => {
        try {
            await clearChatHistory(conversationId, role);
            if (get().activeChatId === conversationId) {
                set({ messages: [] });
            }
            // Update conversation preview locally
            set(state => ({
                conversations: state.conversations.map(c =>
                    c._id === conversationId ? { ...c, lastMessage: null } : c
                )
            }));
            return true;
        } catch (error) {
            console.error('Failed to clear chat history:', error);
            throw error;
        }
    },

    // Clear active chat
    clearActiveChat: () => {
        const { activeChatId } = get();
        if (activeChatId) {
            socketService.leaveChatRoom(activeChatId);
        }
        set({
            activeChatId: null,
            messages: [],
            currentConversation: null,
            typingUsers: {}
        });
    },

    // Reset store
    reset: () => {
        get().disconnectSocket();
        set({
            conversations: [],
            currentConversation: null,
            messages: [],
            isLoading: false,
            error: null,
            activeChatId: null,
            typingUsers: {},
            isSocketConnected: false
        });
    }
}));
