import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle, FiFileText, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from '../../../components/Badge';
import ExportButton from '../../../components/Admin/ExportButton';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { formatPrice } from '../../../utils/helpers';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { fetchEarningsStats, fetchWalletTransactions, fetchVendorOrdersList, fetchVendorWallet, requestVendorWithdrawal, fetchVendorWithdrawals } from '../../../services/vendorDashboardApi';
import { toast } from 'react-hot-toast';

const Earnings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor } = useVendorAuthStore();

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/commission-history')) return 'commission';
    if (path.includes('/settlement-history')) return 'settlement';
    if (path.includes('/withdrawals')) return 'withdrawals';
    return 'overview'; // Default to overview
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [commissions, setCommissions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const vendorId = vendor?.id;

  useEffect(() => {
    const loadData = async () => {
      if (!vendorId) return;
      setLoading(true);
      setError(null);
      try {
        // Earnings summary
        const earningsRes = await fetchEarningsStats();
        const earningsData = earningsRes?.data || earningsRes;
        const pending = earningsData?.pendingEarnings || 0;
        const total = earningsData?.totalOrderEarnings || 0;
        const totalOrders = earningsData?.totalOrders || 0;
        const mappedSummary = {
          totalEarnings: total,
          pendingEarnings: pending,
          paidEarnings: Math.max(total - pending, 0),
          totalOrders: totalOrders,
          totalCommission: 0,
        };
        setEarningsSummary(mappedSummary);

        // Commission history derived from vendor orders
        const ordersRes = await fetchVendorOrdersList({ page: 1, limit: 50 });
        console.log('ordersRes', ordersRes);
        const ordersPayload = ordersRes?.data?.data || ordersRes?.data || ordersRes || {};
        const ordersList = ordersPayload?.orders || ordersPayload?.data?.orders || ordersRes?.orders || [];
        const commissionList = ordersList.map((o) => {
          const vendorBreak = Array.isArray(o.vendorItems)
            ? o.vendorItems.find(v => v.vendorId === vendorId)
            : null;

          const subtotal = vendorBreak?.subtotal || 0;
          const commission = vendorBreak?.commission || 0;
          const vendorEarnings = vendorBreak?.vendorEarnings || 0;

          const status =
            o.status === 'delivered' || o.status === 'completed'
              ? 'paid'
              : o.status === 'cancelled' || o.status === 'canceled'
                ? 'cancelled'
                : 'pending';

          return {
            id: o._id,
            orderId: o.orderCode,
            createdAt: o.createdAt,
            subtotal,
            commission,
            vendorEarnings,
            status,
          };
        });

        setCommissions(commissionList);

        // Settlements from wallet transactions
        const txRes = await fetchWalletTransactions();
        const txList = txRes?.data || txRes || [];
        const settlementsMapped = (Array.isArray(txList?.data) ? txList.data : Array.isArray(txList) ? txList : []).map((t) => ({
          id: t._id || t.referenceId || `TX-${Math.random().toString(36).slice(2)}`,
          commissionId: t.referenceId || null,
          vendorId: vendorId,
          vendorName: vendor?.storeName || vendor?.name || 'You',
          amount: t.amount || 0,
          paymentMethod: t.referenceType || t.type || 'manual',
          transactionId: t.referenceId || null,
          createdAt: t.createdAt || new Date().toISOString(),
        }));
        setSettlements(settlementsMapped);

        const walletRes = await fetchVendorWallet();
        const walletData = walletRes?.data || walletRes;
        setWallet(walletData);

        const withdrawalsRes = await fetchVendorWithdrawals();
        const withdrawalsList = withdrawalsRes?.data || withdrawalsRes || [];
        setWithdrawals(Array.isArray(withdrawalsList) ? withdrawalsList : []);
        const pendingWithdrawals = (Array.isArray(withdrawalsList) ? withdrawalsList : []).filter(w => w.status === 'pending');
        setHasPendingWithdrawal(pendingWithdrawals.length > 0);
      } catch (err) {
        setError(err?.message || 'Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [vendorId]);

  const filteredCommissions = useMemo(() => {
    if (selectedStatus === 'all') return commissions;
    return commissions.filter((c) => c.status === selectedStatus);
  }, [commissions, selectedStatus]);

  const getOrderDetails = (orderId) => null;
  const handleWithdrawal = async () => {
    try {
      if (!wallet?.balance) return;
      await requestVendorWithdrawal();
      toast.success('Withdrawal request submitted');
      setHasPendingWithdrawal(true);
    } catch (err) {
      toast.error(err?.message || 'Withdrawal request failed');
    }
  };

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view earnings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate('/vendor/earnings');
    } else if (tab === 'commission') {
      navigate('/vendor/earnings/commission-history');
    } else if (tab === 'settlement') {
      navigate('/vendor/earnings/settlement-history');
    } else if (tab === 'withdrawals') {
      navigate('/vendor/earnings/withdrawals');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Earnings</h1>
          <p className="text-gray-600">View your earnings and commission history</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${activeTab === 'overview'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <FiDollarSign />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleTabChange('commission')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${activeTab === 'commission'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <FiFileText />
              <span>Commission History</span>
            </button>
            <button
              onClick={() => handleTabChange('settlement')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${activeTab === 'settlement'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <FiCheckCircle />
              <span>Settlement History</span>
            </button>
            <button
              onClick={() => handleTabChange('withdrawals')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${activeTab === 'withdrawals'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
            >
              <FiDownload />
              <span>Withdrawals</span>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {/* Earnings Summary Cards - Show on Overview tab */}
          {activeTab === 'overview' && (
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-700 font-medium">Total Earnings</p>
                    <FiDollarSign className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {earningsSummary ? formatPrice(earningsSummary.totalEarnings) : formatPrice(0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">All time</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 shadow-sm border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-yellow-700 font-medium">Pending</p>
                    <FiClock className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-800">
                    {earningsSummary ? formatPrice(earningsSummary.pendingEarnings) : formatPrice(0)}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">Awaiting settlement</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-700 font-medium">Paid</p>
                    <FiCheckCircle className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-800">
                    {earningsSummary ? formatPrice(earningsSummary.paidEarnings) : formatPrice(0)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Settled</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-700 font-medium">Total Orders</p>
                    <FiTrendingUp className="text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-800">
                    {earningsSummary ? earningsSummary.totalOrders : 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">With earnings</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-700 font-medium">Available to Withdraw</p>
                    <FiCheckCircle className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {wallet ? formatPrice(wallet.balance || 0) : formatPrice(0)}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={handleWithdrawal}
                      disabled={!wallet?.balance || hasPendingWithdrawal}
                      className={`px-4 py-2 rounded-lg text-white ${!wallet?.balance || hasPendingWithdrawal ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} transition-colors`}
                    >
                      {hasPendingWithdrawal ? 'Request Pending' : 'Request Withdrawal'}
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-700 font-medium">Pending Settlement</p>
                    <FiClock className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {wallet ? formatPrice(wallet.pendingBalance || 0) : formatPrice(0)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Awaiting admin approval</p>
                </div>
              </div>
            </div>
          )}

          {/* Commission History Section */}
          {(activeTab === 'overview' || activeTab === 'commission') && (
            <div className={activeTab === 'overview' ? 'mb-6' : ''}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Commission History</h2>
                    <p className="text-sm text-gray-600">View all your commission records</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AnimatedSelect
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ]}
                      className="min-w-[140px]"
                    />
                    <ExportButton
                      data={filteredCommissions}
                      headers={[
                        { label: 'Order ID', accessor: (row) => row.orderId },
                        { label: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
                        { label: 'Subtotal', accessor: (row) => formatPrice(row.subtotal) },
                        { label: 'Commission', accessor: (row) => formatPrice(row.commission) },
                        { label: 'Your Earnings', accessor: (row) => formatPrice(row.vendorEarnings) },
                        { label: 'Status', accessor: (row) => row.status },
                      ]}
                      filename="vendor-commissions"
                    />
                  </div>
                </div>

                {filteredCommissions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredCommissions.map((commission) => {
                      const order = getOrderDetails(commission.orderId);
                      return (
                        <div
                          key={commission.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-800">{commission.orderId}</h3>
                              <Badge
                                variant={
                                  commission.status === 'paid'
                                    ? 'success'
                                    : commission.status === 'pending'
                                      ? 'warning'
                                      : 'error'
                                }>
                                {commission.status?.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Date</p>
                                <p className="font-semibold text-gray-800">
                                  {new Date(commission.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Subtotal</p>
                                <p className="font-semibold text-gray-800">
                                  {formatPrice(commission.subtotal)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Commission</p>
                                <p className="font-semibold text-red-600">
                                  -{formatPrice(commission.commission)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Your Earnings</p>
                                <p className="font-semibold text-green-600">
                                  {formatPrice(commission.vendorEarnings)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {order && (
                              <button
                                onClick={() => navigate(`/vendor/orders/${commission.orderId}`)}
                                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                View Order
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiFileText className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No commission records found</p>
                    <p className="text-sm text-gray-400">
                      {selectedStatus !== 'all'
                        ? 'Try selecting a different status'
                        : 'Commissions will appear here once you receive orders'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settlement History Section */}
          {(activeTab === 'overview' || activeTab === 'settlement') && settlements.length > 0 && (
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Settlement History</h2>
                    <p className="text-sm text-gray-600">View your payment settlements</p>
                  </div>
                  <ExportButton
                    data={settlements}
                    headers={[
                      { label: 'Settlement ID', accessor: (row) => row.id },
                      { label: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
                      { label: 'Amount', accessor: (row) => formatPrice(row.amount) },
                      { label: 'Payment Method', accessor: (row) => row.paymentMethod },
                      { label: 'Transaction ID', accessor: (row) => row.transactionId || 'N/A' },
                    ]}
                    filename="vendor-settlements"
                  />
                </div>

                <div className="space-y-3">
                  {settlements.map((settlement) => (
                    <div
                      key={settlement.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">{settlement.id}</h3>
                          <Badge variant="success">PAID</Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Date Paid</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(settlement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-semibold text-green-600">
                              {formatPrice(settlement.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Payment Method</p>
                            <p className="font-semibold text-gray-800 capitalize">
                              {settlement.paymentMethod?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                          {settlement.transactionId && (
                            <div>
                              <p className="text-gray-600">Transaction ID</p>
                              <p className="font-semibold text-gray-800 text-xs">
                                {settlement.transactionId}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settlement' && settlements.length === 0 && (
            <div className="text-center py-12">
              <FiCheckCircle className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No settlement records found</p>
              <p className="text-sm text-gray-400">
                Settlements will appear here once your commissions are paid
              </p>
            </div>
          )}

          {/* Withdrawals Section */}
          {activeTab === 'withdrawals' && (
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">Withdrawal Requests</h2>
                    <p className="text-sm text-gray-600">View your withdrawal request history</p>
                  </div>
                  <ExportButton
                    data={withdrawals}
                    headers={[
                      { label: 'Request ID', accessor: (row) => row._id?.slice(-8) || 'N/A' },
                      { label: 'Amount', accessor: (row) => formatPrice(row.amount) },
                      { label: 'Status', accessor: (row) => row.status },
                      { label: 'Requested', accessor: (row) => new Date(row.requestedAt).toLocaleDateString() },
                      { label: 'Processed', accessor: (row) => row.processedAt ? new Date(row.processedAt).toLocaleDateString() : 'Pending' },
                      { label: 'Transaction ID', accessor: (row) => row.transactionId || 'N/A' },
                    ]}
                    filename="withdrawal-requests"
                  />
                </div>

                {withdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal._id}
                        className={`rounded-xl p-6 border transition-all ${withdrawal.status === 'approved'
                            ? 'bg-green-50 border-green-200'
                            : withdrawal.status === 'rejected'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-800">Request #{withdrawal._id?.slice(-8)}</h3>
                            <Badge
                              variant={
                                withdrawal.status === 'approved'
                                  ? 'success'
                                  : withdrawal.status === 'rejected'
                                    ? 'error'
                                    : 'warning'
                              }
                            >
                              {withdrawal.status?.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-green-600">{formatPrice(withdrawal.amount)}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Requested On</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(withdrawal.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Processed On</p>
                            <p className="font-semibold text-gray-800">
                              {withdrawal.processedAt
                                ? new Date(withdrawal.processedAt).toLocaleDateString()
                                : 'Pending'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Payment Method</p>
                            <p className="font-semibold text-gray-800 capitalize">
                              {withdrawal.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
                            </p>
                          </div>
                          {withdrawal.transactionId && (
                            <div>
                              <p className="text-gray-600">Transaction ID</p>
                              <p className="font-mono text-xs text-gray-700">{withdrawal.transactionId}</p>
                            </div>
                          )}
                        </div>

                        {withdrawal.adminNotes && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 font-medium">Admin Notes:</p>
                            <p className="text-sm text-gray-800">{withdrawal.adminNotes}</p>
                          </div>
                        )}

                        {withdrawal.rejectionReason && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                            <p className="text-xs text-red-600 mb-1 font-medium">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{withdrawal.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiDownload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No withdrawal requests found</p>
                    <p className="text-sm text-gray-400">
                      Your withdrawal requests will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Earnings;

