import * as pickupLocationService from '../../services/pickupLocation.service.js';
import Vendor from '../../models/Vendor.model.js';

export const createLocation = async (req, res, next) => {
    try {
        const vendorId = req.user.vendorId || req.user.id;
        const location = await pickupLocationService.createPickupLocation(vendorId, req.body);
        res.status(201).json({
            success: true,
            message: 'Pickup location created successfully',
            data: location
        });
    } catch (error) {
        next(error);
    }
};

export const getLocations = async (req, res, next) => {
    try {
        const vendorId = req.user.vendorId || req.user.id;
        let locations = await pickupLocationService.getVendorPickupLocations(vendorId);

        // If no locations exist, seed from vendor profile
        if (locations.length === 0) {
            const vendor = await Vendor.findById(vendorId);
            if (vendor && vendor.address && vendor.address.street) {
                const defaultLoc = {
                    name: 'Main Store',
                    address: {
                        street: vendor.address.street,
                        city: vendor.address.city,
                        state: vendor.address.state || '',
                        zipCode: vendor.address.zipCode || '',
                        country: vendor.address.country || 'India'
                    },
                    phone: vendor.phone || '',
                    email: vendor.email || '',
                    isDefault: true,
                    isActive: true
                };
                await pickupLocationService.createPickupLocation(vendorId, defaultLoc);
                locations = await pickupLocationService.getVendorPickupLocations(vendorId);
            }
        }

        res.status(200).json({
            success: true,
            data: locations
        });
    } catch (error) {
        next(error);
    }
};

export const updateLocation = async (req, res, next) => {
    try {
        const vendorId = req.user.vendorId || req.user.id;
        const location = await pickupLocationService.updatePickupLocation(req.params.id, vendorId, req.body);
        res.status(200).json({
            success: true,
            message: 'Pickup location updated successfully',
            data: location
        });
    } catch (error) {
        next(error);
    }
};

export const deleteLocation = async (req, res, next) => {
    try {
        const vendorId = req.user.vendorId || req.user.id;
        await pickupLocationService.deletePickupLocation(req.params.id, vendorId);
        res.status(200).json({
            success: true,
            message: 'Pickup location deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
