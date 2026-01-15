import { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiPackage, FiShoppingBag, FiDollarSign, FiArrowUpRight, FiArrowDownRight, FiStar, FiActivity ,FiUsers} from 'react-icons/fi';
import { motion } from 'framer-motion';
import RevenueLineChart from '../../../components/Admin/Analytics/RevenueLineChart';
import SalesBarChart from '../../../components/Admin/Analytics/SalesBarChart';
import OrderStatusPieChart from '../../../components/Admin/Analytics/OrderStatusPieChart';
import RevenueVsOrdersChart from '../../../components/Admin/Analytics/RevenueVsOrdersChart';
import TimePeriodFilter from '../../../components/Admin/Analytics/TimePeriodFilter';
import ExportButton from '../../../components/Admin/ExportButton';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { vendorAnalyticsService } from '../services/vendorAnalyticsService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const vendorId = vendor?.id || vendor?._id;

  const fetchData = async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const response = await vendorAnalyticsService.getDashboardData(period);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vendorId, period]);

  if (!vendorId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">Please log in to view your store analytics</p>
          <button
            onClick={() => navigate('/vendor/login')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const earnings = data?.earnings || {};
  const topProducts = data?.topProducts || [];
  const recentOrders = data?.recentOrders || [];
  const chartData = data?.revenueData || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <FiActivity className="text-primary-500" />
            Performance insights for {vendor?.storeName || 'your store'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
          <TimePeriodFilter selectedPeriod={period} onPeriodChange={setPeriod} />
          <div className="w-px h-8 bg-gray-200 mx-1" />
          <ExportButton
            data={chartData}
            headers={[
              { label: 'Date', accessor: (row) => row.date },
              { label: 'Revenue', accessor: (row) => formatPrice(row.revenue) },
              { label: 'Orders', accessor: (row) => row.orders },
            ]}
            filename={`vendor-analytics-${period}`}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <FiBarChart2 className="absolute inset-0 m-auto text-primary-600 w-6 h-6" />
          </div>
          <p className="text-gray-500 font-medium mt-6">Analyzing your store data...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={formatPrice(metrics.totalRevenue || 0)}
              change={metrics.revenueChange || 0}
              icon={FiDollarSign}
              color="blue"
            />
            <MetricCard
              title="Total Orders"
              value={metrics.totalOrders || 0}
              change={metrics.ordersChange || 0}
              icon={FiShoppingBag}
              color="emerald"
            />
            <MetricCard
              title="Avg. Order Value"
              value={formatPrice(metrics.avgOrderValue || 0)}
              change={metrics.revenueChange || 0}
              icon={FiTrendingUp}
              color="indigo"
            />
            <MetricCard
              title="Total Customers"
              value={metrics.customerCount || 0}
              subtitle="Unique shoppers"
              icon={FiUsers}
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <MetricCard
              title="Pending Earnings"
              value={formatPrice(earnings.pendingEarnings || 0)}
              subtitle="Awaiting settlement (7 days)"
              icon={FiPackage}
              color="amber"
            />
            <MetricCard
              title="Paid Earnings"
              value={formatPrice(earnings.paidEarnings || 0)}
              subtitle="Successfully settled"
              icon={FiDollarSign}
              color="emerald"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RevenueLineChart data={chartData} period={period} />
            <SalesBarChart data={chartData} period={period} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RevenueVsOrdersChart data={chartData} period={period} />
            </div>
            <div>
              <OrderStatusPieChart data={data?.statusDistribution} />
            </div>
          </div>

          {/* Bottom Grid: Top Products & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
                  <p className="text-sm text-gray-500">Based on sales volume</p>
                </div>
                <button
                  onClick={() => navigate('/vendor/products')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1"
                >
                  View All <FiArrowUpRight />
                </button>
              </div>

              <div className="space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="relative">
                        <img
                          src={product.image || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                        />
                        {idx < 3 && (
                          <div className="absolute -top-2 -left-2 w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-800 truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.sales} sales • {formatPrice(product.revenue)}</p>
                      </div>
                      <div className="flex items-center text-amber-500">
                        <FiStar className="fill-current w-3 h-3" />
                        <span className="text-xs font-bold ml-1">4.8</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No sales recorded yet" />
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                  <p className="text-sm text-gray-500">Latest orders and status updates</p>
                </div>
                <button
                  onClick={() => navigate('/vendor/orders/all-orders')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1"
                >
                  Manage <FiArrowUpRight />
                </button>
              </div>

              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border-l-4 border-l-transparent hover:border-l-primary-500">
                      <div className={`p-3 rounded-full bg-gray-100 text-gray-600`}>
                        <FiShoppingBag />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800">Order #{order.id}</h4>
                        <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()} • {formatPrice(order.total)}</p>
                      </div>
                      <div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getStatusStyles(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No recent activity" />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

// Internal Components
const MetricCard = ({ title, value, change, subtitle, icon: Icon, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute -right-2 -top-2 w-20 h-20 rounded-full opacity-5 bg-current transition-transform group-hover:scale-110 ${colors[color].split(' ')[0]}`} />
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {change >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-10 opacity-60">
    <FiBarChart2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-emerald-100 text-emerald-700';
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'shipped': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-rose-100 text-rose-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default Analytics;


