import { useState, useEffect } from "react";
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { motion } from "framer-motion";
import ProfitLossChart from "../../../components/Admin/Analytics/ProfitLossChart";
import AnimatedSelect from "../../../components/Admin/AnimatedSelect";
import { formatCurrency } from "../../../utils/adminHelpers";
import { fetchFinanceSummary, fetchFinanceChartData } from "../../../services/adminFinanceApi";
import { toast } from "react-hot-toast";

const ProfitLoss = () => {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState({
    totalRevenue: 0,
    costOfGoods: 0,
    operatingExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summary, chart] = await Promise.all([
          fetchFinanceSummary(period),
          fetchFinanceChartData(period)
        ]);

        setFinancials(summary);
        setChartData(chart);
      } catch (error) {
        console.error("Failed to load profit/loss data:", error);
        toast.error("Failed to load financial data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Profit & Loss
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          View financial performance and profitability
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <AnimatedSelect
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={[
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "year", label: "This Year" },
          ]}
          className="min-w-[140px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Income</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-bold text-green-600">
                {formatCurrency(financials.totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Expenses</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cost of Goods Sold</span>
              <span className="font-bold text-red-600">
                {formatCurrency(financials.costOfGoods)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Operating Expenses</span>
              <span className="font-bold text-red-600">
                {formatCurrency(financials.operatingExpenses)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                Total Expenses
              </span>
              <span className="font-bold text-red-600">
                {formatCurrency(
                  financials.costOfGoods + financials.operatingExpenses
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Gross Profit</p>
            <FiTrendingUp className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(financials.grossProfit)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Net Profit</p>
            <FiDollarSign className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(financials.netProfit)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Profit Margin</p>
            <FiTrendingDown className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {Number(financials.profitMargin).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Financial Trends</h3>
        </div>
        <ProfitLossChart data={chartData} period={period} />
      </div>
    </motion.div>
  );
};

export default ProfitLoss;
