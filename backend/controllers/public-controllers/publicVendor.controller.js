import { getApprovedVendors, getVendorById } from '../../services/vendorManagement.service.js';
import Product from '../../models/Product.model.js';

/**
 * Get all approved vendors (public endpoint)
 * GET /api/vendors
 */
export const getPublicVendors = async (req, res, next) => {
  try {
    const {
      search = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Get approved vendors
    const result = await getApprovedVendors({
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
    });

    // Enrich vendors with product counts and ratings
    const enrichedVendors = await Promise.all(
      result.vendors.map(async (vendor) => {
        // Get product count for this vendor
        const productCount = await Product.countDocuments({
          vendorId: vendor._id,
          isActive: true,
        });

        // Get average rating from vendor's products
        const products = await Product.find({
          vendorId: vendor._id,
          isActive: true,
        })
          .select('rating reviewCount')
          .lean();

        let averageRating = 0;
        let totalReviews = 0;

        if (products.length > 0) {
          totalReviews = products.reduce((sum, p) => sum + (p.reviewCount || 0), 0);

          const productsWithRating = products.filter(p => p.rating > 0);
          if (productsWithRating.length > 0) {
            const sumRating = productsWithRating.reduce((sum, p) => sum + (p.rating || 0), 0);
            averageRating = sumRating / productsWithRating.length;
          }
        }

        // Transform vendor data for public consumption
        return {
          id: vendor._id.toString(),
          _id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
          storeName: vendor.storeName,
          storeLogo: vendor.storeLogo,
          storeDescription: vendor.storeDescription,
          address: vendor.address,
          status: vendor.status,
          isVerified: vendor.isEmailVerified || vendor.status === 'approved',
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: totalReviews,
          totalProducts: productCount,
          joinDate: vendor.createdAt,
          createdAt: vendor.createdAt,
          updatedAt: vendor.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: {
        vendors: enrichedVendors,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public vendor by ID
 * GET /api/vendors/:id
 */
export const getPublicVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await getVendorById(id);

    // Allow both 'approved' and 'active' vendors to be viewed
    if (!vendor || (vendor.status !== 'approved' && vendor.status !== 'active')) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    // Get product count
    const productCount = await Product.countDocuments({
      vendorId: vendor._id,
      isActive: true,
    });

    // Get average rating from vendor's products
    const products = await Product.find({
      vendorId: vendor._id,
      isActive: true,
    })
      .select('rating reviewCount')
      .lean();

    let averageRating = 0;
    let totalReviews = 0;

    if (products.length > 0) {
      // Calculate total reviews from all products
      totalReviews = products.reduce((sum, p) => sum + (p.reviewCount || 0), 0);

      const productsWithRating = products.filter(p => p.rating > 0);
      if (productsWithRating.length > 0) {
        const sumRating = productsWithRating.reduce((sum, p) => sum + (p.rating || 0), 0);
        averageRating = sumRating / productsWithRating.length;
      }
    }

    // Check if vendor has any reels/videos
    const hasReels = await Product.exists({
      vendorId: vendor._id,
      isActive: true,
      videos: { $exists: true, $not: { $size: 0 } },
    });

    // Transform vendor data for public consumption
    const publicVendor = {
      id: vendor._id.toString(),
      _id: vendor._id,
      hasReels: !!hasReels,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      storeName: vendor.storeName,
      storeLogo: vendor.storeLogo,
      storeDescription: vendor.storeDescription,
      address: vendor.address,
      status: vendor.status,
      isVerified: vendor.isEmailVerified || vendor.status === 'approved',
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: totalReviews,
      totalProducts: productCount,
      joinDate: vendor.createdAt,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Vendor retrieved successfully',
      data: { vendor: publicVendor },
    });
  } catch (error) {
    next(error);
  }
};

