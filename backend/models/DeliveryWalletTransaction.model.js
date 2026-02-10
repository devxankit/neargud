import mongoose from 'mongoose';

const deliveryWalletTransactionSchema = new mongoose.Schema(
    {
        deliveryPartnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryPartner',
            required: true,
        },
        type: {
            type: String,
            enum: ['earning', 'withdrawal', 'adjustment'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        balanceBefore: {
            type: Number,
            required: true,
        },
        balanceAfter: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'referenceType',
            default: null,
        },
        referenceType: {
            type: String,
            enum: ['Order', 'WithdrawalRequest', 'Manual'],
            default: 'Manual',
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed',
        }
    },
    {
        timestamps: true,
    }
);

deliveryWalletTransactionSchema.index({ deliveryPartnerId: 1, createdAt: -1 });

const DeliveryWalletTransaction = mongoose.model('DeliveryWalletTransaction', deliveryWalletTransactionSchema);

export default DeliveryWalletTransaction;
