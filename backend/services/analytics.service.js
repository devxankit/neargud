import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

/**
 * Get date range based on period
 * @param {string} period - 'week', 'month', 'year'
 * @returns {Object} - { startDate, endDate }
 */
const getDateRange = (period) => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'quarter':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate };
};

/**
 * Get Admin Analytics Summary
 * @param {string} period 
 */
export const getAdminAnalyticsSummary = async (period) => {
  const { startDate, endDate } = getDateRange(period);

  // Get total stats
  const [
    totalRevenueResult,
    totalOrders,
    totalProducts,
    totalCustomers
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.countDocuments({ status: { $ne: 'cancelled' } }),
    Product.countDocuments(),
    User.countDocuments({ role: 'user' })
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

  // Get growth stats (comparing with previous period)
  const previousStartDate = new Date(startDate);
  const diff = endDate.getTime() - startDate.getTime();
  previousStartDate.setTime(startDate.getTime() - diff);

  const [
    recentRevenueResult,
    previousRevenueResult,
    recentOrders,
    previousOrders,
    recentProducts,
    previousProducts,
    recentCustomers,
    previousCustomers
  ] = await Promise.all([
    Order.aggregate([
      { $match: { orderDate: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.aggregate([
      { $match: { orderDate: { $gte: previousStartDate, $lt: startDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.countDocuments({ orderDate: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' } }),
    Order.countDocuments({ orderDate: { $gte: previousStartDate, $lt: startDate }, status: { $ne: 'cancelled' } }),
    Product.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    Product.countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startDate, $lte: endDate } }),
    User.countDocuments({ role: 'user', createdAt: { $gte: previousStartDate, $lt: startDate } })
  ]);

  const recentRevenue = recentRevenueResult[0]?.total || 0;
  const previousRevenue = previousRevenueResult[0]?.total || 0;

  const calculateChange = (recent, previous) => {
    if (previous === 0) return recent > 0 ? 100 : 0;
    return parseFloat((((recent - previous) / previous) * 100).toFixed(1));
  };

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueChange: calculateChange(recentRevenue, previousRevenue),
    ordersChange: calculateChange(recentOrders, previousOrders),
    productsChange: calculateChange(recentProducts, previousProducts),
    customersChange: calculateChange(recentCustomers, previousCustomers)
  };
};

/**
 * Get Admin Chart Data
 * @param {string} period 
 */
export const getAdminChartData = async (period) => {
  const { startDate, endDate } = getDateRange(period);

  const grouping = {
    week: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
    month: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
    year: { $dateToString: { format: '%Y-%m', date: '$orderDate' } }
  };

  const chartData = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: grouping[period] || grouping.month,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return chartData.map(item => ({
    date: item._id,
    revenue: item.revenue,
    orders: item.orders
  }));
};

/**
 * Get Admin Finance Summary
 * @param {string} period 
 */
export const getAdminFinanceSummary = async (period) => {
  const { startDate, endDate } = getDateRange(period);

  const [revenueResult, commissionResult, ordersCount] = await Promise.all([
    // Total Revenue (GMV)
    Order.aggregate([
      { $match: { orderDate: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    // Commissions (Admin Profit)
    Order.aggregate([
      { $match: { orderDate: { $gte: startDate, $lte: endDate }, status: 'delivered' } },
      { $unwind: '$vendorBreakdown' },
      { $group: { _id: null, total: { $sum: '$vendorBreakdown.commission' } } }
    ]),
    Order.countDocuments({ orderDate: { $gte: startDate, $lte: endDate }, status: { $ne: 'cancelled' } })
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const totalCommission = commissionResult[0]?.total || 0;

  // Simplified finance logic for a marketplace
  const costOfGoods = totalRevenue * 0.85; // Assume 85% goes to vendors
  const operatingExpenses = totalRevenue * 0.05; // Assume 5% operating cost
  const grossProfit = totalRevenue - costOfGoods;
  const netProfit = totalCommission - operatingExpenses;

  return {
    totalRevenue,
    totalOrders: ordersCount,
    averageOrderValue: ordersCount > 0 ? totalRevenue / ordersCount : 0,
    costOfGoods,
    operatingExpenses,
    grossProfit,
    netProfit,
    profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  };
};

/**
 * Get Order Trends
 * @param {string} period 
 */
export const getOrderTrends = async (period) => {
  const { startDate, endDate } = getDateRange(period);

  const trends = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$total" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return trends.map(t => ({
    date: t._id,
    orders: t.orders,
    revenue: t.revenue
  }));
};

/**
 * Get Payment Breakdown
 * @param {string} period 
 */
export const getPaymentBreakdown = async (period) => {
  const { startDate, endDate } = getDateRange(period);

  const breakdown = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        amount: { $sum: "$total" }
      }
    }
  ]);

  return breakdown.map(b => ({
    method: b._id || 'Unknown',
    count: b.count,
    amount: b.amount
  }));
};

/**
 * Get Tax Reports
 * @param {string} period 
 */
export const getTaxReports = async (period) => {
  const { startDate, endDate } = getDateRange(period);

  const taxData = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startDate, $lte: endDate },
        status: 'delivered'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
        taxableAmount: { $sum: "$total" },
        taxAmount: { $sum: { $ifNull: ["$pricing.tax", 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return taxData.map(t => ({
    month: t._id,
    taxableAmount: t.taxableAmount,
    taxAmount: t.taxAmount
  }));
};

/**
 * Get Refund Reports
 * @param {string} period 
 */
export const getRefundReports = async (period) => {
  const { startDate, endDate } = getDateRange(period);

  const refunds = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: startDate, $lte: endDate },
        status: 'returned'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
        count: { $sum: 1 },
        amount: { $sum: "$total" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return refunds.map(r => ({
    date: r._id,
    count: r.count,
    amount: r.amount
  }));
};

/**
 * Get Vendor Analytics Summary
 * @param {string} vendorId 
 * @param {string} period 
 */
export const getVendorAnalyticsSummary = async (vendorId, period) => {
  const { startDate, endDate } = getDateRange(period);
  const vId = new mongoose.Types.ObjectId(vendorId);

  // Get vendor's product IDs to ensure we catch all relevant orders
  const vendorProducts = await Product.find({ vendorId: vId }).select('_id').lean();
  const vProductIds = vendorProducts.map(p => p._id);

  const matchFilter = {
    $or: [
      { 'vendorBreakdown.vendorId': vId },
      { 'items.productId': { $in: vProductIds } }
    ],
    status: { $ne: 'cancelled' },
    orderDate: { $gte: startDate, $lte: endDate }
  };

  // Total stats for the vendor
  const [totalEarningsResult, totalOrders, totalProducts] = await Promise.all([
    Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.vendorId': vId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]),
    Order.countDocuments(matchFilter),
    Product.countDocuments({ vendorId: vId })
  ]);

  const totalEarnings = totalEarningsResult[0]?.total || 0;

  // Pending earnings (orders not yet delivered)
  const pendingEarningsResult = await Order.aggregate([
    {
      $match: {
        ...matchFilter,
        status: { $in: ['pending', 'processing', 'ready_to_ship', 'dispatched', 'shipped_seller', 'shipped'] }
      }
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    { $match: { 'productInfo.vendorId': vId } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
  ]);

  const pendingEarnings = pendingEarningsResult[0]?.total || 0;

  // Growth stats
  const previousStartDate = new Date(startDate);
  const diff = endDate.getTime() - startDate.getTime();
  previousStartDate.setTime(startDate.getTime() - diff);

  const [recentRevenueResult, previousRevenueResult, recentOrders, previousOrders] = await Promise.all([
    Order.aggregate([
      { $match: { ...matchFilter, orderDate: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.vendorId': vId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]),
    Order.aggregate([
      { $match: { ...matchFilter, orderDate: { $gte: previousStartDate, $lt: startDate } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.vendorId': vId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]),
    Order.countDocuments({ ...matchFilter, orderDate: { $gte: startDate, $lte: endDate } }),
    Order.countDocuments({ ...matchFilter, orderDate: { $gte: previousStartDate, $lt: startDate } })
  ]);

  const recentRevenue = recentRevenueResult[0]?.total || 0;
  const previousRevenue = previousRevenueResult[0]?.total || 0;

  const calculateChange = (recent, previous) => {
    if (previous === 0) return recent > 0 ? 100 : 0;
    return parseFloat((((recent - previous) / previous) * 100).toFixed(1));
  };

  return {
    totalRevenue: totalEarnings,
    pendingEarnings,
    totalOrders,
    totalProducts,
    revenueChange: calculateChange(recentRevenue, previousRevenue),
    ordersChange: calculateChange(recentOrders, previousOrders)
  };
};

/**
 * Get Vendor Chart Data
 * @param {string} vendorId 
 * @param {string} period 
 */
export const getVendorChartData = async (vendorId, period) => {
  const { startDate, endDate } = getDateRange(period);
  const vId = new mongoose.Types.ObjectId(vendorId);

  const grouping = {
    week: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
    month: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
    year: { $dateToString: { format: '%Y-%m', date: '$orderDate' } }
  };

  const vendorProducts = await Product.find({ vendorId: vId }).select('_id').lean();
  const vProductIds = vendorProducts.map(p => p._id);

  const matchFilter = {
    $or: [
      { 'vendorBreakdown.vendorId': vId },
      { 'items.productId': { $in: vProductIds } }
    ],
    status: { $ne: 'cancelled' },
    orderDate: { $gte: startDate, $lte: endDate }
  };

  const chartData = await Order.aggregate([
    { $match: matchFilter },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    { $match: { 'productInfo.vendorId': vId } },
    {
      $group: {
        _id: grouping[period] || grouping.month,
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return chartData.map(item => ({
    date: item._id,
    revenue: item.revenue,
    orders: item.orders
  }));
};

/**
 * Get Vendor Dashboard Data
 * @param {string} vendorId 
 * @param {string} period 
 */
export const getVendorDashboardData = async (vendorId, period) => {
  const { startDate, endDate } = getDateRange(period);
  const vId = new mongoose.Types.ObjectId(vendorId);

  // Get vendor's product IDs to ensure we catch all relevant orders
  const vendorProducts = await Product.find({ vendorId: vId }).select('_id').lean();
  const vProductIds = vendorProducts.map(p => p._id);

  const matchFilter = {
    $or: [
      { 'vendorBreakdown.vendorId': vId },
      { 'items.productId': { $in: vProductIds } }
    ],
    status: { $ne: 'cancelled' },
    orderDate: { $gte: startDate, $lte: endDate }
  };

  // 1. Basic Metrics & Earnings
  const [
    totalEarningsResult,
    pendingEarningsResult,
    totalOrders,
    totalProducts,
    recentOrders,
    topProductsResult,
    summaryStats,
    statusStats,
    customerCountResult
  ] = await Promise.all([
    // [0-5] existing queries...
    // Total Earnings (Delivered)
    Order.aggregate([
      { $match: { ...matchFilter, status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.vendorId': vId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]),
    // Pending Earnings
    Order.aggregate([
      {
        $match: {
          ...matchFilter,
          status: { $in: ['pending', 'processing', 'ready_to_ship', 'dispatched', 'shipped_seller', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.vendorId': vId } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]),
    Order.countDocuments(matchFilter),
    Product.countDocuments({ vendorId: vId }),
    // Recent Orders
    Order.find({
      $or: [
        { 'vendorBreakdown.vendorId': vId },
        { 'items.productId': { $in: vProductIds } }
      ]
    })
      .sort({ orderDate: -1 })
      .limit(5)
      .select('orderCode orderDate total status vendorBreakdown items')
      .lean(),
    // Top Products
    Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.vendorId': vId } },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]),
    getVendorAnalyticsSummary(vendorId, period),
    Order.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Order.distinct('customerId', matchFilter)
  ]);

  const customerCount = customerCountResult.length;

  const statusDistribution = statusStats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const totalEarnings = totalEarningsResult[0]?.total || 0;
  const pendingEarnings = pendingEarningsResult[0]?.total || 0;

  // 2. Revenue Data for Chart
  const revenueData = await getVendorChartData(vendorId, period);

  return {
    metrics: {
      totalRevenue: totalEarnings + pendingEarnings,
      totalOrders,
      totalProducts,
      avgOrderValue: totalOrders > 0 ? (totalEarnings + pendingEarnings) / totalOrders : 0,
      customerCount: customerCount,
      revenueChange: summaryStats.revenueChange,
      ordersChange: summaryStats.ordersChange
    },
    earnings: {
      totalEarnings: totalEarnings + pendingEarnings,
      pendingEarnings: pendingEarnings,
      paidEarnings: totalEarnings,
    },
    statusDistribution,
    revenueData,
    topProducts: topProductsResult.map(p => ({
      id: p._id,
      name: p.name,
      image: p.image,
      sales: p.sales,
      revenue: p.revenue
    })),
    recentOrders: recentOrders.map(o => {
      const vendorInfo = o.vendorBreakdown?.find(vb => vb.vendorId?.toString() === vId.toString());
      return {
        id: o.orderCode,
        date: o.orderDate,
        total: vendorInfo?.subtotal || o.total,
        status: o.status
      };
    })
  };
};
