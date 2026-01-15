import api from '../utils/api';

/**
 * Vendor Shipping API Service
 */

// Zones
export const fetchShippingZones = async () => {
    const response = await api.get('/vendor/shipping/zones');
    return response.data;
};

export const createShippingZone = async (zoneData) => {
    const response = await api.post('/vendor/shipping/zones', zoneData);
    return response.data;
};

export const updateShippingZone = async (id, zoneData) => {
    const response = await api.put(`/vendor/shipping/zones/${id}`, zoneData);
    return response.data;
};

export const deleteShippingZone = async (id) => {
    const response = await api.delete(`/vendor/shipping/zones/${id}`);
    return response.data;
};

// Rates
export const fetchShippingRates = async () => {
    const response = await api.get('/vendor/shipping/rates');
    return response.data;
};

export const createShippingRate = async (rateData) => {
    const response = await api.post('/vendor/shipping/rates', rateData);
    return response.data;
};

export const updateShippingRate = async (id, rateData) => {
    const response = await api.put(`/vendor/shipping/rates/${id}`, rateData);
    return response.data;
};

export const deleteShippingRate = async (id) => {
    const response = await api.delete(`/vendor/shipping/rates/${id}`);
    return response.data;
};
