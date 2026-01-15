import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: [true, 'Content key is required'],
            unique: true,
            trim: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'Content data is required'],
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Content = mongoose.model('Content', contentSchema);

export default Content;
