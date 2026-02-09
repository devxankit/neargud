import Banner from '../models/Banner.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.util.js';

/**
 * Get active banners for rotation
 * Now fetches directly from the Banner model without booking flow
 */
export const getActiveBanners = async (cityName, categoryId = null) => {
  const now = new Date();

  // Base conditions for active banners
  const query = {
    type: { $in: ['hero', 'promotional'] }, // Allow both hero and promotional in active list
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
    ]
  };

  // If categoryId is provided, we prioritize category banners
  if (categoryId) {
    const categoryQuery = {
      ...query,
      categoryId: categoryId
    };
    const catBanners = await Banner.find(categoryQuery).sort({ order: 1 });
    if (catBanners.length > 0) {
      return catBanners.map(banner => ({
        id: banner._id,
        image: banner.image,
        link: banner.link,
        title: banner.title,
        subtitle: banner.subtitle
      }));
    }
  }

  // Fallback to normal city/universal logic if no category banners found (or no categoryId provided)
  const baseQuery = { ...query, categoryId: null };

  // 1. First, try to fetch banners specifically for this city
  let banners = [];
  if (cityName) {
    const cityQuery = {
      ...baseQuery,
      city: new RegExp(`^${cityName}$`, 'i')
    };
    banners = await Banner.find(cityQuery).sort({ order: 1 });
  }

  // 2. If no city-specific banners found (or no city provided), fetch universal banners
  if (banners.length === 0) {
    const universalQuery = {
      ...baseQuery,
      $or: [
        { city: '' },
        { city: null }
      ]
    };
    banners = await Banner.find(universalQuery).sort({ order: 1 });
  }

  return banners.map(banner => ({
    id: banner._id,
    image: banner.image,
    link: banner.link,
    title: banner.title,
    subtitle: banner.subtitle
  }));
};

/**
 * Get all unique cities that have active sliders
 * Returns only cities with active banners for the location selector
 */
export const getAvailableCities = async () => {
  const now = new Date();

  const cities = await Banner.distinct('city', {
    type: 'hero',
    isActive: true,
    city: { $ne: '', $ne: null },
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
    ]
  });

  // Filter out empty strings and nulls, then sort alphabetically
  return cities
    .filter(city => city && city.trim() !== '')
    .sort((a, b) => a.localeCompare(b));
};

/**
 * Get all hero banners (Admin)
 */
export const getAllHeroBanners = async () => {
  return await Banner.find({ type: 'hero' }).sort({ order: 1 });
};

/**
 * Create a new hero banner (Admin)
 */
export const createHeroBanner = async (bannerData) => {
  const banner = await Banner.create({
    ...bannerData,
    type: 'hero'
  });
  return banner;
};

/**
 * Update a hero banner (Admin)
 */
export const updateHeroBanner = async (id, bannerData) => {
  const banner = await Banner.findByIdAndUpdate(id, bannerData, { new: true });
  if (!banner) throw new Error('Banner not found');
  return banner;
};

/**
 * Delete a hero banner (Admin)
 */
export const deleteHeroBanner = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw new Error('Banner not found');
  return true;
};

/**
 * Placeholder for settings if needed by legacy code
 */
export const getBannerSettings = async () => {
  return {
    universalDisplayTime: 0
  };
};

// Internal placeholders to prevent controller crashes if still called
// These should eventually be removed along with their routes/controller endpoints
export const getBannerSlots = async () => [];
export const updateSlot = async () => ({});
export const updateBannerSettings = async (data) => data;
export const getBookingById = async () => null;
export const getAllBookings = async () => [];
export const approveBooking = async () => ({});
export const rejectBooking = async () => ({});
export const getBannerRevenueStats = async () => ({
  totalRevenue: 0,
  activeBookingsCount: 0
});
export const getBannerTransactions = async () => ({ transactions: [], total: 0 });
export const getVendorBookings = async () => [];
export const getVendorBookingById = async () => null;
export const confirmBookingPayment = async () => ({});
export const createBooking = async () => ({});
export const deleteUnpaidBooking = async () => true;
