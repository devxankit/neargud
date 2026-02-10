import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiAlertTriangle, FiEdit, FiPackage, FiPlus, FiMinus, FiTrendingDown, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import ExportButton from '../../../components/Admin/ExportButton';
import Badge from '../../../components/Badge';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { fetchStock, fetchStockStats, updateStock } from '../../../services/vendorStockApi';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const StockManagement = () => {
  const { vendor } = useVendorAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockStats, setStockStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [stockModal, setStockModal] = useState({ isOpen: false, product: null });

  const vendorId = vendor?.id;

  const loadStockData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const result = await fetchStock({
        page,
        limit,
        search: searchQuery,
        stock: stockFilter === 'all' ? undefined : stockFilter,
        lowStockThreshold
      });

      if (result.success) {
        setProducts(result.data.products);
        setTotalPages(result.pagination.pages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  }, [vendorId, page, limit, searchQuery, stockFilter, lowStockThreshold]);

  const loadStats = useCallback(async () => {
    if (!vendorId) return;
    try {
      const result = await fetchStockStats();
      if (result.success && result.data.stats) {
        setStockStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stock stats', error);
    }
  }, [vendorId]);

  useEffect(() => {
    loadStockData();
  }, [page, stockFilter, lowStockThreshold, loadStockData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStockData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, loadStockData]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);


  const handleStockUpdate = async (productId, newQuantity) => {
    try {
      await updateStock(productId, newQuantity);
      toast.success('Stock updated successfully');
      setStockModal({ isOpen: false, product: null });
      loadStockData();
      loadStats();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Details',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
            <img
              src={row.image}
              alt={row.name}
              className="w-full h-full object-cover transition-transform hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/50x50?text=Product';
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="font-black text-gray-900 truncate text-sm">{row.name}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU: {row.sku || row._id?.substring(18).toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Selling Price',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-gray-800">{formatPrice(value)}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: false,
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-600">{row.categoryId?.name || 'Uncategorized'}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Dept. ID: {row.categoryId?._id?.substring(18).toUpperCase() || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      label: 'Units Available',
      sortable: true,
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-black text-gray-900 text-base">{value?.toLocaleString() || 0}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Items Left</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Inventory Status',
      sortable: false,
      render: (_, row) => {
        let status = 'in_stock';
        if (row.stockQuantity === 0) status = 'out_of_stock';
        else if (row.stockQuantity <= lowStockThreshold) status = 'low_stock';

        return (
          <Badge
            variant={
              status === 'in_stock'
                ? 'success'
                : status === 'low_stock'
                  ? 'warning'
                  : 'error'
            }>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => setStockModal({ isOpen: true, product: row })}
          className="w-9 h-9 flex items-center justify-center bg-primary-50 text-primary-600 rounded-xl border border-primary-100 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
          title="Quick Edit Stock"
        >
          <FiEdit className="text-sm" />
        </button>
      ),
    },
  ];

  if (!vendorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
          <FiPackage className="text-2xl text-gray-300" />
        </div>
        <p className="text-gray-500 font-bold">Session required to manage inventory</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8">

      {/* Premium Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Stock Management
            <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full uppercase tracking-widest font-black">Live</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Real-time inventory tracking and rapid stock adjustments</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-10 w-px bg-gray-100 hidden md:block mx-2"></div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Stock Valuation</p>
            <p className="text-2xl font-black text-primary-600 leading-none tracking-tight">
              {formatPrice(stockStats.totalValue || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Base Products', value: stockStats.totalProducts, icon: FiPackage, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Healthy Inventory', value: stockStats.inStock, icon: FiPackage, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Low Stock Alerts', value: stockStats.lowStock, icon: FiAlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', pulse: stockStats.lowStock > 0 },
          { label: 'Out of Stock', value: stockStats.outOfStock, icon: FiTrendingDown, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', critical: stockStats.outOfStock > 0 }
        ].map((card, idx) => (
          <div key={idx} className={`bg-white rounded-2xl p-6 shadow-sm border ${card.border} hover:shadow-md transition-all group overflow-hidden relative`}>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                <p className={`text-3xl font-black ${card.color} tracking-tight`}>{card.value || 0}</p>
              </div>
              <div className={`${card.bg} ${card.color} p-3 rounded-xl transition-transform group-hover:scale-110 shadow-sm`}>
                <card.icon className={`${card.pulse ? 'animate-bounce' : ''}`} />
              </div>
            </div>
            {card.critical && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/20"></div>}
          </div>
        ))}
      </div>

      {/* Inventory Control Center (Filters) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by SKU or Product Name..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm font-medium shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <AnimatedSelect
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Inventory' },
                { value: 'in_stock', label: 'In Stock' },
                { value: 'low_stock', label: 'Low Stock' },
                { value: 'out_of_stock', label: 'Out of Stock' },
              ]}
              className="min-w-[180px] bg-white rounded-2xl shadow-sm border-gray-200 text-sm font-bold text-gray-700"
            />

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">Threshold</span>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                min="1"
                className="w-12 text-center font-black text-primary-600 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-full border-4 border-primary-50 border-t-primary-600 animate-spin mb-4"></div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Synchronizing Records...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <ExportButton
                  data={products}
                  headers={[
                    { label: 'Name', accessor: (row) => row.name },
                    { label: 'Price', accessor: (row) => formatPrice(row.price) },
                    { label: 'Stock', accessor: (row) => row.stockQuantity || 0 },
                    {
                      label: 'Status', accessor: (row) => {
                        let status = 'in_stock';
                        if (row.stockQuantity === 0) status = 'out_of_stock';
                        else if (row.stockQuantity <= lowStockThreshold) status = 'low_stock';
                        return status;
                      }
                    },
                  ]}
                  filename="vendor-stock-report"
                />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing {products.length} of {totalItems} SKUs</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <DataTable
                  data={products}
                  columns={columns}
                  pagination={true}
                  itemsPerPage={limit}
                  currentPage={page}
                  totalItems={totalItems}
                  onPageChange={(p) => setPage(p)}
                  totalPages={totalPages}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 italic">
              <FiPackage className="mx-auto text-4xl text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No matching inventory records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={stockModal.isOpen}
        product={stockModal.product}
        lowStockThreshold={lowStockThreshold}
        onClose={() => setStockModal({ isOpen: false, product: null })}
        onUpdate={(newQuantity) => {
          if (stockModal.product) {
            handleStockUpdate(stockModal.product._id || stockModal.product.id, newQuantity);
          }
        }}
      />
    </motion.div>
  );
};

// Premium Stock Update Modal Component
const StockUpdateModal = ({ isOpen, product, lowStockThreshold, onClose, onUpdate }) => {
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('set');

  useEffect(() => {
    if (product) {
      setStockQuantity(product.stockQuantity || 0);
      setStockAdjustment('');
      setAdjustmentType('set');
    }
  }, [product]);

  if (!product || !isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let newQuantity = stockQuantity;

    if (adjustmentType === 'add') {
      newQuantity = (product.stockQuantity || 0) + (parseInt(stockAdjustment) || 0);
    } else if (adjustmentType === 'subtract') {
      newQuantity = Math.max(0, (product.stockQuantity || 0) - (parseInt(stockAdjustment) || 0));
    }

    if (newQuantity < 0) {
      toast.error('Inventory cannot be negative');
      return;
    }

    onUpdate(newQuantity);
  };

  const quickAdjust = (amount) => {
    const newQuantity = Math.max(0, stockQuantity + amount);
    setStockQuantity(newQuantity);
  };

  const newStockStatus =
    stockQuantity === 0
      ? 'out_of_stock'
      : stockQuantity <= lowStockThreshold
        ? 'low_stock'
        : 'in_stock';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
              {/* Modal Header */}
              <div className="p-8 pb-6 border-b border-gray-50 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50/30 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Update Inventory</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <FiX />
                  </button>
                </div>
                <div className="flex items-center gap-4 relative z-10 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-white shadow-sm">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight mb-1">{product.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current: {product.stockQuantity || 0} Units</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Adjustment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                    {['set', 'add', 'subtract'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setAdjustmentType(type);
                          if (type === 'set') setStockQuantity(product.stockQuantity || 0);
                          else setStockAdjustment('');
                        }}
                        className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${adjustmentType === type
                          ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                          : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {adjustmentType === 'set' ? (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">
                      Override Total Quantity
                    </label>
                    <div className="flex items-center justify-center gap-4">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => quickAdjust(-5)}
                        className="w-12 h-12 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-2xl border border-gray-100 flex items-center justify-center transition-colors">
                        <FiMinus strokeWidth={3} />
                      </motion.button>
                      <input
                        type="number"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                        className="w-24 text-center font-black text-3xl text-primary-600 focus:outline-none bg-transparent"
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => quickAdjust(5)}
                        className="w-12 h-12 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-2xl border border-gray-100 flex items-center justify-center transition-colors">
                        <FiPlus strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      {adjustmentType === 'add' ? 'Increase' : 'Decrease'} by Units
                    </label>
                    <input
                      type="number"
                      value={stockAdjustment}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setStockAdjustment(e.target.value);
                        if (adjustmentType === 'add') setStockQuantity((product.stockQuantity || 0) + val);
                        else setStockQuantity(Math.max(0, (product.stockQuantity || 0) - val));
                      }}
                      placeholder="Enter quantity..."
                      min="0"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm font-bold transition-all"
                    />
                  </div>
                )}

                <div className="p-4 bg-primary-50/30 rounded-2xl border border-primary-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Projection</span>
                  <Badge
                    variant={
                      newStockStatus === 'in_stock'
                        ? 'success'
                        : newStockStatus === 'low_stock'
                          ? 'warning'
                          : 'error'
                    }>
                    {newStockStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all">
                    Commit Changes
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StockManagement;
