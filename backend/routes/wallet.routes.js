import express from 'express';
import {
  getWallet,
  getTransactions,
  addMoneyController,
  debitMoneyController,
  createWalletOrder,
  verifyWalletPayment,
} from '../controllers/user-controllers/wallet.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get wallet balance and stats
router.get('/', asyncHandler(getWallet));

// Get wallet transactions
router.get('/transactions', asyncHandler(getTransactions));

// Add money to wallet
router.post('/add-money', asyncHandler(addMoneyController));

// Debit money from wallet
router.post('/debit-money', asyncHandler(debitMoneyController));

// Create Razorpay order for wallet
router.post('/create-order', asyncHandler(createWalletOrder));

// Verify Razorpay payment and credit wallet
router.post('/verify-payment', asyncHandler(verifyWalletPayment));

export default router;

