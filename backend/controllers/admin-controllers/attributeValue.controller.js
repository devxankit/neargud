import {
    getAllAttributeValues,
    getAttributeValueById,
    createAttributeValue,
    updateAttributeValue,
    deleteAttributeValue,
} from '../../services/attributeValue.service.js';
import logger from '../../utils/logger.js';

/**
 * Get all attribute values (global)
 * GET /api/admin/attribute-values
 */
export const getAll = async (req, res, next) => {
    try {
        const { vendorId, attributeId, search } = req.query;
        // Admin likely wants global defaults, but filter allows checking vendor stuff too if service permits
        const filters = {
            vendorId: vendorId || null,
            attributeId,
            search
        };

        const attributeValues = await getAllAttributeValues(filters);
        res.status(200).json({
            success: true,
            message: 'Attribute values retrieved successfully',
            data: { attributeValues },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get attribute value by ID
 * GET /api/admin/attribute-values/:id
 */
export const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attributeValue = await getAttributeValueById(id, null);
        res.status(200).json({
            success: true,
            message: 'Attribute value retrieved successfully',
            data: { attributeValue },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new global attribute value
 * POST /api/admin/attribute-values
 */
export const create = async (req, res, next) => {
    try {
        const attributeValue = await createAttributeValue(req.body, null);

        logger.info(`Admin ${req.user.id} created global attribute value ${attributeValue._id}`);

        res.status(201).json({
            success: true,
            message: 'Attribute value created successfully',
            data: { attributeValue },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update global attribute value
 * PUT /api/admin/attribute-values/:id
 */
export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attributeValue = await updateAttributeValue(id, req.body, null);

        logger.info(`Admin ${req.user.id} updated global attribute value ${id}`);

        res.status(200).json({
            success: true,
            message: 'Attribute value updated successfully',
            data: { attributeValue },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete global attribute value
 * DELETE /api/admin/attribute-values/:id
 */
export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteAttributeValue(id, null);

        logger.info(`Admin ${req.user.id} deleted global attribute value ${id}`);

        res.status(200).json({
            success: true,
            message: 'Attribute value deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
