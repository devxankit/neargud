import { useState, useEffect } from 'react';
import { FiSave, FiTruck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import toast from 'react-hot-toast';

const DeliverySettings = () => {
    const { settings, updateSettings, fetchFullSettings } = useSettingsStore();
    const [formData, setFormData] = useState({
        deliveryPartnerFee: 50
    });

    useEffect(() => {
        fetchFullSettings();
    }, []);

    useEffect(() => {
        if (settings && settings.delivery) {
            setFormData({
                ...settings.delivery,
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
            await updateSettings('delivery', formData);
            toast.success('Delivery settings updated successfully');
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
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800 border-b pb-4">
                        <FiTruck className="text-primary-600" />
                        <h2>Delivery Partner Settings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Fixed Delivery Fee (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    name="deliveryPartnerFee"
                                    value={formData.deliveryPartnerFee || ''}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g. 100"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                This is the fixed amount a delivery partner earns for every successful delivery.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold"
                    >
                        <FiSave />
                        Save Delivery Settings
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default DeliverySettings;
