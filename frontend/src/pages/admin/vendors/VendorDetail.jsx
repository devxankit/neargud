import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiEdit,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiUser,
  FiFileText,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  fetchVendorById,
  fetchVendorOrders,
  fetchVendorAnalytics,
  updateVendorStatusApi,
  updateVendorCommissionApi
} from '../../../services/vendorApi';
import Badge from '../../../components/Badge';
import DataTable from '../../../components/Admin/DataTable';
import { formatPrice } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [orderPagination, setOrderPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadVendorData = async () => {
    setLoading(true);
    try {
      const [vendorRes, analyticsRes] = await Promise.all([
        fetchVendorById(id),
        fetchVendorAnalytics(id)
      ]);

      if (vendorRes?.vendor) {
        const v = vendorRes.vendor;
        setVendor({
          ...v,
          id: v._id,
          joinDate: v.createdAt
        });
        setCommissionRate(((v.commissionRate || 0) * 100).toFixed(1));
      }

      if (analyticsRes) {
        setEarningsSummary(analyticsRes.stats || analyticsRes);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load vendor details');
      navigate('/admin/vendors');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetchVendorOrders(id, {
        page: orderPagination.page,
        limit: orderPagination.limit
      });

      if (response?.orders) {
        const formattedOrders = response.orders.map(o => ({
          ...o,
          id: o._id,
          code: o.orderCode,
          date: o.createdAt
        }));
        setVendorOrders(formattedOrders);

        // Derive commissions from orders
        const commissionList = formattedOrders.map(o => {
          const vb = o.vendorBreakdown?.find(vb => vb.vendorId === id || vb.vendorId?._id === id);
          return {
            id: o.id,
            orderId: o.code,
            createdAt: o.date,
            subtotal: vb?.subtotal || 0,
            commission: vb?.commission || 0,
            vendorEarnings: (vb?.subtotal || 0) - (vb?.commission || 0),
            status: o.status === 'delivered' ? 'paid' : (o.status === 'cancelled' ? 'failed' : 'pending')
          };
        });
        setCommissions(commissionList);

        setOrderPagination(prev => ({
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'overview') {
      loadOrders();
    }
  }, [id, activeTab, orderPagination.page]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateVendorStatusApi(id, newStatus);
      toast.success(`Vendor status updated to ${newStatus}`);
      loadVendorData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vendor not found</p>
      </div>
    );
  }

  const orderColumns = [
    {
      key: 'code',
      label: 'Order ID',
      sortable: true,
      render: (value) => <span className="font-semibold text-blue-600">#{value}</span>
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
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
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (_, row) => {
        const vb = row.vendorBreakdown?.find((vi) => vi.vendorId === id || vi.vendorId?._id === id);
        return formatPrice(vb?.subtotal || 0);
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => navigate(`/admin/orders/${row.id}`)}
          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          View
        </button>
      ),
    },
  ];

  const commissionColumns = [
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      sortable: true,
      render: (value) => formatPrice(value),
    },
    {
      key: 'commission',
      label: 'Commission',
      sortable: true,
      render: (value) => <span className="text-red-600">-{formatPrice(value)}</span>,
    },
    {
      key: 'vendorEarnings',
      label: 'Vendor Earnings',
      sortable: true,
      render: (value) => <span className="text-green-600">{formatPrice(value)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === 'paid'
              ? 'success'
              : value === 'pending'
                ? 'warning'
                : 'error'
          }>
          {value?.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {vendor.storeName || vendor.name}
            </h1>
            <p className="text-xs text-gray-500">Vendor ID: {vendor.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              vendor.status === 'approved'
                ? 'success'
                : vendor.status === 'pending'
                  ? 'warning'
                  : 'error'
            }>
            {vendor.status?.toUpperCase()}
          </Badge>
          {vendor.status === 'pending' && (
            <button
              onClick={() => handleStatusUpdate('approved')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <FiCheckCircle />
              Approve
            </button>
          )}
          {vendor.status === 'approved' && (
            <button
              onClick={() => handleStatusUpdate('suspended')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
              <FiXCircle />
              Suspend
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {['overview', 'documents', 'orders', 'commissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}>
              {tab === 'documents' ? 'Verification' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Vendor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Vendor Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FiUser className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="font-semibold text-gray-800">{vendor.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiMail className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{vendor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiPhone className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">{vendor.phone || 'N/A'}</p>
                      </div>
                    </div>
                    {vendor.address && (
                      <div className="flex items-start gap-3">
                        <FiMapPin className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-600">Address</p>
                          <p className="font-semibold text-gray-800">
                            {vendor.address.street || ''}
                            {vendor.address.city && `, ${vendor.address.city}`}
                            {vendor.address.state && `, ${vendor.address.state}`}
                            {vendor.address.zipCode && ` ${vendor.address.zipCode}`}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <FiClock className="text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Join Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(vendor.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Performance</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs text-blue-600 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-800">{vendorOrders.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-green-600 mb-1">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-800">
                        {earningsSummary ? formatPrice(earningsSummary.totalEarnings) : formatPrice(0)}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-xs text-yellow-600 mb-1">Pending Earnings</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {earningsSummary ? formatPrice(earningsSummary.pendingEarnings) : formatPrice(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Verification Documents</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business License */}
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                        <FiFileText size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Business License</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">ID: {vendor.verificationDocs?.businessLicense?.id || 'NOT PROVIDED'}</p>
                      </div>
                    </div>
                    {vendor.verificationDocs?.businessLicense?.url && (
                      <a
                        href={vendor.verificationDocs.businessLicense.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-all shadow-sm"
                      >
                        Open Original
                      </a>
                    )}
                  </div>
                  {vendor.verificationDocs?.businessLicense?.url ? (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-white border shadow-inner group relative">
                      <img
                        src={vendor.verificationDocs.businessLicense.url}
                        alt="Business License"
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                    </div>
                  ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center text-gray-400 bg-white border-2 border-dashed rounded-xl">
                      <FiXCircle size={40} className="mb-3 opacity-50" />
                      <p className="font-medium">No Document Found</p>
                    </div>
                  )}
                </div>

                {/* PAN Card */}
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                        <FiFileText size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">PAN Card</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">ID: {vendor.verificationDocs?.panCard?.id || 'NOT PROVIDED'}</p>
                      </div>
                    </div>
                    {vendor.verificationDocs?.panCard?.url && (
                      <a
                        href={vendor.verificationDocs.panCard.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-bold transition-all shadow-sm"
                      >
                        Open Original
                      </a>
                    )}
                  </div>
                  {vendor.verificationDocs?.panCard?.url ? (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-white border shadow-inner group relative">
                      <img
                        src={vendor.verificationDocs.panCard.url}
                        alt="PAN Card"
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                    </div>
                  ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center text-gray-400 bg-white border-2 border-dashed rounded-xl">
                      <FiXCircle size={40} className="mb-3 opacity-50" />
                      <p className="font-medium">No Document Found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Vendor Orders</h2>
              {vendorOrders.length > 0 ? (
                <DataTable
                  data={vendorOrders}
                  columns={orderColumns}
                  pagination={true}
                  itemsPerPage={orderPagination.limit}
                  currentPage={orderPagination.page}
                  totalPages={orderPagination.totalPages}
                  onPageChange={(page) => setOrderPagination(prev => ({ ...prev, page }))}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">No orders found</p>
              )}
            </div>
          )}

          {/* Commissions Tab */}
          {activeTab === 'commissions' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Commission History</h2>
              {commissions.length > 0 ? (
                <DataTable
                  data={commissions}
                  columns={commissionColumns}
                  pagination={true}
                  itemsPerPage={10}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">No commission records found</p>
              )}
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default VendorDetail;

