import api from '../../../utils/api';

export const pickupLocationService = {
    getLocations: async () => {
        const response = await api.get('/vendor/pickup-locations');
        return response; // api.js interceptor already returns response.data (the JSON body)
    },

    createLocation: async (data) => {
        const response = await api.post('/vendor/pickup-locations', data);
        return response;
    },

    updateLocation: async (id, data) => {
        const response = await api.put(`/vendor/pickup-locations/${id}`, data);
        return response;
    },

    deleteLocation: async (id) => {
        const response = await api.delete(`/vendor/pickup-locations/${id}`);
        return response;
    }
};
