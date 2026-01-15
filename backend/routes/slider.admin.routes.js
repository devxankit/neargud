import express from 'express';
import {
    getSliders,
    getSlider,
    createNewSlider,
    updateSliderData,
    deleteSliderData
} from '../controllers/admin-controllers/slider.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';
import { upload } from '../utils/upload.util.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', asyncHandler(getSliders));
router.get('/:id', asyncHandler(getSlider));
router.post('/', upload.single('image'), asyncHandler(createNewSlider));
router.put('/:id', upload.single('image'), asyncHandler(updateSliderData));
router.delete('/:id', asyncHandler(deleteSliderData));

export default router;
