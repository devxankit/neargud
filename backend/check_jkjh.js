
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neargud';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const p = await Product.findOne({ name: /jkjh/i });
        if (p) {
            console.log('Product found:');
            console.log(JSON.stringify(p, null, 2));
        } else {
            console.log('Product jkjh not found');
            const all = await Product.find().limit(5).select('name vendorId');
            console.log('Sample products:', all);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
