import VendorWalletService from '../../services/vendorWallet.service.js';
import DeliveryWalletService from '../../services/deliveryWallet.service.js';
import WithdrawalRequest from '../../models/WithdrawalRequest.model.js';
import { asyncHandler } from '../../middleware/errorHandler.middleware.js';

/**
 * Get all vendor wallets with balances (Admin)
 */
export const getAllVendorWallets = asyncHandler(async (req, res) => {
    // This remains specific to Vendor Wallets
    const wallets = await VendorWalletService.getAllVendorWallets();
    res.status(200).json({
        success: true,
        data: wallets
    });
});

/**
 * Get all delivery partner wallets (Admin)
 */
export const getAllDeliveryWallets = asyncHandler(async (req, res) => {
    const wallets = await DeliveryWalletService.getAllPartnerWallets();
    res.status(200).json({
        success: true,
        data: wallets
    });
});

/**
 * Get specific vendor wallet (Admin)
 */
export const getVendorWallet = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const wallet = await VendorWalletService.getVendorWallet(vendorId);
    res.status(200).json({
        success: true,
        data: wallet
    });
});

/**
 * Get pending withdrawal requests (Admin)
 */
export const getPendingWithdrawals = asyncHandler(async (req, res) => {
    const { type } = req.query; // 'vendor' or 'delivery'

    let requests = [];
    let stats = {};

    if (type === 'delivery') {
        requests = await DeliveryWalletService.getPendingWithdrawals();
        stats = await DeliveryWalletService.getAdminStats();
    } else {
        requests = await VendorWalletService.getPendingWithdrawals();
        stats = await VendorWalletService.getAdminStats();
    }

    res.status(200).json({
        success: true,
        data: {
            requests,
            stats
        }
    });
});

/**
 * Approve withdrawal request (Admin)
 */
export const approveWithdrawal = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { notes, transactionId } = req.body;
    const adminId = req.user.adminId;

    const requestToCheck = await WithdrawalRequest.findById(requestId);
    if (!requestToCheck) {
        throw new Error('Withdrawal request not found');
    }

    let result;
    if (requestToCheck.userType === 'delivery_partner') {
        result = await DeliveryWalletService.approveWithdrawal(requestId, adminId, notes, transactionId);
    } else {
        result = await VendorWalletService.approveWithdrawal(requestId, adminId, notes, transactionId);
    }

    res.status(200).json({
        success: true,
        message: 'Withdrawal request approved and processed',
        data: result
    });
});

/**
 * Reject withdrawal request (Admin)
 */
export const rejectWithdrawal = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.adminId;

    const requestToCheck = await WithdrawalRequest.findById(requestId);
    if (!requestToCheck) {
        throw new Error('Withdrawal request not found');
    }

    let result;
    if (requestToCheck.userType === 'delivery_partner') {
        result = await DeliveryWalletService.rejectWithdrawal(requestId, adminId, reason);
    } else {
        result = await VendorWalletService.rejectWithdrawal(requestId, adminId, reason);
    }

    res.status(200).json({
        success: true,
        message: 'Withdrawal request rejected',
        data: result
    });
});

/**
 * Get withdrawal reports (Admin)
 */
export const getReports = asyncHandler(async (req, res) => {
    const { status, startDate, endDate, vendorId, type } = req.query;

    let reports;
    if (type === 'delivery') {
        reports = await DeliveryWalletService.getWithdrawalReports({ status, startDate, endDate });
    } else {
        reports = await VendorWalletService.getWithdrawalReports({ status, startDate, endDate, vendorId });
    }

    res.status(200).json({
        success: true,
        data: reports
    });
});
