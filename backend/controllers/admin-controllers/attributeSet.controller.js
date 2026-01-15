import {
    getAllAttributeSets,
    getAttributeSetById,
    createAttributeSet,
    updateAttributeSet,
    deleteAttributeSet,
} from '../../services/attributeSet.service.js';
import logger from '../../utils/logger.js';

/**
 * Get all global attribute sets
 * GET /api/admin/attribute-sets
 */
export const getAll = async (req, res, next) => {
    try {
        const { vendorId } = req.query;
        const attributeSets = await getAllAttributeSets(vendorId || null);
        res.status(200).json({
            success: true,
            message: 'Attribute sets retrieved successfully',
            data: { attributeSets },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get attribute set by ID
 * GET /api/admin/attribute-sets/:id
 */
export const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attributeSet = await getAttributeSetById(id, null);
        res.status(200).json({
            success: true,
            message: 'Attribute set retrieved successfully',
            data: { attributeSet },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new global attribute set
 * POST /api/admin/attribute-sets
 */
export const create = async (req, res, next) => {
    try {
        const attributeSet = await createAttributeSet(req.body, null);

        logger.info(`Admin ${req.user.id} created global attribute set ${attributeSet._id}`);

        res.status(201).json({
            success: true,
            message: 'Attribute set created successfully',
            data: { attributeSet },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update global attribute set
 * PUT /api/admin/attribute-sets/:id
 */
export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attributeSet = await updateAttributeSet(id, req.body, null);

        logger.info(`Admin ${req.user.id} updated global attribute set ${id}`);

        res.status(200).json({
            success: true,
            message: 'Attribute set updated successfully',
            data: { attributeSet },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete global attribute set
 * DELETE /api/admin/attribute-sets/:id
 */
export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteAttributeSet(id, null);

        logger.info(`Admin ${req.user.id} deleted global attribute set ${id}`);

        res.status(200).json({
            success: true,
            message: 'Attribute set deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
