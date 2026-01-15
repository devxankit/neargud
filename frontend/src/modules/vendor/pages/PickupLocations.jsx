import { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiEdit, FiTrash2, FiSearch, FiCheckCircle, FiX, FiClock, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ConfirmModal from '../../../components/Admin/ConfirmModal';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { pickupLocationService } from '../services/pickupLocationService';
import toast from 'react-hot-toast';

const PickupLocations = () => {
  const { vendor } = useVendorAuthStore();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModal, setLocationModal] = useState({ isOpen: false, location: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, locationId: null });

  const vendorId = vendor?.id || vendor?._id;

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await pickupLocationService.getLocations();
      setLocations(response.data || []);
    } catch (error) {
      toast.error('Failed to load pickup locations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchLocations();
    }
  }, [vendorId]);

  const filteredLocations = locations.filter((loc) =>
    !searchQuery ||
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (locationData) => {
    try {
      if (locationModal.location?._id || locationModal.location?.id) {
        const id = locationModal.location._id || locationModal.location.id;
        await pickupLocationService.updateLocation(id, locationData);
        toast.success('Location updated');
      } else {
        await pickupLocationService.createLocation(locationData);
        toast.success('Location added');
      }
      fetchLocations();
      setLocationModal({ isOpen: false, location: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save location');
    }
  };

  const handleDelete = async () => {
    try {
      await pickupLocationService.deleteLocation(deleteModal.locationId);
      toast.success('Location deleted');
      fetchLocations();
      setDeleteModal({ isOpen: false, locationId: null });
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Location Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <FiMapPin className="text-primary-600 flex-shrink-0" />
          <div>
            <span className="font-medium text-gray-800">{value}</span>
            {row.isDefault && (
              <span className="ml-2 text-[10px] px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-bold uppercase tracking-wider">
                Default
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false,
      render: (value) => (
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800">{value.street}</p>
          <p>
            {value.city}{value.state ? `, ${value.state}` : ''} {value.zipCode || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contact',
      sortable: false,
      render: (value, row) => (
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-800">{value || 'N/A'}</p>
          <p>{row.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocationModal({ isOpen: true, location: row })}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit">
            <FiEdit />
          </button>
          {!row.isDefault && (
            <button
              onClick={() => setDeleteModal({ isOpen: true, locationId: row._id || row.id })}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete">
              <FiTrash2 />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!vendorId) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
        <FiMapPin className="mx-auto text-4xl text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Please log in to manage pickup locations</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pickup Locations</h1>
          <p className="text-gray-500 text-sm">Manage optimized pickup points for efficient logistics</p>
        </div>
        <button
          onClick={() => setLocationModal({ isOpen: true, location: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-sm ring-1 ring-primary-700/10">
          <FiPlus className="text-lg" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Search & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center">
          <div className="relative w-full">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city or street..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex flex-col justify-center">
          <p className="text-primary-600 text-xs font-bold uppercase tracking-wider mb-1">Total Locations</p>
          <p className="text-2xl font-black text-primary-700">{locations.length}</p>
        </div>
      </div>

      {/* Locations Table/Empty State */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Syncing locations...</p>
          </div>
        ) : filteredLocations.length > 0 ? (
          <DataTable
            data={filteredLocations}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none"
          />
        ) : (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMapPin className="text-4xl text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No locations found</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              {searchQuery ? "We couldn't find any locations matching your search." : "Ready to start shipping? Add your first pickup location to begin."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setLocationModal({ isOpen: true, location: null })}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold">
                Add Your First Location
              </button>
            )}
          </div>
        )}
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={locationModal.isOpen}
        location={locationModal.location}
        onClose={() => setLocationModal({ isOpen: false, location: null })}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, locationId: null })}
        onConfirm={handleDelete}
        title="Delete Location?"
        message="This will permanently remove this pickup point. Ensure no active orders are assigned to this location."
        confirmText="Delete permanently"
        cancelText="Keep location"
        type="danger"
      />
    </motion.div>
  );
};

// Location Modal Component
const LocationModal = ({ isOpen, location, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
    phone: '',
    email: '',
    isActive: true,
    isDefault: false,
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
  });

  useEffect(() => {
    if (location) {
      setFormData({
        ...location,
        address: {
          ...location.address,
          country: location.address.country || 'India'
        }
      });
    } else {
      setFormData({
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India',
        },
        phone: '',
        email: '',
        isActive: true,
        isDefault: false,
        operatingHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: true },
        },
      });
    }
  }, [location, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address.street || !formData.address.city) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {location ? 'Modify Location' : 'Register Location'}
              </h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Pickup point configuration</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="text-gray-500 text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-admin">
            <form id="location-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary-600 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center font-bold text-sm">1</div>
                  <h3 className="font-bold uppercase text-[10px] tracking-[0.2em]">Basic Information</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Identification Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium"
                    placeholder="e.g., Main Distribution Center"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium"
                      placeholder="warehouse@store.com"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Address Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary-600 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center font-bold text-sm">2</div>
                  <h3 className="font-bold uppercase text-[10px] tracking-[0.2em]">Physical Address</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Street & Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium"
                    placeholder="Plot 42, Sector 5, Near Metro..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">City/Area <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">State/Region</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Zip/Postal Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Country Origin</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-gray-700 font-medium text-gray-400"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary-600 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center font-bold text-sm">3</div>
                  <h3 className="font-bold uppercase text-[10px] tracking-[0.2em]">Operating Status</h3>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-2 ${formData.isActive
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}>
                    {formData.isActive ? <FiCheckCircle className="text-xl" /> : <FiX className="text-xl" />}
                    <span className="font-bold text-sm">{formData.isActive ? 'Active Point' : 'Disabled'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-2 ${formData.isDefault
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}>
                    <FiStar className={`text-xl ${formData.isDefault ? 'fill-current' : ''}`} />
                    <span className="font-bold text-sm">Primary Pickup Pt</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors font-bold shadow-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="location-form"
              className="flex-3 px-8 py-3 bg-primary-600 text-white rounded-2xl hover:shadow-glow-primary transition-all font-bold">
              {location ? 'Apply Changes' : 'Initialize Location'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PickupLocations;
