import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSettings, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';
import StoreIdentity from './settings/StoreIdentity';
import ContactInfo from './settings/ContactInfo';
import DeliverySettings from './settings/DeliverySettings';
import TaxSettings from './settings/TaxSettings';
import VendorCommissionSettings from './settings/VendorCommissionSettings';
import { FiTruck, FiPercent, FiDollarSign } from 'react-icons/fi';

const Settings = () => {
  const { fetchFullSettings } = useSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from URL or default to 'store'
  const getActiveTabFromUrl = () => {
    const path = location.pathname.split('/');
    const tab = path[path.length - 1];
    return (tab === 'identity' || tab === 'store') ? 'store' :
      (tab === 'tax' || tab === 'payment') ? 'tax' :
        tab || 'store';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());

  useEffect(() => {
    fetchFullSettings();
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/settings/${tabId}`);
  };

  const tabs = [
    { id: 'store', label: 'Store', icon: FiSettings, component: StoreIdentity, route: '/admin/settings/store' },
    { id: 'contact', label: 'Contact Info', icon: FiGlobe, component: ContactInfo, route: '/admin/settings/contact' },
    { id: 'commission', label: 'Commission', icon: FiDollarSign, component: VendorCommissionSettings, route: '/admin/settings/commission' },
    { id: 'delivery', label: 'Delivery', icon: FiTruck, component: DeliverySettings, route: '/admin/settings/delivery' },
    { id: 'tax', label: 'Tax', icon: FiPercent, component: TaxSettings, route: '/admin/settings/tax' },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || StoreIdentity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-full overflow-x-hidden"
    >
      {/* Header */}
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Configure your store settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-full overflow-x-hidden">
        <div className="border-b border-gray-200 overflow-x-hidden">
          <div className="flex overflow-x-auto scrollbar-hide -mx-1 px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Icon className="text-base sm:text-lg" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <ActiveComponent />
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;

