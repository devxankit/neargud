# Razorpay Payment Integration

## Overview
This document describes the complete Razorpay payment gateway integration for customer checkout in the NearGud application.

## Features
- **Online Payment Options**: Card, UPI, and Wallet payments via Razorpay
- **Cash on Delivery**: Traditional COD option for offline payments
- **Secure Payment Flow**: Complete payment verification with signature validation
- **User-Friendly UI**: Premium mobile-optimized checkout experience

## Configuration

### Environment Variables
The following environment variables are configured in `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_8sYbzHWidwe5Zw
RAZORPAY_KEY_SECRET=GkxKRQ2B0U63BKBoayuugS3D
```

## Implementation

### Backend (Node.js/Express)

#### 1. Razorpay Service (`backend/services/razorpay.service.js`)
- Initializes Razorpay instance with API credentials
- Creates orders in Razorpay
- Verifies payment signatures
- Handles payment capture and refunds

#### 2. Order Controller (`backend/controllers/user-controllers/order.controller.js`)
- **Create Order**: 
  - Accepts order data from frontend
  - Determines if payment method requires Razorpay ('card', 'upi', 'wallet')
  - Creates order in database
  - Initializes Razorpay payment order
  - Returns order details with Razorpay credentials to frontend

- **Verify Payment**:
  - Receives payment response from Razorpay via frontend
  - Validates payment signature using HMAC-SHA256
  - Fetches payment details from Razorpay
  - Updates order status to 'completed'
  - Notifies relevant parties via Socket.IO

#### 3. Payment Method Detection
Online payment methods that trigger Razorpay:
- `card` - Credit/Debit Card payments
- `creditCard` - Legacy support
- `debitCard` - Legacy support
- `upi` - UPI payments
- `wallet` - Wallet payments (Paytm, PhonePe, etc.)

Offline payment methods:
- `cash` - Cash on Delivery

### Frontend (React)

#### 1. Checkout Component (`frontend/src/modules/App/pages/Checkout.jsx`)

**Key Features:**
- **Razorpay Script Loading**: Dynamically loads Razorpay checkout script
- **Payment Method Selection**: Two clear options:
  - Online Payment (Card, UPI, Wallets via Razorpay)
  - Cash on Delivery
- **Razorpay Integration**: Opens Razorpay modal for online payments
- **Payment Verification**: Verifies payment after successful transaction

**Payment Flow:**
1. Customer selects items and proceeds to checkout
2. Customer enters shipping information (Step 1)
3. Customer selects payment method (Step 2)
4. **For Online Payments:**
   - Order is created on backend
   - Backend returns Razorpay order ID and credentials
   - Razorpay modal opens with payment options
   - Customer completes payment
   - Payment response is sent to backend for verification
   - Order is marked as completed
   - Customer is redirected to order confirmation
5. **For Cash on Delivery:**
   - Order is created directly
   -Order is marked as pending payment
   - Customer is redirected to order confirmation

#### 2. Order Store (`frontend/src/store/orderStore.js`)
- `createOrder()`: Creates order and returns Razorpay details if needed
- `verifyPayment()`: Sends payment verification request to backend

#### 3. Order API (`frontend/src/services/orderApi.js`)
- `createOrder()`: POST `/api/user/orders/create`
- `verifyPayment()`: POST `/api/user/orders/verify-payment`

## API Endpoints

### Create Order
**POST** `/api/user/orders/create`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "variantId": "variant_id",
      "quantity": 2,
      "price": 999
    }
  ],
  "total": 2098,
  "paymentMethod": "card",
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "subtotal": 1998,
  "shipping": 0,
  "tax": 199.8,
  "discount": 99.8,
  "couponCode": "SAVE10"
}
```

**Response (Online Payment):**
```json
{
  "success": true,
  "message": "Order created. Please proceed with payment.",
  "data": {
    "order": {
      "id": "order_db_id",
      "orderCode": "ORD123456",
      "total": 2098,
      "paymentMethod": "card",
      "paymentStatus": "pending",
      "status": "pending",
      "createdAt": "2026-01-12T10:00:00.000Z"
    },
    "razorpay": {
      "orderId": "order_razorpay_id",
      "amount": 209800,
      "currency": "INR",
      "keyId": "rzp_test_8sYbzHWidwe5Zw"
    }
  }
}
```

**Response (Cash on Delivery):**
```json
{
  "success": true,
  "message": "Order created successfully.",
  "data": {
    "order": {
      "id": "order_db_id",
      "orderCode": "ORD123456",
      "total": 2098,
      "paymentMethod": "cash",
      "paymentStatus": "pending",
      "status": "pending",
      "createdAt": "2026-01-12T10:00:00.000Z"
    },
    "razorpay": null
  }
}
```

### Verify Payment
**POST** `/api/user/orders/verify-payment`

**Request Body:**
```json
{
  "orderId": "order_db_id",
  "razorpayOrderId": "order_razorpay_id",
  "razorpayPaymentId": "pay_razorpay_id",
  "razorpaySignature": "signature_from_razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and order confirmed successfully",
  "data": {
    "order": {
      "id": "order_db_id",
      "orderCode": "ORD123456",
      "total": 2098,
      "paymentStatus": "completed",
      "status": "confirmed"
    }
  }
}
```

## Security

### Payment Signature Verification
Razorpay uses HMAC-SHA256 signature verification to ensure payment authenticity:

```javascript
const crypto = require('crypto');

const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(payload)
  .digest('hex');

const isValid = expectedSignature === razorpay_signature;
```

### Best Practices
1. **Never expose** `RAZORPAY_KEY_SECRET` to the frontend
2. **Always verify** payment signatures on the backend
3. **Double-check** payment details with Razorpay API after signature verification
4. **Handle failures gracefully** with appropriate error messages
5. **Log payment attempts** for debugging and audit purposes

## Testing

### Test Cards (Razorpay Test Mode)
- **Success**: 4111 1111 1111 1111
- **Failure**: Any other card number
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI
- **Success**: success@razorpay
- **Failure**: failure@razorpay

### Test Wallets
All test wallets will work in test mode

## Error Handling

### Common Errors
1. **Razorpay not initialized**: Check if API keys are correctly set in `.env`
2. **Payment verification failed**: Check signature calculation and secret key
3. **Amount mismatch**: Ensure amount is in paise (multiply by 100)
4. **Minimum amount error**: Razorpay requires minimum ₹1 (100 paise)

### Error Messages
- User-friendly messages are shown to customers
- Technical errors are logged to console for debugging
- Failed payments don't delete the order (can retry payment)

## Future Enhancements
1. **Payment Retry**: Allow customers to retry failed payments
2. **Partial Refunds**: Implement granular refund functionality
3. **Auto-Capture**: Configure auto-capture vs manual capture
4. **Recurring Payments**: For subscription-based features
5. **International Payments**: Enable multi-currency support
6. **Payment Analytics**: Track conversion rates and payment methods

## Support
For Razorpay-specific issues:
- Documentation: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

---

**Last Updated**: January 12, 2026
**Version**: 1.0.0
