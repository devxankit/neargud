import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiSave, FiCamera, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../../components/Layout/Mobile/MobileLayout';
import { useAuthStore } from '../../../store/authStore';
import { isValidEmail, isValidPhone } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import PageTransition from '../../../components/PageTransition';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const MobileProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword, isLoading } = useAuthStore();
  const [view, setView] = useState('main'); // 'main', 'personal', 'password'
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: personalErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const newPassword = watch('newPassword');

  const onPersonalSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
      setView('main');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPassword();
      setView('main');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/app/login');
  };

  const menuItems = [
    { icon: FiUser, label: 'My Orders', path: '/app/orders', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: FiUser, label: 'Wishlist', path: '/app/wishlist', color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: FiUser, label: 'My Addresses', path: '/app/addresses', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: FiUser, label: 'Saved Cards', path: '/app/cards', color: 'text-purple-500', bg: 'bg-purple-50' }, // Placeholder
  ];

  const settingItems = [
    { icon: FiUser, label: 'Personal Information', action: () => setView('personal'), color: 'text-gray-700', bg: 'bg-gray-100' },
    { icon: FiLock, label: 'Change Password', action: () => setView('password'), color: 'text-gray-700', bg: 'bg-gray-100' },
    { icon: FiUser, label: 'Help Center', path: '/app/help', color: 'text-gray-700', bg: 'bg-gray-100' },
    { icon: FiUser, label: 'Terms & Policies', path: '/app/policies', color: 'text-gray-700', bg: 'bg-gray-100' },
  ];

  return (
    <ProtectedRoute>
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true}>
          <div className="w-full pb-24 min-h-screen bg-gray-50">
            {/* Header / Navigation */}
            <div className="px-4 py-4 bg-white sticky top-0 z-30 shadow-sm flex items-center justify-between">
              {view === 'main' ? (
                <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView('main')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiArrowLeft className="text-xl text-gray-700" />
                  </button>
                  <h1 className="text-xl font-bold text-gray-800">
                    {view === 'personal' ? 'Edit Profile' : 'Change Password'}
                  </h1>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {view === 'main' && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="px-4 py-2"
                >
                  {/* User Profile Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex items-center gap-4 border border-gray-100 mt-2">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full gradient-green flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-800 truncate">{user?.name || 'User'}</h2>
                      <p className="text-sm text-gray-500 truncate">{user?.email || 'No email'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user?.phone || 'No phone'}</p>
                    </div>
                    <button
                      onClick={() => setView('personal')}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <FiUser className="text-xl" />
                    </button>
                  </div>

                  {/* Main Menu Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => item.path && navigate(item.path)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow active:scale-95 duration-200"
                      >
                        <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center`}>
                          <item.icon className={`text-xl ${item.color}`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Settings List */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    {settingItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => item.action ? item.action() : item.path && navigate(item.path)}
                        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${index !== settingItems.length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 ${item.bg} rounded-full flex items-center justify-center`}>
                            <item.icon className={`text-sm ${item.color}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                        <FiArrowLeft className="text-gray-400 rotate-180" />
                      </button>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <FiArrowLeft className="rotate-180" />
                    Log Out
                  </button>

                  <div className="text-center mt-6 text-xs text-gray-400">
                    Version 1.0.0
                  </div>
                </motion.div>
              )}

              {/* Edit Personal Info View */}
              {view === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="px-4 py-2"
                >
                  <div className="glass-card rounded-2xl p-4 bg-white shadow-sm border border-gray-100">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full gradient-green flex items-center justify-center text-white text-3xl font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors border-2 border-white shadow-sm">
                          <FiCamera className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitPersonal(onPersonalSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            {...registerPersonal('name', { required: 'Name is required' })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Your full name"
                          />
                        </div>
                        {personalErrors.name && <p className="text-red-500 text-xs mt-1">{personalErrors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            {...registerPersonal('email', { required: 'Email is required', validate: isValidEmail })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Email address"
                          />
                        </div>
                        {personalErrors.email && <p className="text-red-500 text-xs mt-1">{personalErrors.email.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            {...registerPersonal('phone', { validate: (v) => !v || isValidPhone(v) || 'Invalid phone' })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none transition-colors"
                            placeholder="Phone Number"
                          />
                        </div>
                        {personalErrors.phone && <p className="text-red-500 text-xs mt-1">{personalErrors.phone.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full gradient-green text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all mt-4"
                      >
                        <FiSave />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Change Password View */}
              {view === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="px-4 py-2"
                >
                  <div className="glass-card rounded-2xl p-4 bg-white shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            {...registerPassword('currentPassword', { required: 'Required' })}
                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none"
                            placeholder="Current Password"
                          />
                          <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            {...registerPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none"
                            placeholder="New Password"
                          />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {showNewPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
                        <PasswordStrengthMeter password={newPassword} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...registerPassword('confirmPassword', { validate: v => v === newPassword || 'Passwords do not match' })}
                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none"
                            placeholder="Confirm Password"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full gradient-green text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all mt-4"
                      >
                        <FiSave />
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </MobileLayout>
      </PageTransition>
    </ProtectedRoute>
  );
};

export default MobileProfile;

