import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.model.js';

dotenv.config();

const checkAllSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const allSettings = await Settings.find();
        console.log(`Found ${allSettings.length} settings documents.`);
        allSettings.forEach((s, i) => {
            console.log(`Document ${i}: ID=${s._id}, Name=${s.general?.storeName}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAllSettings();
