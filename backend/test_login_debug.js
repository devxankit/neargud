
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './models/Vendor.model.js';
import { comparePassword } from './utils/bcrypt.util.js';

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'vendor@gmail.com';
        const password = '123';

        const vendor = await Vendor.findOne({ email }).select('+password');
        if (!vendor) {
            console.log('Vendor not found');
        } else {
            const isMatch = await comparePassword(password, vendor.password);
            console.log(`Password match for ${email}: ${isMatch}`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR:', error);
    }
};

testLogin();
