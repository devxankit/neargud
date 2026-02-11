import mongoose from 'mongoose';
import DeliveryWalletTransaction from './models/DeliveryWalletTransaction.model.js';
import WithdrawalRequest from './models/WithdrawalRequest.model.js';
import dotenv from 'dotenv';

dotenv.config();

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find pending withdrawal transactions
        const transactions = await DeliveryWalletTransaction.find({ type: 'withdrawal', status: 'pending' });
        console.log(`Found ${transactions.length} pending transactions to move to WithdrawalRequest`);

        for (const tx of transactions) {
            console.log(`Processing tx: ${tx._id}, Amount: ${tx.amount}`);

            // Create formal request
            await WithdrawalRequest.create({
                deliveryPartnerId: tx.deliveryPartnerId,
                userType: 'delivery_partner',
                amount: tx.amount,
                status: 'pending',
                requestedAt: tx.createdAt || new Date()
            });

            // Remove the temporary pending transaction
            await DeliveryWalletTransaction.findByIdAndDelete(tx._id);
            console.log(`Converted transaction ${tx._id} to WithdrawalRequest and deleted original transaction record.`);
        }

        console.log('Data migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixData();
