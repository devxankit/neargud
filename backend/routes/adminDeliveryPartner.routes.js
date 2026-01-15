import express from 'express';
import * as partnerController from '../controllers/admin-controllers/adminDeliveryPartner.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', asyncHandler(partnerController.getAllPartners));
router.post('/', asyncHandler(partnerController.createPartner));
router.put('/:id', asyncHandler(partnerController.updatePartner));
router.patch('/:id/status', asyncHandler(partnerController.updatePartnerStatus));
router.delete('/:id', asyncHandler(partnerController.deletePartner));

export default router;
