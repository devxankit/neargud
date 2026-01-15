import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  verifyResetOTP,
} from '../controllers/vendor-controllers/vendorAuth.controller.js';
import { upload } from '../utils/upload.util.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { vendorApproved } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';
const router = express.Router();

// Public routes
router.post('/register', upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]), asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/verify-email', asyncHandler(verifyEmail));
router.post('/resend-otp', asyncHandler(resendOTP));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/verify-reset-otp', asyncHandler(verifyResetOTP));
router.post('/reset-password', asyncHandler(resetPassword));

// Protected routes (require authentication)
// Logout uses optional authentication to allow logout even with expired tokens
router.post('/logout', optionalAuthenticate, asyncHandler(logout));
router.get('/me', authenticate, vendorApproved, asyncHandler(getMe));
router.put('/profile', authenticate, vendorApproved, asyncHandler(updateProfile));

export default router;

