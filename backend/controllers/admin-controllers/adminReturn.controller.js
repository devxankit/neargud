import returnService from '../../services/return.service.js';
import ReturnPolicyConfig from '../../models/ReturnPolicyConfig.model.js';

export const getAllReturns = async (req, res) => {
    try {
        const { status } = req.query;
        console.log('Admin API: getAllReturns status:', status);
        const returns = await returnService.getAdminReturns({ status });
        console.log('Admin API: getAllReturns found:', returns.length);

        res.status(200).json({
            success: true,
            data: returns,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getReturnDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const returnRequest = await returnService.getReturnById(id);

        if (!returnRequest) {
            return res.status(404).json({ success: false, message: 'Return request not found' });
        }

        res.status(200).json({
            success: true,
            data: returnRequest,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateAdminReturnStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note, rejectionReason } = req.body;
        const adminId = req.user?.adminId || req.user?.id || req.userDoc?._id;

        if (!adminId) {
            return res.status(401).json({ success: false, message: 'Admin ID not found' });
        }

        if (!['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status for return request' });
        }

        const updatedReturn = await returnService.updateStatus(id, status, adminId, 'Admin', note, rejectionReason);

        res.status(200).json({
            success: true,
            message: `Return request status updated to ${status}`,
            data: updatedReturn,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const processRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.adminId || req.user?.id || req.userDoc?._id;

        if (!adminId) {
            return res.status(401).json({ success: false, message: 'Admin ID not found' });
        }

        const result = await returnService.processRefund(id, adminId, 'Admin');

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getReturnPolicy = async (req, res) => {
    try {
        const policy = await returnService.getPolicyConfig();
        res.status(200).json({
            success: true,
            data: policy,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateReturnPolicy = async (req, res) => {
    try {
        const updates = req.body;
        const adminId = req.user?.adminId || req.user?.id || req.userDoc?._id;

        if (!adminId) {
            return res.status(401).json({ success: false, message: 'Admin ID not found' });
        }

        let config = await ReturnPolicyConfig.findOne();
        if (!config) {
            config = new ReturnPolicyConfig();
        }

        Object.assign(config, updates);
        config.updatedBy = adminId;

        await config.save();

        res.status(200).json({
            success: true,
            message: 'Return policy updated',
            data: config,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const forceDeleteReturn = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await returnService.deleteByOrderId(orderId);
        res.status(200).json({
            success: true,
            message: `Force deleted returns for order ${orderId}`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
