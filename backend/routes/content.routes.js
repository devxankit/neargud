import express from 'express';
import {
    getContentByKey,
    upsertContent,
} from '../controllers/admin-controllers/content.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Routes
router.get('/:key', asyncHandler(getContentByKey));
router.put('/:key', asyncHandler(upsertContent));

export default router;
