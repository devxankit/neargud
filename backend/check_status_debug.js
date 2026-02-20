
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TemporaryRegistration from './models/TemporaryRegistration.model.js';
import Vendor from './models/Vendor.model.js';

dotenv.config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'email-vendor@gmail.com';
        console.log(`Checking status for ${email}`);

        const vendor = await Vendor.findOne({ email: email.toLowerCase() });
        if (vendor) {
            console.log('Found in Vendor:', {
                status: vendor.status,
                isActive: vendor.isActive,
                isEmailVerified: vendor.isEmailVerified
            });
        } else {
            console.log('Not found in Vendor');
        }

        const temp = await TemporaryRegistration.findOne({ email: email.toLowerCase() });
        if (temp) {
            console.log('Found in TemporaryRegistration:', {
                registrationType: temp.registrationType,
                isVerified: temp.isVerified,
                expiresAt: temp.expiresAt
            });
        } else {
            console.log('Not found in TemporaryRegistration');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR:', error);
    }
};

checkStatus();
