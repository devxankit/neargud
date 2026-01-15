import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiCheck, FiArrowLeft, FiKey } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../../utils/api';

const VendorForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Forms
    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors: emailErrors },
    } = useForm();

    const {
        register: registerOtp,
        handleSubmit: handleSubmitOtp,
        formState: { errors: otpErrors },
    } = useForm();

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        watch,
        formState: { errors: passwordErrors },
    } = useForm();

    const onEmailSubmit = async (data) => {
        setIsLoading(true);
        try {
            await api.post('/auth/vendor/forgot-password', { email: data.email });
            setEmail(data.email);
            setStep(2);
            toast.success('OTP sent to your email');
        } catch (error) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const onOtpSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Verify OTP without consuming
            await api.post('/auth/vendor/verify-reset-otp', { email, otp: data.otp });
            setOtp(data.otp);
            setStep(3);
            toast.success('OTP verified');
        } catch (error) {
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const onPasswordSubmit = async (data) => {
        setIsLoading(true);
        try {
            await api.post('/auth/vendor/reset-password', {
                email,
                otp,
                newPassword: data.newPassword,
            });
            toast.success('Password reset successfully!');
            navigate('/vendor/login');
        } catch (error) {
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    // Render Step 1: Email Input
    const renderStep1 = () => (
        <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="email"
                        {...registerEmail('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                        })}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${emailErrors.email ? 'border-red-300' : 'border-gray-200'
                            } focus:border-primary-500 focus:outline-none transition-colors`}
                        placeholder="Enter your registered email"
                    />
                </div>
                {emailErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{emailErrors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-green text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-glow-green disabled:opacity-50"
            >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className="text-center">
                <Link to="/vendor/login" className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-2">
                    <FiArrowLeft /> Back to Login
                </Link>
            </div>
        </form>
    );

    // Render Step 2: OTP Verification
    const renderStep2 = () => (
        <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-6">
            <div className="text-center mb-4">
                <p className="text-gray-600">We sent a code to <span className="font-semibold">{email}</span></p>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                <div className="relative">
                    <FiKey className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        maxLength={4}
                        {...registerOtp('otp', {
                            required: 'OTP is required',
                            minLength: { value: 4, message: 'OTP must be 4 digits' },
                        })}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${otpErrors.otp ? 'border-red-300' : 'border-gray-200'
                            } focus:border-primary-500 focus:outline-none transition-colors tracking-widest text-center text-lg`}
                        placeholder="0000"
                    />
                </div>
                {otpErrors.otp && (
                    <p className="mt-1 text-sm text-red-600">{otpErrors.otp.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-green text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-glow-green disabled:opacity-50"
            >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    Change Email
                </button>
            </div>
        </form>
    );

    // Render Step 3: New Password
    const renderStep3 = () => (
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="password"
                        {...registerPassword('newPassword', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Must be at least 6 characters' },
                        })}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-200'
                            } focus:border-primary-500 focus:outline-none transition-colors`}
                        placeholder="Enter new password"
                    />
                </div>
                {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                    <FiCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="password"
                        {...registerPassword('confirmPassword', {
                            required: 'Confirm Password is required',
                            validate: (val) => {
                                if (watch('newPassword') != val) {
                                    return "Your passwords do not match";
                                }
                            },
                        })}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                            } focus:border-primary-500 focus:outline-none transition-colors`}
                        placeholder="Confirm new password"
                    />
                </div>
                {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-green text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-glow-green disabled:opacity-50"
            >
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {step === 1 && 'Vendor Password Reset'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'Set New Password'}
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {step === 1 && 'Enter your email to receive a reset code'}
                        {step === 2 && 'Enter the code sent to your email'}
                        {step === 3 && 'Create a strong new password'}
                    </p>
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </motion.div>
        </div>
    );
};

export default VendorForgotPassword;
