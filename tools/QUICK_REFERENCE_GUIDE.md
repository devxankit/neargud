# Quick Reference Guide - Customer Profile APIs

## 🚀 Quick Import

```javascript
// Import specific stores
import { 
  useAuthStore, 
  useCartStore, 
  useOrderStore, 
  useWalletStore,
  useNotificationStore,
  useSupportTicketStore,
  useReturnStore
} from '../store';

// Or import specific APIs
import { 
  cartApi, 
  orderApi, 
  walletApi,
  notificationApi 
} from '../services';
```

---

## 📝 Common Usage Patterns

### 1. **Authentication**

```javascript
import { useAuthStore } from '../store/authStore';

function LoginComponent() {
  const { login, register, verifyEmail, isLoading } = useAuthStore();

  // Login
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      navigate('/app/home');
    } catch (error) {
      console.error(error.message);
    }
  };

  // Register
  const handleRegister = async () => {
    try {
      await register('John', 'Doe', 'john@example.com', 'password123', '9876543210');
      navigate('/app/verify-email');
    } catch (error) {
      console.error(error.message);
    }
  };

  // Verify Email
  const handleVerifyEmail = async (otp) => {
    try {
      await verifyEmail('john@example.com', otp);
      navigate('/app/home');
    } catch (error) {
      console.error(error.message);
    }
  };
}
```

### 2. **Profile Management**

```javascript
import { useAuthStore } from '../store/authStore';

function ProfileComponent() {
  const { user, updateProfile, uploadProfileImage, changePassword } = useAuthStore();

  // Update Profile
  const handleUpdateProfile = async (data) => {
    try {
      await updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // Upload Profile Image
  const handleImageUpload = async (file) => {
    try {
      await uploadProfileImage(file);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Change Password
  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      await changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error(error.message);
    }
  };
}
```

### 3. **Cart Management**

```javascript
import { useCartStore } from '../store/cartStore';

function CartComponent() {
  const { 
    cart, 
    items, 
    fetchCart, 
    addToCart, 
    updateCartItem, 
    removeFromCart,
    clearCart,
    getItemCount,
    getCartTotal
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  // Add to Cart
  const handleAddToCart = async (product) => {
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        variantId: product.selectedVariant?._id
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // Update Quantity
  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await updateCartItem(productId, quantity);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Remove Item
  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Get totals
  const itemCount = getItemCount();
  const total = getCartTotal();
}
```

### 4. **Order Management**

```javascript
import { useOrderStore } from '../store/orderStore';

function OrderComponent() {
  const { 
    orders, 
    currentOrder,
    fetchOrders, 
    fetchOrder,
    createOrder, 
    verifyPayment,
    cancelOrder 
  } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Create Order
  const handleCreateOrder = async (orderData) => {
    try {
      const order = await createOrder({
        items: cartItems,
        shippingAddress: selectedAddress,
        paymentMethod: 'razorpay',
        total: totalAmount
      });
      // Proceed to payment
    } catch (error) {
      console.error(error.message);
    }
  };

  // Verify Payment
  const handleVerifyPayment = async (paymentData) => {
    try {
      await verifyPayment({
        orderId: order._id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId, 'Changed my mind');
    } catch (error) {
      console.error(error.message);
    }
  };
}
```

### 5. **Wallet Management**

```javascript
import { useWalletStore } from '../store/walletStore';

function WalletComponent() {
  const { 
    wallet, 
    transactions,
    fetchWallet, 
    fetchTransactions,
    addMoney,
    getBalance 
  } = useWalletStore();

  useEffect(() => {
    fetchWallet();
    fetchTransactions({ page: 1, limit: 10 });
  }, []);

  // Add Money
  const handleAddMoney = async (amount) => {
    try {
      await addMoney(amount, {
        paymentMethod: 'razorpay'
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const balance = getBalance();
}
```

### 6. **Notifications**

```javascript
import { useNotificationStore } from '../store/notificationStore';

function NotificationComponent() {
  const { 
    notifications, 
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Mark as Read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Mark All as Read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error(error.message);
    }
  };
}
```

### 7. **Support Tickets**

```javascript
import { useSupportTicketStore } from '../store/supportTicketStore';

function SupportComponent() {
  const { 
    tickets, 
    currentTicket,
    createTicket,
    fetchTickets,
    fetchTicket,
    replyToTicket 
  } = useSupportTicketStore();

  useEffect(() => {
    fetchTickets();
  }, []);

  // Create Ticket
  const handleCreateTicket = async (data) => {
    try {
      await createTicket({
        subject: data.subject,
        message: data.message,
        category: data.category,
        priority: data.priority
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // Reply to Ticket
  const handleReply = async (ticketId, message) => {
    try {
      await replyToTicket(ticketId, message);
    } catch (error) {
      console.error(error.message);
    }
  };
}
```

### 8. **Return Requests**

```javascript
import { useReturnStore } from '../store/returnStore';

function ReturnComponent() {
  const { 
    returns, 
    returnEligibility,
    createReturnRequest,
    fetchReturns,
    checkReturnEligibility 
  } = useReturnStore();

  useEffect(() => {
    fetchReturns();
  }, []);

  // Check Eligibility
  const handleCheckEligibility = async (orderId) => {
    try {
      const eligibility = await checkReturnEligibility(orderId);
      if (eligibility.eligible) {
        // Show return form
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // Create Return Request
  const handleCreateReturn = async (data) => {
    try {
      await createReturnRequest({
        orderId: data.orderId,
        items: data.items,
        reason: data.reason,
        description: data.description
      });
    } catch (error) {
      console.error(error.message);
    }
  };
}
```

---

## 🎯 Best Practices

### 1. **Error Handling**
```javascript
try {
  await someApiCall();
} catch (error) {
  // Error is already shown via toast in the store
  // Just log it or handle specific cases
  console.error(error);
  
  // Handle specific error codes if needed
  if (error.response?.status === 401) {
    // Redirect to login
  }
}
```

### 2. **Loading States**
```javascript
const { isLoading } = useCartStore();

return (
  <button disabled={isLoading}>
    {isLoading ? 'Loading...' : 'Add to Cart'}
  </button>
);
```

### 3. **Optimistic Updates**
Most stores update local state immediately for better UX. If the API call fails, the state is reverted and an error toast is shown.

### 4. **Refresh Data**
```javascript
// Refresh data after important actions
useEffect(() => {
  fetchCart();
  fetchWallet();
  fetchNotifications();
}, []);
```

---

## 🔄 Real-time Updates

For real-time updates (like order status changes), you can:

1. **Poll periodically:**
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetchOrders();
  }, 30000); // Every 30 seconds

  return () => clearInterval(interval);
}, []);
```

2. **Use WebSockets** (if implemented):
```javascript
import { socketService } from '../services/socketService';

useEffect(() => {
  socketService.on('orderStatusUpdate', (data) => {
    updateOrderStatus(data.orderId, data.status);
  });

  return () => {
    socketService.off('orderStatusUpdate');
  };
}, []);
```

---

## 📱 Mobile-First Considerations

All stores are optimized for mobile:
- ✅ Minimal data fetching
- ✅ Efficient state updates
- ✅ Toast notifications for user feedback
- ✅ Loading states for all async operations
- ✅ Error handling with user-friendly messages

---

## 🎨 UI Integration

```javascript
// Example: Profile page with all integrations
import { 
  useAuthStore, 
  useNotificationStore, 
  useWalletStore 
} from '../store';

function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { wallet } = useWalletStore();

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Notifications: {unreadCount}</p>
      <p>Wallet Balance: ₹{wallet?.balance}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🔐 Protected Routes

```javascript
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/app/login" />;
  }

  return children;
}
```

---

## 📊 Summary

All customer profile APIs are now fully integrated and ready to use! Just import the store you need and start using the methods. All stores follow the same pattern for consistency and ease of use.

**Happy Coding! 🚀**
