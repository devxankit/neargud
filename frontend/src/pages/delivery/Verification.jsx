import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiTruck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useDeliveryAuthStore } from '../../store/deliveryAuthStore';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';

const DeliveryVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendOTP, isLoading } = useDeliveryAuthStore();

    const [codes, setCodes] = useState(['', '', '', '']);
    const inputRefs = useRef([]);

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/delivery/register');
        }
    }, [email, navigate]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) return;

        const newCodes = [...codes];
        newCodes[index] = value;
        setCodes(newCodes);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !codes[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (pastedData.length === 4 && /^\d+$/.test(pastedData)) {
            const newCodes = pastedData.split('');
            setCodes(newCodes);
            inputRefs.current[3]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = codes.join('');

        if (verificationCode.length !== 4) {
            toast.error('Please enter the complete verification code');
            return;
        }

        try {
            const response = await verifyEmail(email, verificationCode);
            toast.success('Email verified successfully!');

            if (response.deliveryBoy?.status === 'pending') {
                navigate('/delivery/login', {
                    state: { message: 'Your email is verified. Please wait for admin approval before logging in.' },
                    replace: true
                });
            } else {
                navigate('/delivery/dashboard', { replace: true });
            }
        } catch (error) {
            toast.error(error.message || 'Verification failed');
        }
    };

    const handleResend = async () => {
        try {
            await resendOTP(email);
            toast.success('Verification code resent to your email');
        } catch (error) {
            toast.error(error.message || 'Failed to resend OTP');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-xl">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-6 flex items-center text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            <FiArrowLeft className="mr-2" size={20} />
                            <span className="text-sm font-medium">Back</span>
                        </button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-green">
                                <FiTruck className="text-white text-2xl" />
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verification</h1>
                            <p className="text-sm text-gray-600">
                                Enter the 4-digit code sent to<br />
                                <span className="font-bold text-gray-800">{email}</span>
                            </p>
                        </div>

                        {/* Code Input Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center gap-4">
                                {codes.map((code, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={code}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 text-center text-xl sm:text-2xl font-bold focus:outline-none transition-all ${code
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-200 focus:border-primary-500 text-gray-900'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || codes.some(code => !code)}
                                className="w-full gradient-green text-white py-4 rounded-xl font-bold text-lg hover:shadow-glow-green shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                        </form>

                        {/* Resend Link */}
                        <div className="mt-8 text-center p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600">
                                Didn't receive the code?{' '}
                                <button
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className="text-primary-600 font-bold hover:underline"
                                >
                                    Resend OTP
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default DeliveryVerification;
