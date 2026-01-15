import express from 'express';
import {
    getZones,
    createZone,
    updateZone,
    deleteZone,
    getRates,
    createRate,
    updateRate,
    deleteRate
} from '../controllers/vendor-controllers/vendorShipping.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('vendor'));

// Zones
router.get('/zones', getZones);
router.post('/zones', createZone);
router.put('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);

// Rates
router.get('/rates', getRates);
router.post('/rates', createRate);
router.put('/rates/:id', updateRate);
router.delete('/rates/:id', deleteRate);

export default router;
