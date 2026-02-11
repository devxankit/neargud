import mongoose from 'mongoose';
import WithdrawalRequest from './models/WithdrawalRequest.model.js';
import dotenv from 'dotenv';

dotenv.config();

const debugWithdrawals = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const requests = await WithdrawalRequest.find({}).populate('deliveryPartnerId vendorId');
        console.log('Total Requests:', requests.length);

        requests.forEach((req, idx) => {
            console.log(`\n--- Request #${idx + 1} ---`);
            console.log('ID:', req._id);
            console.log('Amount:', req.amount);
            console.log('Status:', req.status);
            console.log('UserType:', req.userType);
            console.log('Partner:', req.deliveryPartnerId ? `${req.deliveryPartnerId.firstName} ${req.deliveryPartnerId.lastName}` : 'N/A');
            console.log('Vendor:', req.vendorId ? req.vendorId.name : 'N/A');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugWithdrawals();
