import api from "../../../utils/api";

/**
 * Get all reels for vendor
 * @param {Object} filters - { search, status, page, limit, sortBy, sortOrder }
 * @returns {Promise<Object>} Response object
 */
export const getVendorReels = async (filters = {}) => {
    const response = await api.get('/vendor/reels', { params: filters });
    return response;
};

/**
 * Get reel by ID
 * @param {String} reelId - Reel ID
 * @returns {Promise<Object>} Reel object
 */
export const getVendorReelById = async (reelId) => {
    const response = await api.get(`/vendor/reels/${reelId}`);
    return response;
};

/**
 * Create new reel
 * @param {FormData} reelData - Reel data (FormData allowed for file upload)
 * @returns {Promise<Object>} Created reel
 */
export const createVendorReel = async (reelData) => {
    // Check if reelData is FormData (for file uploads) or object
    const isFormData = reelData instanceof FormData;

    const config = isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

    const response = await api.post('/vendor/reels', reelData, config);
    return response;
};

/**
 * Update reel
 * @param {String} reelId - Reel ID
 * @param {FormData|Object} reelData - Update data
 * @returns {Promise<Object>} Updated reel
 */
export const updateVendorReel = async (reelId, reelData) => {
    const isFormData = reelData instanceof FormData;

    const config = isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

    const response = await api.put(`/vendor/reels/${reelId}`, reelData, config);
    return response;
};

/**
 * Delete reel
 * @param {String} reelId - Reel ID
 * @returns {Promise<Object>} Response
 */
export const deleteVendorReel = async (reelId) => {
    const response = await api.delete(`/vendor/reels/${reelId}`);
    return response;
};

/**
 * Update reel status
 * @param {String} reelId - Reel ID
 * @param {String} status - New status
 * @returns {Promise<Object>} Updated reel
 */
export const updateVendorReelStatus = async (reelId, status) => {
    const response = await api.patch(`/vendor/reels/${reelId}/status`, { status });
    return response;
};
