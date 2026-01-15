import { useState, useEffect } from 'react';
import { FiSend, FiUsers, FiInfo, FiClock, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../../utils/api';
import DataTable from '../../../components/Admin/DataTable';
import AnimatedSelect from '../../../components/Admin/AnimatedSelect';
import { format } from 'date-fns';

const SendCustomNotification = () => {
    const [loading, setLoading] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target: 'all',
        actionUrl: '',
    });
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const fetchHistory = async (page = 1) => {
        setFetchingHistory(true);
        try {
            const response = await api.get(`/admin/notifications/broadcasts?page=${page}&limit=${pagination.limit}`);
            if (response.success) {
                setHistory(response.data.broadcasts);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
            toast.error('Failed to load notification history');
        } finally {
            setFetchingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error('Please fill in both title and message');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/admin/notifications/send', formData);
            if (response.success) {
                toast.success(`Notification sent correctly to recipients`);
                setFormData({ title: '', message: '', target: 'all', actionUrl: '' });
                fetchHistory(1);
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
            toast.error(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'createdAt',
            label: 'Sent At',
            sortable: true,
            render: (value) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                        {format(new Date(value), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-xs text-gray-500">
                        {format(new Date(value), 'hh:mm a')}
                    </span>
                </div>
            ),
        },
        {
            key: 'title',
            label: 'Title',
            sortable: true,
            render: (value) => <span className="font-semibold text-gray-800">{value}</span>,
        },
        {
            key: 'message',
            label: 'Message',
            render: (value) => <p className="text-sm text-gray-600 max-w-xs truncate">{value}</p>,
        },
        {
            key: 'target',
            label: 'Target Group',
            render: (value) => (
                <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {value.replace('_', ' ')}
                </span>
            ),
        },
        {
            key: 'recipientCount',
            label: 'Recipients',
            render: (value) => <span className="font-mono font-bold text-gray-700">{value}</span>,
        },
        {
            key: 'senderId',
            label: 'Sent By',
            render: (value) => <span className="text-xs text-gray-600">{value?.name || 'Admin'}</span>,
        },
    ];

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Custom Notifications</h1>
                <p className="text-gray-600">Send personalized messages to specific user roles</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6"
                >
                    <div className="flex items-center gap-2 mb-6 text-primary-600">
                        <FiSend className="text-xl" />
                        <h2 className="text-lg font-bold">New Notification</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Target Audience
                            </label>
                            <AnimatedSelect
                                value={formData.target}
                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                options={[
                                    { value: 'all', label: 'All Users' },
                                    { value: 'users', label: 'Customers Only' },
                                    { value: 'vendors', label: 'Vendors Only' },
                                    { value: 'delivery_partners', label: 'Delivery Partners Only' },
                                    { value: 'admins', label: 'Admins Only' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Notification Title
                            </label>
                            <input
                                type="text"
                                placeholder="Enter title (e.g. Flash Sale!)"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Message Content
                            </label>
                            <textarea
                                placeholder="Write your message here..."
                                rows={4}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all resize-none"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Action URL (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. /app/flash-sale"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                                value={formData.actionUrl}
                                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                <FiInfo /> Where users go when they click the notification
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 gradient-green text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FiClock className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FiSend />
                                    Send Notification
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* History Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-800">
                            <FiClock className="text-xl" />
                            <h2 className="text-lg font-bold">Broadcast History</h2>
                        </div>
                        <button
                            onClick={() => fetchHistory(pagination.page)}
                            className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                            title="Refresh history"
                        >
                            <FiRefreshCw className={fetchingHistory ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={history}
                            loading={fetchingHistory}
                            pagination={true}
                            itemsPerPage={pagination.limit}
                            totalItems={pagination.total}
                            totalPages={pagination.totalPages}
                            currentPage={pagination.page}
                            onPageChange={(page) => fetchHistory(page)}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SendCustomNotification;
