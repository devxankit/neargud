import { useState, useEffect } from 'react';
import { FiSearch, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../../../utils/adminHelpers';
import toast from 'react-hot-toast';
import api from '../../../utils/api';

const CashCollection = () => {
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [stats, setStats] = useState({ totalCollected: 0, totalPending: 0 });

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

  useEffect(() => {
    fetchCollections(1);
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCollections(1);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Cash Collection</h1>
        <p className="text-sm sm:text-base text-gray-600">Track cash on delivery collections</p>
      </div>

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

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <DataTable
          data={collections}
          columns={columns}
          loading={loading}
          pagination={true}
          itemsPerPage={pagination.limit}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          currentPage={pagination.page}
          onPageChange={(page) => fetchCollections(page)}
        />
      </div>
    </motion.div>
  );
};

export default CashCollection;

