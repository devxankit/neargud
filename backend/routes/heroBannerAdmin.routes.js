import express from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getSlots,
  getBookings,
  getBooking,
  getRevenueStats,
  getTransactions,
  updateSlot,
  updateSettings,
  approveBooking,
  rejectBooking
} from '../controllers/admin-controllers/heroBanner.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';
import { upload } from '../utils/upload.util.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// Simple Hero Banner CRUD
router.get('/', asyncHandler(getBanners));
router.post('/', upload.single('image'), asyncHandler(createBanner));
router.put('/:id', upload.single('image'), asyncHandler(updateBanner));
router.delete('/:id', asyncHandler(deleteBanner));

// Legacy endpoints (returning empty/success to keep UI stable)
router.get('/slots', asyncHandler(getSlots));
router.get('/bookings', asyncHandler(getBookings));
router.get('/bookings/:id', asyncHandler(getBooking));
router.get('/revenue-stats', asyncHandler(getRevenueStats));
router.get('/transactions', asyncHandler(getTransactions));
router.put('/slots/:id', asyncHandler(updateSlot));
router.put('/settings', asyncHandler(updateSettings));
router.put('/bookings/:id/approve', asyncHandler(approveBooking));
router.put('/bookings/:id/reject', asyncHandler(rejectBooking));

export default router;
