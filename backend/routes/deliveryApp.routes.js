import express from 'express';
import {
    getDashboardStats,
    getAssignedOrders,
    getAvailableOrders,
    getOrderDetails,
    updateOrderStatus,
    claimOrder,
    updateLocation,
    getWalletTransactions,
    requestWithdrawal
} from '../controllers/delivery-controllers/deliveryApp.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// Apply authentication middleware
router.use(authenticate);

// Middleware to ensure user is a delivery partner
const ensureDeliveryPartner = (req, res, next) => {
    if (req.user && req.user.role === 'delivery_partner') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Delivery Partner role required.'
        });
    }
};

router.use(ensureDeliveryPartner);

router.get('/dashboard/stats', asyncHandler(getDashboardStats));
router.get('/orders/assigned', asyncHandler(getAssignedOrders));
router.get('/orders/available', asyncHandler(getAvailableOrders));
router.get('/orders/:id', asyncHandler(getOrderDetails));
router.post('/orders/:id/claim', asyncHandler(claimOrder));
router.patch('/orders/:id/status', asyncHandler(updateOrderStatus));
router.post('/location', asyncHandler(updateLocation));

// Wallet Routes
router.get('/wallet/transactions', asyncHandler(getWalletTransactions));
router.post('/wallet/withdraw', asyncHandler(requestWithdrawal));

export default router;
