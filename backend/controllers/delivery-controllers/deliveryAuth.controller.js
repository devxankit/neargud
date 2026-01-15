import * as deliveryAuthService from '../../services/deliveryAuth.service.js';

/**
 * Register Delivery Partner
 * POST /api/auth/delivery/register
 */
export const register = async (req, res, next) => {
    try {
        const result = await deliveryAuthService.registerDeliveryPartner(req.body);

        res.status(201).json({
            success: true,
            message: result.message,
            email: req.body.email
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify Email
 * POST /api/auth/delivery/verify-email
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const { partner, token } = await deliveryAuthService.verifyDeliveryEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                deliveryBoy: partner,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend OTP
 * POST /api/auth/delivery/resend-otp
 */
export const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await deliveryAuthService.resendDeliveryOTP(email);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login Delivery Partner
 * POST /api/auth/delivery/login
 */
export const login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            const error = new Error('Please provide email/phone and password');
            error.status = 400;
            throw error;
        }

        const { partner, token } = await deliveryAuthService.loginDeliveryPartner(identifier, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                deliveryBoy: partner,
                token,
            },
        });
    } catch (error) {
        // Carry over custom flags like isUnverified
        if (error.isUnverified) {
            return res.status(error.status || 403).json({
                success: false,
                message: error.message,
                isUnverified: true
            });
        }
        next(error);
    }
};

/**
 * Get Current Delivery Partner Profile
 * GET /api/auth/delivery/me
 */
export const getMe = async (req, res, next) => {
    try {
        const partner = await deliveryAuthService.getPartnerProfile(req.user.deliveryPartnerId);

        res.status(200).json({
            success: true,
            data: partner,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Forgot Password
 * POST /api/auth/delivery/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await deliveryAuthService.forgotPassword(email);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify Reset OTP
 * POST /api/auth/delivery/verify-reset-otp
 */
export const verifyResetOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        await deliveryAuthService.verifyPasswordResetOTP(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset Password
 * POST /api/auth/delivery/reset-password
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await deliveryAuthService.resetPassword(email, otp, newPassword);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};
