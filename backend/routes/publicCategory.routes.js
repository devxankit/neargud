import express from 'express';
import {
    getPublicCategoryList,
    getCategory,
} from '../controllers/admin-controllers/categoryManagement.controller.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// Public category routes (no authentication required)
router.get('/', asyncHandler(getPublicCategoryList));
router.get('/:id', asyncHandler(getCategory));

export default router;
