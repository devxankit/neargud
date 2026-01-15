import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataTable from '../../../components/Admin/DataTable';
import { formatPrice } from '../../../utils/helpers';
import { fetchVendorCustomerById } from '../../../services/vendorCustomersApi';
import toast from 'react-hot-toast';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        customer: null,
        orders: [],
    });

    useEffect(() => {
        const loadCustomerDetail = async () => {
            setLoading(true);
            try {
                const response = await fetchVendorCustomerById(id);
                if (response) {
                    setData(response);
                }
            } catch (error) {
                console.error('Failed to load customer details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadCustomerDetail();
        }
    }, [id]);

    const orderColumns = [
        { key: 'orderCode', label: 'Order ID', sortable: true },
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${value === 'delivered' ? 'bg-green-100 text-green-700' :
                    value === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'total',
            label: 'Amount',
            sortable: true,
            render: (value, row) => {
                // Find vendor's part in the order
                const vendorItem = row.vendorItems?.find(vi => vi.vendorId);
                return formatPrice(vendorItem?.vendorEarnings || 0);
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    onClick={() => navigate(`/vendor/orders/${row._id || row.id}`)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    View Order
                </button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!data.customer) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Customer not found</p>
                <button onClick={() => navigate('/vendor/customers')} className="mt-4 text-primary-600">Back to Customers</button>
            </div>
        );
    }

    const { customer, orders } = data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/vendor/customers')}
                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                    <FiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
                    <p className="text-sm text-gray-500">Customer Profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center">
                                <FiUser className="text-4xl text-primary-600" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                                    <FiMail className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                    <p className="text-sm text-gray-800 font-medium break-all">{customer.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                                    <FiPhone className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                    <p className="text-sm text-gray-800 font-medium">{customer.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                                    <FiCalendar className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Last Order</p>
                                    <p className="text-sm text-gray-800 font-medium">
                                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4">Customer Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600 font-semibold mb-1">Total Orders</p>
                                <p className="text-xl font-bold text-blue-800">{customer.orders}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-xs text-green-600 font-semibold mb-1">Total Spent</p>
                                <p className="text-xl font-bold text-green-800">{formatPrice(customer.totalSpent)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <FiShoppingBag className="text-primary-600" />
                                Order History
                            </h3>
                        </div>
                        <div className="p-6">
                            {orders.length > 0 ? (
                                <DataTable
                                    data={orders}
                                    columns={orderColumns}
                                    pagination={true}
                                    itemsPerPage={5}
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No orders found for this customer</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomerDetail;
