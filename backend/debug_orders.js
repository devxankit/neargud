import mongoose from 'mongoose';
import Order from './models/Order.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const allOrders = await Order.find({}).select('orderCode paymentMethod paymentStatus total');
        console.log(`Total Orders: ${allOrders.length}`);

        const paymentMethods = await Order.distinct('paymentMethod');
        console.log(`Unique Payment Methods found: ${JSON.stringify(paymentMethods)}`);

        const codOrders = await Order.find({ paymentMethod: { $in: ['cash', 'cod'] } });
        console.log(`Orders with 'cash' or 'cod': ${codOrders.length}`);

        if (codOrders.length > 0) {
            console.log('Sample COD Order:', JSON.stringify(codOrders[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrders();
