import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientTypeModel",
    },
    recipientType: {
      type: String,
      required: true,
      enum: ["user", "vendor", "admin", "delivery_partner"],
    },
    recipientTypeModel: {
      type: String,
      required: true,
      enum: ["User", "Vendor", "Admin", "DeliveryPartner"],
    },
    type: {
      type: String,
      required: true,
      enum: [
        "order_placed",
        "order_confirmed",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "payment_success",
        "payment_failed",
        "new_order",
        "order_status_change",
        "return_request",
        "review",
        "system",
        "offer",
        "promotion",
        "custom",
        "chat_message",
        "ticket_created",
        "ticket_replied",
        "ticket_status_changed",
        "test",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Firebase Cloud Messaging (FCM) fields
    sentViaPush: {
      type: Boolean,
      default: false,
    },
    pushSentAt: {
      type: Date,
    },
    pushDelivered: {
      type: Boolean,
      default: false,
    },
    pushError: {
      type: String,
    },
    fcmMessageId: {
      type: String, // FCM message ID for tracking
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
notificationSchema.index({
  recipientId: 1,
  recipientType: 1,
  isRead: 1,
  createdAt: -1,
});
notificationSchema.index({ recipientId: 1, recipientType: 1, createdAt: -1 });
notificationSchema.index({ orderId: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
