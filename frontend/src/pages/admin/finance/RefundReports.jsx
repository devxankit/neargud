import { useState, useEffect, useMemo } from "react";
import { FiRefreshCw, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";
import RefundTrendsChart from "../../../components/Admin/Analytics/RefundTrendsChart";
import DataTable from "../../../components/Admin/DataTable";
import ExportButton from "../../../components/Admin/ExportButton";
import AnimatedSelect from "../../../components/Admin/AnimatedSelect";
import { formatCurrency, formatDateTime } from "../../../utils/adminHelpers";
import { fetchRefundReports } from "../../../services/adminFinanceApi";
import { toast } from "react-hot-toast";

const RefundReports = () => {
  const [period, setPeriod] = useState("month");
  const [refundData, setRefundData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchRefundReports(period);
        setRefundData(data);
      } catch (error) {
        console.error("Failed to load refund reports:", error);
        toast.error("Failed to load refund reports");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  const totalRefunds = refundData.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  const totalCount = refundData.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value) => formatDateTime(value), // or value if string
    },
    {
      key: "count",
      label: "Number of Refunds",
      sortable: true,
    },
    {
      key: "amount",
      label: "Total Amount",
      sortable: true,
      render: (value) => (
        <span className="font-bold text-red-600">{formatCurrency(value)}</span>
      ),
    },
  ];

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
          Refund Reports
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Track completed refunds
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <AnimatedSelect
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={[
            { value: "week", label: "Last 7 Days" },
            { value: "month", label: "Last 30 Days" },
            { value: "year", label: "Last Year" },
          ]}
          className="min-w-[140px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Refund Amount</p>
            <FiDollarSign className="text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalRefunds)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Count</p>
            <FiRefreshCw className="text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {totalCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Pass refundData directly, ensuring it matches expected prop structure or adapt if needed. 
            RefundTrendsChart likely expects array of {date, amount, count} which is what we have. 
        */}
        <RefundTrendsChart refundData={refundData} period={period} />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Refund Breakdown</h3>
          <ExportButton
            data={refundData}
            headers={[
              { label: "Date", accessor: (row) => row.date },
              { label: "Count", accessor: (row) => row.count },
              {
                label: "Amount",
                accessor: (row) => formatCurrency(row.amount),
              },
            ]}
            filename={`refund-report-${period}`}
          />
        </div>
        <DataTable
          data={refundData}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
        />
      </div>
    </motion.div>
  );
};

export default RefundReports;
