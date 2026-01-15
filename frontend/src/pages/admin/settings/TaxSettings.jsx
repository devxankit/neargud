import { useState, useEffect } from 'react';
import { FiSave, FiPercent } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import toast from 'react-hot-toast';

const TaxSettings = () => {
    const { settings, updateSettings, initialize } = useSettingsStore();
    const [taxData, setTaxData] = useState({});

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (settings && settings.tax) {
            setTaxData(settings.tax);
        }
    }, [settings]);

    const handleTaxChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaxData({
            ...taxData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSettings('tax', taxData);
            toast.success('Tax settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <FiPercent className="text-primary-600 text-lg" />
                        <h3 className="text-lg font-bold text-gray-800">Tax Settings</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Configure global tax rules for all orders</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between p-4 border border-primary-100 rounded-xl bg-primary-50/30">
                        <div>
                            <h4 className="font-bold text-primary-900">Enable Tax Calculation</h4>
                            <p className="text-sm text-primary-700">Toggle this to enable or disable tax on all orders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isEnabled"
                                checked={taxData.isEnabled || false}
                                onChange={handleTaxChange}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                        </label>
                    </div>

                    {/* Tax Configuration */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-300 ${!taxData.isEnabled ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">
                                Tax Name
                            </label>
                            <input
                                type="text"
                                name="taxName"
                                value={taxData.taxName || ''}
                                onChange={handleTaxChange}
                                placeholder="e.g., GST, VAT, Service Tax"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50 shadow-sm"
                            />
                            <p className="text-xs text-gray-500">This name will be displayed on the checkout page</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">
                                Calculation Type
                            </label>
                            <AnimatedSelect
                                name="taxType"
                                value={taxData.taxType || 'percentage'}
                                onChange={handleTaxChange}
                                options={[
                                    { value: 'percentage', label: 'Percentage (%)' },
                                    { value: 'fixed', label: 'Fixed Amount (₹)' },
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">
                                Tax Value
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="taxValue"
                                    value={taxData.taxValue || 0}
                                    onChange={handleTaxChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/50 shadow-sm font-semibold"
                                />
                                <span className="absolute right-4 top-3 text-gray-400 font-bold">
                                    {taxData.taxType === 'fixed' ? '₹' : '%'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">Amount or percentage to be applied</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            className="group flex items-center gap-2 px-8 py-3 gradient-green text-white rounded-xl hover:shadow-glow-green transition-all font-bold text-lg active:scale-95"
                        >
                            <FiSave className="group-hover:rotate-12 transition-transform" />
                            Save Tax Configuration
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default TaxSettings;
