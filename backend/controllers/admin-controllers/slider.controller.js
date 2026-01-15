import {
    getAllSliders,
    createSlider,
    updateSlider,
    deleteSlider,
    getSliderById
} from '../../services/sliders.service.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../../utils/cloudinary.util.js';

/**
 * Get all sliders
 * GET /api/admin/sliders
 */
export const getSliders = async (req, res, next) => {
    try {
        const { page, limit, type, isActive } = req.query;
        const result = await getAllSliders({ page, limit, type, isActive });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get slider by ID
 * GET /api/admin/sliders/:id
 */
export const getSlider = async (req, res, next) => {
    try {
        const slider = await getSliderById(req.params.id);
        res.status(200).json({
            success: true,
            data: { slider }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create slider
 * POST /api/admin/sliders
 */
export const createNewSlider = async (req, res, next) => {
    try {
        const sliderData = { ...req.body };

        // Handle image upload
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer, 'sliders');
                sliderData.image = uploadResult.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message}`
                });
            }
        }

        const slider = await createSlider(sliderData);

        res.status(201).json({
            success: true,
            message: 'Slider created successfully',
            data: { slider }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update slider
 * PUT /api/admin/sliders/:id
 */
export const updateSliderData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Handle image upload
        if (req.file) {
            try {
                // Get existing to delete old image
                const existing = await getSliderById(id);
                if (existing.image) {
                    const publicId = extractPublicIdFromUrl(existing.image);
                    if (publicId) await deleteFromCloudinary(publicId);
                }

                const uploadResult = await uploadToCloudinary(req.file.buffer, 'sliders');
                updateData.image = uploadResult.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message}`
                });
            }
        }

        const slider = await updateSlider(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Slider updated successfully',
            data: { slider }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete slider
 * DELETE /api/admin/sliders/:id
 */
export const deleteSliderData = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get existing to delete image
        const existing = await getSliderById(id);
        if (existing && existing.image) {
            const publicId = extractPublicIdFromUrl(existing.image);
            if (publicId) await deleteFromCloudinary(publicId);
        }

        await deleteSlider(id);

        res.status(200).json({
            success: true,
            message: 'Slider deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
