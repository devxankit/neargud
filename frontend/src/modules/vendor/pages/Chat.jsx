import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiSearch, FiArrowLeft, FiUser, FiHeadphones, FiPlus, FiX, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../../store/chatStore';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { getVendorCustomers } from '../../../services/contactsApi';
import { createOrGetVendorChat, createOrGetSupportChat } from '../../../services/chatApi';
import toast from 'react-hot-toast';
import { formatPrice, getImageUrl } from '../../../utils/helpers';

const VendorChat = () => {
  const navigate = useNavigate();
  const { vendor, token } = useVendorAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    typingUsers,
    isSocketConnected,
    initializeSocket,
    loadConversations,
    selectConversation,
    sendChatMessage,
    startTyping,
    stopTyping,
    clearActiveChat,
    clearChatMessages,
    disconnectSocket
  } = useChatStore();

  /* State */
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'customers' | 'support'
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Customer List State (Replaces New Chat Modal)
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket & Load Data
  useEffect(() => {
    if (token && !isSocketConnected) {
      initializeSocket(token);
    }
    return () => clearActiveChat();
  }, [token]);

  // Load conversations
  useEffect(() => {
    if (vendor) {
      loadConversations('vendor');
    }
  }, [vendor]);

  // Always load customers on mount
  useEffect(() => {
    if (vendor) {
      loadAvailableCustomers();
    }
  }, [vendor]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* Correctly parsing customers to support both flattened and nested structures */
  const loadAvailableCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const customers = await getVendorCustomers();

      // Map to ensure valid objects with IDs
      const mappedCustomers = customers.map(item => {
        // If flattened service response: item has { id, name, ... }
        // If legacy/nested: item has { customer: { _id, name... } } or just { _id, name... }

        // 1. Determine the "Real" Customer Object
        let customerObj = item.customer || item;

        // 2. Determine the ID. 
        // Service returns 'id'. Mongo uses '_id'.
        const id = customerObj.id || customerObj._id || item.id || item._id;

        // 3. Normalize: Ensure the object has both 'id' and '_id' for compatibility
        if (id) {
          customerObj.id = id;
          customerObj._id = id;
        }

        return customerObj;
      });

      // Dedup by ID
      const uniqueCustomers = Array.from(new Map(
        mappedCustomers.filter(c => c.id).map(c => [c.id.toString(), c])
      ).values());

      setAvailableCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    await selectConversation(chat._id, 'vendor');
  };

  const handleStartChatWithCustomer = async (customer) => {
    try {
      // Helper to safely extract string ID
      const getSafeStringId = (val) => {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (val.$oid) return val.$oid; // Extended JSON
        if (val._id) return getSafeStringId(val._id); // Nested object
        if (val.toString && val.toString() !== '[object Object]') return val.toString();
        return null;
      };

      const customerId = getSafeStringId(customer.id) || getSafeStringId(customer._id);
      console.log('Customer:', customer);
      console.log('Customer ID:', customerId);
      console.log('Starting chat with customer:', { name: customer.name, rawId: customer.id || customer._id, extractedId: customerId });

      if (!customerId) {
        console.error('Customer ID missing for:', customer);
        toast.error('Cannot start chat: Invalid customer data');
        return;
      }

      // Check if chat already exists
      const existingChat = conversations.find(c =>
        c.participants?.some(p => {
          const pId = getSafeStringId(p.userId?._id) || getSafeStringId(p.userId);
          // Compare loosely
          return pId && pId === customerId;
        })
      );

      if (existingChat) {
        handleSelectChat(existingChat);
        setActiveTab('messages');
        return;
      }

      // Call API with the extracted ID string
      const conversation = await createOrGetVendorChat(customerId);
      handleSelectChat(conversation);
      toast.success(`Chat started with ${customer.name || customer.firstName}`);
      setActiveTab('messages');
      loadConversations('vendor');
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleStartSupportChat = async () => {
    try {
      const conversation = await createOrGetSupportChat();
      handleSelectChat(conversation);
      setActiveTab('support'); // Or messages? Support messages are usually separate?
      // Actually Support tab filters by role 'admin', so we should probably stay on Support or Messages?
      // If activeTab is 'support', it shows support chats.
      loadConversations('vendor');
    } catch (error) {
      console.error('Failed to start support chat:', error);
      toast.error('Failed to connect to support');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage;
    setNewMessage('');
    stopTyping();

    try {
      // Determine receiver
      const receiverUser = selectedChat.participants?.find(p => p.role === 'user');
      const receiverAdmin = selectedChat.participants?.find(p => p.role === 'admin');

      let receiverId, receiverRole;

      if (receiverUser) {
        receiverId = receiverUser.userId?._id || receiverUser.userId;
        receiverRole = 'user';
      } else if (receiverAdmin) {
        receiverId = receiverAdmin.userId?._id || receiverAdmin.userId;
        receiverRole = 'admin';
      } else {
        toast.error('Cannot find receiver');
        return;
      }

      await sendChatMessage(messageText, receiverId, receiverRole, 'vendor');
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter Logic
  const filteredChats = conversations.filter((chat) => {
    // 1. Filter by Tab
    if (activeTab === 'support') {
      return chat.participants?.some(p => p.role === 'admin');
    }
    // For 'messages', show ONLY user chats
    if (activeTab === 'messages') {
      return chat.participants?.some(p => p.role === 'user');
    }
    return false; // 'customers' tab doesn't use this filter
  });

  const filteredCustomers = availableCustomers.filter(c => {
    if (!customerSearchQuery) return true;
    const q = customerSearchQuery.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) ||
      (c.firstName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q);
  });

  // Filter chats by search query (for Messages/Support tabs)
  const displayChats = filteredChats.filter(chat => {
    if (!searchQuery) return true;
    const name = getChatName(chat).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });


  /* Helpers */
  const getChatName = (chat) => {
    const user = chat.participants?.find(p => p.role === 'user');
    const admin = chat.participants?.find(p => p.role === 'admin');

    if (user) {
      return user.userId?.name ||
        `${user.userId?.firstName || ''} ${user.userId?.lastName || ''} `.trim() ||
        'Customer';
    }
    if (admin) return 'Support Team';
    return 'Unknown';
  };

  const getChatSubtitle = (chat) => {
    const user = chat.participants?.find(p => p.role === 'user');
    if (user) return user.userId?.email || 'Customer';
    return 'Official Support';
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isOtherUserTyping = selectedChat && typingUsers[selectedChat._id]?.isTyping;

  /* Render List Content */
  const renderListContent = () => {
    if (activeTab === 'customers') {
      // CUSTOMERS LIST
      if (loadingCustomers) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        );
      }

      if (filteredCustomers.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FiUser className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">No customers found</p>
          </div>
        );
      }

      return (
        <div className="divide-y divide-gray-50">
          {filteredCustomers.map(customer => (
            <div
              key={customer._id}
              onClick={() => handleStartChatWithCustomer(customer)}
              className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0 text-xl">
                  <FiUser />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {customer.name || `${customer.firstName} ${customer.lastName || ''}`}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                </div>
                <FiMessageCircle className="text-primary-600 self-center" size={20} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // MESSAGES or SUPPORT
    if (isLoading && conversations.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (displayChats.length === 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            {activeTab === 'messages' ? <FiMessageCircle className="text-2xl text-gray-400" /> : <FiHeadphones className="text-2xl text-gray-400" />}
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {activeTab === 'messages' ? 'No Active Chats' : 'No Support Chats'}
          </h3>
          <p className="text-gray-500 text-sm max-w-[200px] mb-4">
            {activeTab === 'messages' ? 'Start a conversation from the Customers tab.' : 'Contact support for help.'}
          </p>

          {activeTab === 'messages' ? (
            <button
              onClick={() => setActiveTab('customers')}
              className="text-primary-600 font-medium hover:underline"
            >
              View All Customers
            </button>
          ) : (
            <button
              onClick={handleStartSupportChat}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-50">
        {displayChats.map(chat => {
          const name = getChatName(chat);
          const lastMsg = chat.lastMessage?.message || 'Start a conversation';
          const unread = chat.unreadCount || 0;
          return (
            <div
              key={chat._id}
              onClick={() => handleSelectChat(chat)}
              className={`p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${selectedChat?._id === chat._id ? 'bg-primary-50/50' : ''}`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${activeTab === 'support' ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'}`}>
                    {activeTab === 'support' ? <FiHeadphones /> : <FiUser />}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatTime(chat.lastMessageAt || chat.updatedAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {lastMsg}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-80px)] flex bg-white rounded-lg shadow-sm overflow-hidden"
    >
      {/* Side Panel (List) */}
      <div className={`w-full lg:w-1/3 flex flex-col border-r border-gray-100 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-3">
            <button onClick={() => setActiveTab('messages')} className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs md:text-sm font-medium transition-all gap-1 ${activeTab === 'messages' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <FiMessageCircle size={14} /> Chats
            </button>
            <button onClick={() => setActiveTab('customers')} className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs md:text-sm font-medium transition-all gap-1 ${activeTab === 'customers' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <FiUser size={14} /> Customers
            </button>
            <button onClick={() => setActiveTab('support')} className={`flex-1 flex justify-center items-center py-2 rounded-lg text-xs md:text-sm font-medium transition-all gap-1 ${activeTab === 'support' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <FiHeadphones size={14} /> Support
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={activeTab === 'customers' ? customerSearchQuery : searchQuery}
              onChange={(e) => activeTab === 'customers' ? setCustomerSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
              placeholder={activeTab === 'customers' ? "Search customers..." : "Search chats..."}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-800 placeholder-gray-500 focus:ring-0"
            />
          </div>

          {!isSocketConnected && (
            <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Connecting...
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {renderListContent()}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`w-full lg:w-2/3 flex flex-col bg-white ${!selectedChat ? 'hidden lg:flex' : 'flex fixed inset-0 lg:static z-[10000]'
        }`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
              <button
                onClick={() => {
                  setSelectedChat(null);
                  clearActiveChat();
                }}
                className="lg:hidden -ml-2 p-2 text-gray-600 hover:bg-gray-50 rounded-full"
              >
                <FiArrowLeft size={24} />
              </button>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getChatName(selectedChat) === 'Support Team'
                ? 'bg-amber-100 text-amber-600'
                : 'bg-primary-100 text-primary-600'
                }`}>
                {getChatName(selectedChat) === 'Support Team' ? <FiHeadphones /> : <FiUser />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{getChatName(selectedChat)}</h3>
                {isOtherUserTyping ? (
                  <p className="text-xs text-primary-600 flex items-center gap-1">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                    typing...
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {getChatName(selectedChat) === 'Support Team' ? 'Online' : getChatSubtitle(selectedChat)}
                  </p>
                )}
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear this chat history? This action only hides it for you.')) {
                      try {
                        await clearChatMessages(selectedChat._id, 'vendor');
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {messages.map((msg) => {
                const isVendor = msg.senderRole === 'vendor';
                const time = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] shadow-sm ${isVendor
                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none'
                        : 'bg-white text-gray-900 rounded-2xl rounded-tl-none border border-gray-100'
                        } px-4 py-2.5`}
                    >
                      {msg.messageType === 'product' && msg.productData && (
                        <div className={`mb-2 p-2 rounded-xl border ${isVendor ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'} flex gap-3 items-center overflow-hidden`}>
                          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            <img src={getImageUrl(msg.productData.image)} alt={msg.productData.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${isVendor ? 'text-white' : 'text-gray-900'}`}>{msg.productData.name}</p>
                            <p className={`text-[10px] font-medium ${isVendor ? 'text-white/80' : 'text-primary-600'}`}>{formatPrice(msg.productData.price)}</p>
                          </div>
                        </div>
                      )}
                      <p className="text-[15px] leading-relaxed break-words">{msg.message}</p>
                      <p className={`text-[10px] mt-1 text-right ${isVendor ? 'text-primary-100' : 'text-gray-400'
                        }`}>
                        {time}
                        {isVendor && msg.readStatus && ' ✓✓'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-full text-gray-900 placeholder-gray-500 focus:ring-0"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="w-11 h-11 flex items-center justify-center bg-primary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                >
                  <FiSend size={20} className={newMessage.trim() ? "ml-0.5" : ""} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <FiMessageCircle size={48} className="mb-4 opacity-20" />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default VendorChat;
