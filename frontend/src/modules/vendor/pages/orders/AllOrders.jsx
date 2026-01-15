
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiXCircle,
  FiShoppingBag,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from "../../../../components/Admin/DataTable";
import ExportButton from "../../../../components/Admin/ExportButton";
import Badge from "../../../../components/Badge";
import AnimatedSelect from "../../../../components/Admin/AnimatedSelect";
import { formatPrice } from "../../../../utils/helpers";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import { useVendorOrderStore } from "../../store/vendorOrderStore";
import toast from 'react-hot-toast';

const AllOrders = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const {
    orders,
    fetchOrders,
    isLoading
  } = useVendorOrderStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const vendorId = vendor?.id || vendor?._id;

  // Fetch orders from API
  useEffect(() => {
    if (vendorId) {
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const debounceTimer = setTimeout(() => {
        fetchOrders(params);
      }, searchQuery ? 500 : 0);

      return () => clearTimeout(debounceTimer);
    }
  }, [vendorId, selectedStatus, searchQuery, fetchOrders]);

  const filteredOrders = orders; // Now filtered by backend

  // Get vendor-specific order data
  const getVendorOrderData = (order) => {
    if (order.vendorItems && Array.isArray(order.vendorItems)) {
      const vendorItem = order.vendorItems.find((vi) => vi.vendorId === vendorId);
      if (vendorItem) {
        return {
          itemCount: vendorItem.items?.length || 0,
          subtotal: vendorItem.subtotal || 0,
          commission: vendorItem.commission || 0,
          firstItem: vendorItem.items?.[0] || null,
        };
      }
    }
    // Fallback
    const vendorItems = order.items?.filter((item) => item.vendorId === vendorId) || [];
    return {
      itemCount: vendorItems.length,
      subtotal: vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      commission: 0,
      firstItem: vendorItems[0] || null,
    };
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{row.orderCode || value}</span>
          <span className="text-[10px] text-gray-400">#{value}</span>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Products',
      sortable: false,
      render: (_, row) => {
        const vendorData = getVendorOrderData(row);
        const item = vendorData.firstItem;
        return (
          <div className="flex items-center gap-3">
            {item?.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=P'; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FiPackage className="text-gray-400" />
              </div>
            )}
            <div className="flex flex-col max-w-[150px]">
              <span className="text-sm font-medium text-gray-800 truncate" title={item?.name}>
                {item?.name || 'Unknown Product'}
              </span>
              {vendorData.itemCount > 1 && (
                <span className="text-xs text-gray-400">
                  +{vendorData.itemCount - 1} more items
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'subtotal',
      label: 'Amount',
      sortable: true,
      render: (_, row) => {
        const vendorData = getVendorOrderData(row);
        return (
          <span className="font-semibold text-gray-800">
            {formatPrice(vendorData.subtotal)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === 'delivered'
              ? 'success'
              : value === 'pending'
                ? 'warning'
                : value === 'cancelled' || value === 'canceled'
                  ? 'error'
                  : 'info'
          }>
          {value?.toUpperCase() || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => navigate(`/vendor/orders/${row.id}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <FiEye />
        </button>
      ),
    },
  ];

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view orders</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            All Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage all your orders
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Filters Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 w-full sm:min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID or Tracking..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
              />
            </div>

            <AnimatedSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              className="w-full sm:w-auto min-w-[140px]"
            />

            <div className="w-full sm:w-auto">
              <ExportButton
                data={filteredOrders}
                headers={[
                  { label: 'Order ID', accessor: (row) => row.id },
                  { label: 'Date', accessor: (row) => new Date(row.date).toLocaleDateString() },
                  { label: 'Items', accessor: (row) => getVendorOrderData(row).itemCount },
                  { label: 'Amount', accessor: (row) => formatPrice(getVendorOrderData(row).subtotal) },
                  { label: 'Status', accessor: (row) => row.status },
                ]}
                filename="vendor-orders"
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        {filteredOrders.length > 0 ? (
          <DataTable
            data={filteredOrders}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            onRowClick={(row) => navigate(`/vendor/orders/${row.id}`)}
          />
        ) : (
          <div className="text-center py-12">
            <FiShoppingBag className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No orders found</p>
            <p className="text-sm text-gray-400">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Orders containing your products will appear here'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AllOrders;

