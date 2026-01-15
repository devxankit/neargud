import express from 'express';
import { protectVendor } from '../middleware/auth.middleware.js';
import {
    getVendorReturns,
    getReturnDetails,
    updateReturnStatus
} from '../controllers/vendor-controllers/vendorReturn.controller.js';

const router = express.Router();

router.use(protectVendor); // All routes require vendor authentication

router.get('/', getVendorReturns);
router.get('/:id', getReturnDetails);
router.put('/:id/status', updateReturnStatus);

export default router;
