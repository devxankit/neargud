import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ConfirmModal from '../../../components/Admin/ConfirmModal';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { useBannerStore } from '../../../store/bannerStore';
import toast from 'react-hot-toast';

const HomeSliders = () => {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const isAppRoute = location.pathname.startsWith('/app');

  // Store hooks
  const {
    banners,
    initialize,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    isLoading
  } = useBannerStore();

  const [editingSlider, setEditingSlider] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (editingSlider) {
      setPreviewUrl(editingSlider.image || '');
      setSelectedFile(null);
    } else {
      setPreviewUrl('');
      setSelectedFile(null);
    }
  }, [editingSlider]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async (sliderData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', sliderData.type);
      formData.append('title', sliderData.title);
      formData.append('link', sliderData.link);
      formData.append('order', sliderData.order);
      formData.append('isActive', sliderData.isActive);

      if (sliderData.city) {
        formData.append('city', sliderData.city);
      } else {
        formData.append('city', ''); // Ensure it's clear
      }

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (!editingSlider?.id) {
        toast.error('Please select an image');
        setIsSubmitting(false);
        return;
      }

      if (editingSlider && editingSlider.id) {
        await updateBanner(editingSlider.id, formData);
      } else {
        await createBanner(formData);
      }
      setEditingSlider(null);
    } catch (error) {
      console.error("Failed to save slider:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBanner(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      console.error("Failed to delete slider:", error);
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt={row.title}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/64x64?text=Image';
            }}
          />
          <span className="font-medium text-gray-800">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'link',
      label: 'Link',
      sortable: false,
      render: (value) => <span className="text-sm text-gray-600">{value}</span>,
    },
    {
      key: 'order',
      label: 'Order',
      sortable: true,
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${!value ? 'bg-gray-100 text-gray-600' : 'bg-primary-50 text-primary-600'}`}>
          {!value ? 'All Cities' : value}
        </span>
      )
    },
    {
      key: 'isActive', // store uses isActive, previous local state used status
      label: 'Status',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => toggleBannerStatus(row.id || row._id)}
          className={`px-2 py-1 rounded text-xs font-medium switch-transition ${value ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          title="Click to toggle status"
        >
          {value ? 'active' : 'inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingSlider(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Home Sliders</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage homepage banner sliders</p>
        </div>
        <button
          onClick={() => setEditingSlider({ isActive: true, city: '' })}
          className="flex items-center gap-2 px-4 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold text-sm"
        >
          <FiPlus />
          <span>Add Slider</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <DataTable
          data={banners?.map(b => ({ ...b, id: b._id || b.id })) || []}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
          isLoading={isLoading}
        />
      </div>

      <AnimatePresence>
        {editingSlider !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setEditingSlider(null)}
              className="fixed inset-0 bg-black/50 z-[10000]"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[10000] flex ${isAppRoute ? 'items-start pt-[10px]' : 'items-end'} sm:items-center justify-center p-4 pointer-events-none`}
            >
              <motion.div
                variants={{
                  hidden: {
                    y: isAppRoute ? '-100%' : '100%',
                    scale: 0.95,
                    opacity: 0
                  },
                  visible: {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    transition: {
                      type: 'spring',
                      damping: 22,
                      stiffness: 350,
                      mass: 0.7
                    }
                  },
                  exit: {
                    y: isAppRoute ? '-100%' : '100%',
                    scale: 0.95,
                    opacity: 0,
                    transition: {
                      type: 'spring',
                      damping: 30,
                      stiffness: 400
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                className={`bg-white ${isAppRoute ? 'rounded-b-3xl' : 'rounded-t-3xl'} sm:rounded-xl shadow-xl p-6 max-w-md w-full pointer-events-auto`}
                style={{ willChange: 'transform' }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {editingSlider.id ? 'Edit Slider' : 'Add Slider'}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target;

                    handleSave({
                      type: 'hero', // Default to hero for this page
                      title: form.title.value,
                      link: form.link.value,
                      order: parseInt(form.order.value),
                      isActive: editingSlider.isActive,
                      city: form.city.value.trim()
                    });
                  }}
                  className="space-y-4"
                >
                  <div
                    className="relative aspect-video w-full bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                          <FiUpload className="text-white text-3xl" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <FiUpload className="text-3xl" />
                        <span className="text-sm font-medium">Select Slider Image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <input
                    type="text"
                    name="title"
                    defaultValue={editingSlider.title || ''}
                    placeholder="Title"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />

                  <input
                    type="text"
                    name="link"
                    defaultValue={editingSlider.link || ''}
                    placeholder="Link URL"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Target City (Leave blank for All Cities)</label>
                      <input
                        type="text"
                        name="city"
                        defaultValue={editingSlider.city || ''}
                        placeholder="e.g. Indore"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <input
                      type="number"
                      name="order"
                      defaultValue={editingSlider.order || 1}
                      placeholder="Order"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />

                    <AnimatedSelect
                      name="status"
                      value={editingSlider.isActive ? 'active' : 'inactive'}
                      defaultValue={editingSlider.id ? (editingSlider.isActive ? 'active' : 'inactive') : 'active'}
                      onChange={(e) => setEditingSlider({ ...editingSlider, isActive: e.target.value === 'active' })}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 text-sm"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlider(null)}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Slider?"
        message="Are you sure you want to delete this slider? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default HomeSliders;
