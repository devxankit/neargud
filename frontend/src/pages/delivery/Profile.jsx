import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDeliveryAuthStore } from '../../store/deliveryAuthStore';
import { useDeliveryStore } from '../../store/deliveryStore'; // Added
import { FiUser, FiMail, FiPhone, FiTruck, FiEdit2, FiSave, FiX, FiLogOut } from 'react-icons/fi';
import PageTransition from '../../components/PageTransition';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/helpers';

const DeliveryProfile = () => {
  const navigate = useNavigate();
  const { deliveryBoy, updateStatus, logout } = useDeliveryAuthStore();
  const { stats, fetchStats } = useDeliveryStore(); // Added

  useEffect(() => {
    fetchStats();
  }, []);

  const displayStats = stats || {
    activeOrders: 0,
    completedToday: 0,
    totalDelivered: 0,
    earnings: 0,
    avgRating: 0,
    totalRatings: 0
  };
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: deliveryBoy?.firstName || '',
    lastName: deliveryBoy?.lastName || '',
    email: deliveryBoy?.email || '',
    phone: deliveryBoy?.phone || '',
    vehicleType: deliveryBoy?.vehicleType || '',
    vehicleNumber: deliveryBoy?.vehicleNumber || '',
    address: deliveryBoy?.address || '',
    city: deliveryBoy?.city || '',
    state: deliveryBoy?.state || '',
    zipcode: deliveryBoy?.zipcode || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const response = await useDeliveryAuthStore.getState().updateProfile(formData);
      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: deliveryBoy?.firstName || '',
      lastName: deliveryBoy?.lastName || '',
      email: deliveryBoy?.email || '',
      phone: deliveryBoy?.phone || '',
      vehicleType: deliveryBoy?.vehicleType || '',
      vehicleNumber: deliveryBoy?.vehicleNumber || '',
      address: deliveryBoy?.address || '',
      city: deliveryBoy?.city || '',
      state: deliveryBoy?.state || '',
      zipcode: deliveryBoy?.zipcode || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/delivery/login');
  };

  const statsData = [
    { label: 'Total Deliveries', value: (displayStats.totalDelivered || 0).toString() },
    { label: 'Completed Today', value: (displayStats.completedToday || 0).toString() },
    { label: 'Rating', value: displayStats.totalRatings > 0 ? displayStats.avgRating.toFixed(1) : 'New' },
    { label: 'Earnings', value: formatPrice(displayStats.earnings || 0) },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-b-[40px] px-6 pt-20 pb-8 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30"
              >
                <FiEdit2 />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30"
                >
                  <FiSave />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 gradient-green rounded-full flex items-center justify-center text-3xl font-bold">
              {deliveryBoy?.firstName?.charAt(0) || 'D'}
            </div>
            <div>
              <p className="text-xl font-semibold">{deliveryBoy ? `${deliveryBoy.firstName} ${deliveryBoy.lastName}` : 'Delivery Boy'}</p>
              <p className="text-primary-100 text-sm">{deliveryBoy?.email || 'email@example.com'}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 px-4">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm space-y-4 mx-4"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h2>

          {/* Name */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiUser />
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.firstName}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiMail />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiPhone />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                placeholder="Full Address"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.address || 'Not set'}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                  placeholder="City"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.city || 'Not set'}</p>
              )}
            </div>
            {/* State */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                  placeholder="State"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.state || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Zipcode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Zipcode</label>
            {isEditing ? (
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                placeholder="Zipcode"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.zipcode || 'Not set'}</p>
            )}
          </div>
        </motion.div>

        {/* Vehicle Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-sm space-y-4 mx-4"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiTruck />
            Vehicle Information
          </h2>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
            {isEditing ? (
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              >
                <option value="Bike">Bike</option>
                <option value="Car">Car</option>
                <option value="Scooter">Scooter</option>
                <option value="Van">Van</option>
              </select>
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.vehicleType}</p>
            )}
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
            {isEditing ? (
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.vehicleNumber}</p>
            )}
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm mx-4"
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
          >
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default DeliveryProfile;

