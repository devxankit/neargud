import express from 'express';
import {
    getCities,
    addCity,
    editCity,
    removeCity,
    getZipcodes,
    addZipcode,
    editZipcode,
    removeZipcode,
} from '../controllers/admin-controllers/location.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'vendor', 'user'));

// City Routes
router.get('/cities', getCities);
router.post('/cities', addCity);
router.put('/cities/:id', editCity);
router.delete('/cities/:id', removeCity);

// Zipcode Routes
router.get('/zipcodes', getZipcodes);
router.post('/zipcodes', addZipcode);
router.put('/zipcodes/:id', editZipcode);
router.delete('/zipcodes/:id', removeZipcode);

export default router;
