import { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiRefreshCw, FiPackage, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { fetchPerformanceMetrics } from '../../../services/vendorPerformanceApi';
import toast from 'react-hot-toast';
import DataTable from '../../../components/Admin/DataTable';

const PerformanceMetrics = () => {
  const { vendor } = useVendorAuthStore();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState({
    metrics: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      avgOrderValue: 0,
      customerCount: 0,
      conversionRate: 0,
    },
    earnings: {
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
    },
    revenueData: [],
    topProducts: [],
    recentOrders: [],
  });

  const vendorId = vendor?.id;

  const loadMetrics = useCallback(async (selectedPeriod = period) => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const response = await fetchPerformanceMetrics(selectedPeriod);
      if (response) {
        setData(response);
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
      toast.error('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  }, [vendorId, period]);

  useEffect(() => {
    loadMetrics();
  }, [vendorId, period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  if (!vendorId && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view metrics</p>
      </div>
    );
  }

  const { metrics, earnings, topProducts, recentOrders } = data;

  const productColumns = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'sales', label: 'Units Sold', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true, render: (v) => formatPrice(v) },
  ];

  const orderColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'date', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
    { key: 'total', label: 'Amount', render: (v) => formatPrice(v) },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${v === 'delivered' ? 'bg-green-100 text-green-700' :
          v === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
          {v}
        </span>
      )
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiTrendingUp className="text-primary-600" />
            Performance-metrics
          </h1>
          <p className="text-sm text-gray-500">Analytics tracking for your store performance</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['week', 'month', 'year', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`flex-1 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize whitespace-nowrap ${period === p ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => loadMetrics()}
            className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors hidden sm:block">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard label="Total Revenue" value={formatPrice(metrics.totalRevenue)} icon={FiDollarSign} color="green" loading={loading} />
        <MetricCard label="Total Orders" value={metrics.totalOrders} icon={FiShoppingBag} color="blue" loading={loading} />
        <MetricCard label="Total Customers" value={metrics.customerCount} icon={FiUsers} color="indigo" loading={loading} />
        <MetricCard label="Average Order" value={formatPrice(metrics.avgOrderValue)} icon={FiTrendingUp} color="orange" loading={loading} />
        <MetricCard label="Total Products" value={metrics.totalProducts} icon={FiPackage} color="purple" loading={loading} />
        <MetricCard label="Conversion Rate" value={`${metrics.conversionRate.toFixed(1)}%`} icon={FiTrendingUp} color="pink" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiDollarSign className="text-green-600" />
            Earnings Overview
          </h3>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earnings</span>
                <span className="text-xl font-bold text-gray-800">{loading ? '...' : formatPrice(earnings.totalEarnings)}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: earnings.totalEarnings > 0 ? `${(earnings.paidEarnings / earnings.totalEarnings) * 100}%` : '0%' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <p className="text-xs font-semibold text-yellow-600 uppercase mb-1">Pending</p>
                <p className="text-lg font-bold text-yellow-800">{loading ? '...' : formatPrice(earnings.pendingEarnings)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-semibold text-green-600 uppercase mb-1">Paid</p>
                <p className="text-lg font-bold text-green-800">{loading ? '...' : formatPrice(earnings.paidEarnings)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400">
                Earnings are released immediately after order delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiPackage className="text-primary-600" />
            Top Selling Products
          </h3>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>
          ) : topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 font-medium">
                    <th className="pb-4">Product</th>
                    <th className="pb-4 text-center">Sales</th>
                    <th className="pb-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((p, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0">
                          {p.image && <img src={p.image} className="w-full h-full object-cover rounded-lg" alt="" />}
                        </div>
                        <span className="font-semibold text-gray-700 truncate max-w-[150px]">{p.name}</span>
                      </td>
                      <td className="py-3 text-center font-bold text-gray-600">{p.sales}</td>
                      <td className="py-3 text-right font-bold text-gray-800">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No data available for this period</div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FiCalendar className="text-blue-600" />
          Recent Orders for this Period
        </h3>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>
        ) : recentOrders.length > 0 ? (
          <DataTable data={recentOrders} columns={orderColumns} pagination={false} />
        ) : (
          <div className="text-center py-12 text-gray-400">No recent orders in this time frame</div>
        )}
      </div>
    </motion.div>
  );
};

// Subcomponent for Metric Cards
const MetricCard = ({ label, value, icon: Icon, color, loading }) => {
  const colorMap = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-primary-200 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color] || 'bg-gray-50 text-gray-600'}`}>
          <Icon className="text-xl" />
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-800">
        {loading ? (
          <span className="inline-block h-6 w-16 bg-gray-100 animate-pulse rounded"></span>
        ) : value}
      </p>
    </div>
  );
};

export default PerformanceMetrics;
