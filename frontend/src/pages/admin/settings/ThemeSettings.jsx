import { useState, useEffect } from 'react';
import { FiSave, FiImage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import toast from 'react-hot-toast';

const ThemeSettings = () => {
    const { settings, updateSettings, initialize } = useSettingsStore();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (settings && settings.theme) {
            setFormData({
                ...settings.theme,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSettings('theme', formData);
            toast.success('Theme settings updated successfully');
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
                            Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                name="primaryColor"
                                value={formData.primaryColor || '#10B981'}
                                onChange={handleChange}
                                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="primaryColor"
                                value={formData.primaryColor || '#10B981'}
                                onChange={handleChange}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Secondary Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                name="secondaryColor"
                                value={formData.secondaryColor || '#3B82F6'}
                                onChange={handleChange}
                                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="secondaryColor"
                                value={formData.secondaryColor || '#3B82F6'}
                                onChange={handleChange}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Accent Color
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                name="accentColor"
                                value={formData.accentColor || '#FFE11B'}
                                onChange={handleChange}
                                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="accentColor"
                                value={formData.accentColor || '#FFE11B'}
                                onChange={handleChange}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Font Family
                        </label>
                        <AnimatedSelect
                            name="fontFamily"
                            value={formData.fontFamily || 'Inter'}
                            onChange={handleChange}
                            options={[
                                { value: 'Inter', label: 'Inter' },
                                { value: 'Roboto', label: 'Roboto' },
                                { value: 'Open Sans', label: 'Open Sans' },
                                { value: 'Poppins', label: 'Poppins' },
                                { value: 'Lato', label: 'Lato' },
                            ]}
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Color Preview:</p>
                    <div className="flex gap-2">
                        <div className="w-20 h-20 rounded-lg bg-primary-500" style={{ backgroundColor: formData.primaryColor }} />
                        <div className="w-20 h-20 rounded-lg bg-secondary-500" style={{ backgroundColor: formData.secondaryColor }} />
                        <div className="w-20 h-20 rounded-lg bg-accent-500" style={{ backgroundColor: formData.accentColor }} />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold"
                    >
                        <FiSave />
                        Save Theme
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ThemeSettings;
