import Order from '../../models/Order.model.js';
import Vendor from '../../models/Vendor.model.js';
import Settings from '../../models/Settings.model.js';
import mongoose from 'mongoose';
import DeliveryPartner from '../../models/DeliveryPartner.model.js';
import DeliveryWalletTransaction from '../../models/DeliveryWalletTransaction.model.js';

/**
 * Helper: Calculate Haversine Distance in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

/**
 * Get Dashboard Stats for Delivery Partner
 * GET /api/delivery/dashboard/stats
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user.deliveryPartnerId;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Active: Orders assigned but not yet delivered
        const activeStatuses = ['dispatched', 'shipped', 'out_for_delivery', 'ready_to_ship', 'shipped_seller'];

        const [activeOrders, completedToday, totalDelivered, settings, deliveryPartner, lastTransaction] = await Promise.all([
            Order.countDocuments({
                deliveryPartnerId,
                status: { $in: activeStatuses }
            }),
            Order.countDocuments({
                deliveryPartnerId,
                status: 'delivered',
                updatedAt: { $gte: startOfDay }
            }),
            Order.countDocuments({
                deliveryPartnerId,
                status: 'delivered'
            }),
            Settings.getSettings(),
            DeliveryPartner.findById(deliveryPartnerId).select('avgRating totalRatings'),
            DeliveryWalletTransaction.findOne({ deliveryPartnerId }).sort({ createdAt: -1 })
        ]);

        const earnings = lastTransaction ? lastTransaction.balanceAfter : 0;

        res.status(200).json({
            success: true,
            data: {
                activeOrders,
                completedToday,
                totalDelivered,
                earnings,
                avgRating: deliveryPartner?.avgRating || 0,
                totalRatings: deliveryPartner?.totalRatings || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Assigned Orders (My Orders)
 * GET /api/delivery/orders/assigned
 */
export const getAssignedOrders = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user.deliveryPartnerId;
        const { status } = req.query;

        const query = { deliveryPartnerId };

        if (status) {
            if (status === 'active') {
                query.status = { $in: ['shipped', 'out_for_delivery', 'dispatched', 'ready_to_ship', 'shipped_seller'] };
            } else if (status === 'history') {
                query.status = { $in: ['delivered', 'cancelled', 'refunded'] };
            } else {
                query.status = status;
            }
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name image price')
            .populate('shippingAddress')
            .populate('vendorBreakdown.vendorId', 'storeName address location') // Populate vendor for address
            .select('orderCode total status paymentMethod paymentStatus items shippingAddress createdAt vendorBreakdown')
            .lean();

        const settings = await Settings.getSettings();
        const deliveryPartnerFee = settings?.delivery?.deliveryPartnerFee || 50;

        const ordersWithFee = orders.map(order => ({
            ...order,
            deliveryFee: deliveryPartnerFee
        }));

        res.status(200).json({
            success: true,
            data: ordersWithFee
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Available Orders (Nearby)
 * GET /api/delivery/orders/available
 * Query: ?lat=...&lng=...
 */
export const getAvailableOrders = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;
        const driverLat = lat ? parseFloat(lat) : null;
        const driverLng = lng ? parseFloat(lng) : null;

        // 1. Find potential orders: Not assigned, Ready to ship
        const orders = await Order.find({
            deliveryPartnerId: null,
            status: { $in: ['ready_to_ship', 'shipped_seller'] }
        })
            .populate('vendorBreakdown.vendorId', 'storeName address location deliveryRadius deliveryPartnersEnabled')
            .populate('shippingAddress')
            .select('orderCode total status items vendorBreakdown shippingAddress createdAt')
            .lean();

        // 2. Filter by radius and include distance
        const filteredOrders = orders.map(order => {
            if (!order.vendorBreakdown || order.vendorBreakdown.length === 0) return order;

            const vendor = order.vendorBreakdown[0]?.vendorId;
            // If vendor is not populated or disabled, skip
            if (!vendor || vendor.deliveryPartnersEnabled === false) return null;

            // If no driver location OR no vendor location, show order without distance calculation
            if (driverLat === null || driverLng === null || !vendor.location?.coordinates) {
                return { ...order, distance: null };
            }

            const [vendorLng, vendorLat] = vendor.location.coordinates;

            // If vendor location is placeholder (0,0), show without distance
            if (!vendorLat || !vendorLng || (vendorLat === 0 && vendorLng === 0)) {
                return { ...order, distance: null };
            }

            const distance = calculateDistance(driverLat, driverLng, vendorLat, vendorLng);
            const radius = vendor.deliveryRadius || 50; // Increased default testing radius

            // If within radius, show with distance
            if (distance <= radius) {
                return { ...order, distance: Math.round(distance * 10) / 10 };
            }

            // For testing: if distance is valid but outside radius, maybe hide it?
            // Let's keep the radius filter but make it more generous or allow all if no radius set.
            return null;
        }).filter(order => order !== null);

        // 3. Get delivery fee from settings
        const settings = await Settings.getSettings();
        const deliveryPartnerFee = settings?.delivery?.deliveryPartnerFee || 50;

        res.status(200).json({
            success: true,
            data: filteredOrders.map(order => ({
                ...order,
                deliveryFee: deliveryPartnerFee
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Claim Order (Accept)
 * POST /api/delivery/orders/:id/claim
 */
export const claimOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deliveryPartnerId = req.user.deliveryPartnerId;

        const order = await Order.findById(id);

        if (!order) {
            const error = new Error('Order not found');
            error.status = 404;
            throw error;
        }

        if (order.deliveryPartnerId) {
            const error = new Error('Order already assigned to another partner');
            error.status = 400; // Conflict
            throw error;
        }

        if (!['ready_to_ship', 'shipped_seller'].includes(order.status)) {
            const error = new Error('Order is not ready for pickup');
            error.status = 400;
            throw error;
        }

        // Assign
        order.deliveryPartnerId = deliveryPartnerId;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order claimed successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Order Details
 * GET /api/delivery/orders/:id
 */
export const getOrderDetails = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId', 'name image price')
            .populate('shippingAddress')
            .populate('customerId', 'firstName lastName phone email')
            .lean();

        if (!order) {
            const error = new Error('Order not found');
            error.status = 404;
            throw error;
        }

        // Check permission
        if (order.deliveryPartnerId && order.deliveryPartnerId.toString() !== req.user.deliveryPartnerId) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        const settings = await Settings.getSettings();
        const deliveryPartnerFee = settings?.delivery?.deliveryPartnerFee || 50;

        // Inject fee
        order.deliveryFee = deliveryPartnerFee;

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Order Status
 * PATCH /api/delivery/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const deliveryPartnerId = req.user.deliveryPartnerId;

        // Allowed transitions
        const allowedStatuses = ['out_for_delivery', 'delivered'];

        if (!allowedStatuses.includes(status)) {
            const error = new Error('Invalid status update');
            error.status = 400;
            throw error;
        }

        const order = await Order.findOne({
            _id: req.params.id,
            deliveryPartnerId
        });

        if (!order) {
            const error = new Error('Order not found or not assigned');
            error.status = 404;
            throw error;
        }

        order.status = status;
        if (status === 'delivered') {
            order.tracking.deliveredAt = new Date();
            order.paymentStatus = 'completed';

            // Add earnings to wallet
            const settings = await Settings.getSettings();
            const deliveryFee = settings?.delivery?.deliveryPartnerFee || 50;

            // Record fee on order
            order.deliveryPartnerFee = deliveryFee;
            if (['cash', 'cod'].includes(order.paymentMethod)) {
                order.cashCollectedBy = deliveryPartnerId;
            }

            // Get current balance
            const lastTransaction = await DeliveryWalletTransaction.findOne({ deliveryPartnerId }).sort({ createdAt: -1 });
            const currentBalance = lastTransaction ? lastTransaction.balanceAfter : 0;

            await DeliveryWalletTransaction.create({
                deliveryPartnerId,
                type: 'earning',
                amount: deliveryFee,
                balanceBefore: currentBalance,
                balanceAfter: currentBalance + deliveryFee,
                description: `Earning for order #${order.orderCode}`,
                referenceId: order._id,
                referenceType: 'Order',
                status: 'completed'
            });
        }

        order.statusHistory.push({
            status: status,
            changedBy: deliveryPartnerId,
            changedByModel: 'DeliveryPartner',
            changedByRole: 'delivery_partner',
            timestamp: new Date(),
            note: `Updated to ${status} by delivery partner`
        });

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Wallet Transactions
 * GET /api/delivery/wallet/transactions
 */
export const getWalletTransactions = async (req, res, next) => {
    try {
        const deliveryPartnerId = req.user.deliveryPartnerId;
        const { type } = req.query;

        const query = { deliveryPartnerId };
        if (type) query.type = type;

        const transactions = await DeliveryWalletTransaction.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        // Calculate balance
        const lastTransaction = await DeliveryWalletTransaction.findOne({ deliveryPartnerId }).sort({ createdAt: -1 });
        const balance = lastTransaction ? lastTransaction.balanceAfter : 0;

        res.status(200).json({
            success: true,
            data: {
                transactions,
                balance
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Request Withdrawal
 * POST /api/delivery/wallet/withdraw
 */
export const requestWithdrawal = async (req, res, next) => {
    try {
        const { amount } = req.body;
        const deliveryPartnerId = req.user.deliveryPartnerId;

        if (!amount || amount < 100) {
            return res.status(400).json({
                success: false,
                message: 'Minimum withdrawal amount is ₹100'
            });
        }

        // Check balance
        const lastTransaction = await DeliveryWalletTransaction.findOne({ deliveryPartnerId }).sort({ createdAt: -1 });
        const currentBalance = lastTransaction ? lastTransaction.balanceAfter : 0;

        if (currentBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Create withdrawal request
        await WithdrawalRequest.create({
            deliveryPartnerId,
            userType: 'delivery_partner',
            amount: amount,
            status: 'pending',
            requestedAt: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal request submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Delivery Partner Location
 * POST /api/delivery/location
 */
export const updateLocation = async (req, res, next) => {
    try {
        const { lat, lng } = req.body;
        const deliveryPartnerId = req.user.deliveryPartnerId;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and Longitude are required'
            });
        }

        const deliveryPartner = await DeliveryPartner.findByIdAndUpdate(
            deliveryPartnerId,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)],
                    lastUpdated: new Date()
                }
            },
            { new: true }
        );

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery Partner not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: {
                location: deliveryPartner.currentLocation
            }
        });
    } catch (error) {
        next(error);
    }
};

