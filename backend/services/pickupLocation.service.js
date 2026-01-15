import PickupLocation from '../models/PickupLocation.model.js';

export const createPickupLocation = async (vendorId, data) => {
    return await PickupLocation.create({ ...data, vendorId });
};

export const getVendorPickupLocations = async (vendorId) => {
    return await PickupLocation.find({ vendorId }).sort({ isDefault: -1, createdAt: -1 });
};

export const getPickupLocationById = async (id, vendorId) => {
    const location = await PickupLocation.findOne({ _id: id, vendorId });
    if (!location) {
        throw new Error('Pickup location not found');
    }
    return location;
};

export const updatePickupLocation = async (id, vendorId, data) => {
    const location = await PickupLocation.findOneAndUpdate(
        { _id: id, vendorId },
        data,
        { new: true, runValidators: true }
    );
    if (!location) {
        throw new Error('Pickup location not found');
    }
    return location;
};

export const deletePickupLocation = async (id, vendorId) => {
    const location = await PickupLocation.findOneAndDelete({ _id: id, vendorId });
    if (!location) {
        throw new Error('Pickup location not found');
    }
    return location;
};
