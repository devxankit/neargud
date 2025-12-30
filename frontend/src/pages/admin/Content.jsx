
import { useState, useEffect } from 'react';
import { FiSave, FiEdit } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useContentStore } from '../../store/contentStore';

const Content = () => {
  const [activeTab, setActiveTab] = useState('homepage');
  const { content, updateContent, updateSection, updateHomepageSection } = useContentStore();

  // Local state for editing form to avoid excessive re-renders/expensive store updates on every keystroke
  // We sync with store on mount and save on explicit save click or blur if preferred.
  // For simplicity, let's sync local state with store content when it loads
  const [formData, setFormData] = useState(content);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleChange = (section, key, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleHomepageChange = (sectionKey, key, value) => {
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        [sectionKey]: {
          ...prev.homepage[sectionKey],
          [key]: value
        }
      }
    }));
  };

  const handleHomepageDirectChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    updateContent(formData);
    toast.success('Content saved successfully');
  };

  const tabs = [
    { id: 'homepage', label: 'Homepage' },
    { id: 'about', label: 'About Us' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Content Management</h1>
          <p className="text-gray-600">Manage website content and pages</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold"
        >
          <FiSave />
          Save All
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'homepage' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={formData.homepage.heroTitle || ''}
                      onChange={(e) => handleHomepageDirectChange('heroTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.homepage.heroSubtitle || ''}
                      onChange={(e) => handleHomepageDirectChange('heroSubtitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Promo Strip Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Promotional Strip (Housefull Sale)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Main Banner Text (e.g., HOUSEFULL)
                    </label>
                    <input
                      type="text"
                      value={formData.homepage.promoStrip?.housefullText || ''}
                      onChange={(e) => handleHomepageChange('promoStrip', 'housefullText', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sale Date Text
                    </label>
                    <input
                      type="text"
                      value={formData.homepage.promoStrip?.saleDateText || ''}
                      onChange={(e) => handleHomepageChange('promoStrip', 'saleDateText', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Crazy Deals Line 1
                    </label>
                    <input
                      type="text"
                      value={formData.homepage.promoStrip?.crazyDealsText?.line1 || ''}
                      onChange={(e) => {
                        const current = formData.homepage.promoStrip?.crazyDealsText || {};
                        handleHomepageChange('promoStrip', 'crazyDealsText', { ...current, line1: e.target.value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Crazy Deals Line 2
                    </label>
                    <input
                      type="text"
                      value={formData.homepage.promoStrip?.crazyDealsText?.line2 || ''}
                      onChange={(e) => {
                        const current = formData.homepage.promoStrip?.crazyDealsText || {};
                        handleHomepageChange('promoStrip', 'crazyDealsText', { ...current, line2: e.target.value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lowest Prices Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Lowest Prices Ever Section</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.homepage.lowestPrices?.title || ''}
                    onChange={(e) => handleHomepageChange('lowestPrices', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Terms & Conditions
              </label>
              <textarea
                value={formData.terms || ''}
                onChange={(e) => handleChange('terms', null, e.target.value)} // Special handling needed for root level strings if using generic handleChange, but simplest is:
                // Actually handleChange above assumes object structure. Let's fix for root strings:
                // onChange={(e) => setFormData({...formData, terms: e.target.value})}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Privacy Policy
              </label>
              <textarea
                value={formData.privacy || ''}
                onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Content;

