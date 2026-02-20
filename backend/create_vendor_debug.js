
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Vendor from './models/Vendor.model.js';

dotenv.config();

const createVendor = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'email-vendor@gmail.com';
        const password = '123';

        // Check if exists
        let vendor = await Vendor.findOne({ email });
        if (vendor) {
            console.log('Vendor already exists. Updating status and password...');
        } else {
            console.log('Creating new vendor...');
            vendor = new Vendor({
                email,
                name: 'Test Vendor',
                storeName: 'Test Store',
                phone: '1234567890',
                businessLicenseNumber: 'BL12345',
                panCardNumber: 'ABCDE1234F',
                role: 'vendor',
                isEmailVerified: true,
                isActive: true
            });
        }

        const salt = await bcrypt.genSalt(10);
        vendor.password = await bcrypt.hash(password, salt);
        vendor.status = 'approved';
        vendor.isActive = true;

        await vendor.save();
        console.log(`Vendor ${email} created/updated successfully with password 123 and status approved.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('ERROR:', error);
    }
};

createVendor();
