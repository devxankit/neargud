import {
  getWalletBalance,
  getWalletTransactions,
  addMoney,
  calculateStats,
} from '../../services/wallet.service.js';
import razorpayService from '../../services/razorpay.service.js';

/**
 * Get wallet balance and stats
 * GET /api/user/wallet
 */
export const getWallet = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const balanceData = await getWalletBalance(userId);
    const stats = await calculateStats(userId);

    res.status(200).json({
      success: true,
      message: 'Wallet retrieved successfully',
      data: {
        balance: balanceData.balance,
        totalCredit: stats.totalCredit,
        totalDebit: stats.totalDebit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get wallet transactions
 * GET /api/user/wallet/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, type } = req.query;

    const filters = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      type,
    };

    const result = await getWalletTransactions(userId, filters);

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add money to wallet (for future use)
 * POST /api/user/wallet/add-money
 */
export const addMoneyController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const transaction = await addMoney(
      userId,
      amount,
      description || 'Money added to wallet'
    );

    res.status(201).json({
      success: true,
      message: 'Money added to wallet successfully',
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Razorpay order for wallet recharge
 * POST /api/user/wallet/create-order
 */
export const createWalletOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured',
      });
    }
    const uidPart = String(userId).slice(-8);
    const timePart = String(Date.now()).slice(-10);
    const receipt = `WAL-${timePart}-${uidPart}`;
    const order = await razorpayService.createOrder(amount, 'INR', receipt, {
      type: 'wallet_recharge',
      userId: userId.toString(),
    });
    res.status(201).json({
      success: true,
      data: {
        razorpay: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment and credit wallet
 * POST /api/user/wallet/verify-payment
 */
export const verifyWalletPayment = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { amount, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!amount || amount <= 0 || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment fields',
      });
    }
    const isValid = razorpayService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
    const paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);
    if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful',
      });
    }
    const tx = await addMoney(userId, amount, 'Wallet recharge via Razorpay');
    res.status(200).json({
      success: true,
      message: 'Wallet recharged successfully',
      data: { transaction: tx },
    });
  } catch (error) {
    next(error);
  }
};

