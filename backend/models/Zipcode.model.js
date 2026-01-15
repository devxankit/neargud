import mongoose from 'mongoose';

const zipcodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true,
        unique: true,
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: [true, 'City is required'],
    },
    state: {
        type: String,
        required: [true, 'State name is required'],
        trim: true,
    },
    deliveryCharge: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const Zipcode = mongoose.model('Zipcode', zipcodeSchema);
export default Zipcode;
