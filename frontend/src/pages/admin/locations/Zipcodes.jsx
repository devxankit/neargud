import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMapPin } from 'react-icons/fi';
import Button from '../../../components/Admin/Button';
import DataTable from '../../../components/Admin/DataTable';
import { useLocationStore } from '../../../store/locationStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../../../components/Admin/Modal'; // Will update this after checking list_dir
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';

const Zipcodes = () => {
  const { 
    zipcodes, cities, fetchZipcodes, fetchCities, 
    createZipcode, updateZipcode, deleteZipcode, isLoading 
  } = useLocationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZip, setEditingZip] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    city: '', 
    state: '',
    deliveryCharge: 0,
    isActive: true 
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchZipcodes();
    fetchCities();
  }, [fetchZipcodes, fetchCities]);

  const filteredZipcodes = (zipcodes || []).filter(zip => 
    zip.code.includes(searchQuery) ||
    (zip.city?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (zip.state || zip.city?.state || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'code', label: 'Zip Code', sortable: true },
    { 
      key: 'city',
      label: 'City', 
      render: (city) => city?.name || 'Unknown'
    },
    { key: 'state', label: 'State', sortable: true },
    { key: 'deliveryCharge', label: 'Delivery Charge', render: (val) => `₹${val}` },
    { 
      key: 'isActive',
      label: 'Status', 
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 size={16} />
          </button>
          <button 
            onClick={() => setDeleteConfirmation({ isOpen: true, id: row._id || row.id })}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (zip) => {
    setEditingZip(zip);
    setFormData({
      code: zip.code,
      city: zip.city?._id || zip.city?.id || zip.city, // Handle populated or unpopulated
      state: zip.state || zip.city?.state || '',
      deliveryCharge: zip.deliveryCharge,
      isActive: zip.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingZip(null);
    setFormData({ code: '', city: '', state: '', deliveryCharge: 0, isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.city || !formData.state) {
      toast.error('Zip Code, City and State are required');
      return;
    }

    try {
      if (editingZip) {
        await updateZipcode(editingZip._id || editingZip.id, formData);
      } else {
        await createZipcode(formData);
      }
      handleCloseModal();
    } catch (error) {
           // Error handled by store
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteZipcode(deleteConfirmation.id);
      setDeleteConfirmation({ isOpen: false, id: null });
    }
  };

  const cityOptions = (cities || []).map(c => ({
    value: c._id || c.id,
    label: `${c.name} (${c.state})`
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiMapPin className="text-primary-500" />
            Zip Codes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage delivery areas and charges</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={FiPlus}>
          Add Zip Code
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search zip codes or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredZipcodes}
          isLoading={isLoading}
          pagination
          itemsPerPage={10}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingZip ? 'Edit Zip Code' : 'Add Zip Code'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. 400001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <AnimatedSelect
              options={cityOptions}
              value={formData.city}
              onChange={(e) => {
                const cityId = e.target.value;
                const selectedCity = cities.find(c => (c._id || c.id) === cityId);
                setFormData({ 
                  ...formData, 
                  city: cityId,
                  state: selectedCity?.state || formData.state 
                });
              }}
              placeholder="Select City"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. Maharashtra"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
            <input
              type="number"
              value={formData.deliveryCharge}
              onChange={(e) => setFormData({ ...formData, deliveryCharge: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              min="0"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} type="button">Cancel</Button>
            <Button type="submit" isLoading={isLoading}>
              {editingZip ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
        title="Delete Zip Code"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this zip code? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmation({ isOpen: false, id: null })}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Zipcodes;
