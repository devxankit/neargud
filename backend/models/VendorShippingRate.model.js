import mongoose from 'mongoose';

const vendorShippingRateSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        zoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VendorShippingZone',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Method name is required'],
            trim: true,
        },
        rate: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        freeShippingThreshold: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const VendorShippingRate = mongoose.model('VendorShippingRate', vendorShippingRateSchema);

export default VendorShippingRate;
