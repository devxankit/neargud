import VendorShippingZone from '../../models/VendorShippingZone.model.js';
import VendorShippingRate from '../../models/VendorShippingRate.model.js';
import { asyncHandler } from '../../middleware/errorHandler.middleware.js';

/**
 * Get all shipping zones for vendor
 */
export const getZones = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const zones = await VendorShippingZone.find({ vendorId });

    res.status(200).json({
        success: true,
        data: zones,
    });
});

/**
 * Create shipping zone
 */
export const createZone = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const { name, countries } = req.body;

    const zone = await VendorShippingZone.create({
        vendorId,
        name,
        countries,
    });

    res.status(201).json({
        success: true,
        data: zone,
    });
});

/**
 * Update shipping zone
 */
export const updateZone = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const { id } = req.params;
    const { name, countries } = req.body;

    const zone = await VendorShippingZone.findOneAndUpdate(
        { _id: id, vendorId },
        { name, countries },
        { new: true, runValidators: true }
    );

    if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    res.status(200).json({
        success: true,
        data: zone,
    });
});

/**
 * Delete shipping zone
 */
export const deleteZone = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const { id } = req.params;

    const zone = await VendorShippingZone.findOneAndDelete({ _id: id, vendorId });

    if (!zone) {
        return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    // Also delete associated rates
    await VendorShippingRate.deleteMany({ zoneId: id, vendorId });

    res.status(200).json({
        success: true,
        message: 'Zone and associated rates deleted successfully',
    });
});

/**
 * Get all shipping rates for vendor
 */
export const getRates = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const rates = await VendorShippingRate.find({ vendorId }).populate('zoneId', 'name');

    // Transform to match front-end expectations if needed
    const transformedRates = rates.map(rate => ({
        ...rate.toObject(),
        id: rate._id,
        zoneName: rate.zoneId?.name || 'Unknown Zone'
    }));

    res.status(200).json({
        success: true,
        data: transformedRates,
    });
});

/**
 * Create shipping rate
 */
export const createRate = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const { zoneId, name, rate, freeShippingThreshold } = req.body;

    const shippingRate = await VendorShippingRate.create({
        vendorId,
        zoneId,
        name,
        rate,
        freeShippingThreshold,
    });

    res.status(201).json({
        success: true,
        data: shippingRate,
    });
});

/**
 * Update shipping rate
 */
export const updateRate = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const { id } = req.params;
    const { zoneId, name, rate, freeShippingThreshold } = req.body;

    const shippingRate = await VendorShippingRate.findOneAndUpdate(
        { _id: id, vendorId },
        { zoneId, name, rate, freeShippingThreshold },
        { new: true, runValidators: true }
    );

    if (!shippingRate) {
        return res.status(404).json({ success: false, message: 'Rate not found' });
    }

    res.status(200).json({
        success: true,
        data: shippingRate,
    });
});

/**
 * Delete shipping rate
 */
export const deleteRate = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorId || req.user.id;
    const { id } = req.params;

    const shippingRate = await VendorShippingRate.findOneAndDelete({ _id: id, vendorId });

    if (!shippingRate) {
        return res.status(404).json({ success: false, message: 'Rate not found' });
    }

    res.status(200).json({
        success: true,
        message: 'Rate deleted successfully',
    });
});
