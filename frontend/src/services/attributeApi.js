import api from '../utils/api';

const attributeApi = {
    // --- Attributes ---
    // Get all attributes (global)
    getAllAttributes: async (params = {}) => {
        // params can include { vendorId, ... }
        const response = await api.get('/admin/attributes', { params });
        return response;
    },

    // Get attribute by ID
    getAttributeById: async (id) => {
        const response = await api.get(`/admin/attributes/${id}`);
        return response;
    },

    // Create attribute
    createAttribute: async (data) => {
        const response = await api.post('/admin/attributes', data);
        return response;
    },

    // Update attribute
    updateAttribute: async (id, data) => {
        const response = await api.put(`/admin/attributes/${id}`, data);
        return response;
    },

    // Delete attribute
    deleteAttribute: async (id) => {
        const response = await api.delete(`/admin/attributes/${id}`);
        return response;
    },

    // --- Attribute Sets ---
    // Get all attribute sets
    getAllAttributeSets: async (params = {}) => {
        const response = await api.get('/admin/attribute-sets', { params });
        return response;
    },

    // Get attribute set by ID
    getAttributeSetById: async (id) => {
        const response = await api.get(`/admin/attribute-sets/${id}`);
        return response;
    },

    // Create attribute set
    createAttributeSet: async (data) => {
        const response = await api.post('/admin/attribute-sets', data);
        return response;
    },

    // Update attribute set
    updateAttributeSet: async (id, data) => {
        const response = await api.put(`/admin/attribute-sets/${id}`, data);
        return response;
    },

    // Delete attribute set
    deleteAttributeSet: async (id) => {
        const response = await api.delete(`/admin/attribute-sets/${id}`);
        return response;
    },

    // --- Attribute Values ---
    // Get all attribute values
    getAllAttributeValues: async (params = {}) => {
        // params: { attributeId, search, ... }
        const response = await api.get('/admin/attribute-values', { params });
        return response;
    },

    // Get attribute value by ID
    getAttributeValueById: async (id) => {
        const response = await api.get(`/admin/attribute-values/${id}`);
        return response;
    },

    // Create attribute value
    createAttributeValue: async (data) => {
        const response = await api.post('/admin/attribute-values', data);
        return response;
    },

    // Update attribute value
    updateAttributeValue: async (id, data) => {
        const response = await api.put(`/admin/attribute-values/${id}`, data);
        return response;
    },

    // Delete attribute value
    deleteAttributeValue: async (id) => {
        const response = await api.delete(`/admin/attribute-values/${id}`);
        return response;
    },
};

export default attributeApi;
