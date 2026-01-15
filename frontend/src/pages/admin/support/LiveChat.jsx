import { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiSend, FiUser, FiSearch, FiArrowLeft, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../../store/chatStore';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { fetchVendors } from '../../../services/vendorApi';
import { initiateVendorChat } from '../../../services/chatApi';
import toast from 'react-hot-toast';

const LiveChat = () => {
  const { token, admin } = useAdminAuthStore();
  const {
    conversations,
    messages,
    isLoading,
    isSocketConnected,
    typingUsers,
    initializeSocket,
    loadConversations,
    selectConversation,
    sendChatMessage,
    startTyping,
    stopTyping,
    clearActiveChat,
    clearChatMessages,
    updateConversationPreview
  } = useChatStore();

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'vendors'
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');

  // Vendors List
  const [availableVendors, setAvailableVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize socket
  useEffect(() => {
    if (token && !isSocketConnected) {
      initializeSocket(token);
    }
    return () => clearActiveChat();
  }, [token]);

  // Load conversations
  useEffect(() => {
    if (admin) {
      loadConversations('admin');
    }
  }, [admin]);

  // Load vendors
  useEffect(() => {
    loadVendors();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      // Fetch all approved vendors
      const response = await fetchVendors({ limit: 1000, status: 'approved' }); // Adjust limit/pagination as needed
      setAvailableVendors(response.vendors || []);
    } catch (error) {
      console.error('Failed to load vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    await selectConversation(chat._id, 'admin');
  };

  const handleStartChatWithVendor = async (vendor) => {
    try {
      // Check for existing chat
      const existingChat = conversations.find(c =>
        c.participants?.some(p => p.role === 'vendor' && (p.userId?._id === vendor._id || p.userId === vendor._id))
      );

      if (existingChat) {
        handleSelectChat(existingChat);
        setActiveTab('chats');
        return;
      }

      const conversation = await initiateVendorChat(vendor._id);
      handleSelectChat(conversation);
      setActiveTab('chats');
      loadConversations('admin');
      toast.success(`Chat started with ${vendor.storeName || vendor.name}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const messageText = newMessage;
    setNewMessage('');
    stopTyping();

    try {
      // Determine receiver (should be vendor for admin chats mostly, but could be user if expanded)
      const receiverVendor = selectedChat.participants?.find(p => p.role === 'vendor');
      const receiverUser = selectedChat.participants?.find(p => p.role === 'user'); // In case admin messages user

      let receiverId, receiverRole;

      if (receiverVendor) {
        receiverId = receiverVendor.userId?._id || receiverVendor.userId;
        receiverRole = 'vendor';
      } else if (receiverUser) {
        receiverId = receiverUser.userId?._id || receiverUser.userId;
        receiverRole = 'user';
      } else {
        toast.error('Receiver not found');
        return;
      }

      await sendChatMessage(messageText, receiverId, receiverRole, 'admin');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 1000);
  };

  // Helper functions
  const getChatName = (chat, isActiveChat = false) => {
    if (!chat) return 'Chat';
    const vendor = chat.participants?.find(p => p.role === 'vendor');
    const user = chat.participants?.find(p => p.role === 'user');

    if (vendor) return vendor.userId?.storeName || vendor.userId?.name || 'Vendor';
    if (user) return user.userId?.name || 'Customer';
    return 'Unknown';
  };

  const getChatSubtitle = (chat) => {
    if (!chat) return '';
    const vendor = chat.participants?.find(p => p.role === 'vendor');
    if (vendor) return vendor.userId?.email;
    return '';
  }

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filtering
  const filteredChats = conversations.filter(chat => {
    if (!searchQuery) return true;
    const name = getChatName(chat).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredVendors = availableVendors.filter(v => {
    if (!vendorSearchQuery) return true;
    const q = vendorSearchQuery.toLowerCase();
    return (v.storeName || '').toLowerCase().includes(q) ||
      (v.name || '').toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q);
  });

  const isOtherUserTyping = selectedChat && typingUsers[selectedChat._id]?.isTyping;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-120px)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Sidebar */}
      <div className={`w-full lg:w-1/3 flex flex-col border-r border-gray-100 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Support Chat</h1>

          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-3">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'chats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Active Chats
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'vendors' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              All Vendors
            </button>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={activeTab === 'chats' ? searchQuery : vendorSearchQuery}
              onChange={(e) => activeTab === 'chats' ? setSearchQuery(e.target.value) : setVendorSearchQuery(e.target.value)}
              placeholder={activeTab === 'chats' ? "Search conversations..." : "Search vendors..."}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            isLoading && conversations.length === 0 ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
            ) : filteredChats.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filteredChats.map(chat => {
                  const name = getChatName(chat);
                  const lastMsg = chat.lastMessage?.message || 'No messages yet';
                  const unread = chat.unreadCount || 0;
                  return (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?._id === chat._id ? 'bg-primary-50/50' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                            {name.charAt(0)}
                          </div>
                          {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white">{unread}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{name}</h3>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-1">{formatTime(chat.lastMessageAt || chat.updatedAt)}</span>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{lastMsg}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No active chats</div>
            )
          ) : (
            // Vendors List
            loadingVendors ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
            ) : filteredVendors.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filteredVendors.map(vendor => (
                  <div
                    key={vendor._id}
                    onClick={() => handleStartChatWithVendor(vendor)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <FiUser />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{vendor.storeName || vendor.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
                      </div>
                      <FiMessageCircle className="text-primary-600 transform scale-90" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No vendors found</div>
            )
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`w-full lg:w-2/3 flex flex-col bg-gray-50/30 ${!selectedChat ? 'hidden lg:flex' : 'flex fixed inset-0 lg:static z-50 bg-white'}`}>
        {selectedChat ? (
          <>
            <div className="p-3 border-b border-gray-200 bg-white flex items-center gap-3 shadow-sm">
              <button onClick={() => { setSelectedChat(null); clearActiveChat(); }} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <FiArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                {getChatName(selectedChat).charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{getChatName(selectedChat)}</h3>
                {isOtherUserTyping ? (
                  <p className="text-[10px] text-primary-600 animate-pulse">typing...</p>
                ) : (
                  <p className="text-[10px] text-gray-500">{getChatSubtitle(selectedChat)}</p>
                )}
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear this chat history? This action only hides it for you.')) {
                      try {
                        await clearChatMessages(selectedChat._id, 'admin');
                        toast.success('Chat history cleared');
                      } catch (err) {
                        toast.error('Failed to clear chat');
                      }
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Clear Chat"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isAdmin = msg.senderRole === 'admin';
                return (
                  <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isAdmin ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-primary-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiMessageCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Conversation</h3>
            <p className="text-gray-500 text-sm max-w-xs">Choose a chat from the active list or start a new one from the All Vendors tab.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveChat;

