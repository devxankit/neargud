
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { loginVendor } from './services/vendorAuth.service.js';

dotenv.config();

const testServiceLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'email-vendor@gmail.com';
        const password = '123';

        console.log(`Testing loginVendor with ${email} and ${password}...`);
        const result = await loginVendor(email, password);
        console.log('Login successful!');
        console.log('Result:', JSON.stringify({
            vendorId: result.vendor._id,
            email: result.vendor.email,
            tokenPresent: !!result.token
        }, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Login failed:', error.message);
        if (error.statusCode) console.error('Status Code:', error.statusCode);
    }
};

testServiceLogin();
