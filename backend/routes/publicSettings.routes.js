import express from 'express';
import { getPublicSettingsController } from '../controllers/admin-controllers/settings.controller.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// Public route - no authentication required
router.get('/', asyncHandler(getPublicSettingsController));

export default router;
