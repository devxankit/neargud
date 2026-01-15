import { useState, useEffect } from 'react';
import { FiSearch, FiTag, FiCopy, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import Badge from '../../../components/Badge';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { fetchVendorPromotions } from '../services/vendorPromotionsApi';
import toast from 'react-hot-toast';

const Promotions = () => {
  const { vendor } = useVendorAuthStore();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Pagination state (if needed in future, currently client-side filtering or full fetch)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await fetchVendorPromotions({
        search: searchQuery,
        page: page,
        limit: 100 // Fetching more for now since it's a list view
      });

      if (data.success && data.data?.promotions) {
        setPromotions(data.data.promotions);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to load promotions", error);
      toast.error("Failed to load active promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [page, searchQuery]); // Refetch when page or search changes

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Code copied to clipboard');
  };

  const columns = [
    {
      key: 'code',
      label: 'Promo Code',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-bold bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-100">{row.code}</code>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(row.code);
              }}
              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy Code">
              {copiedCode === row.code ? <FiCheck className="text-green-500" /> : <FiCopy />}
            </button>
          </div>
          {row.name && <p className="text-xs text-gray-500 mt-1 ml-1">{row.name}</p>}
        </div>
      ),
    },
    {
      key: 'value',
      label: 'Discount',
      sortable: true,
      render: (value, row) => (
        <span className="font-semibold text-gray-700">
          {row.type === 'percentage' ? `${value}% OFF` : `${formatPrice(value)} OFF`}
          {row.maxDiscount && row.type === 'percentage' && (
            <span className="block text-xs text-gray-500 font-normal">Up to {formatPrice(row.maxDiscount)}</span>
          )}
        </span>
      ),
    },
    {
      key: 'minPurchase',
      label: 'Min. Purchase',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value > 0 ? formatPrice(value) : 'None'}
        </span>
      ),
    },
    {
      key: 'endDate',
      label: 'Valid Until',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <p className="font-medium text-gray-700">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(value) < new Date() ? <span className="text-red-500">Expired</span> : <span className="text-green-600">Active</span>}
          </p>
        </div>
      ),
    },
    {
      key: 'usageLimit',
      label: 'Available',
      sortable: true,
      render: (_, row) => {
        if (row.usageLimit === -1) return <Badge variant="success">Unlimited</Badge>;
        const remaining = row.usageLimit - (row.usedCount || 0);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{remaining > 0 ? remaining : 0} left</span>
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${Math.min(100, (remaining / row.usageLimit) * 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiTag className="text-primary-600" />
            Active Promo Codes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">View available promo codes for your store</p>
        </div>
        <button
          onClick={fetchPromotions}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search promo codes..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading active promotions...</p>
        </div>
      ) : promotions.length > 0 ? (
        <DataTable
          data={promotions}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
        />
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <FiTag className="text-4xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Active Promo Codes</h3>
          <p className="text-gray-500">There are currently no active promo codes available.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Promotions;

