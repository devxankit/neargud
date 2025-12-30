import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShield, FiFileText, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import PageTransition from "../../../components/PageTransition";

const Policies = () => {
    const navigate = useNavigate();

    const policies = [
        {
            title: "Privacy Policy",
            icon: FiShield,
            content: `1. Information We Collect
We collect information that you provide directly to us, including when you create an account, make a purchase, or contact us for support.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.

3. Information Sharing
We do not sell, trade, or rent your personal information to third parties without your consent.

4. Data Security
We implement appropriate security measures to protect your personal information.`
        },
        {
            title: "Terms of Service",
            icon: FiFileText,
            content: `1. Acceptance of Terms
By accessing or using our services, you agree to be bound by these Terms of Service.

2. User Accounts
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

3. Purchases
All purchases are subject to our refund policy and product availability.`
        },
        {
            title: "Refund Policy",
            icon: FiAlertCircle,
            content: `1. Refund Eligibility
We offer refunds for products returned within 30 days of purchase in their original condition.

2. Processing Time
Refunds are typically processed within 5-7 business days of receiving the return.`
        }
    ];

    return (
        <PageTransition>
            <MobileLayout showBottomNav={false} showCartBar={false} showHeader={false}>
                <div className="min-h-screen bg-gray-50 pb-8">
                    {/* Header */}
                    <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiArrowLeft className="text-xl text-gray-600" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">Terms & Policies</h1>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-6">
                        {policies.map((policy, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                        <policy.icon className="text-xl text-green-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">{policy.title}</h2>
                                </div>
                                <div className="prose prose-sm prose-gray max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600 leading-relaxed">
                                        {policy.content}
                                    </pre>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </MobileLayout>
        </PageTransition>
    );
};

export default Policies;
