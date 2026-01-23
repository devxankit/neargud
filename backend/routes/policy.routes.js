import express from 'express';
import {
  getAll,
  getByKey,
  upsert,
} from '../controllers/admin-controllers/policy.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// GET routes are public
router.get('/', asyncHandler(getAll));
router.get('/:key', asyncHandler(getByKey));

// PUT route requires admin authentication
router.use(authenticate);
router.put('/:key', authorize('admin'), asyncHandler(upsert));

export default router;

