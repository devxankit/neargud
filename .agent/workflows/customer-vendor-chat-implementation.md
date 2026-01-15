---
description: Customer-Vendor Real-Time Chat Implementation Plan
---

# Customer-Vendor Real-Time Chat System Implementation

## Overview
Implement a real-time chat system between customers and vendors using Socket.IO, leveraging existing backend infrastructure.

## Backend Status
✅ **Already Complete:**
- Socket.IO server setup (`config/socket.io.js`)
- Chat and Message models
- Chat service with full functionality
- Socket event handlers for chat rooms, typing indicators

## Frontend Implementation Required

### 1. Socket.IO Client Setup
**File:** `frontend/src/utils/socket.js`
- Initialize Socket.IO client
- Handle authentication with token
- Auto-reconnection logic
- Event listeners setup

### 2. Chat Store (Zustand)
**File:** `frontend/src/store/chatStore.js` (Update existing)
- Manage conversations list
- Manage current conversation messages
- Handle real-time message updates
- Typing indicators state
- Unread counts

### 3. Chat API Service
**File:** `frontend/src/services/chatApi.js` (Update existing)
- Get conversations
- Get messages for conversation
- Send message
- Mark messages as read
- Create/get conversation with vendor

### 4. Customer Chat UI
**File:** `frontend/src/pages/Chat.jsx` (Replace existing)
- Conversation list view
- Chat window with real-time messages
- Message input with typing indicators
- Product sharing in chat
- Mobile-responsive design

### 5. Vendor Chat UI
**File:** `frontend/src/modules/vendor/pages/Chat.jsx` (New)
- Similar to customer chat but from vendor perspective
- List of customer conversations
- Real-time message handling

### 6. Chat Components
**Directory:** `frontend/src/components/Chat/`
- `ConversationList.jsx` - List of conversations
- `ChatWindow.jsx` - Main chat interface
- `MessageBubble.jsx` - Individual message display
- `ProductCard.jsx` - Product sharing card
- `TypingIndicator.jsx` - Typing animation

## Implementation Steps

### Step 1: Socket Client Setup
Create Socket.IO client utility with authentication

### Step 2: Update Chat Store
Integrate with Socket.IO for real-time updates

### Step 3: Update Chat API
Connect to backend endpoints

### Step 4: Build Customer Chat UI
Complete chat interface for customers

### Step 5: Build Vendor Chat UI
Complete chat interface for vendors

### Step 6: Testing
- Test real-time messaging
- Test typing indicators
- Test unread counts
- Test product sharing
- Test mobile responsiveness

## Features

### Core Features
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Unread message counts
- ✅ Product sharing in chat
- ✅ Message history with pagination
- ✅ Mobile-responsive design

### Additional Features
- Online/offline status
- Message timestamps
- Auto-scroll to latest message
- Search conversations
- Persistent connection with auto-reconnect

## API Endpoints (Already Available)

### Customer Endpoints
- `GET /api/chat/conversations` - Get user's conversations
- `GET /api/chat/:conversationId/messages` - Get messages
- `POST /api/chat/send` - Send message
- `PUT /api/chat/message/:messageId/read` - Mark as read
- `POST /api/chat/conversation` - Create/get conversation

### Vendor Endpoints
- `GET /api/vendor/chat/conversations` - Get vendor's conversations
- `GET /api/vendor/chat/:conversationId/messages` - Get messages
- `POST /api/vendor/chat/send` - Send message
- Similar read/conversation endpoints

## Socket Events

### Client → Server
- `join_chat_room` - Join conversation room
- `leave_chat_room` - Leave conversation room
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server → Client
- `receive_message` - New message in conversation
- `new_chat_message` - New message notification
- `user_typing` - Other user is typing
- `user_stopped_typing` - Other user stopped typing
- `message_read` - Message was read
- `all_messages_read` - All messages marked as read

## Notes
- Backend is fully functional
- Focus on frontend implementation
- Use existing Socket.IO infrastructure
- Leverage existing chat service methods
- Ensure mobile-first design
