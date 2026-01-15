import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminOrderApi } from '../../../services/adminOrderApi';
import { FiSearch, FiMapPin, FiTruck, FiPackage, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import Badge from '../../../components/Badge';
import { formatDateTime } from '../../../utils/adminHelpers';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('orderId') || '');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await adminOrderApi.getOrders({});
        if (response?.success) {
          const ordersData = response.data.orders || [];
          setOrders(ordersData);

          // If orderId is in URL, select it
          const urlOrderId = searchParams.get('orderId');
          if (urlOrderId) {
            const order = ordersData.find(o => o._id === urlOrderId || o.orderCode === urlOrderId);
            if (order) setSelectedOrder(order);
          }
        }
      } catch (error) {
        console.error('Error fetching orders for tracking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [searchParams]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderCode?.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.customer?.email?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const getTrackingSteps = (order) => {
    const status = order.status;
    const history = order.statusHistory || [];

    const getTimestamp = (targetStatus) => {
      const entry = history.find(h => h.status === targetStatus);
      return entry ? entry.timestamp : null;
    };

    const steps = [
      {
        id: 'placed',
        label: 'Order Placed',
        description: 'Order has been successfully placed',
        status: 'completed',
        icon: FiCheckCircle,
        timestamp: order.createdAt || getTimestamp('pending')
      },
      {
        id: 'processing',
        label: 'Processing',
        description: 'Order is being prepared',
        status: ['processing', 'ready_to_ship', 'dispatched', 'shipped_seller', 'shipped', 'delivered'].includes(status) ? 'completed' : (status === 'pending' ? 'current' : 'pending'),
        icon: FiPackage,
        timestamp: getTimestamp('processing')
      },
      {
        id: 'ready',
        label: 'Ready to Ship',
        description: 'Order is packed and ready for pickup',
        status: ['ready_to_ship', 'dispatched', 'shipped_seller', 'shipped', 'delivered'].includes(status) ? 'completed' : (status === 'processing' ? 'current' : 'pending'),
        icon: FiClock,
        timestamp: getTimestamp('ready_to_ship')
      },
      {
        id: 'shipped',
        label: 'Dispatched',
        description: 'Order is on its way',
        status: ['dispatched', 'shipped_seller', 'shipped', 'delivered'].includes(status) ? 'completed' : (status === 'ready_to_ship' ? 'current' : 'pending'),
        icon: FiTruck,
        timestamp: getTimestamp('dispatched') || getTimestamp('shipped') || getTimestamp('shipped_seller')
      },
      {
        id: 'delivered',
        label: 'Delivered',
        description: 'Order has been delivered',
        status: status === 'delivered' ? 'completed' : (['dispatched', 'shipped_seller', 'shipped'].includes(status) ? 'current' : 'pending'),
        icon: FiMapPin,
        timestamp: order.deliveredDate || getTimestamp('delivered')
      },
    ];

    if (status === 'cancelled') {
      steps.push({
        id: 'cancelled',
        label: 'Cancelled',
        description: 'Order has been cancelled',
        status: 'error',
        icon: FiAlertCircle,
        timestamp: order.cancelledDate || getTimestamp('cancelled')
      });
    }

    return steps;
  };

  const columns = [
    {
      key: 'orderCode',
      label: 'Order ID',
      sortable: true,
      render: (value) => <span className="font-bold text-primary-600">{value}</span>,
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value) => (
        <div>
          <p className="font-semibold text-gray-800">{value?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{value?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <Badge variant={value}>{value}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      sortable: true,
      render: (value) => <span className="text-gray-600 text-sm">{formatDateTime(value)}</span>,
    },
    {
      key: 'actions',
      label: 'Track',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => setSelectedOrder(row)}
          className={`p-2 rounded-lg transition-all ${selectedOrder?._id === row._id ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <FiTruck className="text-lg" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor real-time status of customer orders</p>
        </div>
        <div className="relative min-w-[300px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-12 xl:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <DataTable
              data={filteredOrders}
              columns={columns}
              pagination={true}
              itemsPerPage={8}
            />
          </div>
        </div>

        {/* Tracking Sidebar */}
        <div className="lg:col-span-12 xl:col-span-4">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full sticky top-6"
              >
                {/* Order Quick Info Header */}
                <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Tracking Order</p>
                      <h3 className="text-xl font-bold">{selectedOrder.orderCode}</h3>
                    </div>
                    <Badge variant={selectedOrder.status} className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-primary-50">
                    <p className="flex items-center gap-2">
                      <span className="opacity-70">Customer:</span>
                      <span className="font-medium text-white">{selectedOrder.customer?.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="opacity-70">Placed on:</span>
                      <span className="font-medium text-white">{formatDateTime(selectedOrder.createdAt)}</span>
                    </p>
                  </div>
                </div>

                {/* Tracking Steps Container */}
                <div className="p-8 flex-1">
                  <div className="relative">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                    <div className="space-y-10">
                      {getTrackingSteps(selectedOrder).map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';
                        const isError = step.status === 'error';

                        return (
                          <div key={step.id} className="relative flex items-start gap-4">
                            {/* Icon Circle */}
                            <div
                              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white shadow-sm
                                ${isCompleted ? 'bg-green-500 text-white ring-4 ring-green-50' :
                                  isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-50' :
                                    isError ? 'bg-red-500 text-white ring-4 ring-red-50' :
                                      'bg-gray-200 text-gray-400'}`}
                            >
                              <Icon className="text-xs" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-0.5">
                              <div className="flex justify-between items-start">
                                <h4 className={`font-bold text-sm ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-primary-600' : isError ? 'text-red-600' : 'text-gray-400'}`}>
                                  {step.label}
                                </h4>
                                {step.timestamp && (
                                  <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full">
                                    {formatDateTime(step.timestamp)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 px-6 py-4">
                  <button
                    onClick={() => navigate(`/admin/orders/${selectedOrder._id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all font-bold text-sm shadow-sm"
                  >
                    View Order Details
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-[600px] border-dashed"
              >
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                  <FiTruck className="text-3xl text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Select an Order</h3>
                <p className="text-gray-500 max-w-[200px]">Click the truck icon on any order to view its real-time tracking details.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

