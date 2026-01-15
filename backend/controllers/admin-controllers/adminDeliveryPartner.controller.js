import DeliveryPartner from '../../models/DeliveryPartner.model.js';

/**
 * Get all delivery partners
 * GET /api/admin/delivery-partners
 */
export const getAllPartners = async (req, res, next) => {
    try {
        const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: partners
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update partner status (Approve/Suspend)
 * PATCH /api/admin/delivery-partners/:id/status
 */
export const updatePartnerStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!partner) {
            const error = new Error('Partner not found');
            error.status = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: `Partner status updated to ${status}`,
            data: partner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new delivery partner
 * POST /api/admin/delivery-partners
 */
export const createPartner = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, password, vehicleType, vehicleNumber, address, city, state, zipcode, status } = req.body;

        // Check if partner already exists
        const existingPartner = await DeliveryPartner.findOne({ $or: [{ email }, { phone }] });
        if (existingPartner) {
            const error = new Error('Partner with this email or phone already exists');
            error.status = 400;
            throw error;
        }

        const partner = new DeliveryPartner({
            firstName,
            lastName,
            email,
            phone,
            password,
            vehicleType,
            vehicleNumber,
            address,
            city,
            state,
            zipcode,
            status: status || 'available',
            isEmailVerified: true, // Admin created partners are pre-verified
            isAccountVerified: true
        });

        await partner.save();

        res.status(201).json({
            success: true,
            message: 'Delivery partner created successfully',
            data: partner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update delivery partner details
 * PUT /api/admin/delivery-partners/:id
 */
export const updatePartner = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, vehicleType, vehicleNumber, address, city, state, zipcode, status } = req.body;

        // If email or phone is changed, check for duplicates
        if (email || phone) {
            const query = { _id: { $ne: req.params.id } };
            const orConditions = [];
            if (email) orConditions.push({ email });
            if (phone) orConditions.push({ phone });

            if (orConditions.length > 0) {
                query.$or = orConditions;
                const existingPartner = await DeliveryPartner.findOne(query);
                if (existingPartner) {
                    const error = new Error('Partner with this email or phone already exists');
                    error.status = 400;
                    throw error;
                }
            }
        }

        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.params.id,
            {
                firstName,
                lastName,
                email,
                phone,
                vehicleType,
                vehicleNumber,
                address,
                city,
                state,
                zipcode,
                status
            },
            { new: true, runValidators: true }
        );

        if (!partner) {
            const error = new Error('Partner not found');
            error.status = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Partner details updated successfully',
            data: partner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete partner
 * DELETE /api/admin/delivery-partners/:id
 */
export const deletePartner = async (req, res, next) => {
    try {
        const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
        if (!partner) {
            const error = new Error('Partner not found');
            error.status = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Partner deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
