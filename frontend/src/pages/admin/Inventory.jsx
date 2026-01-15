import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch, FiAlertTriangle, FiEdit, FiRefreshCw, FiX, FiPackage, FiPlus, FiMinus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../components/Admin/DataTable';
import ExportButton from '../../components/Admin/ExportButton';
import Badge from '../../components/Badge';
import AnimatedSelect from '../../components/Admin/AnimatedSelect';
import { formatCurrency } from '../../utils/adminHelpers';
import toast from 'react-hot-toast';
import { fetchProducts, updateProduct } from '../../services/productApi';

const Inventory = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkUpdateValue, setBulkUpdateValue] = useState('');
  const [stockModal, setStockModal] = useState({ isOpen: false, product: null });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await fetchProducts({
        page: pagination.page,
        limit: 10,
        search: searchQuery,
        stock: stockFilter
      });

      const backendProducts = response.data?.products || [];
      const { total, totalPages } = response.data || {};

      const mappedProducts = backendProducts.map(p => ({
        ...p,
        id: p._id,
        image: p.images?.[0]?.url || p.images?.[0] || 'https://via.placeholder.com/50',
        stockQuantity: p.stockQuantity || 0,
        // Status is now handled by backend, but we can override if needed for visualization using threshold
        // Ideally backend 'stock' field should be used. However, 'low_stock' on backend 
        // implies <= 10 (hardcoded in service). If user changes threshold here, it's visual only.
        stock: p.stock || 'in_stock'
      }));

      setProducts(mappedProducts);
      setPagination(prev => ({ ...prev, total: total || 0, totalPages: totalPages || 1 }));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchQuery, stockFilter]);

  // Handle stock update
  const handleStockUpdate = async (productId, newQuantity) => {
    try {
      await updateProduct(productId, { stockQuantity: newQuantity });
      toast.success('Stock updated successfully');
      fetchInventory(); // Reload to get updated status/sorting
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stock');
    }
  };

  // We no longer filter client-side for main list
  const filteredProducts = products;


  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products to update');
      return;
    }
    if (!bulkUpdateValue || isNaN(bulkUpdateValue)) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const newQuantity = parseInt(bulkUpdateValue);

    try {
      // Parallel updates
      await Promise.all(selectedProducts.map(id => updateProduct(id, { stockQuantity: newQuantity })));

      toast.success(`${selectedProducts.length} products updated successfully`);
      setSelectedProducts([]);
      setBulkUpdateValue('');
      fetchInventory(); // Reload to be safe
    } catch (error) {
      console.error(error);
      toast.error('Failed to update some products');
    }
  };

  // Table columns
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={value}
            className="w-10 h-10 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/50x50?text=Product';
            }}
          />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      label: 'Current Stock',
      sortable: true,
      render: (value, row) => {
        const isLow = value <= lowStockThreshold;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isLow ? 'text-orange-600' : 'text-gray-800'}`}>
              {value}
            </span>
            {isLow && <FiAlertTriangle className="text-orange-600" />}
          </div>
        );
      },
    },
    {
      key: 'stock',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === 'in_stock'
              ? 'success'
              : value === 'low_stock'
                ? 'warning'
                : 'error'
          }
        >
          {value.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => setStockModal({ isOpen: true, product: row })}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Update Stock"
        >
          <FiEdit />
        </button>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Monitor and manage product stock levels</p>
        </div>
      </div>

      {/* Stats Cards - Note: Low/Out of Stock counts require dedicated stats API, showing only Total for now or N/A */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiRefreshCw className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer" onClick={() => setStockFilter('low_stock')}>
          {/* Click to filter */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">--</p>
              <p className="text-xs text-gray-500">Click to view</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer" onClick={() => setStockFilter('out_of_stock')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">--</p>
              <p className="text-xs text-gray-500">Click to view</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Stock Filter */}
          <AnimatedSelect
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Stock' },
              { value: 'in_stock', label: 'In Stock' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
            ]}
            className="min-w-[140px]"
          />

          {/* Low Stock Threshold */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Low Stock Threshold:
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
              min="1"
              className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Export Button */}
          <ExportButton
            data={filteredProducts}
            headers={[
              { label: 'ID', accessor: (row) => row.id },
              { label: 'Name', accessor: (row) => row.name },
              { label: 'Stock', accessor: (row) => row.stockQuantity },
              { label: 'Status', accessor: (row) => row.stock },
              { label: 'Price', accessor: (row) => formatCurrency(row.price) },
            ]}
            filename="inventory"
          />
        </div>

        {/* Bulk Update */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-primary-700">
                {selectedProducts.length} product(s) selected
              </span>
              <input
                type="number"
                value={bulkUpdateValue}
                onChange={(e) => setBulkUpdateValue(e.target.value)}
                placeholder="New stock quantity"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleBulkUpdate}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
              >
                Update Stock
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <DataTable
          data={filteredProducts}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          totalItems={pagination.total}
        />
      </div>

      {/* Stock Management Modal */}
      <StockManagementModal
        isOpen={stockModal.isOpen}
        product={stockModal.product}
        lowStockThreshold={lowStockThreshold}
        onClose={() => setStockModal({ isOpen: false, product: null })}
        onUpdate={(newQuantity) => {
          if (stockModal.product) {
            handleStockUpdate(stockModal.product.id, newQuantity);
            setStockModal({ isOpen: false, product: null });
          }
        }}
      />
    </motion.div>
  );
};

// Stock Management Modal Component
const StockManagementModal = ({ isOpen, product, lowStockThreshold, onClose, onUpdate }) => {
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('set'); // 'set', 'add', 'subtract'
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setStockQuantity(product.stockQuantity || 0);
      setStockAdjustment('');
      setAdjustmentType('set');
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let newQuantity = stockQuantity;

    if (adjustmentType === 'set') {
      newQuantity = parseInt(stockQuantity) || 0;
    } else if (adjustmentType === 'add') {
      newQuantity = (product.stockQuantity || 0) + (parseInt(stockAdjustment) || 0);
    } else if (adjustmentType === 'subtract') {
      newQuantity = Math.max(0, (product.stockQuantity || 0) - (parseInt(stockAdjustment) || 0));
    }

    if (newQuantity < 0) {
      toast.error('Stock quantity cannot be negative');
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[10000]"
            onClick={onClose}
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
              className={`bg-white ${isAppRoute ? 'rounded-b-3xl' : 'rounded-t-3xl'} sm:rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto relative`}
              style={{ willChange: 'transform' }}
            >
              {/* Drag Handle - Mobile Only */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="flex justify-center pt-3 pb-2 -mt-2 sm:hidden"
              >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Update Stock</h2>
                    <p className="text-sm text-gray-500">Manage inventory levels</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="bg-gray-50 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=Product';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600">ID: {product.id}</p>
                    <p className="text-sm font-medium text-gray-700">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <span className="text-lg font-bold text-gray-800">{product.stockQuantity || 0}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge
                    variant={
                      product.stock === 'in_stock'
                        ? 'success'
                        : product.stock === 'low_stock'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {product.stock?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </div>
              </motion.div>

              {/* Stock Update Form */}
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Update Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentType('set')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${adjustmentType === 'set'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Set
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentType('add')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${adjustmentType === 'add'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentType('subtract')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${adjustmentType === 'subtract'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Subtract
                    </button>
                  </div>
                </div>

                {/* Stock Input */}
                {adjustmentType === 'set' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Stock Quantity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        min="0"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                        required
                      />
                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => quickAdjust(-10)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiMinus className="inline mr-1" />
                          -10
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAdjust(-1)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiMinus className="inline mr-1" />
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAdjust(1)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiPlus className="inline mr-1" />
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAdjust(10)}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FiPlus className="inline mr-1" />
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {adjustmentType === 'add' ? 'Quantity to Add' : 'Quantity to Subtract'}
                    </label>
                    <input
                      type="number"
                      value={stockAdjustment}
                      onChange={(e) => setStockAdjustment(e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                      placeholder="0"
                      required
                    />
                    {stockAdjustment && (
                      <p className="mt-2 text-sm text-gray-600">
                        New stock will be:{' '}
                        <span className="font-semibold">
                          {adjustmentType === 'add'
                            ? (product.stockQuantity || 0) + parseInt(stockAdjustment || 0)
                            : Math.max(0, (product.stockQuantity || 0) - parseInt(stockAdjustment || 0))}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Preview */}
                {adjustmentType === 'set' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="text-sm font-semibold text-gray-800">{product.stockQuantity || 0}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">New:</span>
                      <span className="text-sm font-bold text-blue-600">{stockQuantity || 0}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                      <span className="text-sm text-gray-600">Change:</span>
                      <span
                        className={`text-sm font-bold ${(stockQuantity || 0) - (product.stockQuantity || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}
                      >
                        {(stockQuantity || 0) - (product.stockQuantity || 0) >= 0 ? '+' : ''}
                        {(stockQuantity || 0) - (product.stockQuantity || 0)}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">New Status:</span>
                        <Badge
                          variant={
                            newStockStatus === 'in_stock'
                              ? 'success'
                              : newStockStatus === 'low_stock'
                                ? 'warning'
                                : 'error'
                          }
                        >
                          {newStockStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Update Stock
                  </button>
                </div>
              </motion.form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Inventory;

