import express from 'express';
import {
    createLocation,
    getLocations,
    updateLocation,
    deleteLocation
} from '../controllers/vendor-controllers/pickupLocation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('vendor'));

router.get('/', getLocations);
router.post('/', createLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;
