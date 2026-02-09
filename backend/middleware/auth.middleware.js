import { verifyToken } from "../utils/jwt.util.js";
import User from "../models/User.model.js";
import Vendor from "../models/Vendor.model.js";
import Admin from "../models/Admin.model.js";
import DeliveryPartner from "../models/DeliveryPartner.model.js";

/**
 * Optional authentication middleware - verifies JWT token if present but doesn't fail if expired
 * Useful for logout endpoints where we want to allow logout even with expired tokens
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try to verify token, but don't fail if expired
    try {
      const decoded = verifyToken(token);
      req.user = decoded;

      // Optionally fetch user document if token is valid
      if (decoded.role === "user" && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.userDoc = user;
        }
      } else if (decoded.role === "vendor" && decoded.vendorId) {
        const vendor = await Vendor.findById(decoded.vendorId);
        if (vendor && vendor.isActive) {
          req.userDoc = vendor;
        }
      } else if (decoded.role === "admin" && decoded.adminId) {
        const admin = await Admin.findById(decoded.adminId);
        if (admin && admin.isActive) {
          req.userDoc = admin;
        }
      }
    } catch (error) {
      // Token is invalid or expired, but we continue anyway for logout
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token || token === "null" || token === "undefined") {
      req.user = null;
      return next();
    }

    try {
      const decoded = verifyToken(token);
      let user = null;

      // Try to find user in different models based on role or just by ID
      if (decoded.role === "admin") {
        user = await Admin.findById(decoded.id || decoded.adminId).select(
          "-password",
        );
      } else if (decoded.role === "vendor") {
        user = await Vendor.findById(decoded.id || decoded.vendorId).select(
          "-password",
        );
      } else if (decoded.role === "delivery_partner") {
        user = await DeliveryPartner.findById(
          decoded.id || decoded.deliveryPartnerId,
        ).select("-password");
      } else {
        user = await User.findById(decoded.id || decoded.userId).select(
          "-password",
        );
      }

      if (!user || user.isActive === false) {
        req.user = null;
        return next();
      }

      req.user = { ...decoded, ...user.toObject() };
      next();
    } catch (error) {
      // If token is invalid, treat as guest instead of throwing error
      req.user = null;
      next();
    }
  } catch (error) {
    next(error);
  }
};

// Aliases for compatibility
export const protect = (req, res, next) => authenticate(req, res, next);
export const protectVendor = (req, res, next) => authenticate(req, res, next);
export const protectAdmin = (req, res, next) => authenticate(req, res, next);

/**
 * Middleware to require authentication - fails if user is not logged in
 * Use this for purchase-related and profile routes
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login to continue.",
    });
  }
  next();
};
