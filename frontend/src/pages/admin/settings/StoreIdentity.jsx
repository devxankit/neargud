import { useState, useEffect } from 'react';
import { FiSave, FiImage, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import toast from 'react-hot-toast';

const StoreIdentity = () => {
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const name = e.target.name;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, [name]: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSettings('general', formData);
            toast.success('Store identity updated successfully');
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
                            Store Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="storeName"
                            value={formData.storeName || ''}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Store Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                {formData.storeLogo ? (
                                    <img src={formData.storeLogo} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <FiImage className="text-gray-400 text-2xl" />
                                )}
                            </div>
                            <label className="flex-1">
                                <div className="relative cursor-pointer px-4 py-2 border border-primary-600 rounded-lg text-primary-600 font-semibold hover:bg-primary-50 transition-colors text-center text-sm">
                                    Choose Logo
                                    <input
                                        type="file"
                                        name="storeLogo"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Favicon
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                {formData.favicon ? (
                                    <img src={formData.favicon} alt="Favicon" className="w-full h-full object-contain" />
                                ) : (
                                    <FiImage className="text-gray-400 text-xl" />
                                )}
                            </div>
                            <label className="flex-1">
                                <div className="relative cursor-pointer px-4 py-2 border border-primary-600 rounded-lg text-primary-600 font-semibold hover:bg-primary-50 transition-colors text-center text-sm">
                                    Choose Favicon
                                    <input
                                        type="file"
                                        name="favicon"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Store Description
                        </label>
                        <textarea
                            name="storeDescription"
                            value={formData.storeDescription || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Brief description of your store"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold"
                    >
                        <FiSave />
                        Save Identity
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default StoreIdentity;
