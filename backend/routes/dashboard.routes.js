import express from 'express';
import { getDashboardStats } from '../controllers/admin-controllers/dashboard.controller.js';
// Middleware for auth? Assuming generic admin protection needed, 
// usually done in server.js or per route. 
// I'll assume I should duplicate the pattern of other admin routes.
// But `server.js` applies 'authenticate' middleware? checks... 
// Usually specific middleware is likely imported. 
// Let's check `adminOrder.routes.js` to see what middleware is used.

import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', asyncHandler(getDashboardStats));

export default router;
