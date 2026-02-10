import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiTruck, FiCheck, FiX, FiPlus, FiArrowLeft, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
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
import { promoApi } from '../../../services/promoApi';


const MobileCheckout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, getItemsByVendor } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addresses, getDefaultAddress, addAddress, updateAddress, deleteAddress, fetchAddresses } = useAddressStore();
  const { createOrder, isLoading } = useOrderStore();
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
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
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
      fetchAddresses();
    }
  }, [isAuthenticated, fetchWallet, fetchAddresses]);

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
  }, [isAuthenticated, user, isGuest, getDefaultAddress, addresses]);

  const calculateShipping = () => {
    const total = getTotal();
    // Prioritize deliveryPartnerFee from admin settings as the base delivery charge
    const deliveryFee = settings?.delivery?.deliveryPartnerFee || settings?.shipping?.defaultShippingRate || 0;
    const freeShippingThreshold = settings?.shipping?.freeShippingThreshold || 0;

    let currentCharge = deliveryFee;

    // Only apply free shipping if a threshold is explicitly set (greater than 0)
    if (appliedCoupon?.type === 'freeship') {
      currentCharge = 0;
    } else if (freeShippingThreshold > 0 && total >= freeShippingThreshold) {
      currentCharge = 0;
    }

    if (shippingOption === 'express') {
      return 100;
    }

    return currentCharge;
  };

  const getBaseShippingFee = () => {
    return settings?.delivery?.deliveryPartnerFee || settings?.shipping?.defaultShippingRate || 0;
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


  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const response = await promoApi.validatePromoCode(
        couponCode,
        total,
        items.map(item => ({
          productId: item.productId || item.id,
          id: item.productId || item.id,
          price: item.price,
          quantity: item.quantity
        }))
      );

      if (response && response.success && response.data) {
        const couponData = response.data;
        setAppliedCoupon({
          code: couponData.code,
          type: couponData.type,
          value: couponData.value,
          discountAmount: couponData.discountAmount,
          name: couponData.code
        });
        toast.success(`Coupon "${couponData.code}" applied!`);
      } else {
        // Fallback to local validation if backend returns success=false but no error thrown
        const localCoupon = validateCoupon(couponCode);
        if (localCoupon) {
          setAppliedCoupon(localCoupon);
          toast.success(`Coupon "${localCoupon.name}" applied!`);
        } else {
          toast.error(response?.message || response?.data?.message || 'Invalid coupon code');
        }
      }
    } catch (error) {
      // If backend fails, check if we have it locally as a backup
      const localCoupon = validateCoupon(couponCode);
      if (localCoupon) {
        setAppliedCoupon(localCoupon);
        toast.success(`Coupon "${localCoupon.name}" applied!`);
        return;
      }
      console.error('Coupon validation error:', error);
      toast.error(error.message || 'Invalid coupon code or not applicable');
    } finally {
      setIsApplyingCoupon(false);
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
        shippingAddress: selectedAddressId || {
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
        navigate(`/app/order-confirmation/${createdOrder.id || createdOrder._id}`);
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
            navigate(`/app/order-confirmation/${createdOrder.id || createdOrder._id}`);
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
            shippingAddress: selectedAddressId || {
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
          navigate(`/app/order-confirmation/${response.id || response._id}`);
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
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-slate-50 text-slate-600 active:scale-95 transition-all">
              <FiArrowLeft className="text-xl" />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Checkout</h1>
              <div className="flex gap-1.5">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-1 rounded-full transition-all ${step >= s ? "w-8 bg-primary-600" : "w-4 bg-slate-100"}`} />
                ))}
              </div>
            </div>
            <div className="w-12 h-12" /> {/* Spacer */}
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
              className="px-5 py-6 space-y-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <FiTruck className="text-primary-600 text-xl" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Shipping Information</h2>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Where should we deliver your order?</p>
              </div>

              {isAuthenticated && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Saved Addresses</h3>
                  <div className="space-y-4">
                    {/* Existing addresses */}
                    {addresses.map((address) => (
                      <motion.div
                        key={address.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectAddress(address)}
                        className={`relative p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer ${selectedAddressId === address.id
                          ? "border-primary-500 bg-white shadow-xl shadow-primary-100/50"
                          : "border-slate-100 bg-slate-50 opacity-80"
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedAddressId === address.id ? "bg-primary-50 text-primary-600" : "bg-slate-200 text-slate-400"}`}>
                              <FiMapPin className="text-xl" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-slate-900 text-sm">{address.name}</h4>
                              <p className="text-xs font-bold text-slate-500 mt-1">{address.fullName}</p>
                              <p className="text-xs font-medium text-slate-400 leading-relaxed mt-1">{address.address}, {address.city}, {address.state} - {address.zipCode}</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedAddressId === address.id ? "bg-primary-600 border-primary-600" : "border-slate-300"}`}>
                            {selectedAddressId === address.id && <FiCheck className="text-white text-sm" strokeWidth={4} />}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-50">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address);
                              setShowEditForm(true);
                            }}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
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
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Add New Address Card */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="w-full h-24 flex items-center justify-center p-3 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FiPlus className="text-2xl group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase text-[10px] tracking-widest">Add New Delivery Address</span>
                      </div>
                    </motion.button>
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

          {/* Step 2: Payment & Final Review */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-5 py-6 space-y-8"
            >
              {/* Payment Method Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCreditCard className="text-primary-600 text-xl" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Use Wallet Balance */}
                  {isAuthenticated && walletBalance > 0 && (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUseWallet(true)}
                      className={`relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${useWallet
                        ? "border-primary-500 bg-white shadow-xl shadow-primary-100/50"
                        : "border-slate-100 bg-slate-50 opacity-80"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${useWallet ? "bg-primary-50 text-primary-600" : "bg-slate-200 text-slate-400"}`}>
                            <FiCreditCard className="text-xl" />
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-sm">Use Wallet Balance</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 inline-block">
                              Available: {formatPrice(walletBalance)}
                            </span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${useWallet ? "bg-primary-600 border-primary-600 shadow-lg shadow-primary-200" : "border-slate-300"}`}>
                          {useWallet && <FiCheck className="text-white text-[10px]" strokeWidth={4} />}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Option 2: Digital Payment (Full or Partial) */}
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUseWallet(false)}
                    className={`relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${!useWallet
                      ? "border-primary-500 bg-white shadow-xl shadow-primary-100/50"
                      : "border-slate-100 bg-slate-50 opacity-80"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${!useWallet ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-400"}`}>
                          <FiCreditCard className="text-xl" />
                        </div>
                        <div>
                          <span className="block font-black text-slate-900 text-sm">Razorpay / Online</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 inline-block">
                            Pay {formatPrice(useWallet ? (remainingAmount > 0 ? remainingAmount : 0) : finalTotal)} total
                          </span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${!useWallet ? "bg-primary-600 border-primary-600 shadow-lg shadow-primary-200" : "border-slate-300"}`}>
                        {!useWallet && <FiCheck className="text-white text-[10px]" strokeWidth={4} />}
                      </div>
                    </div>
                  </motion.div>

                  {/* Wallet Coverage Note */}
                  {remainingAmount <= 0 && useWallet && (
                    <div className="px-6 py-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3">
                      <FiCheckCircle className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Selected: Pay {formatPrice(finalTotal)} via Wallet</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Promo Code Section */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Promo Code</h3>
                <div className="p-1.5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 h-12 px-4 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold transition-all"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    onClick={handleApplyCoupon}
                    className="h-12 px-6 rounded-xl bg-primary-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isApplyingCoupon ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Apply'}
                  </motion.button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-600 text-sm" />
                      <span className="text-xs font-bold text-emerald-700">{appliedCoupon.code} Applied</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-slate-400 hover:text-rose-500">
                      <FiX />
                    </button>
                  </div>
                )}
              </section>

              {/* Order Summary Section */}
              <section className="space-y-4 pb-32">
                <div className="flex items-center gap-2 mb-2">
                  <FiShoppingBag className="text-primary-600 text-xl" />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Summary</h2>
                </div>

                <div className="space-y-4">
                  {itemsByVendor.map((vendorGroup) => (
                    <div key={vendorGroup.vendorId} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                      {/* Vendor Header */}
                      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm border border-slate-100">
                            <FiShoppingBag className="text-xs" />
                          </div>
                          <span className="text-sm font-black text-slate-800 tracking-tight">{vendorGroup.vendorName}</span>
                        </div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                          {vendorGroup.items.length} Items
                        </span>
                      </div>

                      {/* Vendor Items */}
                      <div className="p-4 space-y-4">
                        {vendorGroup.items.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 py-1">
                              <h4 className="text-xs font-black text-slate-900 line-clamp-1">{item.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-black text-primary-600">{formatPrice(item.price)}</span>
                                {item.originalPrice > item.price && (
                                  <span className="text-[10px] text-slate-300 line-through font-bold">{formatPrice(item.originalPrice)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Totals Card - CUSTOMER FIX: Changed from Slate-900 to White */}
                <div className="p-6 bg-white rounded-[2.5rem] border border-slate-200 space-y-4 shadow-xl shadow-slate-200/50">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-slate-900">{formatPrice(total)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600 uppercase tracking-widest">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Delivery Charge</span>
                    <span className="text-slate-900 font-black">
                      {shipping === 0 ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-lg font-black tracking-tight text-slate-900">Total Amount</span>
                    <span className="text-2xl font-black text-primary-600">{formatPrice(finalTotal)}</span>
                  </div>

                  {useWallet && amountFromWallet > 0 && (
                    <div className="flex justify-between items-center p-4 bg-primary-50 rounded-2xl border border-primary-100 mt-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-700">
                        <FiCheck className="text-primary-600" />
                        From Wallet
                      </div>
                      <span className="text-xs font-black text-primary-600">-{formatPrice(amountFromWallet)}</span>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* Navigation Buttons / Order Summary Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-6 z-40">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
              {step === 2 && (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Payable</span>
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {formatPrice(useWallet ? (remainingAmount > 0 ? remainingAmount : 0) : finalTotal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <FiCheckCircle className="text-emerald-500 text-xs" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Secure</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {step > 1 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-colors"
                  >
                    <FiArrowLeft className="text-xl" />
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-14 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    step === 2 ? (remainingAmount > 0 ? `Pay & Place Order` : 'Place Order Now') : 'Continue to Payment'
                  )}
                </motion.button>
              </div>
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

