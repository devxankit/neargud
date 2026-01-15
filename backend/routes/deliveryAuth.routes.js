import express from 'express';
import * as deliveryAuthController from '../controllers/delivery-controllers/deliveryAuth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// router.post('/register', asyncHandler(deliveryAuthController.register));
router.post('/login', asyncHandler(deliveryAuthController.login));
router.post('/verify-email', asyncHandler(deliveryAuthController.verifyEmail));
router.post('/resend-otp', asyncHandler(deliveryAuthController.resendOTP));
router.post('/forgot-password', asyncHandler(deliveryAuthController.forgotPassword));
router.post('/verify-reset-otp', asyncHandler(deliveryAuthController.verifyResetOTP));
router.post('/reset-password', asyncHandler(deliveryAuthController.resetPassword));
router.get('/me', authenticate, asyncHandler(deliveryAuthController.getMe));

export default router;
