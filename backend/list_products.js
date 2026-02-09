
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const ps = await Product.find().select('_id name vendorId');
        console.log('Total products:', ps.length);
        ps.forEach(p => {
            console.log(`ID: ${p._id}, Name: ${p.name}, Vendor: ${p.vendorId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
