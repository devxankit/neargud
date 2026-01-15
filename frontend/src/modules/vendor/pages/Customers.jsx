import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiEye, FiMail, FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ExportButton from '../../../components/Admin/ExportButton';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { fetchVendorCustomers } from '../../../services/vendorCustomersApi';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

const Customers = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const vendorId = vendor?.id;

  const loadCustomers = useCallback(async (params = {}) => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const response = await fetchVendorCustomers({
        search: params.search ?? searchQuery,
        page: params.page ?? pagination.page,
        limit: params.limit ?? pagination.limit,
      });
      if (response) {
        setCustomers(response.customers || []);
        setStats(response.stats || {
          totalCustomers: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
        });
        setPagination({
          page: response.meta?.page || 1,
          limit: response.meta?.limit || 10,
          total: response.meta?.total || 0,
          pages: response.meta?.pages || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      // toast is already handled by api utility usually, but adding for extra safety
      // toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [vendorId, searchQuery, pagination.page, pagination.limit]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      loadCustomers({ search: query, page: 1 });
    }, 500),
    [loadCustomers]
  );

  useEffect(() => {
    if (vendorId) {
      loadCustomers();
    }
  }, [vendorId]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handlePageChange = (newPage) => {
    loadCustomers({ page: newPage });
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-800">{value}</p>
          {row.email && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FiMail className="text-xs" />
              {row.email}
            </p>
          )}
          {row.phone && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FiPhone className="text-xs" />
              {row.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'orders',
      label: 'Orders',
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-gray-800">{formatPrice(value)}</span>
      ),
    },
    {
      key: 'lastOrderDate',
      label: 'Last Order',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/vendor/customers/${row.id}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <FiEye />
        </button>
      ),
    },
  ];

  if (!vendorId && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view customers</p>
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
          <FiUsers className="text-primary-600" />
          Customers
        </h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage your customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Customers</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? '...' : stats.totalCustomers}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? '...' : formatPrice(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? '...' : formatPrice(stats.averageOrderValue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>

          <ExportButton
            data={customers}
            headers={[
              { label: 'Name', accessor: (row) => row.name },
              { label: 'Email', accessor: (row) => row.email },
              { label: 'Phone', accessor: (row) => row.phone },
              { label: 'Orders', accessor: (row) => row.orders },
              { label: 'Total Spent', accessor: (row) => formatPrice(row.totalSpent) },
              { label: 'Last Order', accessor: (row) => row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString() : 'N/A' },
            ]}
            filename="vendor-customers"
          />
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : customers.length > 0 ? (
        <DataTable
          data={customers}
          columns={columns}
          pagination={true}
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No customers found</p>
        </div>
      )}
    </motion.div>
  );
};

export default Customers;
