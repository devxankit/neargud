import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import mongoose from 'mongoose';
import { getAllVendorOrdersTransformed } from './vendorOrders.service.js';
import Settings from '../models/Settings.model.js';

/**
 * Get vendor performance metrics
 * @param {String} vendorId - Vendor ID
 * @param {String} period - Time period (week, month, year)
 * @returns {Promise<Object>} { metrics, earnings, revenueData, topProducts, recentOrders }
 */
export const getVendorPerformanceMetrics = async (vendorId, period = 'all') => {
  try {
    // Get all vendor orders
    let query = {
      $and: [
        {
          $or: [
            { 'vendorBreakdown.vendorId': new mongoose.Types.ObjectId(vendorId) },
            { 'items.productId': { $in: await Product.find({ vendorId }).distinct('_id') } }
          ]
        },
        {
          $or: [
            { paymentStatus: { $in: ['completed', 'refunded'] } },
            { paymentMethod: { $in: ['cod', 'cash'] } }
          ]
        }
      ]
    };

    if (period !== 'all') {
      // ... existing date logic ...
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
      query.orderDate = { $gte: startDate };
    }

    const orders = await Order.find(query).sort({ orderDate: -1 }).lean();
    // Get total products count
    const totalProducts = await Product.countDocuments({
      vendorId: vendorId,
    });

    // Get global commission rate from settings
    const settings = await Settings.findOne();
    const defaultCommissionRate = settings?.general?.defaultCommissionRate
      ? settings.general.defaultCommissionRate / 100
      : 0.1; // Default to 10%

    // Get vendor product IDs for fallback calculation
    const vendorProductIds = await Product.find({ vendorId }).distinct('_id');
    const vendorProductIdStrings = vendorProductIds.map(id => id.toString());

    // Calculate metrics from orders
    let totalRevenue = 0;
    let totalEarnings = 0;
    let pendingEarnings = 0;
    let paidEarnings = 0;
    let successfulOrdersCount = 0;
    const customerIds = new Set();

    orders.forEach((order) => {
      let orderSubtotal = 0;
      let orderEarnings = 0;
      let itemsFound = false;

      // Filter out unsuccessful orders from metrics (but they remain in recentOrders)
      const isUnsuccessful = ['cancelled', 'returned', 'refunded', 'cancellation_requested', 'return_requested'].includes(order.status);

      // 1. First, check if there's data in vendorBreakdown
      if (order.vendorBreakdown && Array.isArray(order.vendorBreakdown)) {
        const vendorItem = order.vendorBreakdown.find(
          (vi) => vi.vendorId?.toString() === vendorId.toString()
        );

        if (vendorItem) {
          orderSubtotal = vendorItem.subtotal || 0;
          // Use current commission rate for calculations to reflect admin changes immediately
          const commission = orderSubtotal * defaultCommissionRate;
          orderEarnings = orderSubtotal - commission;
          itemsFound = true;
        }
      }

      // 2. If not found in breakdown or subtotal is 0, calculate from items
      if (!itemsFound || orderSubtotal === 0) {
        let calculatedSubtotal = 0;
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productVendorId = item.productId?.vendorId?.toString();
            const pId = item.productId?._id?.toString() || item.productId?.toString();

            if (productVendorId === vendorId.toString() || vendorProductIdStrings.includes(pId)) {
              calculatedSubtotal += (item.price || 0) * (item.quantity || 1);
            }
          });
        }

        if (calculatedSubtotal > 0) {
          orderSubtotal = calculatedSubtotal;
          const commission = orderSubtotal * defaultCommissionRate;
          orderEarnings = orderSubtotal - commission;
          itemsFound = true;
        }
      }

      // Only add to metrics if items were found and order is NOT unsuccessful
      if (itemsFound && orderSubtotal > 0 && !isUnsuccessful) {
        totalRevenue += orderSubtotal;
        totalEarnings += orderEarnings;
        successfulOrdersCount++;

        // Track customer
        const customerId = order.customerId?._id || order.customerId || order.userId?._id || order.userId;
        if (customerId) {
          customerIds.add(customerId.toString());
        }

        // Categorize earnings by order status
        // Settlement rule: Direct release upon delivery
        const isDelivered = ['delivered', 'completed'].includes(order.status);

        if (order.fundsReleased || isDelivered) {
          // Funds are officially paid/released
          paidEarnings += orderEarnings;
        } else {
          // Everything else that is NOT unsuccessful is "Pending" (e.g. processing, shipped)
          pendingEarnings += orderEarnings;
        }
      }
    });

    const totalOrders = orders.length;
    const customerCount = customerIds.size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = 0; // Requires visitor data

    const metrics = {
      totalRevenue,
      totalOrders,
      totalProducts,
      avgOrderValue,
      customerCount,
      conversionRate,
    };

    const earnings = {
      totalEarnings,
      pendingEarnings,
      paidEarnings,
    };

    // Prepare aggregation match stage
    const matchStage = {
      $match: {
        $and: [
          {
            $or: [
              { 'vendorBreakdown.vendorId': new mongoose.Types.ObjectId(vendorId) },
              { 'items.productId': { $in: vendorProductIds } }
            ]
          },
          {
            $or: [
              { paymentStatus: { $in: ['completed', 'refunded'] } },
              { paymentMethod: { $in: ['cod', 'cash'] } }
            ]
          }
        ],
        status: { $nin: ['cancelled', 'refunded'] },
      },
    };

    if (period !== 'all') {
      const now = new Date();
      let startDate;
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
      matchStage.$match.orderDate = { $gte: startDate };
    }

    // Generate revenue trends
    const trends = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'year' ? '%Y-%m' : '%Y-%m-%d',
              date: '$orderDate',
            },
          },
          revenue: {
            $sum: {
              $reduce: {
                input: '$vendorBreakdown',
                initialValue: 0,
                in: {
                  $cond: [
                    { $eq: ['$$this.vendorId', new mongoose.Types.ObjectId(vendorId)] },
                    { $add: ['$$value', { $ifNull: ['$$this.subtotal', 0] }] },
                    '$$value',
                  ],
                },
              },
            },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top products for this vendor
    // We need to be careful here because items might not have vendorId
    const topProducts = await Order.aggregate([
      matchStage,
      { $unwind: '$items' },
      {
        $match: {
          'items.productId': { $in: vendorProductIds },
        },
      },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Format top products
    const formattedTopProducts = topProducts.map(p => ({
      id: p._id,
      name: p.name,
      image: p.image,
      sales: p.sales,
      revenue: p.revenue,
      stock: 'in_stock' // Mocking stock for now
    }));

    // Format revenue data
    const revenueData = trends.map((t) => ({
      date: t._id,
      revenue: t.revenue,
      orders: t.orders,
    }));

    // Recent orders (already sorted by date desc)
    const recentOrders = orders.slice(0, 5).map(order => {
      // Find this specific vendor's subtotal from the breakdown
      let vendorSubtotal = 0;
      if (order.vendorBreakdown && Array.isArray(order.vendorBreakdown)) {
        const breakdown = order.vendorBreakdown.find(v => v.vendorId?.toString() === vendorId.toString());
        vendorSubtotal = breakdown?.subtotal || 0;
      }

      // If breakdown is empty or missing subtotal, calculate from items
      if (vendorSubtotal === 0 && order.items) {
        order.items.forEach(item => {
          const pId = item.productId?._id?.toString() || item.productId?.toString();
          if (vendorProductIdStrings.includes(pId)) {
            vendorSubtotal += (item.price || 0) * (item.quantity || 1);
          }
        });
      }

      return {
        id: order.orderCode || order._id,
        customerName: order.shippingAddress?.name || order.customerSnapshot?.name || 'Guest',
        date: order.orderDate,
        total: vendorSubtotal,
        status: order.status
      };
    });

    return {
      metrics,
      earnings,
      revenueData,
      topProducts: formattedTopProducts,
      recentOrders
    };
  } catch (error) {
    console.error('Error in getVendorPerformanceMetrics:', error);
    throw error;
  }
};

