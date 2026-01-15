import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShield, FiFileText, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import PageTransition from "../../../components/PageTransition";

const Policies = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // Static policies (can be moved to API later when backend route is ready)
    const policies = [
        {
            title: "Privacy Policy",
            icon: FiShield,
            key: 'privacy',
            content: `1. Information We Collect
We collect information that you provide directly to us, including when you create an account, make a purchase, or contact us for support.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.

3. Information Sharing
We do not sell, trade, or rent your personal information to third parties without your consent.

4. Data Security
We implement appropriate security measures to protect your personal information.

5. Your Rights
You have the right to access, update, or delete your personal information at any time.`
        },
        {
            title: "Terms of Service",
            icon: FiFileText,
            key: 'terms',
            content: `1. Acceptance of Terms
By accessing or using our services, you agree to be bound by these Terms of Service.

2. User Accounts
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

3. Purchases
All purchases are subject to our refund policy and product availability.

4. Prohibited Activities
You may not use our services for any illegal or unauthorized purpose.

5. Termination
We reserve the right to terminate or suspend your account at any time for violations of these terms.`
        },
        {
            title: "Refund Policy",
            icon: FiAlertCircle,
            key: 'refund',
            content: `1. Refund Eligibility
We offer refunds for products returned within 30 days of purchase in their original condition.

2. Processing Time
Refunds are typically processed within 5-7 business days of receiving the return.

3. Non-Refundable Items
Certain items such as personalized products, perishable goods, and digital downloads are non-refundable.

4. Return Shipping
Return shipping costs are the responsibility of the customer unless the item is defective.`
        },
        {
            title: "Shipping Policy",
            icon: FiFileText,
            key: 'shipping',
            content: `1. Shipping Methods
We offer standard and express shipping options for all orders.

2. Delivery Time
Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days.

3. Shipping Costs
Shipping costs are calculated based on the weight and destination of your order.

4. International Shipping
We currently ship to select international locations. Additional customs fees may apply.`
        }
    ];

    useEffect(() => {
        // Simulate loading for smooth UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

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
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500">Loading policies...</p>
                            </div>
                        ) : (
                            policies.map((policy, index) => (
                                <motion.div
                                    key={policy.key || index}
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
                                        <div className="whitespace-pre-wrap font-sans text-sm text-gray-600 leading-relaxed">
                                            {policy.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </MobileLayout>
        </PageTransition>
    );
};

export default Policies;
