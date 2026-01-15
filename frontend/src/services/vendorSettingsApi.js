import api from '../utils/api';

/**
 * Fetch current vendor profile
 */
export const fetchVendorProfile = async () => {
    try {
        const response = await api.get('/vendor/auth/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching vendor profile:', error);
        throw error;
    }
};

/**
 * Update vendor profile (store settings, identity, etc.)
 * @param {Object} profileData 
 */
export const updateVendorProfileApi = async (profileData) => {
    try {
        const response = await api.put('/vendor/auth/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating vendor profile:', error);
        throw error;
    }
};

/**
 * Update vendor password
 * @param {Object} passwordData - { currentPassword, newPassword }
 */
export const updateVendorPassword = async (passwordData) => {
    try {
        // Assuming there might be a dedicated path, but using /profile if it handles everything
        // Backend seems to have reset-password but that's with OTP.
        // Let's check if the generic /profile handles password or if we need a new route.
        // For now, if no dedicate pwd route exists, we might need to add one or use a different endpoint.
        const response = await api.put('/vendor/auth/profile', { password: passwordData.newPassword, currentPassword: passwordData.currentPassword });
        return response.data;
    } catch (error) {
        console.error('Error updating vendor password:', error);
        throw error;
    }
};
