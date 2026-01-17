import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiSearch, FiArrowLeft, FiShoppingBag, FiMoreVertical, FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import MobileLayout from '../components/Layout/Mobile/MobileLayout';
import PageTransition from '../components/PageTransition';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { getAvailableVendors } from '../services/contactsApi';
import { formatPrice } from '../utils/helpers';

const Chat = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, token } = useAuthStore();
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
        createConversationWithVendor,
        clearActiveChat,
        clearChatMessages,
        disconnectSocket
    } = useChatStore();

    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [vendorSearchQuery, setVendorSearchQuery] = useState('');
    const [loadingVendors, setLoadingVendors] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const processedProductRef = useRef(null);

    // Get query params for initial chat
    const vendorId = searchParams.get('vendorId');
    const vendorName = searchParams.get('vendorName');
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');
    const productImage = searchParams.get('productImage');
    const productPrice = searchParams.get('productPrice');

    // Initialize socket on mount
    useEffect(() => {
        if (token && !isSocketConnected) {
            console.log('🔌 Initializing socket connection...');
            initializeSocket(token);
        }

        return () => {
            clearActiveChat();
        };
    }, [token]);

    // Load conversations
    useEffect(() => {
        if (user) {
            loadConversations('user');
        }
    }, [user]);

    // Load vendors always
    useEffect(() => {
        if (user && !loadingVendors) {
            loadVendors();
        }
    }, [user]);

    const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'vendors'

    // Handle vendor from URL params
    useEffect(() => {
        const initializeVendorChat = async () => {
            if (!vendorId || !user) return;

            try {
                let conversation = null;

                // 1. Try to find existing conversation in the loaded list
                if (conversations.length > 0) {
                    conversation = conversations.find(c =>
                        c.participants?.some(p =>
                            (p.userId?._id || p.userId) === vendorId
                        )
                    );
                }

                // 2. If not found, create or get from server
                if (!conversation) {
                    conversation = await createConversationWithVendor(vendorId);
                    // Refresh conversations list to include the new one
                    loadConversations('user');
                }

                if (conversation) {
                    // Select the chat (this is async)
                    await handleSelectChat(conversation);

                    // 3. Handle automatic product inquiry message
                    // Only send if we have product info AND we haven't already processed it for this conversation
                    const inquiryKey = `${conversation._id}_${productId}`;
                    if (productId && productName && processedProductRef.current !== inquiryKey) {
                        processedProductRef.current = inquiryKey;

                        // Slight delay to ensure socket and activeChatId are ready
                        setTimeout(async () => {
                            try {
                                const receiver = conversation.participants?.find(p => p.role === 'vendor');
                                const receiverId = receiver?.userId?._id || receiver?.userId;

                                if (receiverId) {
                                    await sendChatMessage(
                                        `I'm interested in this product: ${productName}`,
                                        receiverId,
                                        'vendor',
                                        'user',
                                        'product',
                                        {
                                            productId,
                                            name: productName,
                                            image: productImage,
                                            price: parseFloat(productPrice)
                                        }
                                    );
                                }
                            } catch (err) {
                                console.error('Failed to send auto product message:', err);
                            }
                        }, 800);
                    }
                }
            } catch (error) {
                console.error('Error initializing vendor chat:', error);
            }
        };

        if (vendorId && user) {
            initializeVendorChat();
        }

    }, [vendorId, user, !!conversations.length]); // Use boolean to avoid re-triggering on every length change if not needed, but length 0 to >0 transition is key.

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat);
        await selectConversation(chat._id, 'user');
    };

    // Load vendors list
    const loadVendors = async () => {
        setLoadingVendors(true);
        try {
            const vendorsList = await getAvailableVendors();
            // console.log("Vendors loaded:", vendorsList); 
            setVendors(vendorsList || []);
        } catch (error) {
            console.error('Failed to load vendors:', error);
            toast.error('Failed to load vendors');
        } finally {
            setLoadingVendors(false);
        }
    };


    // Start new chat with vendor
    const handleStartChatWithVendor = async (vendor) => {
        try {
            // Check if chat already exists
            const existingChat = conversations.find(c =>
                c.participants?.some(p => (p.userId?._id || p.userId) === (vendor._id || vendor.id))
            );

            if (existingChat) {
                handleSelectChat(existingChat);
                setActiveTab('messages'); // Switch to messages tab
                return;
            }

            const conversation = await createConversationWithVendor(vendor._id || vendor.id);
            setVendorSearchQuery('');
            handleSelectChat(conversation);
            setActiveTab('messages'); // Switch to messages when chat starts
            toast.success(`Started chat with ${vendor.storeName || vendor.name}`);
            loadConversations('user'); // Refresh list
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
            // Get receiver info from conversation
            const receiver = selectedChat.participants?.find(p =>
                p.role === 'vendor'
            );

            if (!receiver) {
                toast.error('Cannot find receiver');
                return;
            }

            const receiverId = receiver.userId?._id || receiver.userId;

            await sendChatMessage(messageText, receiverId, 'vendor', 'user');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            setNewMessage(messageText); // Restore message on error
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        // Handle typing indicator
        if (!isTyping) {
            setIsTyping(true);
            startTyping();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
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

    const filteredChats = conversations.filter((chat) => {
        if (!searchQuery) return true;
        const vendorParticipant = chat.participants?.find(p => p.role === 'vendor');
        const vendorName = vendorParticipant?.userId?.storeName ||
            vendorParticipant?.userId?.name || '';
        return vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Filter vendors ensuring we handle the structure correctly
    const filteredVendors = vendors.filter(v => {
        if (!vendorSearchQuery) return true;
        const search = vendorSearchQuery.toLowerCase();
        return (v.storeName?.toLowerCase().includes(search) ||
            v.name?.toLowerCase().includes(search) ||
            v.businessName?.toLowerCase().includes(search));
    });

    const getVendorInfo = (chat) => {
        const vendor = chat.participants?.find(p => p.role === 'vendor');
        return {
            name: vendor?.userId?.storeName || vendor?.userId?.name || 'Vendor',
            logo: vendor?.userId?.storeLogo || null
        };
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 86400000) { // Less than 24 hours
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) { // Less than 7 days
            return d.toLocaleDateString([], { weekday: 'short' });
        } else {
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const isOtherUserTyping = selectedChat && typingUsers[selectedChat._id]?.isTyping;

    // Render Side List Content
    const renderSideList = () => {
        if (activeTab === 'messages') {
            if (isLoading && conversations.length === 0) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                );
            }

            if (filteredChats.length === 0) {
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center">
                        <FiMessageCircle className="text-4xl text-gray-300 mb-3" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No Chats</h3>
                        <p className="text-gray-500 mb-4">Start a conversation from the Vendor list.</p>
                        <button
                            onClick={() => setActiveTab('vendors')}
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Find Vendors
                        </button>
                    </div>
                );
            }

            return (
                <div className="divide-y divide-gray-50">
                    {filteredChats.map((chat) => {
                        const vendorInfo = getVendorInfo(chat);
                        const lastMsg = chat.lastMessage?.message || 'Start a conversation';
                        const unread = chat.unreadCount || 0;

                        return (
                            <div
                                key={chat._id}
                                onClick={() => handleSelectChat(chat)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${selectedChat?._id === chat._id ? 'bg-primary-50/50' : ''
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl overflow-hidden">
                                            {vendorInfo.logo ? (
                                                <img src={vendorInfo.logo} alt={vendorInfo.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FiShoppingBag className="text-gray-500" />
                                            )}
                                        </div>
                                        {unread > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {vendorInfo.name}
                                            </h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {formatTime(chat.lastMessageAt || chat.updatedAt)}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                            }`}>
                                            {lastMsg}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            // Vendors Tab
            if (loadingVendors) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                );
            }

            if (filteredVendors.length > 0) {
                return (
                    <div className="divide-y divide-gray-50">
                        {filteredVendors.map((vendor) => (
                            <div
                                key={vendor._id || vendor.id}
                                onClick={() => handleStartChatWithVendor(vendor)}
                                className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {vendor.storeLogo ? (
                                            <img
                                                src={vendor.storeLogo}
                                                alt={vendor.storeName || vendor.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FiShoppingBag className="text-gray-500 text-xl" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {vendor.storeName || vendor.name || 'Vendor'}
                                        </h3>
                                        {vendor.businessName && (
                                            <p className="text-xs text-gray-500 truncate">
                                                {vendor.businessName}
                                            </p>
                                        )}
                                    </div>
                                    <FiMessageCircle className="text-primary-600 self-center" size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center">
                    <FiShoppingBag className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Vendors</h3>
                    <p className="text-gray-500 text-sm max-w-[200px]">
                        {vendorSearchQuery ? 'Try a different search' : 'No vendors currently available'}
                    </p>
                </div>
            );
        }
    };

    return (
        <PageTransition>
            <MobileLayout showBottomNav={!selectedChat} className="bg-white">
                <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
                    {/* Chat List - Hidden on mobile if chat selected */}
                    <div className={`w-full lg:w-1/3 flex flex-col border-r border-gray-100 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h1 className="text-2xl font-bold text-gray-800 mb-3">
                                Messages
                            </h1>

                            {/* Tabs */}
                            <div className="flex p-1 bg-gray-100 rounded-xl mb-3">
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'messages'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FiMessageCircle size={16} />
                                    Chats
                                </button>
                                <button
                                    onClick={() => setActiveTab('vendors')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'vendors'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FiShoppingBag size={16} />
                                    Vendors
                                </button>
                            </div>

                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={activeTab === 'messages' ? searchQuery : vendorSearchQuery}
                                    onChange={(e) => activeTab === 'messages' ? setSearchQuery(e.target.value) : setVendorSearchQuery(e.target.value)}
                                    placeholder={activeTab === 'messages' ? "Search chats" : "Search vendors..."}
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
                        <div className="flex-1 overflow-y-auto w-full">
                            {renderSideList()}
                        </div>
                    </div>

                    {/* Chat Window - Full screen on mobile */}
                    <div className={`w-full lg:w-2/3 flex flex-col bg-white ${!selectedChat ? 'hidden lg:flex' : 'flex fixed inset-0 lg:static z-[60]'
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
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                        {getVendorInfo(selectedChat).logo ? (
                                            <img
                                                src={getVendorInfo(selectedChat).logo}
                                                alt={getVendorInfo(selectedChat).name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FiShoppingBag className="text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{getVendorInfo(selectedChat).name}</h3>
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
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                                Online
                                            </p>
                                        )}
                                    </div>

                                    {/* Chat Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to clear this chat history? This action only hides it for you.')) {
                                                    try {
                                                        await clearChatMessages(selectedChat._id, 'user');
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
                                        const isUser = msg.senderRole === 'user';
                                        const time = new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] shadow-sm ${isUser
                                                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none'
                                                        : 'bg-white text-gray-900 rounded-2xl rounded-tl-none border border-gray-100'
                                                        } px-4 py-2.5`}
                                                >
                                                    {msg.messageType === 'product' && msg.productData && (
                                                        <div className={`mb-2 p-2 rounded-xl border ${isUser ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'} flex gap-3 items-center`}>
                                                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                                <img src={msg.productData.image} alt={msg.productData.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-bold truncate ${isUser ? 'text-white' : 'text-gray-900'}`}>{msg.productData.name}</p>
                                                                <p className={`text-[10px] font-medium ${isUser ? 'text-white/80' : 'text-primary-600'}`}>{formatPrice(msg.productData.price)}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-[15px] leading-relaxed break-words">{msg.message}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isUser ? 'text-primary-100' : 'text-gray-400'
                                                        }`}>
                                                        {time}
                                                        {isUser && msg.readStatus && ' ✓✓'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 bg-white border-t border-gray-100 safe-area-bottom">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Message..."
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
                </div>
            </MobileLayout>
        </PageTransition>
    );
};

export default Chat;
