import DeliveryWallet from '../models/DeliveryWallet.model.js';
import WithdrawalRequest from '../models/WithdrawalRequest.model.js';
import DeliveryWalletTransaction from '../models/DeliveryWalletTransaction.model.js';
import mongoose from 'mongoose';

class DeliveryWalletService {
    /**
     * Get or create a wallet for a delivery partner
     */
    async getOrCreateWallet(deliveryPartnerId) {
        let wallet = await DeliveryWallet.findOne({ deliveryPartnerId });
        if (!wallet) {
            wallet = await DeliveryWallet.create({
                deliveryPartnerId,
                balance: 0,
                pendingBalance: 0,
                totalWithdrawn: 0
            });
        }
        return wallet;
    }

    /**
     * Credit delivery wallet (e.g., from order delivery)
     */
    async creditWallet(deliveryPartnerId, amount, description, referenceId, referenceType = 'order') {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const wallet = await this.getOrCreateWallet(deliveryPartnerId);
            const balanceBefore = wallet.balance;
            wallet.balance += amount;
            await wallet.save({ session });

            await DeliveryWalletTransaction.create([{
                deliveryPartnerId,
                type: 'earning', // Changed from 'credit' to match enum in model
                amount,
                balanceBefore,
                balanceAfter: wallet.balance,
                description,
                referenceId,
                referenceType,
                status: 'completed'
            }], { session });

            await session.commitTransaction();
            return wallet;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Request withdrawal (full balance only)
     */
    async requestWithdrawal(deliveryPartnerId) {
        const wallet = await this.getOrCreateWallet(deliveryPartnerId);
        if (wallet.balance <= 0) {
            throw new Error('Insufficient balance for withdrawal');
        }

        // Check if there's already a pending request
        const pendingRequest = await WithdrawalRequest.findOne({ deliveryPartnerId, status: 'pending' });
        if (pendingRequest) {
            throw new Error('You already have a pending withdrawal request');
        }

        const amount = wallet.balance;

        const request = await WithdrawalRequest.create({
            deliveryPartnerId,
            userType: 'delivery_partner',
            amount,
            status: 'pending',
        });

        return request;
    }

    /**
     * Approve withdrawal request (Admin)
     */
    async approveWithdrawal(requestId, adminId, notes, transactionId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const request = await WithdrawalRequest.findById(requestId).session(session);
            if (!request) throw new Error('Withdrawal request not found');
            if (request.status !== 'pending') throw new Error('Request already processed');

            const wallet = await DeliveryWallet.findOne({ deliveryPartnerId: request.deliveryPartnerId }).session(session);
            if (!wallet) throw new Error('Delivery wallet not found');
            if (wallet.balance < request.amount) throw new Error('Insufficient wallet balance');

            const balanceBefore = wallet.balance;
            wallet.balance -= request.amount;
            wallet.totalWithdrawn += request.amount;
            wallet.lastWithdrawalDate = new Date();
            await wallet.save({ session });

            // Record transaction
            await DeliveryWalletTransaction.create([{
                deliveryPartnerId: request.deliveryPartnerId,
                type: 'withdrawal',
                amount: request.amount,
                balanceBefore,
                balanceAfter: wallet.balance,
                description: `Withdrawal approved: ${transactionId || 'N/A'}`,
                referenceId: request._id,
                referenceType: 'WithdrawalRequest', // Matches enum
                status: 'completed'
            }], { session });

            // Update request
            request.status = 'approved';
            request.processedAt = new Date();
            request.processedBy = adminId;
            request.adminNotes = notes;
            request.transactionId = transactionId;
            await request.save({ session });

            await session.commitTransaction();
            return request;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Reject withdrawal request (Admin)
     */
    async rejectWithdrawal(requestId, adminId, reason) {
        const request = await WithdrawalRequest.findById(requestId);
        if (!request) throw new Error('Withdrawal request not found');
        if (request.status !== 'pending') throw new Error('Request already processed');

        request.status = 'rejected';
        request.processedAt = new Date();
        request.processedBy = adminId;
        request.rejectionReason = reason;
        await request.save();

        return request;
    }

    /**
     * Get withdrawal history for a delivery partner
     */
    async getPartnerWithdrawals(deliveryPartnerId, status = null) {
        const query = { deliveryPartnerId, userType: 'delivery_partner' };
        if (status) query.status = status;
        return await WithdrawalRequest.find(query).sort({ requestedAt: -1 });
    }

    /**
     * Get transaction history for a delivery partner
     */
    async getPartnerTransactions(deliveryPartnerId) {
        return await DeliveryWalletTransaction.find({ deliveryPartnerId }).sort({ createdAt: -1 });
    }

    /**
     * Get all pending withdrawals (Admin)
     */
    async getPendingWithdrawals() {
        return await WithdrawalRequest.find({ status: 'pending', userType: 'delivery_partner' })
            .populate('deliveryPartnerId', 'firstName lastName email phone')
            .sort({ requestedAt: 1 });
    }

    /**
     * Get withdrawal reports (Admin)
     */
    async getWithdrawalReports(filters = {}) {
        const query = { userType: 'delivery_partner' };
        if (filters.status) query.status = filters.status;
        if (filters.startDate && filters.endDate) {
            query.requestedAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
        }
        if (filters.deliveryPartnerId) query.deliveryPartnerId = filters.deliveryPartnerId;

        return await WithdrawalRequest.find(query)
            .populate('deliveryPartnerId', 'firstName lastName email phone')
            .sort({ requestedAt: -1 });
    }

    /**
     * Get wallet dashboard stats (Admin)
     */
    async getAdminStats() {
        const totalWithdrawn = await WithdrawalRequest.aggregate([
            { $match: { status: 'approved', userType: 'delivery_partner' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const pendingCount = await WithdrawalRequest.countDocuments({ status: 'pending', userType: 'delivery_partner' });
        const processedToday = await WithdrawalRequest.countDocuments({
            status: { $in: ['approved', 'rejected'] },
            userType: 'delivery_partner',
            processedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        return {
            totalWithdrawn: totalWithdrawn[0]?.total || 0,
            pendingCount,
            processedToday
        };
    }

    /**
     * Get all delivery wallets (Admin)
     */
    async getAllPartnerWallets() {
        return await DeliveryWallet.find()
            .populate('deliveryPartnerId', 'firstName lastName email phone')
            .sort({ balance: -1 });
    }

    /**
     * Get specific delivery wallet (Admin)
     */
    async getPartnerWallet(deliveryPartnerId) {
        return await this.getOrCreateWallet(deliveryPartnerId);
    }
}

export default new DeliveryWalletService();
