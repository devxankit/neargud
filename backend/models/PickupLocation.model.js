import mongoose from 'mongoose';

const pickupLocationSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Vendor ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Location name is required'],
            trim: true,
        },
        address: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, trim: true },
            zipCode: { type: String, trim: true },
            country: { type: String, default: 'India' },
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        operatingHours: {
            monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
            tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
            wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
            thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
            friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
            saturday: { open: { type: String, default: '10:00' }, close: { type: String, default: '16:00' }, closed: { type: Boolean, default: false } },
            sunday: { open: { type: String, default: '10:00' }, close: { type: String, default: '16:00' }, closed: { type: Boolean, default: true } },
        },
    },
    {
        timestamps: true,
    }
);

// If isDefault is set to true, unset other default locations for the same vendor
pickupLocationSchema.pre('save', async function (next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { vendorId: this.vendorId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

const PickupLocation = mongoose.model('PickupLocation', pickupLocationSchema);

export default PickupLocation;
