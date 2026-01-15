import { useState, useEffect } from 'react';
import { FiBarChart, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ExportButton from '../../../components/Admin/ExportButton';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { fetchInventoryReport } from '../../../services/vendorInventoryApi';
import toast from 'react-hot-toast';

const InventoryReports = () => {
  const { vendor } = useVendorAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    inventory: [],
    stats: {
      totalProducts: 0,
      totalStockValue: 0,
      totalSold: 0,
      lowStockItems: 0,
    }
  });

  const vendorId = vendor?.id;

  const loadReport = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const response = await fetchInventoryReport();
      if (response) {
        setData(response);
      }
    } catch (error) {
      console.error('Failed to load inventory report:', error);
      toast.error('Failed to load inventory report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [vendorId]);

  const columns = [
    { key: 'name', label: 'Product', sortable: true },
    {
      key: 'currentStock',
      label: 'Current Stock',
      sortable: true,
      render: (value) => (
        <span className={value < 10 ? 'text-red-600 font-semibold' : 'text-gray-800'}>
          {value}
        </span>
      ),
    },
    { key: 'price', label: 'Price', sortable: true, render: (value) => formatPrice(value) },
    { key: 'stockValue', label: 'Stock Value', sortable: true, render: (value) => formatPrice(value) },
    { key: 'sold', label: 'Units Sold', sortable: true },
  ];

  if (!vendorId && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view reports</p>
      </div>
    );
  }

  const { inventory, stats } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiBarChart className="text-primary-600" />
            Inventory Reports
          </h1>
          <p className="text-xs text-gray-500">Inventory analysis and stock reports</p>
        </div>
        <button
          onClick={loadReport}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Stock Value</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{loading ? '...' : formatPrice(stats.totalStockValue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Units Sold</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalSold}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 flex items-center gap-1">
            <FiAlertCircle className="text-red-600" />
            Low Stock
          </p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">{loading ? '...' : stats.lowStockItems}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-gray-200 gap-4">
        <h3 className="font-semibold text-gray-700">Detailed Inventory Analysis</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={loadReport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all hidden sm:flex"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <ExportButton
            data={inventory}
            headers={[
              { label: 'Product', accessor: (row) => row.name },
              { label: 'Current Stock', accessor: (row) => row.currentStock },
              { label: 'Price', accessor: (row) => formatPrice(row.price) },
              { label: 'Stock Value', accessor: (row) => formatPrice(row.stockValue) },
              { label: 'Units Sold', accessor: (row) => row.sold },
            ]}
            filename="vendor-inventory-report"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : inventory.length > 0 ? (
          <DataTable
            data={inventory}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
          />
        ) : (
          <div className="text-center py-24">
            <FiAlertCircle className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">No inventory data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryReports;
