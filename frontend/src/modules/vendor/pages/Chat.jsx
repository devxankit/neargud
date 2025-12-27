import { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiSend, FiUser, FiSearch, FiArrowLeft, FiMoreVertical } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from '../../../components/Badge';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { useOrderStore } from '../../../store/orderStore';
import toast from 'react-hot-toast';

const Chat = () => {
  const { vendor } = useVendorAuthStore();
  const { orders } = useOrderStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const messagesEndRef = useRef(null);
  const vendorId = vendor?.id;

  useEffect(() => {
    if (!vendorId) return;

    // Load chats from localStorage or initialize with dummy data
    const savedChats = localStorage.getItem(`vendor-${vendorId}-chats`);
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    } else {
      // Initialize with chats from orders
      const orderChats = orders
        .filter((order) => {
          if (order.vendorItems && Array.isArray(order.vendorItems)) {
            return order.vendorItems.some((vi) => vi.vendorId === vendorId);
          }
          return false;
        })
        .slice(0, 5)
        .map((order, index) => ({
          id: `chat-${order.id}`,
          customerId: order.userId || `customer-${index}`,
          customerName: order.shippingAddress?.name || `Customer ${index + 1}`,
          customerEmail: order.shippingAddress?.email || `customer${index + 1}@example.com`,
          orderId: order.id,
          lastMessage: index === 0 ? 'Hello, I need help with my order' : 'Thank you for your help!',
          unreadCount: index === 0 ? 2 : 0,
          status: index === 0 ? 'active' : index === 1 ? 'resolved' : 'active',
          lastActivity: order.date,
          createdAt: order.date,
        }));

      setChats(orderChats);
      localStorage.setItem(`vendor-${vendorId}-chats`, JSON.stringify(orderChats));
    }
  }, [vendorId, orders]);

  useEffect(() => {
    if (selectedChat) {
      // Load messages for selected chat
      const savedMessages = localStorage.getItem(`vendor-${vendorId}-chat-${selectedChat.id}-messages`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with default messages
        const defaultMessages = [
          {
            id: 1,
            sender: 'customer',
            message: selectedChat.lastMessage,
            time: selectedChat.lastActivity,
          },
          {
            id: 2,
            sender: 'vendor',
            message: 'Hi! How can I help you today?',
            time: new Date().toISOString(),
          },
        ];
        setMessages(defaultMessages);
        localStorage.setItem(
          `vendor-${vendorId}-chat-${selectedChat.id}-messages`,
          JSON.stringify(defaultMessages)
        );
      }
    }
  }, [selectedChat, vendorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Mark as read
    const updatedChats = chats.map((c) =>
      c.id === chat.id ? { ...c, unreadCount: 0, status: 'active' } : c
    );
    setChats(updatedChats);
    localStorage.setItem(`vendor-${vendorId}-chats`, JSON.stringify(updatedChats));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message = {
      id: messages.length + 1,
      sender: 'vendor',
      message: newMessage,
      time: new Date().toISOString(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');

    // Update chat last message
    const updatedChats = chats.map((c) =>
      c.id === selectedChat.id
        ? {
          ...c,
          lastMessage: newMessage,
          lastActivity: new Date().toISOString(),
          unreadCount: 0,
        }
        : c
    );
    setChats(updatedChats);

    // Save to localStorage
    localStorage.setItem(
      `vendor-${vendorId}-chat-${selectedChat.id}-messages`,
      JSON.stringify(updatedMessages)
    );
    localStorage.setItem(`vendor-${vendorId}-chats`, JSON.stringify(updatedChats));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      !searchQuery ||
      chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.orderId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || chat.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeChats = chats.filter((c) => c.status === 'active').length;
  const unreadCount = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="flex h-full">
        {/* Chat List - Hidden on mobile if chat selected */}
        <div className={`w-full lg:w-1/3 flex flex-col border-r border-gray-200 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
              {unreadCount > 0 && (
                <Badge variant="warning" className="text-xs">
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All ({chats.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Active ({activeChats})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiUser className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{chat.customerName}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {chat.orderId ? `Order: ${chat.orderId}` : chat.customerEmail}
                          </p>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge variant="warning" className="text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{chat.lastMessage}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(chat.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                <FiMessageCircle className="text-4xl mb-4 text-gray-300" />
                <p>No chats found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`w-full lg:w-2/3 flex flex-col bg-white ${!selectedChat ? 'hidden lg:flex' : 'flex fixed inset-0 lg:static z-[60]'} `}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-4 shadow-sm z-10 safe-area-top">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="lg:hidden -ml-2 p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                >
                  <FiArrowLeft size={24} />
                </button>
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{selectedChat.customerName}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedChat.orderId ? `Order: ${selectedChat.orderId}` : selectedChat.customerEmail}
                  </p>
                </div>
                <Badge
                  variant={selectedChat.status === 'active' ? 'success' : 'info'}
                  className="text-xs"
                >
                  {selectedChat.status === 'active' ? 'Active' : 'Resolved'}
                </Badge>
                <button className="p-2 text-gray-400 hover:text-gray-600 lg:hidden">
                  <FiMoreVertical size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'vendor'
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                        }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.sender === 'vendor' ? 'text-primary-100' : 'text-gray-400'
                        }`}>
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 lg:p-4 border-t border-gray-200 bg-white safe-area-bottom">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-200 shrink-0"
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <FiMessageCircle size={32} className="text-primary-200" />
              </div>
              <p className="text-lg font-medium">Select a chat to start messaging</p>
              <p className="text-sm text-gray-400">Communicate with customers directly</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;

