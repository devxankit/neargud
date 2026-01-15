import api from '../utils/api';

// City APIs
export const fetchCities = async (params) => {
    const response = await api.get('/admin/locations/cities', { params });
    return response.data;
};

export const createCity = async (data) => {
    const response = await api.post('/admin/locations/cities', data);
    return response.data;
};

export const updateCity = async (id, data) => {
    const response = await api.put(`/admin/locations/cities/${id}`, data);
    return response.data;
};

export const deleteCity = async (id) => {
    const response = await api.delete(`/admin/locations/cities/${id}`);
    return response.data;
};

// Zipcode APIs
export const fetchZipcodes = async (params) => {
    const response = await api.get('/admin/locations/zipcodes', { params });
    return response.data;
};

export const createZipcode = async (data) => {
    const response = await api.post('/admin/locations/zipcodes', data);
    return response.data;
};

export const updateZipcode = async (id, data) => {
    const response = await api.put(`/admin/locations/zipcodes/${id}`, data);
    return response.data;
};

export const deleteZipcode = async (id) => {
    const response = await api.delete(`/admin/locations/zipcodes/${id}`);
    return response.data;
};
