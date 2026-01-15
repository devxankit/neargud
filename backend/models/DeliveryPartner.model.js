import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deliveryPartnerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        vehicleType: {
            type: String,
            enum: ['Bike', 'Scooter', 'Car', 'Van', 'Truck'],
            default: 'Bike',
        },
        vehicleNumber: {
            type: String,
            required: [true, 'Vehicle number is required'],
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
        },
        city: {
            type: String,
            required: [true, 'City is required'],
        },
        state: {
            type: String,
            required: [true, 'State is required'],
        },
        zipcode: {
            type: String,
            required: [true, 'Zipcode is required'],
        },
        avatar: {
            type: String,
            default: null,
        },
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        status: {
            type: String,
            enum: ['available', 'busy', 'offline', 'pending', 'suspended'],
            default: 'pending',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isAccountVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            default: 'delivery_partner',
        },
        documents: {
            idProof: String,
            drivingLicense: String,
            vehicleRC: String
        }
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
deliveryPartnerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
deliveryPartnerSchema.methods.comparePassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

export default DeliveryPartner;
