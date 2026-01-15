import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'City name is required'],
        trim: true,
        unique: true,
    },
    state: {
        type: String,
        required: [true, 'State name is required'],
        trim: true,
    },
    country: {
        type: String,
        required: [true, 'Country name is required'],
        trim: true,
        default: 'India',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const City = mongoose.model('City', citySchema);
export default City;
