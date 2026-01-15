import Review from '../models/Review.model.js';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

/**
 * Create a new review
 * @param {Object} data - { userId, productId, orderId, rating, comment, images }
 */
export const createReview = async (data) => {
    const { userId, productId, orderId, rating, comment, review, images } = data;

    // Check if user has already submitted 3 reviews for this product
    const reviewCount = await Review.countDocuments({ userId, productId });
    if (reviewCount >= 3) {
        throw new Error('You have already reviewed this product');
    }

    // Fetch user details for the name
    const user = await User.findById(userId);
    const customerName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous';

    // Create Review without strict order verification as requested
    const finalReviewText = review || comment || '';

    const reviewDoc = await Review.create({
        userId,
        productId,
        orderId: orderId || null,
        rating,
        review: finalReviewText,
        comment: finalReviewText,
        images,
        status: 'approved',
        customerName: customerName,
        isVerifiedPurchase: !!orderId
    });

    // Update Product Aggregates
    await updateProductRating(productId);

    return reviewDoc;
};

/**
 * Get reviews for a product
 */
export const getProductReviews = async (productId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId }) // Removing strict approval filter for visibility testing
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar');

    const total = await Review.countDocuments({ productId });

    return {
        reviews,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

/**
 * Check if a user can review a product
 */
export const checkReviewEligibility = async (userId, productId) => {
    // Check if user has already submitted 3 reviews for this product
    const reviewCount = await Review.countDocuments({ userId, productId });

    if (reviewCount >= 3) {
        return {
            canReview: false,
            message: 'You have already reviewed this product'
        };
    }

    // We try to find a delivered order just to link it if possible, but it's not required.
    const order = await Order.findOne({
        customerId: userId,
        status: 'delivered',
        'items.productId': productId,
    }).select('_id');

    return {
        canReview: true,
        orderId: order ? order._id : null,
        message: 'Anyone can review products (up to 3 times).'
    };
};

/**
 * Inner Helper: Update Product Average Rating
 */
const updateProductRating = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
            $group: {
                _id: '$productId',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: parseFloat(stats[0].avgRating.toFixed(1)),
            reviewCount: stats[0].count,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            reviewCount: 0,
        });
    }
};
