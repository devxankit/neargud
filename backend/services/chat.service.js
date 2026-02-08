import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import mongoose from 'mongoose';
import notificationService from './notification.service.js';
import { getSocket } from '../config/socket.io.js';

class ChatService {
  /**
   * Create or get conversation between user and vendor
   * @param {String} userId - User ID
   * @param {String} vendorId - Vendor ID
   * @returns {Promise<Object>} Conversation object
   */
  async createOrGetConversation(userId, vendorId) {
    return this.createOrGetConversationGeneric(
      { id: userId, role: 'user', model: 'User' },
      { id: vendorId, role: 'vendor', model: 'Vendor' }
    );
  }

  /**
   * Create or get conversation between admin and vendor
   * @param {String} adminId - Admin ID
   * @param {String} vendorId - Vendor ID
   * @returns {Promise<Object>} Conversation object
   */
  async createOrGetAdminVendorConversation(adminId, vendorId) {
    return this.createOrGetConversationGeneric(
      { id: adminId, role: 'admin', model: 'Admin' },
      { id: vendorId, role: 'vendor', model: 'Vendor' }
    );
  }

  /**
   * Generic create or get conversation
   */
  async createOrGetConversationGeneric(p1, p2) {
    try {
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(p1.id) || !mongoose.Types.ObjectId.isValid(p2.id)) {
        throw new Error('Invalid ID format');
      }

      const id1 = new mongoose.Types.ObjectId(p1.id);
      const id2 = new mongoose.Types.ObjectId(p2.id);

      // Check if conversation exists
      const existingChat = await Chat.findOne({
        participants: {
          $all: [
            { $elemMatch: { userId: id1, role: p1.role } },
            { $elemMatch: { userId: id2, role: p2.role } }
          ]
        }
      })
        .populate('participants.userId', 'name email storeName')
        .populate('lastMessage')
        .lean();

      if (existingChat) {
        return existingChat;
      }

      // Create new conversation
      const newChat = await Chat.create({
        participants: [
          {
            userId: id1,
            role: p1.role,
            roleModel: p1.model,
          },
          {
            userId: id2,
            role: p2.role,
            roleModel: p2.model,
          },
        ],
        unreadCount: new Map([
          [`${p1.role}_${p1.id.toString()}`, 0],
          [`${p2.role}_${p2.id.toString()}`, 0],
        ]),
      });

      return await Chat.findById(newChat._id)
        .populate('participants.userId', 'name email storeName')
        .lean();
    } catch (error) {
      console.error('Error in createOrGetConversationGeneric:', error);
      throw error;
    }
  }

  /**
   * Get user's conversations
   * @param {String} userId - User ID
   * @returns {Promise<Array>} Array of conversations
   */
  async getUserConversations(userId) {
    try {
      console.log('--- ChatService.getUserConversations Debug ---');
      console.log('Original userId:', userId);

      const userObjectId = mongoose.isValidObjectId(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null;

      console.log('Converted userObjectId:', userObjectId);

      const query = {
        participants: {
          $elemMatch: {
            userId: userObjectId ? { $in: [userObjectId, userId.toString()] } : userId.toString(),
            role: 'user'
          }
        }
      };

      console.log('Query:', JSON.stringify(query, null, 2));

      const conversations = await Chat.find(query)
        .populate({
          path: 'participants.userId',
          select: 'name email storeName storeLogo'
        })
        .populate('lastMessage')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .lean();

      console.log(`Found ${conversations.length} raw conversations for user ${userId}`);
      if (conversations.length > 0) {
        console.log('First conversation participants:', JSON.stringify(conversations[0].participants.map(p => ({
          userId: p.userId._id || p.userId,
          role: p.role
        })), null, 2));
      }

      // Transform conversations to include participant info and filter out deleted/empty ones
      const visibleConversations = conversations.filter(conv => {
        // If no last message, check if we want to show empty chats. 
        // Usually, if a user explicitly deleted chat, lastMessage remains but is marked deleted.
        // If it was never started (just created), lastMessage might be null.
        // Let's hide if lastMessage is deleted for user.

        if (conv.lastMessage) {
          const isDeletedForUser = conv.lastMessage.deletedFor?.some(
            d => d.userId.toString() === userId.toString() && d.role === 'user'
          );
          if (isDeletedForUser) return false;
        } else {
          // If no last message, it's an empty chat. 
          // If the user wants to "remove" chats, we should probably hide empty ones too 
          // unless they are currently active (handled by frontend state usually).
          // But for the *list*, hide empty ones.
          return false;
        }
        return true;
      });

      return visibleConversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p.userId && (p.userId._id || p.userId).toString() !== userId.toString()
        );

        // Handle unreadCount
        let unreadCount = 0;
        if (conv.unreadCount) {
          const key = `user_${userId}`;
          // In lean(), Map becomes a POJO, but let's be safe
          if (conv.unreadCount instanceof Map) {
            unreadCount = conv.unreadCount.get(key) || 0;
          } else {
            unreadCount = conv.unreadCount[key] || 0;
          }
        }

        return {
          ...conv,
          otherParticipant: otherParticipant || null,
          unreadCount,
        };
      });
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      throw error;
    }
  }

  /**
   * Get vendor's conversations
   * @param {String} vendorId - Vendor ID
   * @returns {Promise<Array>} Array of conversations
   */
  async getVendorConversations(vendorId) {
    try {
      console.log('--- ChatService.getVendorConversations Debug ---');
      console.log('Original vendorId:', vendorId);

      const vendorObjectId = mongoose.isValidObjectId(vendorId)
        ? new mongoose.Types.ObjectId(vendorId)
        : null;

      console.log('Converted vendorObjectId:', vendorObjectId);

      const query = {
        participants: {
          $elemMatch: {
            userId: vendorObjectId ? { $in: [vendorObjectId, vendorId.toString()] } : vendorId.toString(),
            role: 'vendor'
          }
        }
      };

      console.log('Query:', JSON.stringify(query, null, 2));

      const conversations = await Chat.find(query)
        .populate({
          path: 'participants.userId',
          select: 'name email storeName storeLogo'
        })
        .populate('lastMessage')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .lean();

      console.log(`Found ${conversations.length} raw conversations for vendor ${vendorId}`);
      if (conversations.length > 0) {
        console.log('First conversation participants:', JSON.stringify(conversations[0].participants.map(p => ({
          userId: p.userId._id || p.userId,
          role: p.role
        })), null, 2));
      }

      // Transform conversations to include participant info
      return conversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p.userId && (p.userId._id || p.userId).toString() !== vendorId.toString()
        );

        // Handle unreadCount
        let unreadCount = 0;
        if (conv.unreadCount) {
          const key = `vendor_${vendorId}`;
          if (conv.unreadCount instanceof Map) {
            unreadCount = conv.unreadCount.get(key) || 0;
          } else {
            unreadCount = conv.unreadCount[key] || 0;
          }
        }

        return {
          ...conv,
          otherParticipant: otherParticipant || null,
          unreadCount,
        };
      });
    } catch (error) {
      console.error('Error in getVendorConversations:', error);
      throw error;
    }
  }

  /**
   * Get admin's conversations
   * @param {String} adminId - Admin ID
   * @returns {Promise<Array>} Array of conversations
   */
  async getAdminConversations(adminId) {
    try {
      const adminObjectId = mongoose.isValidObjectId(adminId)
        ? new mongoose.Types.ObjectId(adminId)
        : null;

      const query = {
        participants: {
          $elemMatch: {
            userId: adminObjectId ? { $in: [adminObjectId, adminId.toString()] } : adminId.toString(),
            role: 'admin'
          }
        }
      };

      const conversations = await Chat.find(query)
        .populate({
          path: 'participants.userId',
          select: 'name email storeName storeLogo'
        })
        .populate('lastMessage')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .lean();

      // Transform conversations
      return conversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p.userId && (p.userId._id || p.userId).toString() !== adminId.toString()
        );

        let unreadCount = 0;
        if (conv.unreadCount) {
          const key = `admin_${adminId}`;
          if (conv.unreadCount instanceof Map) {
            unreadCount = conv.unreadCount.get(key) || 0;
          } else {
            unreadCount = conv.unreadCount[key] || 0;
          }
        }

        return {
          ...conv,
          otherParticipant: otherParticipant || null,
          unreadCount,
        };
      });
    } catch (error) {
      console.error('Error in getAdminConversations:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation with pagination
   * @param {String} conversationId - Conversation ID
   * @param {String} userId - User ID (for permission check)
   * @param {String} userRole - User role (user/vendor)
   * @param {Number} page - Page number
   * @param {Number} limit - Messages per page
   * @returns {Promise<Object>} Messages and pagination info
   */
  async getMessages(conversationId, userId, userRole, page = 1, limit = 50) {
    try {
      // Verify user has access to this conversation
      const conversation = await Chat.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const isParticipant = conversation.participants.some(
        (p) => {
          const pUserId = (p.userId?._id || p.userId).toString();
          return pUserId === userId.toString() && p.role === userRole;
        }
      );

      if (!isParticipant) {
        console.error('Access denied to conversation:', conversationId, 'for user:', userId, 'role:', userRole);
        throw new Error('Access denied');
      }

      const skip = (page - 1) * limit;

      const query = {
        conversationId,
        'deletedFor': {
          $not: {
            $elemMatch: {
              userId: userId,
              role: userRole
            }
          }
        }
      };

      const messages = await Message.find(query)
        .populate('senderId', 'name email storeName')
        .populate('receiverId', 'name email storeName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalMessages = await Message.countDocuments(query);

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear chat history for a specific participant
   */
  async clearChat(conversationId, userId, userRole) {
    try {
      const messages = await Message.find({ conversationId });

      // Update all messages in the conversation to be marked as deleted for this user
      await Message.updateMany(
        {
          conversationId,
          'deletedFor': {
            $not: {
              $elemMatch: {
                userId: userId,
                role: userRole
              }
            }
          }
        },
        {
          $push: {
            deletedFor: {
              userId: userId,
              role: userRole
            }
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error in clearChat:', error);
      throw error;
    }
  }

  /**
   * Send a message
   * @param {String} conversationId - Conversation ID
   * @param {String} senderId - Sender ID
   * @param {String} senderRole - Sender role (user/vendor)
   * @param {String} receiverId - Receiver ID
   * @param {String} receiverRole - Receiver role (user/vendor)
   * @param {String} message - Message text
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(
    conversationId,
    senderId,
    senderRole,
    receiverId,
    receiverRole,
    message,
    messageType = 'text',
    productData = null
  ) {
    console.log('ChatService.sendMessage called with:', { conversationId, senderId, senderRole, receiverId, receiverRole, messageType });
    try {
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        console.error('Invalid sender or receiver ID format');
        throw new Error('Invalid sender or receiver ID');
      }

      // Verify conversation exists and user is participant
      const conversation = await Chat.findById(conversationId);
      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        throw new Error('Conversation not found');
      }

      console.log('Conversation found:', conversation._id);

      const isParticipant = conversation.participants.some((p) => {
        const pUserId = (p.userId?._id || p.userId).toString();
        const sId = senderId.toString();
        const match = pUserId === sId && p.role === senderRole;
        console.log(`Checking participant: ${pUserId} (${p.role}) vs ${sId} (${senderRole}) -> Match: ${match}`);
        return match;
      });

      if (!isParticipant) {
        console.error('Access denied. User not participant.', { senderId, senderRole, participants: conversation.participants });
        throw new Error('Access denied');
      }

      // Create message
      const senderRoleModel = senderRole === 'user' ? 'User' : (senderRole === 'admin' ? 'Admin' : 'Vendor');
      const receiverRoleModel = receiverRole === 'user' ? 'User' : (receiverRole === 'admin' ? 'Admin' : 'Vendor');

      console.log('Creating message document with:', {
        messageType,
        hasProductData: !!productData,
        productDataContent: productData
      });
      const newMessage = await Message.create({
        conversationId,
        senderId: new mongoose.Types.ObjectId(senderId),
        senderRole,
        senderRoleModel,
        receiverId: new mongoose.Types.ObjectId(receiverId),
        receiverRole,
        receiverRoleModel,
        message,
        messageType,
        productData: productData ? {
          productId: mongoose.Types.ObjectId.isValid(productData.productId) ? new mongoose.Types.ObjectId(productData.productId) : null,
          name: productData.name,
          price: productData.price,
          image: productData.image
        } : null,
        readStatus: false,
      });
      console.log('Message created successfully:', {
        id: newMessage._id,
        messageType: newMessage.messageType,
        productData: newMessage.productData
      });

      // Update conversation last message and timestamp
      // Ensure unreadCount is initialized and usable as a Map
      if (!conversation.unreadCount) {
        conversation.unreadCount = new Map();
      } else if (!(conversation.unreadCount instanceof Map)) {
        // If unreadCount exists but isn't a Map (e.g. plain object from lean or legacy), convert it
        try {
          const plainObj = conversation.unreadCount.toObject ? conversation.unreadCount.toObject() : conversation.unreadCount;
          conversation.unreadCount = new Map(Object.entries(plainObj));
        } catch (e) {
          console.error('Failed to convert unreadCount to Map:', e);
          conversation.unreadCount = new Map();
        }
      }

      // Use string keys for the Map to avoid object reference issues
      const unreadKey = `${receiverRole}_${receiverId.toString()}`;
      const currentUnread = conversation.unreadCount.get(unreadKey) || 0;
      conversation.unreadCount.set(unreadKey, currentUnread + 1);

      conversation.lastMessage = newMessage._id;
      conversation.lastMessageAt = new Date();

      console.log('Saving conversation updates with unread key:', unreadKey);
      await conversation.save();
      console.log('Conversation saved successfully');

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'name email storeName')
        .populate('receiverId', 'name email storeName')
        .lean();

      // Emit to socket rooms
      const io = getSocket();
      if (io) {
        // 1. Emit to the specific chat room for participants currently in the chat
        const chatRoom = `chat_${conversationId}`;
        console.log(`Emitting to chat room: ${chatRoom}`);
        io.to(chatRoom).emit('receive_message', populatedMessage);

        // 2. Emit to receiver's personal room to update their conversation list/notifications
        const receiverRoom = `${receiverRole}_${receiverId}`;
        console.log(`Emitting to receiver personal room: ${receiverRoom}`);
        io.to(receiverRoom).emit('new_chat_message', populatedMessage);

        // 3. Emit to receiver's notification room
        const notificationRoom = `notifications_${receiverId}_${receiverRole}`;
        console.log(`Emitting to notification room: ${notificationRoom}`);
        io.to(notificationRoom).emit('new_notification', {
          type: 'chat_message',
          title: 'New message',
          message: `You have a new message from ${senderRole === 'user' ? 'User' : 'Vendor'}`,
          metadata: {
            conversationId: conversationId.toString(),
            messageId: newMessage._id.toString(),
            senderId: senderId.toString(),
            senderRole,
          }
        });
      }

      // Create notification for receiver
      try {
        await notificationService.createNotification({
          recipientId: receiverId,
          recipientType: receiverRole,
          type: 'chat_message',
          title: `New message from ${senderRole === 'user' ? 'User' : 'Vendor'}`,
          message: message.substring(0, 100),
          actionUrl: senderRole === 'user' ? `/vendor/chat` : (senderRole === 'admin' ? `/vendor/chat/admin` : `/app/chat/${senderId}`),
          metadata: {
            conversationId: conversationId.toString(),
            messageId: newMessage._id.toString(),
            senderId: senderId.toString(),
            senderRole,
          },
        });
      } catch (notifError) {
        // Don't fail message send if notification fails
        console.error('Failed to create chat notification:', notifError);
      }

      return populatedMessage;
    } catch (error) {
      console.error('ChatService.sendMessage Error:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   * @param {String} messageId - Message ID
   * @param {String} userId - User ID
   * @param {String} userRole - User role
   * @returns {Promise<Object>} Updated message
   */
  async markMessageAsRead(messageId, userId, userRole) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Verify user is the receiver
      if (
        message.receiverId.toString() !== userId.toString() ||
        message.receiverRole !== userRole
      ) {
        throw new Error('Access denied');
      }

      if (!message.readStatus) {
        message.readStatus = true;
        message.readAt = new Date();
        await message.save();

        // Update unread count in conversation
        const conversation = await Chat.findById(message.conversationId);
        if (conversation) {
          const unreadKey = `${userRole}_${userId}`;
          const currentUnread = conversation.unreadCount?.get(unreadKey) || 0;
          if (currentUnread > 0) {
            conversation.unreadCount.set(unreadKey, currentUnread - 1);
            await conversation.save();
          }
        }
      }

      // Emit to socket room for real-time UI update
      const io = getSocket();
      if (io) {
        io.to(`chat_${message.conversationId}`).emit('message_read', {
          messageId: message._id,
          conversationId: message.conversationId
        });
      }

      return await Message.findById(messageId)
        .populate('senderId', 'name email storeName')
        .populate('receiverId', 'name email storeName')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all messages in conversation as read
   * @param {String} conversationId - Conversation ID
   * @param {String} userId - User ID
   * @param {String} userRole - User role
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(conversationId, userId, role) {
    try {
      // Verify user has access to conversation
      const conversation = await Chat.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const isParticipant = conversation.participants.some(
        (p) => p.userId.toString() === userId.toString() && p.role === role
      );

      if (!isParticipant) {
        throw new Error('Access denied');
      }

      // Mark all unread messages as read
      const result = await Message.updateMany(
        {
          conversationId,
          receiverId: new mongoose.Types.ObjectId(userId),
          receiverRole: role,
          readStatus: false,
        },
        {
          $set: {
            readStatus: true,
            readAt: new Date(),
          },
        }
      );

      // Reset unread count
      const unreadKey = `${role}_${userId.toString()}`;
      conversation.unreadCount.set(unreadKey, 0);
      await conversation.save();

      // Emit to socket room
      const io = getSocket();
      if (io) {
        io.to(`chat_${conversationId}`).emit('all_messages_read', {
          conversationId,
          userId,
          role
        });
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatService();

