import mongoose from 'mongoose';

const deliveryWalletSchema = new mongoose.Schema(
    {
        deliveryPartnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryPartner',
            required: true,
            unique: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
        },
        pendingBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalWithdrawn: {
            type: Number,
            default: 0,
        },
        lastWithdrawalDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const DeliveryWallet = mongoose.model('DeliveryWallet', deliveryWalletSchema);

export default DeliveryWallet;
