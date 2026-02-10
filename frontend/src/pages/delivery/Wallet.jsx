import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useDeliveryAuthStore } from '../../store/deliveryAuthStore';
import { useDeliveryStore } from '../../store/deliveryStore';
import PageTransition from '../../components/PageTransition';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DeliveryWallet = () => {
    const { deliveryBoy } = useDeliveryAuthStore();
    const {
        stats,
        fetchStats,
        transactions,
        walletBalance,
        fetchWalletData,
        requestWithdrawal,
        loading
    } = useDeliveryStore();

    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'withdrawals'

    useEffect(() => {
        fetchStats();
        fetchWalletData();
    }, []);

    const balance = walletBalance || 0;
    const totalEarnings = stats?.earnings || 0;

    // Filter transactions based on tab
    const filteredTransactions = activeTab === 'transactions'
        ? transactions.filter(t => t.type === 'earning' || (t.type === 'withdrawal' && t.status === 'completed'))
        : transactions.filter(t => t.type === 'withdrawal');

    const handleWithdraw = async () => {
        if (balance < 100) {
            toast.error('Minimum withdrawal amount is ₹100');
            return;
        }

        try {
            await requestWithdrawal(balance);
            toast.success('Withdrawal request submitted successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 pb-24">
                {/* Header - Purple Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-b-[40px] px-6 pt-20 pb-12 text-white shadow-lg relative overflow-hidden"
                >
                    {/* Decorative Circles */}
                    <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-50px] left-[-20px] w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center">
                        <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
                        <h1 className="text-5xl font-black mb-6">{formatPrice(balance)}</h1>

                        <button
                            onClick={handleWithdraw}
                            disabled={loading || balance < 100}
                            className="bg-white text-primary-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Withdraw Cash'}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 px-4 -mt-8 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-5 shadow-md flex flex-col items-center text-center"
                    >
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <FiDollarSign className="text-green-600 text-xl" />
                        </div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight mb-1">Total Earning</p>
                        <p className="text-xl font-black text-gray-800">{formatPrice(totalEarnings)}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-5 shadow-md flex flex-col items-center text-center"
                    >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <FiClock className="text-blue-600 text-xl" />
                        </div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight mb-1">Processing</p>
                        <p className="text-xl font-black text-gray-800">
                            {formatPrice(transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0))}
                        </p>
                    </motion.div>
                </div>

                {/* Content Section */}
                <div className="px-4 mt-8">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'transactions'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setActiveTab('withdrawals')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'withdrawals'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            Withdrawals
                        </button>
                    </div>

                    <div className="space-y-4">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'earning' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {tx.type === 'earning' ? <FiArrowDownLeft size={24} /> : <FiArrowUpRight size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 text-sm line-clamp-1">{tx.description}</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black ${tx.type === 'earning' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {tx.type === 'earning' ? '+' : '-'} {formatPrice(tx.amount)}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <FiCheckCircle size={10} className={tx.status === 'completed' ? "text-green-500" : "text-yellow-500"} />
                                            <span className={`text-[10px] font-bold uppercase ${tx.status === 'completed' ? "text-green-600" : "text-yellow-600"}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiClock className="text-gray-300 text-2xl" />
                                </div>
                                <p className="text-gray-500 font-medium">No {activeTab} found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default DeliveryWallet;
