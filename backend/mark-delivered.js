// Quick test script to mark order as delivered and credit vendor wallet
import mongoose from 'mongoose';
import Order from './models/Order.model.js';
import vendorWalletService from './services/vendorWallet.service.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const markOrderDelivered = async (orderCode) => {
    try {
        await connectDB();
        console.log(`Marking order ${orderCode} as delivered...`);

        const order = await Order.findOne({ orderCode });
        if (!order) {
            console.error('Order not found!');
            process.exit(1);
        }

        console.log('Current status:', order.status);

        // Set delivered status
        const deliveredAt = new Date();
        const returnWindowDays = 7;
        const returnWindowExpiresAt = new Date(deliveredAt);
        returnWindowExpiresAt.setDate(returnWindowExpiresAt.getDate() + returnWindowDays);

        order.status = 'delivered';
        order.tracking = { ...order.tracking, deliveredAt };
        order.returnWindowExpiresAt = returnWindowExpiresAt;
        order.fundsReleased = false;

        // Add to status history
        order.statusHistory.push({
            status: 'delivered',
            changedBy: null,
            changedByRole: 'admin',
            timestamp: new Date(),
            note: 'Test delivery - marked via script'
        });

        await order.save();
        console.log('✅ Order marked as delivered');
        console.log('Return window expires at:', returnWindowExpiresAt);

        // Credit vendor wallets (to pending balance)
        if (order.vendorBreakdown && order.vendorBreakdown.length > 0) {
            console.log('\nCrediting vendor wallets...');
            for (const vb of order.vendorBreakdown) {
                if (vb.vendorId) {
                    const earnings = (vb.subtotal || 0) - (vb.commission || 0);
                    console.log(`Vendor ${vb.vendorName}: ₹${earnings} (Subtotal: ₹${vb.subtotal}, Commission: ₹${vb.commission})`);

                    if (earnings > 0) {
                        await vendorWalletService.creditPendingWallet(
                            vb.vendorId,
                            earnings,
                            `Order #${order.orderCode} settlement (Pending)`,
                            order._id
                        );
                        console.log(`✅ Credited ₹${earnings} to vendor pending wallet`);
                    }
                }
            }
        }

        console.log('\n✅ Done! Now you can use "Release Pending Funds" button in admin panel.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// Usage: node mark-delivered.js ORD-1768458787889-2953
const orderCode = process.argv[2] || 'ORD-1768458787889-2953';
markOrderDelivered(orderCode);
