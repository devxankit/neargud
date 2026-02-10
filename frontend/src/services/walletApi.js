import api from '../utils/api';

export const walletApi = {
    // Get wallet balance and stats
    getWallet: () => api.get('/user/wallet'),

    // Get wallet transactions
    getTransactions: (params) => api.get('/user/wallet/transactions', { params }),

    // Add money to wallet
    addMoney: (amount, paymentData) => api.post('/user/wallet/add-money', { amount, ...paymentData }),

    // Create Razorpay order for wallet recharge
    createOrder: (amount) => api.post('/user/wallet/create-order', { amount }),

    // Verify Razorpay payment and credit wallet
    verifyPayment: (data) => api.post('/user/wallet/verify-payment', data),

    // Debit money from wallet
    debitMoney: (amount, description) => api.post('/user/wallet/debit-money', { amount, description }),
};
