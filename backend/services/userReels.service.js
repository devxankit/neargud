import Reel from '../models/Reel.model.js';

/**
 * Get all active reels for users (public API)
 * @param {Object} filters - { page, limit, sortBy, sortOrder }
 * @returns {Promise<Object>} { reels, total, page, totalPages }
 */
export const getActiveReelsForUsers = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Only get active reels
    const query = { status: 'active' };
    if (filters.vendorId) {
      query.vendorId = filters.vendorId;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [reels, total] = await Promise.all([
      Reel.find(query)
        .populate('productId', 'name price image')
        .populate('vendorId', 'businessName storeName storeLogo')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Reel.countDocuments(query),
    ]);

    // Add productName, productPrice, vendorName, and vendorLogo to each reel
    const enrichedReels = reels.map(reel => ({
      ...reel,
      productName: reel.productId?.name || '',
      productPrice: reel.productId?.price || 0,
      vendorName: reel.vendorId?.businessName || reel.vendorId?.storeName || '',
      vendorLogo: reel.vendorId?.storeLogo || null,
      vendorId: reel.vendorId?._id || reel.vendorId,
      thumbnail: reel.thumbnail || reel.productId?.image || null,
    }));

    const totalPages = Math.ceil(total / parseInt(limit));

    return {
      reels: enrichedReels,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get single active reel by ID for users (public API)
 * @param {String} reelId - Reel ID
 * @returns {Promise<Object>} Reel object
 */
export const getReelByIdForUser = async (reelId) => {
  try {
    const reel = await Reel.findOne({
      _id: reelId,
      status: 'active'
    })
      .populate('productId', 'name price image')
      .populate('vendorId', 'businessName storeName storeLogo')
      .lean();

    if (!reel) {
      const err = new Error('Reel not found');
      err.status = 404;
      throw err;
    }

    return {
      ...reel,
      productName: reel.productId?.name || '',
      productPrice: reel.productId?.price || 0,
      vendorName: reel.vendorId?.businessName || reel.vendorId?.storeName || '',
      vendorLogo: reel.vendorId?.storeLogo || null,
      vendorId: reel.vendorId?._id || reel.vendorId,
      thumbnail: reel.thumbnail || reel.productId?.image || null,
    };
  } catch (error) {
    throw error;
  }
};
