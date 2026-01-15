import { useState, useEffect, useMemo } from "react";
import { FiFileText, FiDownload } from "react-icons/fi";
import { motion } from "framer-motion";
import TaxTrendsChart from "../../../components/Admin/Analytics/TaxTrendsChart";
import DataTable from "../../../components/Admin/DataTable";
import ExportButton from "../../../components/Admin/ExportButton";
import { formatCurrency, formatDateTime } from "../../../utils/adminHelpers";
import { fetchTaxReports } from "../../../services/adminFinanceApi";
import AnimatedSelect from "../../../components/Admin/AnimatedSelect";
import { toast } from "react-hot-toast";

const TaxReports = () => {
  const [period, setPeriod] = useState("month");
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchTaxReports(period);
        setTaxData(data);
      } catch (error) {
        console.error("Failed to load tax reports:", error);
        toast.error("Failed to load tax reports");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  const formattedData = useMemo(() => {
    return taxData.map(item => ({
      date: item.month || item.date || item._id, // Handle different potential keys
      taxAmount: item.taxAmount,
      total: item.taxableAmount,
      taxRate: item.taxableAmount > 0 ? ((item.taxAmount / item.taxableAmount) * 100).toFixed(1) : 0
    }));
  }, [taxData]);

  const totalTax = formattedData.reduce(
    (sum, item) => sum + item.taxAmount,
    0
  );
  const totalRevenue = formattedData.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const columns = [
    {
      key: "date",
      label: "Period",
      sortable: true,
      render: (value) => value, // Display as is (YYYY-MM or YYYY-MM-DD)
    },
    {
      key: "total",
      label: "Taxable Amount",
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: "taxRate",
      label: "Avg Tax Rate",
      sortable: true,
      render: (value) => `${value}%`,
    },
    {
      key: "taxAmount",
      label: "Tax Collected",
      sortable: true,
      render: (value) => (
        <span className="font-bold text-gray-800">{formatCurrency(value)}</span>
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
          Tax Reports
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          View tax collection and reports
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
            <p className="text-sm text-gray-600">Total Tax Collected</p>
            <FiFileText className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalTax)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Taxable Revenue</p>
            <FiFileText className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Pass the fully formatted data to chart. The chart handles filtering, but we already fetched tailored data. 
            We might need to adjust chart internal logic if it aggressively filters. 
            But usually passing 'data' prop overrides internal fetching. 
            However, our TaxTrendsChart 'filters' based on date range. 
            Since backend returns data FOR the period, client side filtering for the SAME period should be a no-op 
            if the dates match expected range. 
        */}
        <TaxTrendsChart taxData={formattedData} period={period} />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Tax Breakdown</h3>
          <ExportButton
            data={formattedData}
            headers={[
              { label: "Date", accessor: (row) => row.date },
              { label: "Taxable Amount", accessor: (row) => formatCurrency(row.total) },
              { label: "Tax Rate", accessor: (row) => `${row.taxRate}%` },
              { label: "Tax Amount", accessor: (row) => formatCurrency(row.taxAmount) },
            ]}
            filename={`tax-report-${period}`}
          />
        </div>
        <DataTable
          data={formattedData}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
        />
      </div>
    </motion.div>
  );
};

export default TaxReports;
