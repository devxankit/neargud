import { getActiveSliders } from '../../services/sliders.service.js';

/**
 * Get all active sliders (public endpoint)
 * GET /api/public/hero-banners/active?city=CityName
 */
export const getPublicSliders = async (req, res, next) => {
  try {
    const { city } = req.query;

    // Only return active sliders for public endpoint, filtered by city if provided
    const sliders = await getActiveSliders(city);

    res.status(200).json({
      success: true,
      message: 'Sliders retrieved successfully',
      data: { banners: sliders }, // Changed 'sliders' to 'banners' to match frontend expectation
    });
  } catch (error) {
    next(error);
  }
};

