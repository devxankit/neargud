import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiMapPin, FiPhone, FiCheckCircle, FiXCircle, FiEye, FiEyeOff, FiDollarSign } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import Badge from '../../../components/Badge';
import ConfirmModal from '../../../components/Admin/ConfirmModal';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import toast from 'react-hot-toast';
import api from '../../../utils/api';

const DeliveryBoys = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingBoy, setEditingBoy] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, boy: null, data: [], loading: false });
  const [showPassword, setShowPassword] = useState(false);

  const fetchDeliveryPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/delivery-partners');
      if (response.success) {
        setDeliveryBoys(response.data);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryPartners();
  }, [fetchDeliveryPartners]);

  const filteredBoys = deliveryBoys.filter((boy) => {
    const name = `${boy.firstName} ${boy.lastName}`.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      name.includes(searchQuery.toLowerCase()) ||
      boy.phone.includes(searchQuery) ||
      boy.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (boy.address && boy.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || boy.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await api.patch(`/admin/delivery-partners/${id}/status`, { status: newStatus });
      if (response.success) {
        toast.success(`Partner ${newStatus === 'available' ? 'approved' : newStatus}`);
        setDeliveryBoys(deliveryBoys.map(b => b._id === id ? { ...b, status: newStatus } : b));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleSave = async (boyData) => {
    try {
      let response;
      if (editingBoy._id) {
        response = await api.put(`/admin/delivery-partners/${editingBoy._id}`, boyData);
      } else {
        response = await api.post('/admin/delivery-partners', boyData);
      }

      if (response.success) {
        toast.success(editingBoy._id ? 'Partner updated successfully' : 'Partner created successfully');
        fetchDeliveryPartners();
        setEditingBoy(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save partner');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/admin/delivery-partners/${deleteModal.id}`);
      if (response.success) {
        setDeliveryBoys(deliveryBoys.filter((b) => b._id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null });
        toast.success('Partner deleted');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete partner');
    }
  };

  const fetchBoyHistory = async (boy) => {
    setHistoryModal({ isOpen: true, boy, data: [], loading: true });
    try {
      const response = await api.get('/admin/orders/cash-collections', {
        params: { deliveryPartnerId: boy._id, limit: 100 }
      });
      if (response.success) {
        setHistoryModal(prev => ({ ...prev, data: response.data.collections, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load collection history');
      setHistoryModal(prev => ({ ...prev, loading: false }));
    }
  };

  const columns = [
    {
      key: '_id',
      label: 'ID',
      sortable: true,
      render: (value) => <span className="font-semibold text-gray-800 text-xs">{value.slice(-6)}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-gray-800">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Mobile No',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiPhone className="text-gray-500 text-sm" />
          <span className="text-gray-800">{value}</span>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-start gap-2 max-w-xs">
          <FiMapPin className="text-gray-500 text-sm mt-0.5 flex-shrink-0" />
          <span className="text-gray-800 text-sm break-words">{row.city}, {row.state}</span>
        </div>
      ),
    },
    {
      key: 'vehicleType',
      label: 'Vehicle',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{row.vehicleNumber}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === 'available' ? 'success' :
              value === 'pending' ? 'warning' :
                value === 'busy' ? 'info' : 'error'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingBoy(row)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit />
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleUpdateStatus(row._id, 'available')}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Approve"
            >
              <FiCheckCircle />
            </button>
          )}
          {row.status !== 'suspended' && row.status !== 'pending' && (
            <button
              onClick={() => handleUpdateStatus(row._id, 'suspended')}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Suspend"
            >
              <FiXCircle />
            </button>
          )}
          <button
            onClick={() => fetchBoyHistory(row)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View History"
          >
            <FiEye />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: row._id })}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Delivery Boys</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage delivery personnel</p>
        </div>
        <button
          onClick={() => setEditingBoy({})}
          className="flex items-center gap-2 px-4 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold text-sm"
        >
          <FiPlus />
          <span>Add Delivery Boy</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email, or address..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <AnimatedSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'available', label: 'Available' },
              { value: 'busy', label: 'Busy' },
              { value: 'offline', label: 'Offline' },
              { value: 'pending', label: 'Pending' },
              { value: 'suspended', label: 'Suspended' },
            ]}
            className="min-w-[140px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <DataTable
          data={filteredBoys}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
        />
      </div>

      <AnimatePresence>
        {editingBoy !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setEditingBoy(null)}
              className="fixed inset-0 bg-black/50 z-[10000]"
            />

            {/* Modal Content - Mobile: Slide up from bottom, Desktop: Center with scale */}
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
                className={`bg-white ${isAppRoute ? 'rounded-b-3xl' : 'rounded-t-3xl'} sm:rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto`}
                style={{ willChange: 'transform' }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {editingBoy._id ? 'Edit Delivery Boy' : 'Add Delivery Boy'}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const boyData = {
                      firstName: formData.get('firstName'),
                      lastName: formData.get('lastName'),
                      phone: formData.get('phone'),
                      email: formData.get('email'),
                      address: formData.get('address'),
                      city: formData.get('city'),
                      state: formData.get('state'),
                      zipcode: formData.get('zipcode'),
                      vehicleType: formData.get('vehicleType'),
                      vehicleNumber: formData.get('vehicleNumber'),
                      status: formData.get('status'),
                    };
                    if (!editingBoy._id) {
                      boyData.password = formData.get('password');
                    }
                    handleSave(boyData);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={editingBoy.firstName || ''}
                      placeholder="First Name"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={editingBoy.lastName || ''}
                      placeholder="Last Name"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingBoy.phone || ''}
                    placeholder="Phone (10 digits)"
                    required
                    maxLength={10}
                    minLength={10}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingBoy.email || ''}
                    placeholder="Email"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {!editingBoy._id && (
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingBoy.address || ''}
                    placeholder="Address"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      defaultValue={editingBoy.city || ''}
                      placeholder="City"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      name="state"
                      defaultValue={editingBoy.state || ''}
                      placeholder="State"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <input
                    type="text"
                    name="zipcode"
                    defaultValue={editingBoy.zipcode || ''}
                    placeholder="Zipcode"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatedSelect
                      name="vehicleType"
                      value={editingBoy.vehicleType || 'Bike'}
                      onChange={(e) => setEditingBoy({ ...editingBoy, vehicleType: e.target.value })}
                      options={[
                        { value: 'Bike', label: 'Bike' },
                        { value: 'Car', label: 'Car' },
                        { value: 'Scooter', label: 'Scooter' },
                        { value: 'Van', label: 'Van' },
                        { value: 'Truck', label: 'Truck' },
                      ]}
                    />
                    <input
                      type="text"
                      name="vehicleNumber"
                      defaultValue={editingBoy.vehicleNumber || ''}
                      placeholder="Vehicle Number (e.g. MP09AB1234)"
                      required
                      pattern="^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$"
                      title="Please enter a valid vehicle number (e.g. MP09AB1234 or MH12A1234)"
                      onInput={(e) => {
                        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 invalid:border-red-500"
                    />
                  </div>
                  <AnimatedSelect
                    name="status"
                    value={editingBoy.status || 'available'}
                    onChange={(e) => setEditingBoy({ ...editingBoy, status: e.target.value })}
                    options={[
                      { value: 'available', label: 'Available' },
                      { value: 'busy', label: 'Busy' },
                      { value: 'offline', label: 'Offline' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'suspended', label: 'Suspended' },
                    ]}
                  />
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      {editingBoy._id ? 'Update Partner' : 'Create Partner'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBoy(null)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
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

      <AnimatePresence>
        {historyModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryModal({ isOpen: false, boy: null, data: [], loading: false })}
              className="fixed inset-0 bg-black/50 z-[10000]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Collection History</h3>
                    <p className="text-sm text-gray-500">
                      Driver: <span className="font-semibold text-gray-700">{historyModal.boy?.firstName} {historyModal.boy?.lastName}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setHistoryModal({ isOpen: false, boy: null, data: [], loading: false })}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <FiXCircle className="text-xl text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {historyModal.loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                      <p className="mt-4 text-gray-500 font-medium">Fetching records...</p>
                    </div>
                  ) : historyModal.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <FiDollarSign className="text-4xl text-gray-300 mb-2" />
                      <p className="text-gray-500">No cash collection records found for this driver.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="pb-3 font-semibold text-gray-600 text-sm">Order ID</th>
                            <th className="pb-3 font-semibold text-gray-600 text-sm">Customer</th>
                            <th className="pb-3 font-semibold text-gray-600 text-sm">Amount</th>
                            <th className="pb-3 font-semibold text-gray-600 text-sm">Status</th>
                            <th className="pb-3 font-semibold text-gray-600 text-sm">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {historyModal.data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 font-medium text-gray-800 text-sm">{item.orderId}</td>
                              <td className="py-4 text-gray-600 text-sm">{item.customerName}</td>
                              <td className="py-4 font-bold text-gray-800 text-sm">₹{item.amount}</td>
                              <td className="py-4">
                                <Badge variant={item.status === 'collected' ? 'success' : 'warning'}>
                                  {item.status}
                                </Badge>
                              </td>
                              <td className="py-4 text-gray-500 text-xs">
                                {new Date(item.orderDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Records</span>
                      <span className="text-lg font-bold text-gray-700">{historyModal.data.length}</span>
                    </div>
                    <div className="flex flex-col border-l pl-4">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Collected</span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{historyModal.data.filter(i => i.status === 'collected').reduce((sum, i) => sum + i.amount, 0)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setHistoryModal({ isOpen: false, boy: null, data: [], loading: false })}
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold shadow-sm"
                  >
                    Close History
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Delivery Boy?"
        message="Are you sure you want to delete this delivery boy? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </motion.div>
  );
};

export default DeliveryBoys;

