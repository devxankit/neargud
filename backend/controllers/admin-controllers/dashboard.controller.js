import Order from '../../models/Order.model.js';
import User from '../../models/User.model.js';
import Product from '../../models/Product.model.js';

/**
 * Get dashboard aggregated statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        // Date filtering
        const now = new Date();
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        switch (period) {
            case 'today':
                break;
            case 'week':
                startDate.setDate(now.getDate() - 6);
                break;
            case 'month':
                startDate.setDate(1);
                break;
            case 'year':
                startDate.setMonth(0, 1);
                break;
            default:
                startDate.setDate(now.getDate() - 29);
        }

        // Global Payment Filter: Only Paid or COD/Cash orders are valid
        const paymentFilter = {
            $or: [
                { paymentStatus: { $in: ['completed', 'refunded'] } },
                { paymentMethod: { $in: ['cod', 'cash'] } }
            ]
        };

        // 1. Total Revenue & Orders (Aggregated)
        const statsResult = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    ...paymentFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['cancelled', 'refunded', 'pending', 'returned', 'return_approved']] },
                                0,
                                { $ifNull: ['$pricing.total', 0] }
                            ]
                        }
                    }
                }
            }
        ]);

        const totalRevenue = statsResult[0]?.totalRevenue || 0;
        const totalOrders = statsResult[0]?.totalOrders || 0;

        // 2. Total Customers
        const totalCustomers = await User.countDocuments({ role: 'user', isActive: true });

        // 3. Total Products (Active)
        const totalProducts = await Product.countDocuments({ isActive: true });

        // 4. Chart Data: Revenue & Orders over time
        const chartData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    ...paymentFilter
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['cancelled', 'refunded', 'pending', 'returned', 'return_approved']] },
                                0,
                                { $ifNull: ['$pricing.total', 0] }
                            ]
                        }
                    },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing dates
        const formattedChartData = [];
        let currentDate = new Date(startDate);
        const nowStr = now.toISOString().split('T')[0];

        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (dateStr > nowStr) break;

            const found = chartData.find(d => d._id === dateStr);
            formattedChartData.push({
                date: dateStr,
                revenue: found ? found.revenue : 0,
                orders: found ? found.orders : 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 5. Order Status Distribution (Pie Chart)
        const statusAgg = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    ...paymentFilter
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusDistribution = statusAgg.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // 6. Top Products
        const topProductsAgg = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ['cancelled', 'refunded', 'returned', 'return_approved'] },
                    createdAt: { $gte: startDate },
                    ...paymentFilter
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.name' },
                    sales: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $project: {
                    name: 1,
                    sales: 1,
                    revenue: 1,
                    image: { $arrayElemAt: ['$productDetails.images', 0] },
                    stock: { $arrayElemAt: ['$productDetails.stock', 0] },
                    stockQuantity: { $arrayElemAt: ['$productDetails.stockQuantity', 0] }
                }
            }
        ]);

        // 7. Recent Orders
        const recentOrders = await Order.find(paymentFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customerId', 'firstName lastName email')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalOrders,
                    totalCustomers,
                    totalProducts
                },
                chartData: formattedChartData,
                statusDistribution,
                topProducts: topProductsAgg.map(p => ({
                    ...p,
                    id: p._id,
                    image: Array.isArray(p.image) ? p.image[0] : (p.image || 'https://via.placeholder.com/50'),
                    stock: p.stock || 'in_stock'
                })),
                recentOrders
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
