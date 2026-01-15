import Order from '../../models/Order.model.js';
import Vendor from '../../models/Vendor.model.js';
import Settings from '../../models/Settings.model.js';
import mongoose from 'mongoose';
import DeliveryPartner from '../../models/DeliveryPartner.model.js';

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

        const [activeOrders, completedToday, totalDelivered, settings] = await Promise.all([
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
            Settings.getSettings()
        ]);

        const deliveryPartnerFee = settings?.delivery?.deliveryPartnerFee || 50;

        res.status(200).json({
            success: true,
            data: {
                activeOrders,
                completedToday,
                totalDelivered,
                earnings: totalDelivered * deliveryPartnerFee
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

        if (!lat || !lng) {
            // If no location provided, return empty or error.
            // For now, return empty to avoid erroring if GPS off.
            return res.status(200).json({ success: true, data: [] });
        }

        const driverLat = parseFloat(lat);
        const driverLng = parseFloat(lng);

        // 1. Find potential orders: Not assigned, Ready to ship
        // Note: Using 'ready_to_ship' or 'shipped_seller'?
        // Usually 'ready_to_ship' means packed and ready for pickup.
        const orders = await Order.find({
            deliveryPartnerId: null,
            status: { $in: ['ready_to_ship', 'shipped_seller'] }
        })
            .populate('vendorBreakdown.vendorId', 'storeName address location deliveryRadius deliveryPartnersEnabled')
            .populate('shippingAddress')
            .select('orderCode total status items vendorBreakdown shippingAddress createdAt');

        // 2. Filter by radius and include distance
        const nearbyOrders = orders.map(order => {
            if (!order.vendorBreakdown || order.vendorBreakdown.length === 0) return null;

            const vendor = order.vendorBreakdown[0].vendorId;
            if (!vendor || vendor.deliveryPartnersEnabled === false) return null;

            if (!vendor.location || !vendor.location.coordinates) return null;

            const [vendorLng, vendorLat] = vendor.location.coordinates;

            // Strict check: Ignore if vendor location is missing or invalid (0,0)
            if (!vendorLat || !vendorLng || (vendorLat === 0 && vendorLng === 0)) return null;

            // Parse driver location safely
            const dLat = parseFloat(driverLat);
            const dLng = parseFloat(driverLng);

            // Strict check: Ignore if driver location is invalid
            if (isNaN(dLat) || isNaN(dLng) || (dLat === 0 && dLng === 0)) return null;

            const distance = calculateDistance(dLat, dLng, vendorLat, vendorLng);
            const radius = vendor.deliveryRadius || 20;

            // Strict distance check: Must be a valid number and within radius
            if (isNaN(distance) || distance > radius) return null;

            // Return order with calculated distance
            const orderObj = order.toObject();
            orderObj.distance = Math.round(distance * 10) / 10; // Round to 1 decimal place
            return orderObj;
        }).filter(order => order !== null);

        // 3. Get delivery fee from settings
        const settings = await Settings.getSettings();
        const deliveryPartnerFee = settings?.delivery?.deliveryPartnerFee || 50;

        res.status(200).json({
            success: true,
            data: nearbyOrders.map(order => ({
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
        // Optionally update status to 'dispatched' or keep 'ready_to_ship' until picked up?
        // Let's keep it 'ready_to_ship' but assigned. 
        // Or update to 'dispatched' to indicate "Driver assigned".
        // Frontend uses 'dispatched' or 'shipped' as active.
        // Let's set to 'dispatched' (Driver Assigned).
        // order.status = 'dispatched'; 
        // Wait, 'dispatched' usually means Vendor dispatched it.
        // If Vendor marks 'ready_to_ship', then Driver Claims.
        // If Driver Claims -> 'out_for_delivery'? No, that's when they have it.
        // Let's just assign it. Status stays 'ready_to_ship'.
        // BUT `getAssignedOrders` filters for `['shipped', 'out_for_delivery', 'dispatched', 'ready_to_ship']`.
        // So it will show up.

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

// ... existing getOrderDetails and updateOrderStatus
/**
 * Get Order Details
 * GET /api/delivery/orders/:id
 */
export const getOrderDetails = async (req, res, next) => {
    try {
        // Also allow viewing details if order is available (unassigned) and user is claiming?
        // Or restrict to assigned?
        // User might want to see details before claiming.
        // Let's allow if assigned to me OR (unassigned).

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
        // If 'ready_to_ship' -> 'out_for_delivery' (Pick up)
        // If 'out_for_delivery' -> 'delivered'
        const allowedStatuses = ['out_for_delivery', 'delivered'];

        if (!allowedStatuses.includes(status)) {
            // Maybe allow 'dispatched'?
            // Let strict check.
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
        }

        order.statusHistory.push({
            status: status,
            changedBy: deliveryPartnerId,
            changedByModel: 'DeliveryPartner',
            changedByRole: 'delivery_partner',
            timestamp: new Date(),
            note: `Updated by delivery partner`
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
