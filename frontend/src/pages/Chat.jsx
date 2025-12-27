import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiUser, FiSearch, FiArrowLeft, FiShoppingBag, FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../components/Badge';
import MobileLayout from '../components/Layout/Mobile/MobileLayout';
import PageTransition from '../components/PageTransition';

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    // Get query params for initial chat
    const queryParams = new URLSearchParams(location.search);
    const initialVendorId = queryParams.get('vendorId');
    const initialVendorName = queryParams.get('vendorName');

    // userId would come from auth store in real app
    const userId = 'user-123';

    // Helper to check if we are on mobile view logic might be needed, 
    // but here we just toggle views based on selectedChat presence 
    // on small screens (using CSS/conditional rendering).

    useEffect(() => {
        // Load chats from localStorage
        const savedChats = localStorage.getItem(`user-${userId}-chats`);
        let loadedChats = savedChats ? JSON.parse(savedChats) : [];

        // If navigated with vendor info, check if chat exists, else create it
        if (initialVendorId && initialVendorName) {
            const existingChat = loadedChats.find(c => c.vendorId === initialVendorId);

            if (!existingChat) {
                const newChat = {
                    id: `chat-${initialVendorId}`,
                    vendorId: initialVendorId,
                    vendorName: initialVendorName,
                    lastMessage: 'Start a conversation',
                    unreadCount: 0,
                    status: 'active',
                    lastActivity: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                };
                loadedChats = [newChat, ...loadedChats];
                localStorage.setItem(`user-${userId}-chats`, JSON.stringify(loadedChats));
            } else {
                // Move to top if exists
                loadedChats = [existingChat, ...loadedChats.filter(c => c.id !== existingChat.id)];
            }

            setChats(loadedChats);
            const chatToSelect = existingChat || loadedChats[0];
            setSelectedChat(chatToSelect);
        } else {
            setChats(loadedChats);
        }
    }, [initialVendorId, initialVendorName]);

    useEffect(() => {
        if (selectedChat) {
            // Load messages for selected chat
            const savedMessages = localStorage.getItem(`user-${userId}-chat-${selectedChat.id}-messages`);
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            } else {
                setMessages([]);
            }
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        // Mark as read
        const updatedChats = chats.map((c) =>
            c.id === chat.id ? { ...c, unreadCount: 0 } : c
        );
        setChats(updatedChats);
        localStorage.setItem(`user-${userId}-chats`, JSON.stringify(updatedChats));
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChat) return;

        const message = {
            id: Date.now(),
            sender: 'user',
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
                }
                : c
        );
        setChats(updatedChats);

        // Save to localStorage
        localStorage.setItem(
            `user-${userId}-chat-${selectedChat.id}-messages`,
            JSON.stringify(updatedMessages)
        );
        localStorage.setItem(`user-${userId}-chats`, JSON.stringify(updatedChats));

        // Simulate Vendor Reply
        setTimeout(() => {
            const replyMsg = {
                id: Date.now() + 1,
                sender: 'vendor',
                message: "Thanks for your message! We'll get back to you shortly.",
                time: new Date().toISOString(),
            };
            const msgsAfterReply = [...updatedMessages, replyMsg];
            setMessages(msgsAfterReply);
            localStorage.setItem(
                `user-${userId}-chat-${selectedChat.id}-messages`,
                JSON.stringify(msgsAfterReply)
            );
            // Update chat last message regarding reply would ideally happen here too
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredChats = chats.filter((chat) =>
        !searchQuery ||
        chat.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageTransition>
            <MobileLayout showBottomNav={!selectedChat} className="bg-white">
                <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
                    {/* Chat List - Hidden on mobile if chat selected */}
                    <div className={`w-full lg:w-1/3 flex flex-col border-r border-gray-100 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h1 className="text-2xl font-bold text-gray-800 mb-3">Messages</h1>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search chats"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-800 placeholder-gray-500 focus:ring-0"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto w-full">
                            {filteredChats.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {filteredChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            onClick={() => handleSelectChat(chat)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${selectedChat?.id === chat.id ? 'bg-primary-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                                                        <FiShoppingBag className="text-gray-500" />
                                                    </div>
                                                    {chat.unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {chat.vendorName}
                                                        </h3>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                            {new Date(chat.lastActivity).toLocaleDateString(undefined, {
                                                                month: 'short', day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                                        }`}>
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <FiMessageCircle className="text-2xl text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Messages Yet</h3>
                                    <p className="text-gray-500 text-sm max-w-[200px]">
                                        Your conversations with sellers will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Window - Full screen on mobile */}
                    <div className={`w-full lg:w-2/3 flex flex-col bg-white ${!selectedChat ? 'hidden lg:flex' : 'flex fixed inset-0 lg:static z-[60]'} `}>
                        {selectedChat ? (
                            <>
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                                    <button
                                        onClick={() => {
                                            if (initialVendorId) {
                                                navigate(-1);
                                            } else {
                                                setSelectedChat(null);
                                            }
                                        }}
                                        className="lg:hidden -ml-2 p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                                    >
                                        <FiArrowLeft size={24} />
                                    </button>
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <FiShoppingBag className="text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{selectedChat.vendorName}</h3>
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                            Online
                                        </p>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-gray-600">
                                        <FiMoreVertical size={20} />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] px-4 py-2.5 shadow-sm ${msg.sender === 'user'
                                                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none'
                                                    : 'bg-white text-gray-900 rounded-2xl rounded-tl-none border border-gray-100'
                                                    }`}
                                            >
                                                <p className="text-[15px] leading-relaxed">{msg.message}</p>
                                                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-primary-100' : 'text-gray-400'
                                                    }`}>
                                                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 bg-white border-t border-gray-100 safe-area-bottom">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
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
