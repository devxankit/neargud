import express from 'express';
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
} from '../controllers/user-controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// All routes require user authentication
// Note: We're not enforcing requireAuth here yet to allow guest cart functionality on frontend
// (though backend cart persistence currently requires user role)
// If you want guest cart persistence, we need to refactor Cart model/controller
// For now, let's keep it restricted to 'user' role but ensure authenticate doesn't block guests (it returns null user)
// But authorize('user') WILL block guests. 
// Ideally guest cart is handled purely on frontend (localStorage) until checkout.
// So we keep this route protected for logged-in users to sync their cart.

router.use(authenticate, authorize('user'));

// Get cart
router.get('/', asyncHandler(getCartController));

// Add product to cart
router.post('/', asyncHandler(addToCartController));

// Update cart item quantity
router.put('/:productId', asyncHandler(updateCartItemController));

// Remove product from cart
router.delete('/:productId', asyncHandler(removeFromCartController));

// Clear entire cart
router.delete('/', asyncHandler(clearCartController));

export default router;

