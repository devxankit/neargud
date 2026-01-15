import { useState, useEffect } from "react";
import { FiCreditCard, FiDollarSign, FiSmartphone } from "react-icons/fi";
import { motion } from "framer-motion";
import PaymentBreakdownPieChart from "../../../components/Admin/Analytics/PaymentBreakdownPieChart";
import { formatCurrency } from "../../../utils/adminHelpers";
import { fetchPaymentBreakdown } from "../../../services/adminFinanceApi";
import AnimatedSelect from "../../../components/Admin/AnimatedSelect";
import { toast } from "react-hot-toast";

const PaymentBreakdown = () => {
  const [period, setPeriod] = useState("month");
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPaymentBreakdown(period);
        setPaymentData(data);
      } catch (error) {
        console.error("Failed to load payment breakdown:", error);
        toast.error("Failed to load payment breakdown");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  const transformedPaymentData = paymentData.reduce((acc, item) => {
    acc[item.method] = { count: item.count, total: item.amount };
    return acc;
  }, {});

  const totalAmount = paymentData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const getMethodIcon = (method) => {
    const icons = {
      creditCard: FiCreditCard,
      debitCard: FiCreditCard,
      cod: FiDollarSign, // cash -> cod as per typical backend enum
      cash: FiDollarSign,
      wallet: FiSmartphone,
      upi: FiSmartphone,
    };
    return icons[method] || FiCreditCard;
  };

  const getMethodLabel = (method) => {
    const labels = {
      creditCard: "Credit Card",
      debitCard: "Debit Card",
      cod: "Cash on Delivery",
      cash: "Cash",
      wallet: "Digital Wallet",
      upi: "UPI",
    };
    return labels[method] || method;
  };

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
          Payment Breakdown
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Analyze payment methods and distribution
        </p>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          Total Payments: {formatCurrency(totalAmount)}
        </h3>
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

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <PaymentBreakdownPieChart paymentData={transformedPaymentData} />
      </div>
    </motion.div>
  );
};

export default PaymentBreakdown;
