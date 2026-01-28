import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    console.log("Connecting to Socket.IO server...");

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat room methods
  joinChatRoom(conversationId) {
    console.log("Joining chat room:", conversationId);
    this.socket?.emit("join_chat_room", { conversationId });
  }

  leaveChatRoom(conversationId) {
    console.log("Leaving chat room:", conversationId);
    this.socket?.emit("leave_chat_room", { conversationId });
  }

  sendMessage(data, callback) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", data, callback);
    } else {
      console.error("Socket disconnected, cannot send message");
      if (callback) callback({ success: false, error: "Socket disconnected" });
    }
  }

  // Typing indicators
  startTyping(conversationId) {
    this.socket?.emit("typing_start", { conversationId });
  }

  stopTyping(conversationId) {
    this.socket?.emit("typing_stop", { conversationId });
  }

  // Event listeners
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on("receive_message", callback);
    }
  }

  onNewChatMessage(callback) {
    if (this.socket) {
      this.socket.on("new_chat_message", callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on("new_notification", callback);
    }
  }

  onNotificationRead(callback) {
    if (this.socket) {
      this.socket.on("notification_read", callback);
    }
  }

  onAllNotificationsRead(callback) {
    if (this.socket) {
      this.socket.on("all_notifications_read", callback);
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on("user_stopped_typing", callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on("message_read", callback);
    }
  }

  // Reel methods
  joinReelRoom(reelId) {
    this.socket?.emit("join_reel", reelId);
  }

  leaveReelRoom(reelId) {
    this.socket?.emit("leave_reel", reelId);
  }

  likeReel(reelId) {
    this.socket?.emit("like_reel", { reelId });
  }

  sendReelComment(reelId, text, callback) {
    if (this.socket?.connected) {
      this.socket.emit("send_reel_comment", { reelId, text }, callback);
    } else if (callback) {
      callback({ success: false, error: "Socket disconnected" });
    }
  }

  editReelComment(reelId, commentId, text, callback) {
    if (this.socket?.connected) {
      this.socket.emit(
        "edit_reel_comment",
        { reelId, commentId, text },
        callback,
      );
    } else if (callback) {
      callback({ success: false, error: "Socket disconnected" });
    }
  }

  deleteReelComment(reelId, commentId, callback) {
    if (this.socket?.connected) {
      this.socket.emit("delete_reel_comment", { reelId, commentId }, callback);
    } else if (callback) {
      callback({ success: false, error: "Socket disconnected" });
    }
  }

  // Remove listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
