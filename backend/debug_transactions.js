import mongoose from 'mongoose';
import DeliveryWalletTransaction from './models/DeliveryWalletTransaction.model.js';
import DeliveryPartner from './models/DeliveryPartner.model.js';
import dotenv from 'dotenv';

dotenv.config();

const debugTransactions = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const transactions = await DeliveryWalletTransaction.find({ type: 'withdrawal' });
        console.log('All Withdrawal Transactions:', transactions.length);

        for (const tx of transactions) {
            const partner = await DeliveryPartner.findById(tx.deliveryPartnerId);
            console.log(`\n--- Transaction ---`);
            console.log('ID:', tx._id);
            console.log('Amount:', tx.amount);
            console.log('Status:', tx.status);
            console.log('Partner:', partner ? `${partner.firstName} ${partner.lastName}` : 'N/A');
            console.log('Description:', tx.description);
        };

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugTransactions();
