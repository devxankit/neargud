import mongoose from 'mongoose';

const vendorShippingZoneSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Zone name is required'],
            trim: true,
        },
        countries: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

const VendorShippingZone = mongoose.model('VendorShippingZone', vendorShippingZoneSchema);

export default VendorShippingZone;
