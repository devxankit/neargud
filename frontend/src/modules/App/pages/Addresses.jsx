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
        <div className="pb-24 min-h-screen bg-gray-50">
          {/* Header */}
          <div className="px-4 py-4 bg-white border-b sticky top-0 z-30 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-xl font-bold flex-1">Saved Addresses</h1>
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
            className="fixed bottom-6 right-6 z-40 bg-green-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-all"
          >
            <FiPlus className="text-2xl" />
          </button>

          {/* Address List */}
          <div className="px-4 py-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <FiLoader className="text-3xl animate-spin text-green-500" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMapPin className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Address Found</h3>
                <p className="text-gray-500 text-sm mb-6">Add an address to continue checkout</p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200"
                >
                  Add New Address
                </button>
              </div>
            ) : (
              addresses.map((address) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={address._id || address.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-50 rounded-lg">
                        <FiMapPin className="text-green-600" />
                      </div>
                      <h3 className="font-bold text-gray-800">{address.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-0.5 ml-9">
                    <p className="text-sm font-semibold text-gray-700">{address.fullName}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{address.address}</p>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{address.phone}</p>
                  </div>

                  <div className="flex gap-3 mt-4 ml-9">
                    <button
                      onClick={() => handleEdit(address)}
                      className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold active:scale-95 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address._id || address.id)}
                      className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
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
