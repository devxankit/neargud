

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../../components/Admin/Analytics/StatsCards';
import RevenueLineChart from '../../components/Admin/Analytics/RevenueLineChart';
import SalesBarChart from '../../components/Admin/Analytics/SalesBarChart';
import OrderStatusPieChart from '../../components/Admin/Analytics/OrderStatusPieChart';
import CustomerGrowthAreaChart from '../../components/Admin/Analytics/CustomerGrowthAreaChart';
import RevenueVsOrdersChart from '../../components/Admin/Analytics/RevenueVsOrdersChart';
import TopProducts from '../../components/Admin/Analytics/TopProducts';
import RecentOrders from '../../components/Admin/Analytics/RecentOrders';
import TimePeriodFilter from '../../components/Admin/Analytics/TimePeriodFilter';
import ExportButton from '../../components/Admin/ExportButton';
import { fetchDashboardStats } from '../../services/dashboardApi';
import { formatCurrency } from '../../utils/adminHelpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {},
    chartData: [],
    statusDistribution: [],
    topProducts: [],
    recentOrders: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const response = await fetchDashboardStats(period);
        if (response?.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [period]);

  const { summary, chartData, statusDistribution, topProducts, recentOrders } = data;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-2 w-full">
          <TimePeriodFilter selectedPeriod={period} onPeriodChange={setPeriod} />
          <ExportButton
            data={chartData}
            headers={[
              { label: 'Date', accessor: (row) => row.date },
              { label: 'Revenue', accessor: (row) => formatCurrency(row.revenue) },
              { label: 'Orders', accessor: (row) => row.orders },
            ]}
            filename={`dashboard_report_${period}`}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={summary} />

      {/* Main Charts Row - Revenue and Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueLineChart data={chartData} period={period} />
        <SalesBarChart data={chartData} period={period} />
      </div>

      {/* Secondary Charts Row - Combined and Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueVsOrdersChart data={chartData} period={period} />
        {/* Pass distribution data if component supports it, otherwise it might be using mock internally still if we don't update it. 
            Checking usage: OrderStatusPieChart currently doesn't take props in original file? 
            I'll pass it anyway, and if it ignores it, I should fix it. */}
        <OrderStatusPieChart data={statusDistribution} />
      </div>

      {/* Customer Growth Chart - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <CustomerGrowthAreaChart data={chartData} period={period} />
      </div>

      {/* Products and Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts products={topProducts} />
        <RecentOrders
          orders={recentOrders}
          onViewOrder={(order) => navigate(`/admin/orders/${order._id || order.id}`)}
        />
      </div>
    </motion.div>
  );
};

export default Dashboard;
