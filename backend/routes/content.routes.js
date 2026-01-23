import express from 'express';
import {
    getContentByKey,
    upsertContent,
} from '../controllers/admin-controllers/content.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// GET route is public (or optional authentication)
router.get('/:key', asyncHandler(getContentByKey));

// PUT route requires admin authentication
router.use(authenticate);
router.put('/:key', authorize('admin'), asyncHandler(upsertContent));

export default router;
