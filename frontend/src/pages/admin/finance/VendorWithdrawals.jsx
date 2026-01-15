import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCheck, FiX, FiClock, FiCheckCircle, FiXCircle, FiFilter, FiDownload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { fetchPendingWithdrawals, approveWithdrawal, rejectWithdrawal, fetchWithdrawalReports } from '../../../services/adminVendorWalletApi';
import { formatPrice } from '../../../utils/helpers';
import Badge from '../../../components/Badge';
import ExportButton from '../../../components/Admin/ExportButton';

const VendorWithdrawals = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pendingRes, reportsRes] = await Promise.all([
                fetchPendingWithdrawals(),
                fetchWithdrawalReports()
            ]);

            const pendingData = pendingRes?.data || {};
            setPendingRequests(pendingData.requests || []);
            setStats(pendingData.stats || {});

            const reportsData = reportsRes?.data || [];
            setAllRequests(reportsData);
        } catch (error) {
            toast.error('Failed to load withdrawal data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            await approveWithdrawal(selectedRequest._id, {
                notes: adminNotes,
                transactionId: transactionId
            });

            toast.success('Withdrawal approved successfully');
            setShowApproveModal(false);
            setSelectedRequest(null);
            setTransactionId('');
            setAdminNotes('');
            loadData();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to approve withdrawal');
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await rejectWithdrawal(selectedRequest._id, {
                reason: rejectionReason
            });

            toast.success('Withdrawal rejected');
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectionReason('');
            loadData();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to reject withdrawal');
        }
    };

    const filteredRequests = allRequests.filter(req => {
        if (filterStatus === 'all') return true;
        return req.status === filterStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning"><FiClock className="inline mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="success"><FiCheckCircle className="inline mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="error"><FiXCircle className="inline mr-1" />Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (loading && pendingRequests.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vendor Withdrawals</h1>
                    <p className="text-gray-600 mt-1">Manage vendor payment withdrawal requests</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 shadow-sm border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-yellow-700 font-medium">Pending Requests</p>
                            <FiClock className="text-yellow-600 text-xl" />
                        </div>
                        <p className="text-3xl font-bold text-yellow-800">{stats.pendingCount || 0}</p>
                        <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-green-700 font-medium">Total Withdrawn</p>
                            <FiDollarSign className="text-green-600 text-xl" />
                        </div>
                        <p className="text-3xl font-bold text-green-800">{formatPrice(stats.totalWithdrawn || 0)}</p>
                        <p className="text-xs text-green-600 mt-1">All time</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-blue-700 font-medium">Processed Today</p>
                            <FiCheckCircle className="text-blue-600 text-xl" />
                        </div>
                        <p className="text-3xl font-bold text-blue-800">{stats.processedToday || 0}</p>
                        <p className="text-xs text-blue-600 mt-1">Approved/Rejected</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pending'
                                    ? 'border-purple-600 text-purple-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <FiClock />
                            <span>Pending Requests</span>
                            {pendingRequests.length > 0 && (
                                <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history'
                                    ? 'border-purple-600 text-purple-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <FiCheckCircle />
                            <span>History</span>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Pending Requests Tab */}
                    {activeTab === 'pending' && (
                        <div className="space-y-4">
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiCheckCircle className="text-5xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No pending withdrawal requests</p>
                                    <p className="text-sm text-gray-400 mt-2">All requests have been processed</p>
                                </div>
                            ) : (
                                pendingRequests.map((request) => (
                                    <div
                                        key={request._id}
                                        className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {request.vendorId?.storeName || request.vendorId?.name || 'Unknown Vendor'}
                                                    </h3>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Amount</p>
                                                        <p className="font-bold text-green-600 text-lg">{formatPrice(request.amount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Requested On</p>
                                                        <p className="font-semibold text-gray-800">
                                                            {new Date(request.requestedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Request ID</p>
                                                        <p className="font-mono text-xs text-gray-700">{request._id.slice(-8)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Payment Method</p>
                                                        <p className="font-semibold text-gray-800 capitalize">
                                                            {request.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowApproveModal(true);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <FiCheck />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <FiX />
                                                    <span>Reject</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <FiFilter className="text-gray-600" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <ExportButton
                                    data={filteredRequests}
                                    headers={[
                                        { label: 'Vendor', accessor: (row) => row.vendorId?.storeName || row.vendorId?.name || 'N/A' },
                                        { label: 'Amount', accessor: (row) => formatPrice(row.amount) },
                                        { label: 'Status', accessor: (row) => row.status },
                                        { label: 'Requested', accessor: (row) => new Date(row.requestedAt).toLocaleDateString() },
                                        { label: 'Processed', accessor: (row) => row.processedAt ? new Date(row.processedAt).toLocaleDateString() : 'N/A' },
                                        { label: 'Transaction ID', accessor: (row) => row.transactionId || 'N/A' },
                                    ]}
                                    filename="withdrawal-history"
                                />
                            </div>

                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiDollarSign className="text-5xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No withdrawal requests found</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {filterStatus !== 'all' ? 'Try changing the filter' : 'Requests will appear here'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredRequests.map((request) => (
                                        <div
                                            key={request._id}
                                            className={`rounded-xl p-6 border transition-all ${request.status === 'approved'
                                                    ? 'bg-green-50 border-green-200'
                                                    : request.status === 'rejected'
                                                        ? 'bg-red-50 border-red-200'
                                                        : 'bg-yellow-50 border-yellow-200'
                                                }`}
                                        >
                                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            {request.vendorId?.storeName || request.vendorId?.name || 'Unknown Vendor'}
                                                        </h3>
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">Amount</p>
                                                            <p className="font-bold text-green-600 text-lg">{formatPrice(request.amount)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Requested</p>
                                                            <p className="font-semibold text-gray-800">
                                                                {new Date(request.requestedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Processed</p>
                                                            <p className="font-semibold text-gray-800">
                                                                {request.processedAt
                                                                    ? new Date(request.processedAt).toLocaleDateString()
                                                                    : 'Pending'}
                                                            </p>
                                                        </div>
                                                        {request.transactionId && (
                                                            <div>
                                                                <p className="text-gray-600">Transaction ID</p>
                                                                <p className="font-mono text-xs text-gray-700">{request.transactionId}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {request.adminNotes && (
                                                        <div className="mt-3 p-3 bg-white rounded-lg">
                                                            <p className="text-xs text-gray-600 mb-1">Admin Notes:</p>
                                                            <p className="text-sm text-gray-800">{request.adminNotes}</p>
                                                        </div>
                                                    )}
                                                    {request.rejectionReason && (
                                                        <div className="mt-3 p-3 bg-white rounded-lg">
                                                            <p className="text-xs text-gray-600 mb-1">Rejection Reason:</p>
                                                            <p className="text-sm text-red-600">{request.rejectionReason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Approve Withdrawal Request</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Vendor</p>
                                <p className="font-semibold text-gray-800">
                                    {selectedRequest.vendorId?.storeName || selectedRequest.vendorId?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Amount</p>
                                <p className="text-2xl font-bold text-green-600">{formatPrice(selectedRequest.amount)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction/reference ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notes (Optional)
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add any notes..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleApprove}
                                    disabled={!transactionId.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Approve & Process
                                </button>
                                <button
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setSelectedRequest(null);
                                        setTransactionId('');
                                        setAdminNotes('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Reject Withdrawal Request</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Vendor</p>
                                <p className="font-semibold text-gray-800">
                                    {selectedRequest.vendorId?.storeName || selectedRequest.vendorId?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Amount</p>
                                <p className="text-2xl font-bold text-red-600">{formatPrice(selectedRequest.amount)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this request is being rejected..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setSelectedRequest(null);
                                        setRejectionReason('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default VendorWithdrawals;
