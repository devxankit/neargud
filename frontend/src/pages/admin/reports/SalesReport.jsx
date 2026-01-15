import { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiTrendingUp, FiDollarSign, FiShoppingCart, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ExportButton from '../../../components/Admin/ExportButton';
import { formatCurrency, formatDateTime } from '../../../utils/adminHelpers';
import { getSalesReport } from '../../../services/adminReportsApi';
import toast from 'react-hot-toast';

const SalesReport = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState({ summary: {}, orders: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const response = await getSalesReport(params);
      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch sales report');
      console.error('Sales report error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Debounced fetch when date range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReport();
    }, 500);
    return () => clearTimeout(timer);
  }, [dateRange]);

  const { summary = {}, orders = [] } = reportData;

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value) => <span className="font-semibold text-primary-600">#{value}</span>,
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value) => (
        <div>
          <p className="font-medium text-gray-800">{value?.name || 'Guest'}</p>
          <p className="text-xs text-gray-500">{value?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => formatDateTime(value),
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-green-600">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${value === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
            value === 'shipped' ? 'bg-blue-100 text-blue-700' :
              value === 'processing' ? 'bg-amber-100 text-amber-700' :
                value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  value === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-800'
          }`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-sm text-gray-500 mt-1">View detailed sales analytics and order history</p>
        </div>
        <button
          onClick={fetchReport}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm disabled:opacity-50"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-emerald-100 font-medium">Total Sales</p>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiDollarSign className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-black">{formatCurrency(summary.totalSales || 0)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-blue-100 font-medium">Total Orders</p>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiShoppingCart className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-black">{summary.totalOrders || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-purple-100 font-medium">Average Order Value</p>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-black">{formatCurrency(summary.averageOrderValue || 0)}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex items-end">
            <ExportButton
              data={orders}
              headers={[
                { label: 'Order ID', accessor: (row) => row.id },
                { label: 'Customer', accessor: (row) => row.customer?.name || 'Guest' },
                { label: 'Email', accessor: (row) => row.customer?.email || '' },
                { label: 'Date', accessor: (row) => formatDateTime(row.date) },
                { label: 'Amount', accessor: (row) => formatCurrency(row.total) },
                { label: 'Status', accessor: (row) => row.status },
              ]}
              filename={`sales-report-${dateRange.start || 'all'}-${dateRange.end || 'all'}`}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Details</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length > 0 ? (
          <DataTable
            data={orders}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
          />
        ) : (
          <div className="text-center py-12">
            <FiShoppingCart className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders found for the selected date range</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesReport;
