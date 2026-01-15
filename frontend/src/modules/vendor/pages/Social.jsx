import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUser, FiHeart, FiVideo,
    FiShare2, FiInstagram, FiFacebook,
    FiTwitter, FiLinkedin, FiExternalLink, FiCheckCircle, FiLink
} from 'react-icons/fi';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import toast from 'react-hot-toast';

const VendorSocial = () => {
    const { vendor } = useVendorAuthStore();
    const navigate = useNavigate();

    // Map social media from vendor data
    const socialAccounts = useMemo(() => {
        const sm = vendor?.socialMedia || {};
        return [
            {
                id: 'instagram',
                name: 'Instagram',
                icon: FiInstagram,
                connected: !!sm.instagram,
                handle: sm.instagram || 'Not linked',
                url: sm.instagram ? (sm.instagram.startsWith('http') ? sm.instagram : `https://instagram.com/${sm.instagram.replace('@', '')}`) : '#',
                color: 'text-pink-600 bg-pink-50 border-pink-100',
                hover: 'hover:border-pink-200 hover:shadow-pink-100'
            },
            {
                id: 'facebook',
                name: 'Facebook',
                icon: FiFacebook,
                connected: !!sm.facebook,
                handle: sm.facebook || 'Not linked',
                url: sm.facebook ? (sm.facebook.startsWith('http') ? sm.facebook : `https://facebook.com/${sm.facebook}`) : '#',
                color: 'text-blue-600 bg-blue-50 border-blue-100',
                hover: 'hover:border-blue-200 hover:shadow-blue-100'
            },
            {
                id: 'twitter',
                name: 'Twitter (X)',
                icon: FiTwitter,
                connected: !!sm.twitter,
                handle: sm.twitter || 'Not linked',
                url: sm.twitter ? (sm.twitter.startsWith('http') ? sm.twitter : `https://twitter.com/${sm.twitter.replace('@', '')}`) : '#',
                color: 'text-gray-900 bg-gray-50 border-gray-200',
                hover: 'hover:border-gray-300 hover:shadow-gray-100'
            },
            {
                id: 'linkedin',
                name: 'LinkedIn',
                icon: FiLinkedin,
                connected: !!sm.linkedin,
                handle: sm.linkedin || 'Not linked',
                url: sm.linkedin ? (sm.linkedin.startsWith('http') ? sm.linkedin : `https://linkedin.com/in/${sm.linkedin}`) : '#',
                color: 'text-blue-700 bg-blue-50 border-blue-100',
                hover: 'hover:border-blue-200 hover:shadow-blue-100'
            },
        ];
    }, [vendor?.socialMedia]);

    const handleShare = () => {
        const url = `${window.location.origin}/app/vendor/${vendor?._id || vendor?.id}`;
        navigator.clipboard.writeText(url);
        toast.success('Store profile link copied to clipboard!');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Social Presence</h1>
                    <p className="text-gray-500 text-base mt-2">Manage your social connections and store identity</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-semibold text-sm"
                    >
                        <FiShare2 className="text-lg" />
                        <span>Share Store</span>
                    </button>
                    <button
                        onClick={() => navigate('/vendor/reels/add-reel')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-semibold text-sm transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <FiVideo className="text-lg" />
                        <span>Create Reel</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/40 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-10"></div>
                        <div className="relative">
                            <div className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-xl bg-gray-50 overflow-hidden mb-4 relative z-10">
                                {vendor?.storeLogo ? (
                                    <img src={vendor.storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600">
                                        <FiUser className="text-4xl" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-1">
                                <h2 className="text-2xl font-black text-gray-900">{vendor?.storeName || 'My Store'}</h2>
                                <FiCheckCircle className="text-green-500 fill-green-50" />
                            </div>
                            <p className="text-gray-500 font-medium text-sm mb-6">@{vendor?.name?.toLowerCase().replace(/\s+/g, '') || 'username'}</p>

                        </div>
                    </div>

                    {/* Quick Tip Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-purple-200 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <h4 className="font-bold text-lg mb-2">Pro Tip 🚀</h4>
                        <p className="text-white/80 text-sm leading-relaxed mb-4">Sharing your store link on social media can increase your sales by 3x. Keep your profiles connected!</p>
                        <button onClick={handleShare} className="w-full py-2.5 bg-white text-purple-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-50 transition-colors shadow-sm">
                            Share Now
                        </button>
                    </div>
                </motion.div>

                {/* Right Column: Social Connections */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/30 overflow-hidden flex flex-col h-full">
                        <div className="px-8 py-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900">Connected Accounts</h3>
                                <p className="text-sm text-gray-500 mt-1">Manage where your content is shared</p>
                            </div>
                          <button
    onClick={() => navigate(`/vendor/settings/social-media`)}
    className="text-purple-600 hover:text-purple-700 font-semibold text-sm bg-purple-50 px-4 py-2 rounded-lg transition-colors"
>
    Edit Links
</button>

                        </div>

                        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {socialAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className={`relative group p-6 rounded-2xl border ${account.connected ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 border-dashed'} ${account.hover} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${account.color}`}>
                                            <account.icon size={24} />
                                        </div>
                                        {account.connected ? (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Linked
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                Unlinked
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{account.name}</h4>
                                    <p className={`text-sm font-medium truncate mb-6 ${account.connected ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {account.connected ? account.handle : 'Not connected yet'}
                                    </p>

                                    {account.connected ? (
                                        <a
                                            href={account.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            View Profile <FiExternalLink />
                                        </a>
                                    ) : (
                                        <button className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-sm">
                                            Connect <FiLink />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VendorSocial;
