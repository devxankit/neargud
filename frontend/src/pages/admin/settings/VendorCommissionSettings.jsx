import { useState, useEffect } from 'react';
import { FiSave, FiPercent } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import toast from 'react-hot-toast';

const VendorCommissionSettings = () => {
    const { settings, updateSettings, fetchFullSettings } = useSettingsStore();
    const [formData, setFormData] = useState({
        defaultCommissionRate: 10
    });

    useEffect(() => {
        fetchFullSettings();
    }, []);

    useEffect(() => {
        if (settings && settings.general) {
            setFormData({
                defaultCommissionRate: settings.general.defaultCommissionRate || 10,
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
            await updateSettings('general', formData);
            toast.success('Commission settings updated successfully');
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
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Global Commission Rate (%) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiPercent className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                type="number"
                                name="defaultCommissionRate"
                                value={formData.defaultCommissionRate || 0}
                                onChange={handleChange}
                                required
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="Enter commission percentage (e.g. 10)"
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 italic">
                            This commission rate applies to <b>all vendors</b> globally. Individual vendor rates are no longer supported.
                        </p>
                    </div>

                    <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-primary-600">
                            <FiPercent className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-primary-900">How it works?</h3>
                            <p className="text-xs text-primary-700 mt-1">
                                If a product is sold for ₹1000 and commission is 10%, Admin gets ₹100 and Vendor gets ₹900.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold"
                    >
                        <FiSave />
                        Save Commission Changes
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default VendorCommissionSettings;
