import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.model.js';

dotenv.config();

const updateSettings = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database.');

        const settings = await Settings.findOne();
        if (settings) {
            console.log('Found existing settings. Updating...');
            settings.general.storeName = 'Neargud';
            settings.general.storeLogo = '/images/logos/logo.png';
            settings.general.favicon = '/images/logos/logo.png';
            await settings.save();
            console.log('Settings updated successfully.');
        } else {
            console.log('No settings document found. Creating with defaults...');
            await Settings.create({
                general: {
                    storeName: 'Neargud',
                    storeLogo: '/images/logos/logo.png',
                    favicon: '/images/logos/logo.png'
                }
            });
            console.log('Settings created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating settings:', error);
        process.exit(1);
    }
};

updateSettings();
