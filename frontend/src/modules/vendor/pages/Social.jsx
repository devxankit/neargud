import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiHeart, FiVideo, FiUsers, FiTrendingUp, FiShare2, FiGlobe } from 'react-icons/fi';
import { useVendorAuthStore } from '../store/vendorAuthStore';

const VendorSocial = () => {
    const { vendor } = useVendorAuthStore();
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data for social stats
    const stats = [
        { title: 'Followers', value: '1.2K', icon: FiUsers, change: '+12%', color: 'from-blue-500 to-blue-600' },
        { title: 'Following', value: '348', icon: FiUser, change: '+5%', color: 'from-purple-500 to-purple-600' },
        { title: 'Reel Likes', value: '8.5K', icon: FiHeart, change: '+24%', color: 'from-pink-500 to-pink-600' },
        { title: 'Total Views', value: '45.2K', icon: FiVideo, change: '+18%', color: 'from-amber-500 to-amber-600' },
    ];

    // Mock data for recent likes/activity
    const recentActivity = [
        { id: 1, user: 'Sarah Johnson', action: 'liked your reel', target: 'Summer Collection Showcase', time: '2 mins ago', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
        { id: 2, user: 'Mike Chen', action: 'started following you', target: '', time: '15 mins ago', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
        { id: 3, user: 'Emily Davis', action: 'commented on', target: 'New Arrivals', time: '1 hour ago', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
        { id: 4, user: 'Alex Wilson', action: 'liked your reel', target: 'Discount Alert!', time: '3 hours ago', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
    ];

    // Mock data for connected accounts
    const socialAccounts = [
        { id: 'insta', name: 'Instagram', icon: FiGlobe, connected: true, handle: '@mystore_official', url: '#' },
        { id: 'fb', name: 'Facebook', icon: FiGlobe, connected: true, handle: 'My Store Page', url: '#' },
        { id: 'yt', name: 'YouTube', icon: FiGlobe, connected: false, handle: '', url: '#' },
        { id: 'tw', name: 'Twitter', icon: FiGlobe, connected: false, handle: '', url: '#' },
    ];


    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Social Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your social presence and interactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        <FiShare2 />
                        <span>Share Profile</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
                        <FiVideo />
                        <span>Create Reel</span>
                    </button>
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-400 to-primary-600 opacity-10"></div>
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 overflow-hidden -mt-8 md:mt-0">
                        {vendor?.storeLogo ? (
                            <img src={vendor.storeLogo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600">
                                <FiUser className="text-3xl" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{vendor?.storeName || 'My Store'}</h2>
                        <p className="text-gray-500 text-sm">@{vendor?.name?.toLowerCase().replace(/\s+/g, '') || 'username'}</p>
                    </div>
                    <div className="flex gap-8 mb-2">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-gray-900">1.2K</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-gray-900">348</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-gray-900">8.5K</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Likes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-primary-500/20`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Recent Activity</h3>
                        <button className="text-primary-600 text-sm font-semibold hover:underline">View All</button>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-4">
                                    <img src={activity.image} alt={activity.user} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-bold">{activity.user}</span> {activity.action} {activity.target && <span className="font-medium text-primary-600">"{activity.target}"</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <FiShare2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Connected Accounts */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Connected Accounts</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {socialAccounts.map((account) => (
                            <div key={account.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-gray-700 shadow-sm">
                                        <account.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{account.name}</p>
                                        <p className="text-xs text-gray-500">{account.connected ? account.handle : 'Not connected'}</p>
                                    </div>
                                </div>
                                <button
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${account.connected
                                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        : 'bg-primary-600 text-white hover:bg-primary-700'
                                        }`}
                                >
                                    {account.connected ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorSocial;
