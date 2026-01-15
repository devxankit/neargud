import api from '../utils/api';

/**
 * Chat API Service
 */

/**
 * Get conversations based on user role
 * @param {String} role - 'user' | 'vendor' | 'admin'
 */
export const fetchConversations = async (role = 'user') => {
    const prefix = role === 'user' ? '/auth/user' : (role === 'admin' ? '/admin' : '/vendor');
    // Note: Standard API routes are:
    // User: /api/user/chat/conversations
    // Vendor: /api/vendor/chat/conversations
    // Admin: /api/admin/chat/conversations

    // Wait, my verify of routes:
    // User: /api/user/chat (mounted in server.js line 285)
    // Vendor: /api/vendor/chat (mounted in server.js line 291)
    // Admin: /api/admin/chat (mounted in server.js line 273)

    const endpoint = `/${role}/chat/conversations`;
    // api.js baseURL is /api already. So we pass /user/chat/conversations.

    // Correction: 
    // role 'user' -> /user/chat/conversations
    // role 'vendor' -> /vendor/chat/conversations
    // role 'admin' -> /admin/chat/conversations

    const response = await api.get(endpoint);
    return response.data;
};

/**
 * Get messages for a conversation
 * @param {String} conversationId 
 * @param {String} role 
 * @param {Number} page 
 */
export const fetchMessages = async (conversationId, role = 'user', page = 1) => {
    const endpoint = `/${role}/chat/conversations/${conversationId}/messages`;
    const response = await api.get(endpoint, { params: { page } });
    return response.data; // { messages: [], pagination: {} }
};

/**
 * Send a message
 * @param {Object} data - { conversationId, receiverId, message, receiverRole }
 * @param {String} role - sender role
 */
export const sendMessage = async (data, role = 'user') => {
    const endpoint = `/${role}/chat/messages`;
    const response = await api.post(endpoint, data);
    return response.data;
};

/**
 * Mark message as read
 */
export const markMessageRead = async (messageId, role = 'user') => {
    const endpoint = `/${role}/chat/messages/${messageId}/read`;
    const response = await api.put(endpoint);
    return response.data;
};

/**
 * Mark all messages as read
 */
export const markAllRead = async (conversationId, role = 'user') => {
    const endpoint = `/${role}/chat/conversations/${conversationId}/read-all`;
    const response = await api.put(endpoint);
    return response.data;
};

/**
 * Initiate a chat (Admin -> Vendor)
 */
export const initiateVendorChat = async (vendorId) => {
    const response = await api.post('/admin/chat/conversations/vendor', { vendorId });
    return response.data;
};

/**
 * Create or Get User <-> Vendor Chat (User initiation)
 * @param {String} vendorId 
 */
export const createOrGetUserChat = async (vendorId) => {
    console.log('Creating or getting user chat for vendor:', vendorId);
    const response = await api.post('/user/chat/conversations', { vendorId });
    return response.data;
};

/**
 * Create or Get Vendor <-> User Chat (Vendor initiation)
 */
export const createOrGetVendorChat = async (userId) => {
    console.log('Creating or getting vendor chat for user:', userId);
    const response = await api.post('/vendor/chat/conversations', { userId });
    return response.data;
};

/**
 * Create or Get Vendor <-> Admin Chat (Support)
 */
export const createOrGetSupportChat = async () => {
    const response = await api.post('/vendor/chat/conversations', { type: 'admin' });
    return response.data;
};

/**
 * Clear Chat History
 */
export const clearChatHistory = async (conversationId, role = 'user') => {
    const response = await api.delete(`/${role}/chat/conversations/${conversationId}/clear`);
    return response.data;
};
