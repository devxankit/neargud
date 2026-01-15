import {
    getAllAttributes,
    getAttributeById,
    createAttribute,
    updateAttribute,
    deleteAttribute,
} from '../../services/attribute.service.js';
import logger from '../../utils/logger.js';

/**
 * Get all global attributes
 * GET /api/admin/attributes
 */
export const getAll = async (req, res, next) => {
    try {
        // Admin fetches global attributes (no vendorId)
        // Optionally we could allow filtering by vendorId if admins want to see vendor attributes
        const { vendorId } = req.query;
        const attributes = await getAllAttributes(vendorId || null);
        res.status(200).json({
            success: true,
            message: 'Attributes retrieved successfully',
            data: { attributes },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get attribute by ID
 * GET /api/admin/attributes/:id
 */
export const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Admins can potentially view any attribute, so we might pass null for vendorId
        // or specific logic. For now, try fetching it. Service handles "not found".
        const attribute = await getAttributeById(id, null);
        res.status(200).json({
            success: true,
            message: 'Attribute retrieved successfully',
            data: { attribute },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new global attribute
 * POST /api/admin/attributes
 */
export const create = async (req, res, next) => {
    try {
        // Admin creates GLOBAL attribute, so vendorId is null
        const attribute = await createAttribute(req.body, null);

        logger.info(`Admin ${req.user.id} created global attribute ${attribute._id}`);

        res.status(201).json({
            success: true,
            message: 'Attribute created successfully',
            data: { attribute },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update global attribute
 * PUT /api/admin/attributes/:id
 */
export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Admin updates GLOBAL attribute
        const attribute = await updateAttribute(id, req.body, null);

        logger.info(`Admin ${req.user.id} updated global attribute ${id}`);

        res.status(200).json({
            success: true,
            message: 'Attribute updated successfully',
            data: { attribute },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete global attribute
 * DELETE /api/admin/attributes/:id
 */
export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Admin deletes GLOBAL attribute
        await deleteAttribute(id, null);

        logger.info(`Admin ${req.user.id} deleted global attribute ${id}`);

        res.status(200).json({
            success: true,
            message: 'Attribute deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
