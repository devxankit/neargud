import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderRoleModel',
    },
    senderRole: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      required: true,
    },
    senderRoleModel: {
      type: String,
      enum: ['User', 'Vendor', 'Admin'],
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverRoleModel',
    },
    receiverRole: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      required: true,
    },
    receiverRoleModel: {
      type: String,
      enum: ['User', 'Vendor', 'Admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    readStatus: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    deletedFor: [{
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      role: { type: String, enum: ['user', 'vendor', 'admin'], required: true }
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, senderRole: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, receiverRole: 1, readStatus: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

