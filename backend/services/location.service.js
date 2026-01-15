import City from '../models/City.model.js';
import Zipcode from '../models/Zipcode.model.js';

// --- City Services ---

export const createCity = async (data) => {
    const existingCity = await City.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
    if (existingCity) {
        throw new Error('City with this name already exists');
    }
    return await City.create(data);
};

export const getAllCities = async (query = {}) => {
    const { status } = query;
    const filter = {};
    if (status) filter.isActive = status === 'active';

    return await City.find(filter).sort({ name: 1 });
};

export const updateCity = async (id, data) => {
    // If name is being updated, check for duplicates (excluding current city)
    if (data.name) {
        const existingCity = await City.findOne({
            name: { $regex: new RegExp(`^${data.name}$`, 'i') },
            _id: { $ne: id }
        });
        if (existingCity) {
            throw new Error('City with this name already exists');
        }
    }
    return await City.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCity = async (id) => {
    // Check if any zipcodes utilize this city
    const zipcodes = await Zipcode.countDocuments({ city: id });
    if (zipcodes > 0) {
        throw new Error('Cannot delete city. It has associated zipcodes.');
    }
    return await City.findByIdAndDelete(id);
};

// --- Zipcode Services ---

export const createZipcode = async (data) => {
    const existingZip = await Zipcode.findOne({ code: data.code });
    if (existingZip) {
        throw new Error('Zipcode already exists');
    }
    return await Zipcode.create(data);
};

export const getAllZipcodes = async (query = {}) => {
    const { cityId, status, search } = query;
    const filter = {};

    if (cityId) filter.city = cityId;
    if (status) filter.isActive = status === 'active';
    if (search) filter.code = { $regex: search, $options: 'i' };

    return await Zipcode.find(filter)
        .populate('city', 'name state')
        .sort({ code: 1 });
};

export const updateZipcode = async (id, data) => {
    if (data.code) {
        const existingZip = await Zipcode.findOne({
            code: data.code,
            _id: { $ne: id }
        });
        if (existingZip) {
            throw new Error('Zipcode already exists');
        }
    }
    return await Zipcode.findByIdAndUpdate(id, data, { new: true }).populate('city', 'name state');
};

export const deleteZipcode = async (id) => {
    return await Zipcode.findByIdAndDelete(id);
};
