import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiEdit, FiTrash2, FiPlus, FiX, FiArrowLeft, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../../components/Layout/Mobile/MobileLayout';
import toast from 'react-hot-toast';
import PageTransition from '../../../components/PageTransition';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import { useAddressStore } from '../../../store/addressStore';

const MobileAddresses = () => {
  const navigate = useNavigate();
  const { addresses, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, isLoading } =
    useAddressStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id || editingAddress.id, data);
        toast.success('Address updated successfully!');
      } else {
        await addAddress(data);
        toast.success('Address added successfully!');
      }
      reset();
      setIsFormOpen(false);
      setEditingAddress(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    reset(address);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this address?')) {
      await deleteAddress(id);
      toast.success('Address deleted!');
    }
  };

  const handleCancel = () => {
    reset();
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <MobileLayout showBottomNav showCartBar showHeader={false}>
          <div className="pb-[160px]">

            {/* Header */}
            <div className="px-4 py-4 bg-white border-b sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                  <FiArrowLeft className="text-xl" />
                </button>
                <h1 className="text-xl font-bold flex-1">Saved Addresses</h1>
              </div>
            </div>

            {/* Floating Add Button */}
            <button
              onClick={() => {
                setEditingAddress(null);
                reset({
                  name: '',
                  fullName: '',
                  phone: '',
                  address: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: ''
                });
                setIsFormOpen(true);
              }}
              className="fixed bottom-[90px] right-4 z-40 bg-green-600 text-white p-4 rounded-full shadow-xl active:scale-95"
            >
              <FiPlus className="text-2xl" />
            </button>

            {/* Address List */}
            <div className="px-4 py-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <FiLoader className="text-3xl animate-spin text-green-500" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-16">
                  <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No Address Found</h3>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      reset({
                        name: '',
                        fullName: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                      });
                      setIsFormOpen(true);
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address._id} className="bg-white rounded-2xl shadow p-4">
                    <h3 className="font-bold">{address.name}</h3>
                    <p className="text-sm text-gray-600">{address.fullName}</p>
                    <p className="text-sm text-gray-600">{address.address}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(address)}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address._id)}
                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Address Modal */}
            <AnimatePresence>
              {isFormOpen && (
                <AddressFormModal
                  onSubmit={onSubmit}
                  onCancel={handleCancel}
                  editingAddress={editingAddress}
                  register={register}
                  handleSubmit={handleSubmit}
                  errors={errors}
                />
              )}
            </AnimatePresence>

          </div>
        </MobileLayout>
      </PageTransition>
    </ProtectedRoute>
  );
};

const AddressFormModal = ({ onSubmit, onCancel, editingAddress, register, handleSubmit, errors }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-white rounded-t-3xl w-full max-h-[92vh] flex flex-col"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="font-bold text-lg">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full bg-gray-100">
            <FiX />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 pt-4 space-y-4 pb-[140px]"
        >
          {[
            { label: 'Address Label', name: 'name' },
            { label: 'Full Name', name: 'fullName' },
            { label: 'Phone', name: 'phone' },
            { label: 'Street Address', name: 'address' },
            { label: 'City', name: 'city' },
            { label: 'State', name: 'state' },
            { label: 'Zip Code', name: 'zipCode' },
            { label: 'Country', name: 'country' },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-sm font-semibold text-gray-600">{field.label}</label>
              <input
                {...register(field.name, { required: `${field.label} required` })}
                autoComplete="off"
                className="w-full mt-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-300 outline-none"
              />
              {errors[field.name] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.name].message}</p>
              )}
            </div>
          ))}
        </form>

        {/* Sticky Bottom Button (Always Visible) */}
        <div className="fixed bottom-[70px] left-0 right-0 bg-white border-t px-6 py-4">
          <button
            onClick={handleSubmit(onSubmit)}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold shadow-lg active:scale-95"
          >
            {editingAddress ? 'Update Address' : 'Create Address'}
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default MobileAddresses;
