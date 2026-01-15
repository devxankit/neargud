import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMapPin } from 'react-icons/fi';
import Button from '../../../components/Admin/Button';
import DataTable from '../../../components/Admin/DataTable';
import { useLocationStore } from '../../../store/locationStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../../../components/Admin/Modal';

const Cities = () => {
  const { cities, fetchCities, createCity, updateCity, deleteCity, isLoading } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({ name: '', state: '', country: 'India', isActive: true });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filteredCities = (cities || []).filter(city => 
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (city.country || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'country', label: 'Country', sortable: true },
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

  const handleEdit = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      state: city.state,
      country: city.country || 'India',
      isActive: city.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCity(null);
    setFormData({ name: '', state: '', country: 'India', isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.state.trim()) {
      toast.error('Name and State are required');
      return;
    }

    try {
      if (editingCity) {
        await updateCity(editingCity._id || editingCity.id, formData);
      } else {
        await createCity(formData);
      }
      handleCloseModal();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation.id) {
      await deleteCity(deleteConfirmation.id);
      setDeleteConfirmation({ isOpen: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiMapPin className="text-primary-500" />
            Cities
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage delivery cities and states</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={FiPlus}>
          Add City
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredCities}
          isLoading={isLoading}
          pagination
          itemsPerPage={10}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCity ? 'Edit City' : 'Add City'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. Mumbai"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. India"
              required
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
              {editingCity ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
        title="Delete City"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this city? This action cannot be undone.
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

export default Cities;
