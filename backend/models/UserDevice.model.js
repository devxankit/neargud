import mongoose from "mongoose";

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
      index: true,
    },
    userModel: {
      type: String,
      enum: ["User", "Vendor", "Admin"],
      default: "User",
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      deviceId: String,
      deviceType: {
        type: String,
        enum: ["web", "android", "ios"],
        default: "web",
      },
      browser: String,
      os: String,
      userAgent: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
userDeviceSchema.index({ userId: 1, isActive: 1 });

// Update last used timestamp
userDeviceSchema.methods.updateLastUsed = function () {
  this.lastUsed = new Date();
  return this.save();
};

// Deactivate token
userDeviceSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

const UserDevice = mongoose.model("UserDevice", userDeviceSchema);

export default UserDevice;
