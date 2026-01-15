import { useState, useEffect } from 'react';
import { FiTruck, FiMapPin, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ConfirmModal from '../../../components/Admin/ConfirmModal';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import {
  fetchShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  fetchShippingRates,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate
} from '../../../services/vendorShippingApi';
import toast from 'react-hot-toast';

const ShippingManagement = () => {
  const { vendor } = useVendorAuthStore();
  const [shippingZones, setShippingZones] = useState([]);
  const [shippingRates, setShippingRates] = useState([]);
  const [activeTab, setActiveTab] = useState('zones');
  const [editingZone, setEditingZone] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });
  const [loading, setLoading] = useState(false);

  const vendorId = vendor?.id;

  const loadData = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const [zonesRes, ratesRes] = await Promise.all([
        fetchShippingZones(),
        fetchShippingRates()
      ]);
      if (zonesRes) {
        setShippingZones(zonesRes.map(z => ({ ...z, id: z._id })));
      }

      if (ratesRes) {
        setShippingRates(ratesRes.map(r => ({ ...r, id: r._id })));
      }
    } catch (error) {
      console.error('Failed to load shipping data:', error);
      toast.error('Failed to load shipping data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const handleZoneSave = async (zoneData) => {
    try {
      let result;
      if (editingZone && editingZone._id) {
        result = await updateShippingZone(editingZone._id, zoneData);
      } else {
        result = await createShippingZone(zoneData);
      }

      if (result) {
        toast.success(editingZone?._id ? 'Zone updated' : 'Zone added');
        setEditingZone(null);
        loadData();
      }
    } catch (error) {
      toast.error('Failed to save zone');
    }
  };

  const handleRateSave = async (rateData) => {
    try {
      let result;
      if (editingRate && editingRate._id) {
        result = await updateShippingRate(editingRate._id, rateData);
      } else {
        result = await createShippingRate(rateData);
      }

      if (result) {
        toast.success(editingRate?._id ? 'Rate updated' : 'Rate added');
        setEditingRate(null);
        loadData();
      }
    } catch (error) {
      toast.error('Failed to save rate');
    }
  };

  const handleDelete = async () => {
    try {
      let result;
      if (deleteModal.type === 'zone') {
        result = await deleteShippingZone(deleteModal.id);
        await fetchShippingZones();
      } else {
        result = await deleteShippingRate(deleteModal.id);
        await fetchShippingRates();
      }

      if (result) {
        toast.success('Deleted successfully');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: null });
    }
  };

  const zoneColumns = [
    { key: 'name', label: 'Zone Name', sortable: true },
    { key: 'countries', label: 'Countries', sortable: false, render: (value) => Array.isArray(value) ? value.join(', ') : value },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => setEditingZone(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, type: 'zone' })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
        </div>
      ),
    },
  ];

  const rateColumns = [
    { key: 'zoneName', label: 'Zone', sortable: true },
    { key: 'name', label: 'Method', sortable: true },
    { key: 'rate', label: 'Rate', sortable: true, render: (value) => formatPrice(value) },
    { key: 'freeShippingThreshold', label: 'Free Shipping Above', sortable: true, render: (value) => value ? formatPrice(value) : 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => setEditingRate(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, type: 'rate' })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
        </div>
      ),
    },
  ];

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view shipping</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FiTruck className="text-primary-600" />
          Shipping Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">Manage shipping zones and rates</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('zones')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 transition-colors ${activeTab === 'zones' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
              }`}>
            <FiMapPin />
            <span>Shipping Zones</span>
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 transition-colors ${activeTab === 'rates' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
              }`}>
            <FiTruck />
            <span>Shipping Rates</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'zones' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setEditingZone({})}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                    <FiPlus />
                    Add Zone
                  </button>
                  <DataTable data={shippingZones} columns={zoneColumns} pagination={true} />
                </div>
              )}
              {activeTab === 'rates' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setEditingRate({})}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                    <FiPlus />
                    Add Rate
                  </button>
                  <DataTable data={shippingRates} columns={rateColumns} pagination={true} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editingZone !== null && (
        <ShippingZoneForm
          zone={editingZone}
          onSave={handleZoneSave}
          onClose={() => setEditingZone(null)}
        />
      )}

      {editingRate !== null && (
        <ShippingRateForm
          rate={editingRate}
          zones={shippingZones}
          onSave={handleRateSave}
          onClose={() => setEditingRate(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: null })}
        onConfirm={handleDelete}
        title="Delete"
        message="Are you sure you want to delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

const ShippingZoneForm = ({ zone, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    countries: zone?.countries || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">{zone?._id ? 'Edit Zone' : 'Add Zone'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Zone Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Countries (comma-separated)</label>
            <input
              type="text"
              value={Array.isArray(formData.countries) ? formData.countries.join(', ') : formData.countries}
              onChange={(e) => setFormData({ ...formData, countries: e.target.value.split(',').map(c => c.trim()) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShippingRateForm = ({ rate, zones, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    zoneId: rate?.zoneId?._id || rate?.zoneId || '',
    name: rate?.name || '',
    rate: rate?.rate || 0,
    freeShippingThreshold: rate?.freeShippingThreshold || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">{rate?._id ? 'Edit Rate' : 'Add Rate'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Zone</label>
            <select
              value={formData.zoneId}
              onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg">
              <option value="">Select Zone</option>
              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>{zone.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Method Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Rate</label>
            <input
              type="number"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Free Shipping Threshold (optional)</label>
            <input
              type="number"
              value={formData.freeShippingThreshold}
              onChange={(e) => setFormData({ ...formData, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingManagement;
