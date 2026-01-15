import Vendor from '../models/Vendor.model.js';

/**
 * Get all vendors with optional filters
 * @param {Object} filters - { status, search, page, limit }
 * @returns {Promise<Object>} { vendors, total, page, totalPages }
 */
export const getAllVendors = async (filters = {}) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build match stage
    const match = {};
    if (status && status !== 'all') {
      match.status = status;
    }

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Aggregation pipeline
    const pipeline = [
      { $match: match },
      // Look up orders to calculate performance
      {
        $lookup: {
          from: 'orders',
          let: { vendorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$$vendorId', '$vendorBreakdown.vendorId'] },
                    { $ne: ['$status', 'cancelled'] }
                  ]
                }
              }
            },
            {
              $project: {
                vendorBreakdown: {
                  $filter: {
                    input: '$vendorBreakdown',
                    as: 'vb',
                    cond: { $eq: ['$$vendorId', '$$vb.vendorId'] }
                  }
                }
              }
            }
          ],
          as: 'vendorOrders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$vendorOrders' },
          totalRevenue: {
            $reduce: {
              input: '$vendorOrders',
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  { $ifNull: [{ $arrayElemAt: ['$$this.vendorBreakdown.subtotal', 0] }, 0] }
                ]
              }
            }
          }
        }
      },
      { $project: { vendorOrders: 0 } },
      { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limitNum }]
        }
      }
    ];

    const result = await Vendor.aggregate(pipeline);

    const vendors = result[0].data;
    const total = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return {
      vendors,
      total,
      page: parseInt(page),
      limit: limitNum,
      totalPages,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get vendor by ID
 * @param {String} vendorId - Vendor ID
 * @returns {Promise<Object>} Vendor object
 */
export const getVendorById = async (vendorId) => {
  try {
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    return vendor;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error('Invalid vendor ID');
    }
    throw error;
  }
};

/**
 * Update vendor status
 * @param {String} vendorId - Vendor ID
 * @param {String} status - New status (pending, approved, rejected)
 * @param {String} reason - Optional reason for status change
 * @returns {Promise<Object>} Updated vendor
 */
export const updateVendorStatus = async (vendorId, status, reason = null) => {
  try {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be one of: pending, approved, rejected');
    }

    const updateData = { status };
    if (reason) {
      updateData.suspensionReason = reason;
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error('Invalid vendor ID');
    }
    throw error;
  }
};

/**
 * Update vendor commission rate
 * @param {String} vendorId - Vendor ID
 * @param {Number} commissionRate - Commission rate (0-1)
 * @returns {Promise<Object>} Updated vendor
 */
export const updateCommissionRate = async (vendorId, commissionRate) => {
  try {
    if (commissionRate < 0 || commissionRate > 1) {
      throw new Error('Commission rate must be between 0 and 1');
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { commissionRate },
      { new: true, runValidators: true }
    ).lean();

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error('Invalid vendor ID');
    }
    throw error;
  }
};

/**
 * Get pending vendors
 * @param {Object} filters - { search, page, limit }
 * @returns {Promise<Object>} { vendors, total, page, totalPages }
 */
export const getPendingVendors = async (filters = {}) => {
  try {
    return getAllVendors({ ...filters, status: 'pending' });
  } catch (error) {
    throw error;
  }
};

/**
 * Get approved vendors
 * @param {Object} filters - { search, page, limit }
 * @returns {Promise<Object>} { vendors, total, page, totalPages }
 */
export const getApprovedVendors = async (filters = {}) => {
  try {
    return getAllVendors({ ...filters, status: 'approved' });
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle vendor active status
 * @param {String} vendorId - Vendor ID
 * @param {Boolean} isActive - New active status
 * @returns {Promise<Object>} Updated vendor
 */
export const toggleVendorActiveStatus = async (vendorId, isActive) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isActive },
      { new: true, runValidators: true }
    ).lean();

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error('Invalid vendor ID');
    }
    throw error;
  }
};

