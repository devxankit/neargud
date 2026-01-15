import mongoose from 'mongoose';

const adminBroadcastSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        target: {
            type: String,
            required: true,
            enum: ['all', 'users', 'vendors', 'delivery_partners', 'admins', 'specific'],
        },
        recipientCount: {
            type: Number,
            default: 0,
        },
        actionUrl: {
            type: String,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        type: {
            type: String,
            default: 'custom',
        }
    },
    {
        timestamps: true,
    }
);

const AdminBroadcast = mongoose.model('AdminBroadcast', adminBroadcastSchema);

export default AdminBroadcast;
