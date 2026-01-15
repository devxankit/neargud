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

        // We'll fetch more data for 'all' to show trends, or specific based on period
        // For now, let's get stats for current month vs previous?
        // Actually, dashboard usually shows "Total Revenue" (All time) and chart shows trend.

        // 1. Total Revenue & Orders (Aggregated)
        // We want Total Orders to be ALL orders in period.
        // We want Total Revenue to be only VALID orders in period.
        const statsResult = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['cancelled', 'refunded', 'pending']] },
                                0,
                                // Use pricing.total if exists, else 0
                                { $ifNull: ['$pricing.total', 0] }
                            ]
                        }
                    }
                }
            }
        ]);

        const totalRevenue = statsResult[0]?.totalRevenue || 0;
        const totalOrders = statsResult[0]?.totalOrders || 0;

        // 2. Total Customers (All time usually, or new? Let's keep All Time for "Total Base")
        const totalCustomers = await User.countDocuments({ role: 'user', isActive: true });

        // 3. Total Products (Active)
        const totalProducts = await Product.countDocuments({ isActive: true });

        // 4. Chart Data: Revenue & Orders over time
        // Chart usually reflects "Performance", so usually excludes cancelled?
        // But if Total Orders card shows 2, and Chart shows 1, it is confusing.
        // Let's show ALL orders in Chart Orders count, but only Valid Revenue in Chart Revenue.
        const chartData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['cancelled', 'refunded', 'pending']] },
                                0,
                                { $ifNull: ['$pricing.total', 0] }
                            ]
                        }
                    },
                    orders: { $sum: 1 } // Count all orders
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

        // 5. Order Status Distribution (Pie Chart) - Apply Date Filter!
        const statusAgg = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
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

        // 6. Top Products (by sales count in orders) - Apply Date Filter!
        // Also only count sales from VALID orders (cancelled items shouldn't be "Top Sellers")
        const topProductsAgg = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ['cancelled', 'refunded'] },
                    createdAt: { $gte: startDate }
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
        // We can fetch this separately or include it. 
        // The dashboard already fetches recent orders separately in the frontend code I saw!
        // But I can include it to save a request if I want. 
        // The current frontend implementation uses `adminOrderApi.getOrders({ limit: 5 })`.
        // I will leave that as is or return it here. Returning it here is cleaner.
        const recentOrders = await Order.find()
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
