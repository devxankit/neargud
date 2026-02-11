import { useState, useEffect } from 'react';
import { FiSearch, FiDollarSign, FiCheckCircle, FiXCircle, FiClock, FiCheck, FiX, FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../../../utils/adminHelpers';
import toast from 'react-hot-toast';
import api from '../../../utils/api';
import { fetchPendingWithdrawals, approveWithdrawal, rejectWithdrawal } from '../../../services/adminVendorWalletApi';

const CashCollection = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'withdrawals'
  const [collections, setCollections] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [stats, setStats] = useState({ totalCollected: 0, totalPending: 0 });
  const [withdrawalStats, setWithdrawalStats] = useState(null);

  // Modal States for Withdrawals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchCollections = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders/cash-collections', {
        params: {
          page,
          limit: 10,
          status: statusFilter,
          search: searchQuery,
        },
      });
      if (response.success) {
        setCollections(response.data.collections);
        setPagination(response.data.pagination);
        setStats({
          totalCollected: response.data.totalCollected,
          totalPending: response.data.totalPending,
        });
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      toast.error('Failed to load cash collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await fetchPendingWithdrawals('delivery');
      const data = response || {};
      setWithdrawalRequests(data.requests || []);
      setWithdrawalStats(data.stats || {});
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchCollections(1);
    } else {
      fetchWithdrawals();
    }
  }, [activeTab, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'orders') {
      fetchCollections(1);
    }
  };

  const handleMarkCollected = async (id) => {
    try {
      const response = await api.put(`/admin/orders/${id}/mark-collected`);
      if (response.success) {
        toast.success('Payment marked as collected');
        fetchCollections(pagination.page);
      }
    } catch (error) {
      console.error('Failed to mark collected:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleApproveWithdrawal = async () => {
    if (!selectedRequest) return;
    try {
      await approveWithdrawal(selectedRequest._id, {
        notes: adminNotes,
        transactionId: transactionId
      });
      toast.success('Withdrawal approved successfully');
      setShowApproveModal(false);
      setSelectedRequest(null);
      setTransactionId('');
      setAdminNotes('');
      fetchWithdrawals();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectWithdrawal(selectedRequest._id, {
        reason: rejectionReason
      });
      toast.success('Withdrawal rejected');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchWithdrawals();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reject withdrawal');
    }
  };

  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
      render: (value) => <span className="font-semibold text-gray-800">{value}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiDollarSign className="text-green-600" />
          <span className="font-bold text-gray-800">{formatCurrency(value)}</span>
        </div>
      ),
    },
    {
      key: 'deliveryBoy',
      label: 'Delivery Boy',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'collected' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      sortable: true,
      render: (value) => formatDateTime(value),
    },
    {
      key: 'collectionDate',
      label: 'Collection Date',
      sortable: true,
      render: (value) => value ? formatDateTime(value) : <span className="text-gray-400">Pending</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        row.status === 'pending' ? (
          <button
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
            onClick={() => handleMarkCollected(row.id)}
          >
            Mark Collected
          </button>
        ) : (
          <span className="text-green-600">
            <FiCheckCircle />
          </span>
        )
      ),
    },
  ];

  const withdrawalColumns = [
    {
      key: 'deliveryPartnerId',
      label: 'Delivery Partner',
      render: (val) => `${val?.firstName || ''} ${val?.lastName || ''}`.trim() || 'Unknown'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="font-bold text-green-600">{formatCurrency(val)}</span>
    },
    {
      key: 'requestedAt',
      label: 'Requested On',
      render: (val) => formatDateTime(val)
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant="warning">{val}</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedRequest(row);
              setShowApproveModal(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Approve"
          >
            <FiCheckCircle size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedRequest(row);
              setShowRejectModal(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Reject"
          >
            <FiXCircle size={20} />
          </button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Cash Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Track and manage cash collections & withdrawal requests</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Order Collections
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'withdrawals' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Withdrawal Requests
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Pending Collection</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalPending)}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Pending Withdrawals</p>
            <p className="text-2xl font-bold text-orange-600">{withdrawalStats?.pendingCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Processed Today</p>
            <p className="text-2xl font-bold text-blue-600">{withdrawalStats?.processedToday || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(withdrawalStats?.totalWithdrawn || 0)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeTab === 'orders' && (
            <>
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order ID or customer..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </form>

              <AnimatedSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'collected', label: 'Collected' },
                  { value: 'pending', label: 'Pending' },
                ]}
                className="min-w-[140px]"
              />
            </>
          )}
        </div>

        <div className="mt-4">
          <DataTable
            data={activeTab === 'orders' ? collections : withdrawalRequests}
            columns={activeTab === 'orders' ? columns : withdrawalColumns}
            loading={loading}
            pagination={activeTab === 'orders'}
            itemsPerPage={pagination.limit}
            totalItems={pagination.total}
            totalPages={pagination.totalPages}
            currentPage={pagination.page}
            onPageChange={(page) => fetchCollections(page)}
          />
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Approve Withdrawal Request</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Partner</p>
                <p className="font-semibold text-gray-800">
                  {`${selectedRequest.deliveryPartnerId?.firstName || ''} ${selectedRequest.deliveryPartnerId?.lastName || ''}`.trim()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedRequest.amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID <span className="text-red-500">*</span></label>
                <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter transaction ID" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add any notes..." rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleApproveWithdrawal} disabled={!transactionId.trim()} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors">Approve</button>
                <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reject Withdrawal Request</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Partner</p>
                <p className="font-semibold text-gray-800">
                  {`${selectedRequest.deliveryPartnerId?.firstName || ''} ${selectedRequest.deliveryPartnerId?.lastName || ''}`.trim()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedRequest.amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why..." rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleRejectWithdrawal} disabled={!rejectionReason.trim()} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors">Reject</button>
                <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CashCollection;


