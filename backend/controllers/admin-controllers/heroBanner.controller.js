import * as heroBannerService from '../../services/heroBanner.service.js';
import { uploadToCloudinary } from '../../utils/cloudinary.util.js';

export const getBanners = async (req, res, next) => {
  try {
    const banners = await heroBannerService.getAllHeroBanners();
    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const bannerData = req.body;

    // Handle image upload if provided in body as base64 or similar, 
    // or if handled by middleware (req.file)
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'hero-banners');
      bannerData.image = uploadResult.secure_url;
    }

    const banner = await heroBannerService.createHeroBanner(bannerData);
    res.status(201).json({
      success: true,
      message: 'Hero banner created successfully',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bannerData = req.body;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'hero-banners');
      bannerData.image = uploadResult.secure_url;
    }

    const banner = await heroBannerService.updateHeroBanner(id, bannerData);
    res.status(200).json({
      success: true,
      message: 'Hero banner updated successfully',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await heroBannerService.deleteHeroBanner(id);
    res.status(200).json({
      success: true,
      message: 'Hero banner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Compatibility exports for legacy routes (to prevent crashes)
export const getSlots = async (req, res) => res.status(200).json({ success: true, data: { slots: [], settings: {} } });
export const updateSlot = async (req, res) => res.status(200).json({ success: true, data: {} });
export const updateSettings = async (req, res) => res.status(200).json({ success: true, data: {} });
export const getBooking = async (req, res) => res.status(404).json({ success: false, message: 'Booking system disabled' });
export const getBookings = async (req, res) => res.status(200).json({ success: true, data: [] });
export const approveBooking = async (req, res) => res.status(200).json({ success: true, data: {} });
export const rejectBooking = async (req, res) => res.status(200).json({ success: true, data: {} });
export const getRevenueStats = async (req, res) => res.status(200).json({ success: true, data: { totalRevenue: 0 } });
export const getTransactions = async (req, res) => res.status(200).json({ success: true, data: { transactions: [], total: 0 } });
