import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ExportButton from '../../../components/Admin/ExportButton';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { useOrderStore } from '../../../store/orderStore';
import { vendorReturnApi } from '../../../services/vendorReturnApi';
import toast from 'react-hot-toast';

const ReturnRequests = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const [returnRequests, setReturnRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const vendorId = vendor?.id;

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const response = await vendorReturnApi.getReturns({ status: selectedStatus !== 'all' ? selectedStatus : undefined });
      setReturnRequests(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
      toast.error('Failed to load return requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchReturns();
    }
  }, [vendorId, selectedStatus]);

  // Filtered return requests
  const filteredRequests = useMemo(() => {
    let filtered = [...returnRequests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          request.returnCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.orderId?.orderCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.customerId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((request) => new Date(request.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((request) => new Date(request.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((request) => new Date(request.createdAt) >= filterDate);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [returnRequests, searchQuery, dateFilter]);

  // Handle status update
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await vendorReturnApi.updateStatus(requestId, newStatus);
      toast.success(`Return request ${newStatus} successfully`);
      fetchReturns();
    } catch (error) {
      console.error('Status update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    const statusMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      processing: 'info',
      completed: 'success',
    };
    return statusMap[status] || 'warning';
  };

  // Table columns
  const columns = [
    {
      key: 'returnCode',
      label: 'Return ID',
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
      render: (value) => (
        <span
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/vendor/orders/${value?._id || value}`);
          }}
        >
          {value?.orderCode || 'N/A'}
        </span>
      ),
    },
    {
      key: 'customerId',
      label: 'Customer',
      sortable: true,
      render: (value) => (
        <div>
          <p className="font-medium text-gray-800">
            {value?.name || (value?.firstName ? `${value.firstName} ${value.lastName || ''}` : 'N/A')}
          </p>
          <p className="text-xs text-gray-500">{value?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Request Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'items',
      label: 'Items',
      sortable: false,
      render: (value) => {
        const count = Array.isArray(value) ? value.length : 0;
        return <span>{count} item{count !== 1 ? 's' : ''}</span>;
      },
    },
    {
      key: 'reason',
      label: 'Reason',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-700 capitalize">{value?.replace(/_/g, ' ')}</span>
      ),
    },
    {
      key: 'refundAmount',
      label: 'Refund Amount',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-gray-800">{formatPrice(value)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <Badge variant={getStatusVariant(value)}>{value.toUpperCase()}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const requestId = row._id || row.id;
              if (requestId) navigate(`/vendor/return-requests/${requestId}`);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const requestId = row._id || row.id;
                  if (!requestId) return;
                  if (window.confirm('Are you sure you want to approve this return request?')) {
                    handleStatusUpdate(requestId, 'approved');
                  }
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Approve"
              >
                <FiCheck />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const requestId = row._id || row.id;
                  if (!requestId) return;
                  if (window.confirm('Are you sure you want to reject this return request?')) {
                    handleStatusUpdate(requestId, 'rejected');
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject"
              >
                <FiX />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Get status counts for stats
  const statusCounts = useMemo(() => {
    return {
      all: returnRequests.length,
      pending: returnRequests.filter((r) => r.status === 'pending').length,
      approved: returnRequests.filter((r) => r.status === 'approved').length,
      processing: returnRequests.filter((r) => r.status === 'processing').length,
      completed: returnRequests.filter((r) => r.status === 'completed').length,
      rejected: returnRequests.filter((r) => r.status === 'rejected').length,
    };
  }, [returnRequests]);

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view return requests</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Return Requests</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and process customer return requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{statusCounts.all}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-lg sm:text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">{statusCounts.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Processing</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{statusCounts.processing}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">{statusCounts.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-lg sm:text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, order ID, name, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>

          <AnimatedSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />

          <AnimatedSelect
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />

          <div className="w-full sm:w-auto">
            <ExportButton
              data={filteredRequests}
              headers={[
                { label: 'Return ID', accessor: (row) => row.returnCode },
                { label: 'Order ID', accessor: (row) => row.orderId?.orderCode },
                { label: 'Customer', accessor: (row) => row.customerId?.name || `${row.customerId?.firstName} ${row.customerId?.lastName || ''}` },
                { label: 'Email', accessor: (row) => row.customerId?.email },
                { label: 'Request Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
                { label: 'Items', accessor: (row) => row.items?.length },
                { label: 'Reason', accessor: (row) => row.reason },
                { label: 'Refund Amount', accessor: (row) => formatPrice(row.refundAmount) },
                { label: 'Status', accessor: (row) => row.status },
              ]}
              filename="vendor-return-requests"
            />
          </div>
        </div>
      </div>

      {/* Return Requests Table */}
      {filteredRequests.length > 0 ? (
        <DataTable
          data={filteredRequests}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
          onRowClick={(row) => {
            const requestId = row._id || row.id;
            if (requestId) navigate(`/vendor/return-requests/${requestId}`);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No return requests found</p>
        </div>
      )}
    </motion.div>
  );
};

export default ReturnRequests;

