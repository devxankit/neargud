import AttributeValue from '../models/AttributeValue.model.js';
import Attribute from '../models/Attribute.model.js';
import mongoose from 'mongoose';

/**
 * Get all attribute values with optional filters
 * @param {Object} filters - Filter options (attributeId, search, vendorId)
 * @returns {Promise<Array>} Array of attribute values
 */
export const getAllAttributeValues = async (filters = {}) => {
  try {
    const { attributeId, search, vendorId } = filters;
    const query = {};

    if (vendorId) {
      query.vendorId = vendorId;
    } else {
      // Assume global if no vendorId? Or check filters?
      // Admin viewing: might want global values
      query.isGlobal = true;
    }

    if (attributeId && attributeId !== 'all') {
      query.attributeId = attributeId;
    }

    if (search) {
      query.value = { $regex: search, $options: 'i' };
    }

    const values = await AttributeValue.find(query)
      .populate('attributeId', 'name type')
      .sort({ displayOrder: 1, createdAt: 1 });

    return values;
  } catch (error) {
    throw error;
  }
};

/**
 * Get attribute value by ID
 * @param {String} id - Attribute value ID
 * @param {String} vendorId - Vendor ID
 * @returns {Promise<Object>} Attribute value object
 */
export const getAttributeValueById = async (id, vendorId) => {
  try {
    const query = { _id: id };
    if (vendorId) query.vendorId = vendorId;

    const value = await AttributeValue.findOne(query).populate('attributeId', 'name type');
    if (!value) {
      const err = new Error('Attribute value not found');
      err.status = 404;
      throw err;
    }
    return value;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new attribute value
 * @param {Object} data - Attribute value data
 * @param {String} vendorId - Vendor ID
 * @returns {Promise<Object>} Created attribute value
 */
export const createAttributeValue = async (data, vendorId) => {
  try {
    const { attributeId, value, displayOrder = 1, status = 'active' } = data;

    // Validate attributeId
    if (!attributeId || typeof attributeId !== 'string' || attributeId.trim() === '') {
      const err = new Error('Valid attribute ID is required');
      err.status = 400;
      throw err;
    }

    // Validate value
    if (!value || typeof value !== 'string' || value.trim() === '') {
      const err = new Error('Valid value is required');
      err.status = 400;
      throw err;
    }

    const isGlobal = !vendorId;
    let vendorObjectId = null;

    if (!isGlobal) {
      if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        const err = new Error('Invalid vendor ID format');
        err.status = 400;
        throw err;
      }
      // Handle mixed ID types as before
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        vendorObjectId = new mongoose.Types.ObjectId(vendorId);
      } else {
        // Fallback for weird edge cases or error
        vendorObjectId = vendorId;
      }
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(attributeId)) {
      const err = new Error('Invalid attribute ID format');
      err.status = 400;
      throw err;
    }

    const attributeObjectId = new mongoose.Types.ObjectId(attributeId);

    // Verify attribute exists
    // If Global Value, Attribute MUST be Global (or maybe allowed on Vendor attr? Assuming Global Value -> Global Attr)
    // Actually, values define the options. Global Attributes have Global Values.
    const attributeQuery = { _id: attributeObjectId };
    if (isGlobal) {
      attributeQuery.isGlobal = true;
    } else {
      // Vendor can add values to their own attributes
      // OR Vendor can add custom values to Global attributes? 
      // For simplicity: Vendor Values -> Vendor Attribute. Global Values -> Global Attribute.
      // If complex mixing is allowed, logic changes. Assuming scoping matches.
      attributeQuery.vendorId = vendorObjectId;
    }

    // Simple verification for ownership
    const attribute = await Attribute.findOne(attributeQuery);

    if (!attribute && !isGlobal) {
      // Fallback checks from original code were extensive. 
      // Logic: if not found, maybe it's global and we are adding value to it?
      // Let's stick to rigid ownership for now to avoid mess. 
      // If creating a VENDOR value, attribute should be VENDOR owned (or we need policy).
      // Original code was rigorous about ownership.
      const err = new Error('Attribute not found or access denied');
      err.status = 404;
      throw err;
    }
    if (!attribute && isGlobal) {
      const err = new Error('Global Attribute not found');
      err.status = 404;
      throw err;
    }

    // Check duplicate value
    const duplicateQuery = {
      attributeId,
      value: { $regex: new RegExp(`^${value.trim()}$`, 'i') },
    };
    if (isGlobal) {
      duplicateQuery.isGlobal = true;
    } else {
      duplicateQuery.vendorId = vendorObjectId;
    }

    const existingValue = await AttributeValue.findOne(duplicateQuery);
    if (existingValue) {
      const err = new Error('This value already exists for this attribute');
      err.status = 409;
      throw err;
    }

    const attributeValue = await AttributeValue.create({
      attributeId,
      vendorId: vendorObjectId,
      isGlobal,
      value: value.trim(),
      displayOrder: parseInt(displayOrder) || 1,
      status,
    });

    return await AttributeValue.findById(attributeValue._id).populate('attributeId', 'name type');
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('This value already exists for this attribute');
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

/**
 * Update attribute value
 * @param {String} id - Attribute value ID
 * @param {Object} data - Update data
 * @param {String} vendorId - Vendor ID
 * @returns {Promise<Object>} Updated attribute value
 */
export const updateAttributeValue = async (id, data, vendorId) => {
  try {
    const attributeValue = await AttributeValue.findOne({ _id: id, vendorId });
    if (!attributeValue) {
      const err = new Error('Attribute value not found');
      err.status = 404;
      throw err;
    }

    // If value is being updated, check for duplicates for THIS vendor
    if (data.value && data.value.trim().toLowerCase() !== attributeValue.value.toLowerCase()) {
      const existingValue = await AttributeValue.findOne({
        attributeId: data.attributeId || attributeValue.attributeId,
        vendorId,
        value: { $regex: new RegExp(`^${data.value.trim()}$`, 'i') },
        _id: { $ne: id },
      });
      if (existingValue) {
        const err = new Error('This value already exists for this attribute');
        err.status = 409;
        throw err;
      }
      attributeValue.value = data.value.trim();
    }

    if (data.attributeId !== undefined) {
      // Verify new attribute exists and belongs to this vendor
      const attribute = await Attribute.findOne({ _id: data.attributeId, vendorId });
      if (!attribute) {
        const err = new Error('Attribute not found or does not belong to you');
        err.status = 404;
        throw err;
      }
      attributeValue.attributeId = data.attributeId;
    }

    if (data.displayOrder !== undefined) {
      attributeValue.displayOrder = parseInt(data.displayOrder) || 1;
    }
    if (data.status !== undefined) {
      attributeValue.status = data.status;
    }

    await attributeValue.save();
    return await AttributeValue.findById(attributeValue._id).populate('attributeId', 'name type');
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('This value already exists for this attribute');
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

/**
 * Delete attribute value
 * @param {String} id - Attribute value ID
 * @param {String} vendorId - Vendor ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteAttributeValue = async (id, vendorId) => {
  try {
    const attributeValue = await AttributeValue.findOneAndDelete({ _id: id, vendorId });
    if (!attributeValue) {
      const err = new Error('Attribute value not found');
      err.status = 404;
      throw err;
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

