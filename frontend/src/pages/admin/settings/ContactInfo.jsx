import { useState, useEffect } from 'react';
import { FiSave, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import toast from 'react-hot-toast';

const ContactInfo = () => {
    const { settings, updateSettings, fetchFullSettings } = useSettingsStore();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchFullSettings();
    }, []);

    useEffect(() => {
        if (settings && settings.general) {
            setFormData({
                ...settings.general,
            });
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSocialMediaChange = (platform, value) => {
        setFormData({
            ...formData,
            socialMedia: {
                ...formData.socialMedia,
                [platform]: value,
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSettings('general', formData);
            toast.success('Contact info updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Business Hours
                        </label>
                        <input
                            type="text"
                            name="businessHours"
                            value={formData.businessHours || ''}
                            onChange={handleChange}
                            placeholder="Mon-Fri 9AM-6PM"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Timezone
                        </label>
                        <AnimatedSelect
                            name="timezone"
                            value={formData.timezone || 'UTC'}
                            onChange={handleChange}
                            options={[
                                { value: 'UTC', label: 'UTC' },
                                { value: 'America/New_York', label: 'Eastern Time' },
                                { value: 'America/Chicago', label: 'Central Time' },
                                { value: 'America/Denver', label: 'Mountain Time' },
                                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                                { value: 'Asia/Kolkata', label: 'IST (India)' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Currency
                        </label>
                        <AnimatedSelect
                            name="currency"
                            value={formData.currency || 'INR'}
                            onChange={handleChange}
                            options={[
                                { value: 'INR', label: 'INR (₹)' },
                                { value: 'USD', label: 'USD ($)' },
                                { value: 'EUR', label: 'EUR (€)' },
                                { value: 'GBP', label: 'GBP (£)' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Language
                        </label>
                        <AnimatedSelect
                            name="language"
                            value={formData.language || 'en'}
                            onChange={handleChange}
                            options={[
                                { value: 'en', label: 'English' },
                                { value: 'es', label: 'Spanish' },
                                { value: 'fr', label: 'French' },
                            ]}
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Facebook
                            </label>
                            <input
                                type="url"
                                value={formData.socialMedia?.facebook || ''}
                                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                                placeholder="https://facebook.com/yourpage"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Instagram
                            </label>
                            <input
                                type="url"
                                value={formData.socialMedia?.instagram || ''}
                                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                                placeholder="https://instagram.com/yourpage"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold"
                    >
                        <FiSave />
                        Save Contact Info
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ContactInfo;
