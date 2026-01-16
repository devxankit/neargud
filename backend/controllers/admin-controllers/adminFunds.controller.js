import VendorWalletService from '../../services/vendorWallet.service.js';
import Order from '../../models/Order.model.js';
import { asyncHandler } from '../../middleware/errorHandler.middleware.js';
import mongoose from 'mongoose';

/**
 * Manually release pending funds for eligible orders (Admin only)
 * This releases funds for delivered orders where return window has expired
 */
export const releasePendingFunds = asyncHandler(async (req, res) => {
    const now = new Date();

    // Find delivered orders where:
    // 1. Return window has expired, OR
    // 2. Order is delivered but returnWindowExpiresAt is not set (old orders)
    const orders = await Order.find({
        status: 'delivered',
        $or: [
            { returnWindowExpiresAt: { $lte: now } },
            { returnWindowExpiresAt: { $exists: false } }
        ],
        fundsReleased: { $ne: true }
    });

    console.log(`Found ${orders.length} orders eligible for fund release.`);

    let processedCount = 0;
    let totalReleased = 0;
    const errors = [];

    for (const order of orders) {
        // If returnWindowExpiresAt is not set, set it to past date for old orders
        if (!order.returnWindowExpiresAt) {
            order.returnWindowExpiresAt = new Date(Date.now() - 1000); // 1 second ago
        }

        if (!order.vendorBreakdown || order.vendorBreakdown.length === 0) {
            order.fundsReleased = true;
            await order.save();
            continue;
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            for (const vb of order.vendorBreakdown) {
                if (vb.vendorId) {
                    // Calculate earnings: Subtotal - Commission
                    const earnings = (vb.subtotal || 0) - (vb.commission || 0);

                    if (earnings > 0) {
                        // Check wallet state first
                        const wallet = await VendorWalletService.getOrCreateWallet(vb.vendorId);

                        // If pending balance is sufficient, do normal release (Move Pending -> Available)
                        if (wallet.pendingBalance >= earnings) {
                            await VendorWalletService.releasePendingFunds(
                                vb.vendorId,
                                earnings,
                                `Return window expired for Order #${order.orderCode}`,
                                order._id
                            );
                        } else {
                            // If pending balance is NOT sufficient (funds never added to pending), 
                            // directly credit to Available Balance
                            console.log(`Directly crediting wallet for Order #${order.orderCode} (Pending balance insufficient)`);
                            await VendorWalletService.creditWallet(
                                vb.vendorId,
                                earnings,
                                `Order Settlement - Return window expired #${order.orderCode}`,
                                order._id
                            );
                        }
                        totalReleased += earnings;
                    }
                }
            }

            order.fundsReleased = true;
            await order.save({ session });

            await session.commitTransaction();
            processedCount++;
        } catch (err) {
            await session.abortTransaction();
            errors.push({ orderCode: order.orderCode, error: err.message });
        } finally {
            session.endSession();
        }
    }

    res.status(200).json({
        success: true,
        message: `Processed ${processedCount}/${orders.length} orders`,
        data: {
            totalOrders: orders.length,
            processedCount,
            totalReleased,
            errors: errors.length > 0 ? errors : undefined
        }
    });
});
