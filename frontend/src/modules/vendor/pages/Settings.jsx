import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSettings, FiCreditCard, FiTruck, FiUser, FiShoppingBag, FiGlobe, FiImage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import StoreSettings from './settings/StoreSettings';
import PaymentSettings from './settings/PaymentSettings';
import ShippingSettings from './settings/ShippingSettings';
import ProfileSettings from './settings/ProfileSettings';

// Wrapper components for StoreSettings sections
const IdentitySettings = () => <StoreSettings section="identity" />;
const ContactSettings = () => <StoreSettings section="contact" />;
const SocialSettings = () => <StoreSettings section="social" />;

const VendorSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from URL or default to 'identity'
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/contact-info')) return 'contact';
    if (path.includes('/social-media')) return 'social';
    if (path.includes('/shipping-delivery')) return 'shipping';
    if (path.includes('/store-identity') || path.includes('/settings')) return 'identity';
    return 'identity';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());

  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'identity') {
      navigate('/vendor/settings/store-identity');
    } else if (tabId === 'contact') {
      navigate('/vendor/settings/contact-info');
    } else if (tabId === 'social') {
      navigate('/vendor/settings/social-media');
    } else if (tabId === 'shipping') {
      navigate('/vendor/settings/shipping-delivery');
    }
  };

  const tabs = [
    { id: 'identity', label: 'Store Identity', icon: FiShoppingBag, component: IdentitySettings },
    { id: 'contact', label: 'Contact Info', icon: FiGlobe, component: ContactSettings },
    { id: 'social', label: 'Social Media', icon: FiImage, component: SocialSettings },
    { id: 'shipping', label: 'Shipping & Delivery', icon: FiTruck, component: ShippingSettings },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || IdentitySettings;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-full overflow-x-hidden"
    >
      {/* Header */}
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Configure your vendor store settings</p>
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
                    ? 'border-purple-600 text-purple-600 font-semibold'
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

export default VendorSettings;

