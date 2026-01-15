import { useState, useEffect } from 'react';
import { FiPackage, FiAlertCircle, FiTrendingDown, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ExportButton from '../../../components/Admin/ExportButton';
import { formatCurrency } from '../../../utils/adminHelpers';
import { getInventoryReport } from '../../../services/adminReportsApi';
import toast from 'react-hot-toast';

const InventoryReport = () => {
  const [reportData, setReportData] = useState({ stats: {}, lowStockProducts: [], products: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'lowStock'

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await getInventoryReport();
      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch inventory report');
      console.error('Inventory report error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const { stats = {}, lowStockProducts = [], products = [] } = reportData;

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {row.image ? (
              <img
                src={row.image}
                alt={value}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/50x50?text=P';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FiPackage />
              </div>
            )}
          </div>
          <span className="font-semibold text-gray-800">{value}</span>
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      label: 'Stock',
      sortable: true,
      render: (value) => (
        <span className={`font-bold ${value < 10 ? 'text-red-600' : value < 50 ? 'text-amber-600' : 'text-green-600'}`}>
          {value?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          in_stock: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: FiCheckCircle, label: 'In Stock' },
          low_stock: { bg: 'bg-amber-100', text: 'text-amber-700', icon: FiAlertTriangle, label: 'Low Stock' },
          out_of_stock: { bg: 'bg-red-100', text: 'text-red-700', icon: FiXCircle, label: 'Out of Stock' },
        };
        const config = statusConfig[value] || statusConfig.in_stock;
        const Icon = config.icon;

        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
            <Icon className="text-sm" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'price',
      label: 'Unit Price',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-700">{formatCurrency(value)}</span>,
    },
    {
      key: 'value',
      label: 'Total Value',
      sortable: true,
      render: (value) => <span className="font-bold text-primary-600">{formatCurrency(value)}</span>,
    },
  ];

  const displayProducts = activeTab === 'lowStock' ? lowStockProducts : products;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Report</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor stock levels and inventory value</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiPackage className="text-blue-600 text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.totalProducts || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">In Stock</p>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-emerald-600 text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.inStock || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Low Stock</p>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <FiAlertCircle className="text-amber-600 text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.lowStock || 0}</p>
          {stats.outOfStock > 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">{stats.outOfStock} out of stock</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-purple-100 font-medium">Total Value</p>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiTrendingDown className="text-lg" />
            </div>
          </div>
          <p className="text-2xl font-black">{formatCurrency(stats.totalValue || 0)}</p>
        </motion.div>
      </div>

      {/* Tabs and Export */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('lowStock')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'lowStock'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}
            >
              <FiAlertTriangle />
              Low Stock Alert ({lowStockProducts.length})
            </button>
          </div>
          <ExportButton
            data={displayProducts}
            headers={[
              { label: 'Product Name', accessor: (row) => row.name },
              { label: 'Stock Quantity', accessor: (row) => row.stockQuantity },
              { label: 'Status', accessor: (row) => row.stock?.replace('_', ' ').toUpperCase() },
              { label: 'Unit Price', accessor: (row) => formatCurrency(row.price) },
              { label: 'Total Value', accessor: (row) => formatCurrency(row.value) },
            ]}
            filename={`inventory-report-${activeTab}`}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {activeTab === 'lowStock' ? 'Low Stock Products' : 'All Products'}
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayProducts.length > 0 ? (
          <DataTable
            data={displayProducts}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
          />
        ) : (
          <div className="text-center py-12">
            <FiPackage className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {activeTab === 'lowStock' ? 'No low stock products - Great job!' : 'No products found'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryReport;
