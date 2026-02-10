import DeliveryPartner from '../models/DeliveryPartner.model.js';
import TemporaryRegistration from '../models/TemporaryRegistration.model.js';
import { generateToken } from '../utils/jwt.util.js';
import { generateOTP, verifyOTP, resendOTP, checkOTP } from './otp.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';
import { isValidEmail, validatePassword } from '../utils/validators.util.js';
import bcrypt from 'bcryptjs';

// Removed local generateToken function to use shared utility

/**
 * Register a new delivery partner (Temporary)
 */
export const registerDeliveryPartner = async (partnerData) => {
    const { email, phone, password } = partnerData;

    // Check if partner already exists in main collection
    const existingPartner = await DeliveryPartner.findOne({
        $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingPartner) {
        const error = new Error('Delivery partner with this email or phone already exists');
        error.status = 400;
        throw error;
    }

    // Hash password for temporary storage
    const hashedPassword = await bcrypt.hash(password, 12);

    // Store temporarily
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await TemporaryRegistration.findOneAndDelete({ email: email.toLowerCase(), registrationType: 'delivery_partner' });

    await TemporaryRegistration.create({
        email: email.toLowerCase(),
        registrationType: 'delivery_partner',
        registrationData: {
            ...partnerData,
            email: email.toLowerCase(),
            password: password // Model will hash this on create
        },
        expiresAt
    });

    // Generate and send OTP
    const otp = await generateOTP(email, 'email_verification');
    await sendVerificationEmail(email, otp);

    return { message: 'OTP sent to your email' };
};

/**
 * Verify Delivery Partner Email
 */
export const verifyDeliveryEmail = async (email, otp) => {
    await verifyOTP(email, otp, 'email_verification');

    const tempReg = await TemporaryRegistration.findOne({
        email: email.toLowerCase(),
        registrationType: 'delivery_partner',
        expiresAt: { $gt: new Date() }
    });

    if (!tempReg) {
        throw new Error('Registration expired. Please register again.');
    }

    const partner = await DeliveryPartner.create({
        ...tempReg.registrationData,
        isEmailVerified: true,
        status: 'pending' // Admin must approve
    });

    await TemporaryRegistration.deleteOne({ _id: tempReg._id });

    const token = generateToken({ deliveryPartnerId: partner._id, role: 'delivery_partner' });

    // Remove password from output
    const partnerObj = partner.toObject();
    delete partnerObj.password;

    return { partner: partnerObj, token };
};

/**
 * Resend Verification OTP
 */
export const resendDeliveryOTP = async (email) => {
    const tempReg = await TemporaryRegistration.findOne({
        email: email.toLowerCase(),
        registrationType: 'delivery_partner',
        expiresAt: { $gt: new Date() }
    });

    if (!tempReg) {
        throw new Error('Registration session not found or expired');
    }

    const otp = await resendOTP(email, 'email_verification');
    await sendVerificationEmail(email, otp);

    return { message: 'OTP resent successfully' };
};

/**
 * Login delivery partner
 */
export const loginDeliveryPartner = async (identifier, password) => {
    // Find partner by email or phone
    const partner = await DeliveryPartner.findOne({
        $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select('+password');

    if (!partner || !(await partner.comparePassword(password, partner.password))) {
        const error = new Error('Invalid email/phone or password');
        error.status = 401;
        throw error;
    }

    if (!partner.isEmailVerified) {
        const error = new Error('Please verify your email first');
        error.status = 403;
        error.isUnverified = true;
        throw error;
    }

    if (partner.status === 'pending') {
        const error = new Error('Your account is pending admin approval');
        error.status = 403;
        throw error;
    }

    if (partner.status === 'suspended') {
        const error = new Error('Your account has been suspended');
        error.status = 403;
        throw error;
    }

    if (!partner.isActive) {
        const error = new Error('This account has been deactivated');
        error.status = 403;
        throw error;
    }

    const token = generateToken({ deliveryPartnerId: partner._id, role: 'delivery_partner' });

    // Remove password from output
    const partnerObj = partner.toObject();
    delete partnerObj.password;

    return { partner: partnerObj, token };
};

/**
 * Get delivery partner profile
 */
export const getPartnerProfile = async (id) => {
    const partner = await DeliveryPartner.findById(id);
    if (!partner) {
        const error = new Error('Delivery partner not found');
        error.status = 404;
        throw error;
    }
    return partner;
};

/**
 * Forgot Password (Send OTP)
 */
export const forgotPassword = async (email) => {
    if (!email || !isValidEmail(email)) {
        throw new Error('Valid email is required');
    }

    const partner = await DeliveryPartner.findOne({ email: email.toLowerCase() });
    if (!partner) {
        // For security, don't reveal if user doesn't exist? 
        // Typically we do for now to define flow.
        const error = new Error('No account found with this email');
        error.status = 404;
        throw error;
    }

    const otp = await generateOTP(email, 'password_reset');
    await sendPasswordResetEmail(email, otp);

    return { message: 'Password reset OTP has been sent to your email' };
};

/**
 * Verify Password Reset OTP (Non-consuming)
 */
export const verifyPasswordResetOTP = async (email, otp) => {
    if (!email || !otp) {
        throw new Error('Email and OTP are required');
    }

    // Check if exists using checkOTP
    await checkOTP(email, otp, 'password_reset');

    return true;
};

/**
 * Reset Password
 */
export const resetPassword = async (email, otp, newPassword) => {
    if (!email || !otp || !newPassword) {
        throw new Error('Email, OTP and new password are required');
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
        throw new Error(validation.message);
    }

    // Verify and consume OTP
    await verifyOTP(email, otp, 'password_reset');

    const partner = await DeliveryPartner.findOne({ email: email.toLowerCase() });
    if (!partner) {
        throw new Error('Delivery partner not found');
    }

    partner.password = newPassword; // Pre-save hook will hash this
    await partner.save();

    return { message: 'Password reset successfully' };
};

/**
 * Update delivery partner profile
 */
export const updatePartnerProfile = async (id, updateData) => {
    const allowedFields = ['firstName', 'lastName', 'phone', 'vehicleType', 'vehicleNumber', 'address', 'city', 'state', 'zipcode'];
    const filteredUpdate = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
        }, {});

    const partner = await DeliveryPartner.findByIdAndUpdate(
        id,
        { $set: filteredUpdate },
        { new: true, runValidators: true }
    );

    if (!partner) {
        const error = new Error('Delivery partner not found');
        error.status = 404;
        throw error;
    }

    return partner;
};
