import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import MobileLayout from '../../../components/Layout/Mobile/MobileLayout';
import PageTransition from '../../../components/PageTransition';

const Contact = () => {
    const navigate = useNavigate();

    const contactInfo = [
        {
            icon: FiMail,
            label: 'Email',
            value: 'support@neargud.com',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            icon: FiPhone,
            label: 'Phone',
            value: '+91 9876543210',
            color: 'text-green-500',
            bg: 'bg-green-50',
        },
        {
            icon: FiMapPin,
            label: 'Address',
            value: 'Hyderabad, Telangana, India',
            color: 'text-orange-500',
            bg: 'bg-orange-50',
        },
        {
            icon: FiClock,
            label: 'Working Hours',
            value: 'Mon - Sat: 9 AM - 6 PM',
            color: 'text-purple-500',
            bg: 'bg-purple-50',
        },
    ];

    return (
        <PageTransition>
            <MobileLayout showBottomNav={false} showCartBar={false} showHeader={false}>
                <div className="min-h-screen bg-gray-50 pb-8">
                    {/* Header */}
                    <div className="px-4 py-4 bg-white sticky top-0 z-30 shadow-sm flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiArrowLeft className="text-xl text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Contact Us</h1>
                    </div>

                    <div className="px-4 py-4 space-y-6">
                        {/* Contact Info Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {contactInfo.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2"
                                >
                                    <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center`}>
                                        <item.icon className={`text-lg ${item.color}`} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                                    <span className="text-xs text-gray-700 leading-tight">{item.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </MobileLayout>
        </PageTransition>
    );
};

export default Contact;
