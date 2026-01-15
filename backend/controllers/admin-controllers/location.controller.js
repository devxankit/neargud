import {
    createCity,
    getAllCities,
    updateCity,
    deleteCity,
    createZipcode,
    getAllZipcodes,
    updateZipcode,
    deleteZipcode,
} from '../../services/location.service.js';

// --- City Controllers ---

export const getCities = async (req, res, next) => {
    try {
        const cities = await getAllCities(req.query);
        res.status(200).json({ success: true, data: cities });
    } catch (error) {
        next(error);
    }
};

export const addCity = async (req, res, next) => {
    try {
        const city = await createCity(req.body);
        res.status(201).json({ success: true, data: city, message: 'City created successfully' });
    } catch (error) {
        next(error);
    }
};

export const editCity = async (req, res, next) => {
    try {
        const city = await updateCity(req.params.id, req.body);
        if (!city) return res.status(404).json({ success: false, message: 'City not found' });
        res.status(200).json({ success: true, data: city, message: 'City updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const removeCity = async (req, res, next) => {
    try {
        const city = await deleteCity(req.params.id);
        if (!city) return res.status(404).json({ success: false, message: 'City not found' });
        res.status(200).json({ success: true, message: 'City deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// --- Zipcode Controllers ---

export const getZipcodes = async (req, res, next) => {
    try {
        const zipcodes = await getAllZipcodes(req.query);
        res.status(200).json({ success: true, data: zipcodes });
    } catch (error) {
        next(error);
    }
};

export const addZipcode = async (req, res, next) => {
    try {
        const zipcode = await createZipcode(req.body);
        res.status(201).json({ success: true, data: zipcode, message: 'Zipcode created successfully' });
    } catch (error) {
        next(error);
    }
};

export const editZipcode = async (req, res, next) => {
    try {
        const zipcode = await updateZipcode(req.params.id, req.body);
        if (!zipcode) return res.status(404).json({ success: false, message: 'Zipcode not found' });
        res.status(200).json({ success: true, data: zipcode, message: 'Zipcode updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const removeZipcode = async (req, res, next) => {
    try {
        const zipcode = await deleteZipcode(req.params.id);
        if (!zipcode) return res.status(404).json({ success: false, message: 'Zipcode not found' });
        res.status(200).json({ success: true, message: 'Zipcode deleted successfully' });
    } catch (error) {
        next(error);
    }
};
