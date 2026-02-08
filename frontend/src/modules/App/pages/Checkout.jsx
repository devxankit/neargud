import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiTruck, FiCheck, FiX, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../../store/useStore';
import { useAuthStore } from '../../../store/authStore';
import { useAddressStore } from '../../../store/addressStore';
import { useOrderStore } from '../../../store/orderStore';
import { useWalletStore } from '../../../store/walletStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { formatPrice } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import MobileLayout from '../../../components/Layout/Mobile/MobileLayout';
import MobileCheckoutSteps from '../components/MobileCheckoutSteps';
import PageTransition from '../../../components/PageTransition';


const MobileCheckout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, getItemsByVendor } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addresses, getDefaultAddress, addAddress, updateAddress, deleteAddress } = useAddressStore();
  const { createOrder } = useOrderStore();
  const { wallet, fetchWallet } = useWalletStore();
  const { settings } = useSettingsStore();

  // Group items by vendor
  const itemsByVendor = useMemo(() => getItemsByVendor(), [items, getItemsByVendor]);
  console.log("itemsByVendor", itemsByVendor);
  const [step, setStep] = useState(1);
  const [isGuest, setIsGuest] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingOption, setShippingOption] = useState('standard');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    state: '',
    country: '',
    paymentMethod: 'card',
  });
  useEffect(() => {
    if (isAuthenticated && wallet?.balance > 0) {
      setUseWallet(true);   // auto enable wallet
    }
  }, [wallet, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
    }
  }, [isAuthenticated, fetchWallet]);

  useEffect(() => {
    if (isAuthenticated && user && !isGuest) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));

      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData((prev) => ({
          ...prev,
          name: defaultAddress.fullName || user.name || '',
          email: user.email || '',
          phone: defaultAddress.phone || user.phone || '',
          address: defaultAddress.address || '',
          city: defaultAddress.city || '',
          zipCode: defaultAddress.zipCode || '',
          state: defaultAddress.state || '',
          country: defaultAddress.country || '',
        }));
      }
    }
  }, [isAuthenticated, user, isGuest, getDefaultAddress]);

  const calculateShipping = () => {
    const total = getTotal();
    if (appliedCoupon?.type === 'freeship') {
      return 0;
    }
    if (total >= 100) {
      return 0;
    }
    if (shippingOption === 'express') {
      return 100;
    }
    return 50;
  };

  const [useWallet, setUseWallet] = useState(false);

  const total = getTotal();
  const shipping = calculateShipping();
  const taxSettings = settings?.tax;
  const tax = taxSettings?.isEnabled
    ? (taxSettings.taxType === 'percentage' ? total * (taxSettings.taxValue / 100) : taxSettings.taxValue)
    : 0;
  const discount = appliedCoupon ? (appliedCoupon.type === 'percentage'
    ? total * (appliedCoupon.value / 100)
    : appliedCoupon.value) : 0;

  const walletBalance = wallet?.balance || 0;
  const amountFromWallet = useWallet ? Math.min(walletBalance, total + shipping + tax - discount) : 0;
  const remainingAmount = (total + shipping + tax - discount) - amountFromWallet;
  const finalTotal = total + shipping + tax - discount;


  // Get valid coupons from cart items
  const validCoupons = useMemo(() => {
    const allCoupons = items.flatMap(item => item.applicableCoupons || []);
    const uniqueCoupons = [];
    const seenCodes = new Set();
    allCoupons.forEach(coupon => {
      if (coupon && typeof coupon === 'object' && coupon.code && !seenCodes.has(coupon.code)) {
        seenCodes.add(coupon.code);
        uniqueCoupons.push(coupon);
      }
    });
    return uniqueCoupons;
  }, [items]);

  const validateCoupon = (code) => {
    const normalizedCode = code.trim().toUpperCase();
    const found = validCoupons.find(c => c.code.toUpperCase() === normalizedCode);

    if (found) {
      return {
        type: found.type,
        value: found.value || found.discountValue,
        name: found.description || found.code,
        code: found.code
      };
    }
    return null;
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    const coupon = validateCoupon(couponCode);
    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success(`Coupon "${coupon.name}" applied!`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    setFormData({
      ...formData,
      name: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      zipCode: address.zipCode,
      state: address.state,
      country: address.country,
    });
  };

  const handleNewAddress = (addressData) => {
    const newAddress = addAddress(addressData);
    handleSelectAddress(newAddress);
    setShowAddressForm(false);
    toast.success('Address added and selected!');
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <button
              onClick={() => navigate('/app')}
              className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Razorpay Payment
  const handleRazorpayPayment = async (orderData) => {
    try {
      // Create order on backend
      const response = await createOrder({
        items: items.map(item => ({
          productId: item.productId || item.id,
          name: item.name || item.title || 'Product',
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image || item.thumbnail || '',
        })),
        total: finalTotal,
        walletUsed: amountFromWallet,        // ✅ wallet deduction
        payableAmount: remainingAmount,      // ✅ razorpay amount
        paymentMethod: remainingAmount > 0 ? "razorpay" : "wallet",
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          state: formData.state,
          country: formData.country,
        },
        subtotal: total,
        shipping: shipping,
        tax: tax,
        discount: discount,
        couponCode: appliedCoupon ? couponCode : null,
      });


      const { order: createdOrder, razorpay } = response;

      if (!razorpay || !razorpay.orderId) {
        clearCart();
        toast.success('Order placed via wallet');
        navigate(`/app/order-confirmation/${createdOrder.id}`);
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'NearGud',
        description: `Order #${createdOrder.orderCode}`,
        order_id: razorpay.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await useOrderStore.getState().verifyPayment({
              orderId: createdOrder.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart();
            toast.success('Payment successful! Order placed.');
            navigate(`/app/order-confirmation/${createdOrder.id}`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  {
                    method: 'upi'
                  },
                  {
                    method: 'card'
                  },
                  {
                    method: 'wallet'
                  },
                  {
                    method: 'netbanking'
                  }
                ]
              }
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast.error(error.message || 'Failed to initialize payment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (useWallet && remainingAmount <= 0) {
        // Full payment from wallet
        try {
          const response = await createOrder({
            items: items.map(item => ({
              productId: item.productId || item.id,
              name: item.name || item.title || 'Product',
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              originalPrice: item.originalPrice,
              image: item.image || item.thumbnail || '',
            })),
            total: finalTotal,
            walletUsed: amountFromWallet,
            payableAmount: 0,
            paymentMethod: 'wallet',
            shippingAddress: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              zipCode: formData.zipCode,
              state: formData.state,
              country: formData.country,
            },
            subtotal: total,
            shipping: shipping,
            tax: tax,
            discount: discount,
            couponCode: appliedCoupon ? couponCode : null,
          });
          clearCart();
          toast.success('Order placed successfully!');
          navigate(`/app/order-confirmation/${response.order.id}`);
        } catch (error) {
          toast.error(error.message || 'Failed to place order');
        }
      } else {
        // Partial or no wallet payment, proceed to Razorpay
        await handleRazorpayPayment();
      }
    }
  };

  return (
    <PageTransition>
      <div className="w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          {/* Title Bar */}
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
          </div>
          {/* Steps Bar */}
          <div className="px-4 pb-3">
            <MobileCheckoutSteps currentStep={step} totalSteps={2} />
          </div>
        </div>

        {/* Guest Checkout Option */}
        {!isAuthenticated && !isGuest && (
          <div className="px-4 py-4 bg-white border-b border-gray-200">
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-base font-bold text-gray-800 mb-2">Have an account?</h3>
              <p className="text-sm text-gray-600 mb-4">Sign in for faster checkout</p>
              <div className="flex gap-3">
                <Link
                  to="/app/login"
                  className="flex-1 py-2.5 gradient-green text-white rounded-xl font-semibold text-center hover:shadow-glow-green transition-all"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => setIsGuest(true)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-4"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiTruck className="text-primary-600" />
                Shipping Information
              </h2>

              {isAuthenticated && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Saved Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Existing addresses */}
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => handleSelectAddress(address)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            <FiMapPin className="text-primary-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm">{address.name}</h4>
                              <p className="text-xs text-gray-600">{address.fullName}</p>
                              <p className="text-xs text-gray-600">{address.address}</p>
                              <p className="text-xs text-gray-600">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                            </div>
                          </div>
                          {selectedAddressId === address.id && <FiCheck className="text-primary-600 text-xl flex-shrink-0" />}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address);
                              setShowEditForm(true);
                            }}
                            className="px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-50 rounded-lg"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const id = address._id || address.id;
                              if (window.confirm('Delete this address?')) {
                                try {
                                  await deleteAddress(id);
                                  toast.success('Address deleted');
                                  if (selectedAddressId === address.id) setSelectedAddressId(null);
                                } catch (err) {
                                  toast.error(err.message || 'Failed to delete address');
                                }
                              }
                            }}
                            className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 rounded-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add New Address Card */}
                    <div
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
                    >
                      <FiPlus className="text-primary-600 text-2xl" />
                    </div>
                  </div>
                </div>
              )}


              {/* Address Form */}
              {/* <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                    />
                  </div>
                </div>
              </div> */}
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-4"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiCreditCard className="text-primary-600" />
                Payment Method
              </h2>
              {isAuthenticated && walletBalance > 0 && (
                <div className="mb-4">
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${useWallet
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <FiCreditCard className="text-primary-600" />
                      <div>
                        <span className="font-semibold text-gray-800">Use Wallet Balance</span>
                        <p className="text-xs text-gray-500">Available: {formatPrice(walletBalance)}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                  </label>
                </div>
              )}

              {remainingAmount > 0 && (
                <div className="glass-card rounded-xl p-4 border-2 border-primary-500 bg-primary-50">
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-primary-600 text-2xl" />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800 text-base block">
                        {useWallet ? 'Pay Remaining' : 'Online Payment'}
                      </span>
                      <span className="text-xs text-gray-600">
                        {useWallet ? formatPrice(remainingAmount) : 'Card, UPI, Wallets'} via Razorpay
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {remainingAmount <= 0 && useWallet && (
                <div className="glass-card rounded-xl p-4 border-2 border-green-500 bg-green-50">
                  <div className="flex items-center gap-3">
                    <FiCheck className="text-green-600 text-2xl" />
                    <div className="flex-1">
                      <span className="font-semibold text-green-800 text-base block">
                        Payment Covered by Wallet
                      </span>
                      <span className="text-xs text-green-600">
                        No additional payment needed.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Options */}
              {total < 100 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Shipping Options</h3>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingOption === 'standard'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                        }`}
                    >
                      <div>
                        <input
                          type="radio"
                          name="shippingOption"
                          value="standard"
                          checked={shippingOption === 'standard'}
                          onChange={(e) => setShippingOption(e.target.value)}
                          className="w-5 h-5 text-primary-500 mr-3"
                        />
                        <span className="font-semibold text-gray-800 text-base">Standard Shipping</span>
                        <p className="text-xs text-gray-600">5-7 business days</p>
                      </div>
                      <span className="font-bold text-gray-800">{formatPrice(50)}</span>
                    </label>
                    <label
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingOption === 'express'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                        }`}
                    >
                      <div>
                        <input
                          type="radio"
                          name="shippingOption"
                          value="express"
                          checked={shippingOption === 'express'}
                          onChange={(e) => setShippingOption(e.target.value)}
                          className="w-5 h-5 text-primary-500 mr-3"
                        />
                        <span className="font-semibold text-gray-800 text-base">Express Shipping</span>
                        <p className="text-xs text-gray-600">2-3 business days</p>
                      </div>
                      <span className="font-bold text-gray-800">{formatPrice(100)}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Coupon Code - Always Visible */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Do you have a promo code?</h3>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50/50 border border-green-100 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-green-700">{appliedCoupon.name}</p>
                      <p className="text-xs text-green-600 font-medium tracking-wide">{appliedCoupon.code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                      }}
                      className="p-2 bg-white rounded-full shadow-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-base font-bold text-gray-800 mb-3">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {itemsByVendor.map((vendorGroup) => (
                    <div key={vendorGroup.vendorId} className="space-y-2 mb-4">
                      {/* Vendor Header */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200/50 shadow-sm">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                          <FiShoppingBag className="text-white text-[10px]" />
                        </div>
                        <span className="text-sm font-bold text-primary-700 flex-1">
                          {vendorGroup.vendorName}
                        </span>
                        <span className="text-xs font-semibold text-primary-600 bg-white px-2 py-0.5 rounded-md">
                          {formatPrice(vendorGroup.subtotal)}
                        </span>
                      </div>
                      {/* Vendor Items */}
                      <div className="space-y-2 pl-2">
                        {vendorGroup.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-xs">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 truncate text-xs">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-gray-600 text-xs">
                                  {formatPrice(item.price)} × {item.quantity}
                                </p>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <p className="text-[10px] text-gray-400 line-through">
                                    {formatPrice(item.originalPrice)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <div className="flex flex-col">
                      <span>{taxSettings?.taxName || 'Tax'}</span>
                      {taxSettings?.isEnabled && (
                        <span className="text-[10px] text-gray-400">
                          ({taxSettings.taxType === 'percentage' ? `${taxSettings.taxValue}%` : 'Fixed Amount'} applied)
                        </span>
                      )}
                    </div>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons / Order Summary Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] p-4 z-40">
            {step === 2 && (
              <div className="mb-3">
                {useWallet && amountFromWallet > 0 && (
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-green-600">From Wallet</span>
                    <span className="text-green-600">-{formatPrice(amountFromWallet)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold">
                  <span className="text-gray-800">
                    {useWallet && remainingAmount > 0 ? 'Remaining to Pay' : 'Total'}
                  </span>
                  <span className="text-xl text-primary-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-[2] gradient-green text-white py-3 rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300"
              >
                {step === 2 ? (remainingAmount > 0 ? `Pay ${formatPrice(remainingAmount)}` : 'Place Order') : 'Continue'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <AddressFormModal
            onSubmit={handleNewAddress}
            onCancel={() => setShowAddressForm(false)}
            title="Add New Address"
            submitLabel="Add Address"
          />
        )}
        {showEditForm && editingAddress && (
          <AddressFormModal
            onSubmit={async (data) => {
              try {
                const id = editingAddress._id || editingAddress.id;
                await updateAddress(id, data);
                toast.success('Address updated');
                setShowEditForm(false);
                setEditingAddress(null);
              } catch (err) {
                toast.error(err.message || 'Failed to update address');
              }
            }}
            onCancel={() => setShowEditForm(false)}
            initialData={editingAddress}
            title="Edit Address"
            submitLabel="Update Address"
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

// Address Form Modal Component
const AddressFormModal = ({ onSubmit, onCancel, initialData, title, submitLabel }) => {
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        country: initialData.country || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl p-6 w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title || 'Add New Address'}</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address Label</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              placeholder="Home, Work, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 gradient-green text-white py-3 rounded-xl font-semibold hover:shadow-glow-green transition-all"
            >
              {submitLabel || 'Add Address'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MobileCheckout;

