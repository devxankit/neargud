import { create } from 'zustand';
import { walletApi } from '../services/walletApi';
import toast from 'react-hot-toast';

export const useWalletStore = create((set, get) => ({
    wallet: null,
    transactions: [],
    isLoading: false,
    error: null,

    // Fetch wallet
    fetchWallet: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await walletApi.getWallet();
            const walletData = response.data.data || response.data;
            set({
                wallet: walletData,
                isLoading: false,
            });
            return walletData;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Fetch transactions
    fetchTransactions: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await walletApi.getTransactions(params);
            const transactionsData = response.data.data || response.data;
            set({
                transactions: transactionsData.transactions || transactionsData,
                isLoading: false,
            });
            return transactionsData;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Add money to wallet
    addMoney: async (amount) => {
        set({ isLoading: true, error: null });
        try {
            if (!amount || Number(amount) <= 0) {
                throw new Error('Please enter a valid amount');
            }
            const createRes = await walletApi.createOrder(Number(amount));
            const data = createRes.data?.data || createRes.data || createRes || {};
            const razorpay = data.razorpay || {};
            if (!razorpay.orderId || !razorpay.keyId) {
                // Fallback: direct credit if gateway not configured
                const direct = await walletApi.addMoney(Number(amount), {});
                await get().fetchWallet();
                toast.success('Wallet credited');
                set({ isLoading: false });
                return direct.data?.data || direct.data || direct;
            }
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Payment SDK failed to load'));
                    document.body.appendChild(script);
                });
            }
            await new Promise((resolve, reject) => {
                const options = {
                    key: razorpay.keyId,
                    amount: razorpay.amount,
                    currency: razorpay.currency || 'INR',
                    name: 'NearGud',
                    description: 'Wallet Recharge',
                    order_id: razorpay.orderId,
                    handler: async function (response) {
                        try {
                            await walletApi.verifyPayment({
                                amount: Number(amount),
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            });
                            await get().fetchWallet();
                            toast.success('Payment successful, wallet updated');
                            resolve(true);
                        } catch (err) {
                            toast.error('Payment verification failed');
                            reject(err);
                        }
                    },
                    theme: { color: '#10b981' },
                    modal: {
                        ondismiss: function () {
                            reject(new Error('Payment cancelled'));
                        }
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            });
            set({ isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Failed to add money');
            throw error;
        }
    },

    // Get wallet balance
    getBalance: () => {
        const state = get();
        return state.wallet?.balance || 0;
    },
}));
