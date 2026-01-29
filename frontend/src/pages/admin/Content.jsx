import { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useContentStore } from '../../store/contentStore';

const Content = () => {
    const [activeTab, setActiveTab] = useState('homepage');
    const {
        content,
        fetchAllContent,
        updateHomepageContent,
        updateAboutContent,
        updateFAQContent,
        updatePolicyContent,
        isLoading
    } = useContentStore();

    // Local state for editing form
    const [formData, setFormData] = useState(content);

    useEffect(() => {
        fetchAllContent();
    }, [fetchAllContent]);

    useEffect(() => {
        setFormData(content);
    }, [content]);

    const handleHomepageDirectChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            homepage: {
                ...prev.homepage,
                [key]: value
            }
        }));
    };

    const handleHomepageSectionChange = (sectionKey, key, value) => {
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

    // FAQ Handlers
    const handleAddFAQ = () => {
        const newFaq = [...(formData.faq || []), { question: '', answer: '' }];
        setFormData({ ...formData, faq: newFaq });
    };

    const handleRemoveFAQ = (index) => {
        const newFaq = formData.faq.filter((_, i) => i !== index);
        setFormData({ ...formData, faq: newFaq });
    };

    const handleFAQChange = (index, key, value) => {
        const newFaq = formData.faq.map((item, i) =>
            i === index ? { ...item, [key]: value } : item
        );
        setFormData({ ...formData, faq: newFaq });
    };

    const handleSave = async () => {
        try {
            switch (activeTab) {
                case 'homepage':
                    await updateHomepageContent(formData.homepage);
                    break;
                case 'about':
                    await updateAboutContent(formData.about);
                    break;
                case 'faq':
                    await updateFAQContent(formData.faq);
                    break;
                case 'terms':
                    await updatePolicyContent('terms', formData.terms);
                    break;
                case 'privacy':
                    await updatePolicyContent('privacy', formData.privacy);
                    break;
                default:
                    toast.error('Unknown tab');
                    return;
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
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
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold disabled:opacity-50"
                >
                    <FiSave />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto scrollbar-hide">
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
                    {/* Homepage Section */}
                    {activeTab === 'homepage' && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hero Section</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label>
                                        <input
                                            type="text"
                                            value={formData.homepage.heroTitle || ''}
                                            onChange={(e) => handleHomepageDirectChange('heroTitle', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Subtitle</label>
                                        <input
                                            type="text"
                                            value={formData.homepage.heroSubtitle || ''}
                                            onChange={(e) => handleHomepageDirectChange('heroSubtitle', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Promo Strip</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Main Heading (Housefull Text)</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Enter main heading text... Use \n for new lines"
                                                value={formData.homepage.promoStrip?.housefullText || ""}
                                                onChange={(e) =>
                                                    handleHomepageSectionChange("promoStrip", "housefullText", e.target.value)
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Subheading (Sale Text)</label>
                                            <input
                                                type="text"
                                                value={formData.homepage.promoStrip?.saleText || ''}
                                                onChange={(e) => handleHomepageSectionChange('promoStrip', 'saleText', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                placeholder="e.g. SALE"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Date Text</label>
                                            <input
                                                type="text"
                                                value={formData.homepage.promoStrip?.saleDateText || ''}
                                                onChange={(e) => handleHomepageSectionChange('promoStrip', 'saleDateText', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Crazy Deals Line 1</label>
                                                <input
                                                    type="text"
                                                    value={formData.homepage.promoStrip?.crazyDealsText?.line1 || ''}
                                                    onChange={(e) => {
                                                        const newCrazyDeals = { ...(formData.homepage.promoStrip?.crazyDealsText || {}), line1: e.target.value };
                                                        handleHomepageSectionChange('promoStrip', 'crazyDealsText', newCrazyDeals);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Crazy Deals Line 2</label>
                                                <input
                                                    type="text"
                                                    value={formData.homepage.promoStrip?.crazyDealsText?.line2 || ''}
                                                    onChange={(e) => {
                                                        const newCrazyDeals = { ...(formData.homepage.promoStrip?.crazyDealsText || {}), line2: e.target.value };
                                                        handleHomepageSectionChange('promoStrip', 'crazyDealsText', newCrazyDeals);
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Us Tab */}
                    {activeTab === 'about' && (
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">About Us Content</label>
                            <textarea
                                value={formData.about || ''}
                                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                rows={15}
                                placeholder="Enter About Us content..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    )}

                    {/* Terms & Conditions Tab */}
                    {activeTab === 'terms' && (
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Terms & Conditions</label>
                            <textarea
                                value={formData.terms || ''}
                                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                rows={15}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    )}

                    {/* Privacy Policy Tab */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Privacy Policy</label>
                            <textarea
                                value={formData.privacy || ''}
                                onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                                rows={15}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    )}

                    {/* FAQ Tab */}
                    {activeTab === 'faq' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h3>
                                <button
                                    onClick={handleAddFAQ}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-semibold text-sm"
                                >
                                    <FiPlus /> Add FAQ
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.faq && formData.faq.map((item, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-3 relative group">
                                        <button
                                            onClick={() => handleRemoveFAQ(index)}
                                            className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiTrash2 />
                                        </button>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question</label>
                                            <input
                                                type="text"
                                                value={item.question}
                                                onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Answer</label>
                                            <textarea
                                                value={item.answer}
                                                onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!formData.faq || formData.faq.length === 0) && (
                                    <div className="text-center py-8 text-gray-500 italic">No FAQs added yet.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Content;

