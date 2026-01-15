import Banner from '../models/Banner.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.util.js';

/**
 * Get all sliders with pagination and filtering
 */
export const getAllSliders = async ({ page = 1, limit = 10, type, isActive }) => {
    const query = {};

    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const sliders = await Banner.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Banner.countDocuments(query);

    return {
        sliders,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get active sliders (for public API)
 * @param {string} cityName - Optional city name to filter sliders
 * If cityName is provided: returns sliders for that city + universal sliders (empty city)
 * If cityName is not provided: returns only universal sliders
 */
export const getActiveSliders = async (cityName = '') => {
    const now = new Date();

    const query = {
        isActive: true,
        $or: [
            { startDate: null },
            { startDate: { $lte: now } }
        ],
        $and: [
            { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
        ]
    };

    // City filtering logic
    if (cityName) {
        // If city is provided, show city-specific sliders + universal sliders
        query.$and.push({
            $or: [
                { city: cityName },
                { city: '' },
                { city: null }
            ]
        });
    } else {
        // If no city, show only universal sliders
        query.$and.push({
            $or: [
                { city: '' },
                { city: null }
            ]
        });
    }

    return await Banner.find(query).sort({ order: 1 });
};

/**
 * Get slider by ID
 */
export const getSliderById = async (id) => {
    const slider = await Banner.findById(id);
    if (!slider) throw new Error('Slider not found');
    return slider;
};

/**
 * Create new slider
 */
export const createSlider = async (data) => {
    // If order is not provided, put it at the end
    if (!data.order) {
        const lastSlider = await Banner.findOne().sort({ order: -1 });
        data.order = lastSlider ? lastSlider.order + 1 : 1;
    }

    const slider = await Banner.create(data);
    return slider;
};

/**
 * Update slider
 */
export const updateSlider = async (id, data) => {
    const slider = await Banner.findByIdAndUpdate(id, data, { new: true });
    if (!slider) throw new Error('Slider not found');
    return slider;
};

/**
 * Delete slider
 */
export const deleteSlider = async (id) => {
    const slider = await Banner.findById(id);
    if (!slider) throw new Error('Slider not found');

    // Delete image from Cloudinary if generic implementation allows
    // Assuming generic implementation doesn't store publicId in model based on reviewed code,
    // but if we updated the model to store publicId it would be better.
    // For now, we'll just delete the record. 
    // TODO: Check if Banner model has publicId support (Review showed it didn't, just 'image' string).
    // Ideally we should extract publicId from URL if possible or update model.

    await Banner.findByIdAndDelete(id);
    return true;
};
