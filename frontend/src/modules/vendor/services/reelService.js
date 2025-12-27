import {
    getVendorReels as localGetVendorReels,
    getReelById as localGetReelById,
    addVendorReel as localAddVendorReel,
    updateVendorReel as localUpdateVendorReel,
    deleteVendorReel as localDeleteVendorReel
} from "../../../utils/reelHelpers";

// Mock API delay to simulate network request
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all reels for vendor
 * @param {Object} filters - { search, status, page, limit, sortBy, sortOrder }
 * @returns {Promise<Object>} { reels, pagination }
 */
export const getVendorReels = async (filters = {}) => {
    await delay(500);
    const vendorId = filters.vendorId || 1; // Default to vendor 1 if not specified
    const reels = localGetVendorReels(vendorId);
    return {
        success: true,
        data: { reels },
        pagination: { total: reels.length, page: 1, limit: 100 }
    };
};

/**
 * Get reel by ID
 * @param {String} reelId - Reel ID
 * @returns {Promise<Object>} Reel object
 */
export const getVendorReelById = async (reelId) => {
    await delay(300);
    const reel = localGetReelById(reelId);
    return reel;
};

/**
 * Create new reel
 * @param {Object} reelData - Reel data
 * @returns {Promise<Object>} Created reel
 */
export const createVendorReel = async (reelData) => {
    await delay(800);
    const reel = localAddVendorReel(reelData);
    return reel;
};

/**
 * Update reel
 * @param {String} reelId - Reel ID
 * @param {Object} reelData - Update data
 * @returns {Promise<Object>} Updated reel
 */
export const updateVendorReel = async (reelId, reelData) => {
    await delay(500);
    const reel = localUpdateVendorReel(reelId, reelData);
    return reel;
};

/**
 * Delete reel
 * @param {String} reelId - Reel ID
 * @returns {Promise<void>}
 */
export const deleteVendorReel = async (reelId) => {
    await delay(500);
    localDeleteVendorReel(reelId);
};

/**
 * Update reel status
 * @param {String} reelId - Reel ID
 * @param {String} status - New status
 * @returns {Promise<Object>} Updated reel
 */
export const updateVendorReelStatus = async (reelId, status) => {
    await delay(300);
    const reel = localUpdateVendorReel(reelId, { status });
    return reel;
};
