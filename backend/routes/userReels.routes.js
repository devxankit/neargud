import express from 'express';
import { getReels, getReelById } from '../controllers/user-controllers/userReels.controller.js';
import { toggleLike, getLiked, getFavorites } from '../controllers/user-controllers/reelLikes.controller.js';
import { getComments, addComment, deleteComment, updateComment } from '../controllers/user-controllers/reelComments.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// Public route - no authentication required for viewing reels
router.get('/', getReels);

// Like routes - require authentication (Must be before /:id to avoid collision)
router.post('/:reelId/like', authenticate, asyncHandler(toggleLike));
router.get('/liked', authenticate, asyncHandler(getLiked));
router.get('/favorites', authenticate, asyncHandler(getFavorites));

// Comment routes
router.get('/:reelId/comments', optionalAuthenticate, asyncHandler(getComments));
router.post('/:reelId/comments', authenticate, asyncHandler(addComment));
router.put('/comments/:commentId', authenticate, asyncHandler(updateComment));
router.delete('/comments/:commentId', authenticate, asyncHandler(deleteComment));

// Public route to get single reel
router.get('/:id', getReelById);

export default router;
