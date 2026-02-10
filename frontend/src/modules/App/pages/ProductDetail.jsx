import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  FiStar,
  FiHeart,
  FiShoppingBag,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiShare2,
  FiCheckCircle,
  FiMessageCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useCartStore } from "../../../store/useStore";
import { useWishlistStore } from "../../../store/wishlistStore";
import { useFavoritesStore } from "../../../store/favoritesStore";
import { useReviewsStore } from "../../../store/reviewsStore";
import { useAuthStore } from "../../../store/authStore";
import {
  fetchPublicProductById,
  fetchPublicVendorById,

  fetchPublicProducts,
} from "../../../services/publicApi";
import { formatPrice } from "../../../utils/helpers";
import toast from "react-hot-toast";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import ImageGallery from "../../../components/Product/ImageGallery";
import VariantSelector from "../../../components/Product/VariantSelector";
import MobileProductCard from "../components/MobileProductCard";
import PageTransition from "../../../components/PageTransition";
import Badge from "../../../components/Badge";
import ReviewModal from "../components/ReviewModal";

const MobileProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [eligibleOrderId, setEligibleOrderId] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const { user } = useAuthStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
    fetchWishlist,
  } = useWishlistStore();
  const {
    addProduct: addToFavorites,
    removeProduct: removeFromFavorites,
    isInProducts,
  } = useFavoritesStore();
  const { fetchReviews, getReviews, checkEligibility } = useReviewsStore();

  const cartItem = useMemo(
    () =>
      cartItems?.find(
        (item) =>
          String(item.productId?._id || item.productId || item.id) ===
          String(product?._id || product?.id),
      ),
    [cartItems, product],
  );
  const isWishlisted = product
    ? isInWishlist(product._id || product.id)
    : false;
  const isLiked = product ? isInProducts(product._id || product.id) : false;
  const productReviews = product ? getReviews(product._id || product.id) : [];

  const productImages = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0
      ? product.images
      : [product.image];
  }, [product]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;

    // If we have a selected variant with a price, use it
    if (selectedVariant?.price !== undefined && selectedVariant?.price !== null) {
      return selectedVariant.price;
    }

    // Fallback for legacy prices structure
    if (selectedVariant && product.variants?.prices) {
      if (
        selectedVariant.size &&
        product.variants.prices[selectedVariant.size]
      ) {
        return product.variants.prices[selectedVariant.size];
      }
      if (
        selectedVariant.color &&
        product.variants.prices[selectedVariant.color]
      ) {
        return product.variants.prices[selectedVariant.color];
      }
    }

    return product.price;
  }, [product, selectedVariant]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await fetchPublicProductById(id);
      if (res.success) {
        const prodData = res.data.product;
        setProduct(prodData);

        // Fetch reviews
        fetchReviews(prodData._id || prodData.id);

        // Fetch vendor details - handle vendorId as object or string
        const vId = prodData.vendorId;
        const vendorId = typeof vId === "object" ? vId._id || vId.id : vId;

        if (vendorId) {
          const vendorRes = await fetchPublicVendorById(vendorId);
          if (vendorRes.success) setVendor(vendorRes.data.vendor);
        }

        // Fetch similar products
        const similarRes = await fetchPublicProducts({
          categoryId: prodData.categoryId,
          limit: 4,
        });
        if (similarRes.success) {
          const currentId = prodData._id || prodData.id;
          setSimilarProducts(
            similarRes.data.products.filter(
              (p) => (p._id || p.id) !== currentId,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    if (user) {
      fetchWishlist();
    }

    // Check if there's an associated order to tag as verified
    const checkOrderHistory = async () => {
      if (id && user) {
        const res = await checkEligibility(id);
        if (res && res.orderId) {
          setEligibleOrderId(res.orderId);
        }
      }
    };
    checkOrderHistory();
  }, [id, user]);

  useEffect(() => {
    if (product?.variants?.defaultVariant) {
      setSelectedVariant(product.variants.defaultVariant);
    }
  }, [product]);

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartItem]);

  const handleQuantityChange = (val) => {
    const maxStock = selectedVariant?.stock !== undefined
      ? selectedVariant.stock
      : (product?.stockQuantity || 10);

    const currentQty = cartItem?.quantity || quantity;
    const newQty = currentQty + val;

    if (newQty > 0 && newQty <= maxStock) {
      if (cartItem) {
        updateQuantity(product._id || product.id, newQty);
      } else {
        setQuantity(newQty);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return false;

    if (product.stock === "out_of_stock") {
      toast.error("Product is out of stock");
      return false;
    }

    // Validate Variants
    if (product.variants) {
      const hasColorVariants = product.variants.colorVariants && product.variants.colorVariants.length > 0;
      const hasSizes = product.variants.sizes && product.variants.sizes.length > 0;
      const hasColors = product.variants.colors && product.variants.colors.length > 0;

      if (hasColorVariants) {
        if (!selectedVariant || !selectedVariant.color) {
          toast.error("Please select a color");
          return false;
        }
        if (!selectedVariant.size) {
          toast.error("Please select a size");
          return false;
        }
      }

      if (hasSizes && (!selectedVariant || !selectedVariant.size)) {
        toast.error("Please select a size");
        document.getElementById('variant-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }

      if (hasColors && (!selectedVariant || !selectedVariant.color)) {
        toast.error("Please select a color");
        document.getElementById('variant-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
    }

    let finalPrice = product?.price;
    if (selectedVariant && product?.variants?.prices) {
      if (
        selectedVariant.size &&
        product.variants.prices[selectedVariant.size]
      ) {
        finalPrice = product.variants.prices[selectedVariant.size];
      } else if (
        selectedVariant.color &&
        product.variants.prices[selectedVariant.color]
      ) {
        finalPrice = product.variants.prices[selectedVariant.color];
      }
    }

    // Using addItem instead of addToCart
    addItem({
      id: product?._id || product?.id,
      _id: product?._id || product?.id,
      name: product?.name,
      price: currentPrice,
      image: selectedVariant?.image || product?.image,
      quantity: quantity,
      variant: selectedVariant,
      isCouponEligible: product?.isCouponEligible,
      vendorId: product?.vendorId || (vendor?._id || vendor?.id),
      vendorName: vendor?.storeName || vendor?.name || 'NearGud Store',
      storeName: vendor?.storeName,
    });
    return true;

    // If not authenticated, we could prompt them to login or just let them add to cart
    // but they will be blocked at checkout.
    // For better UX, we can just let them add to cart.
    // toast.success("Added to cart"); // Handled in store
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/app/login", { state: { from: location } });
      return;
    }
    if (isWishlisted) {
      removeFromWishlist(product?._id || product?.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: product?._id || product?.id,
        name: product?.name,
        price: product?.price,
        image: product?.image,
      });
      toast.success("Added to wishlist");
    }
  };

  const handleLike = () => {
    if (!user) {
      toast.error("Please login to like products");
      navigate("/app/login", { state: { from: location } });
      return;
    }
    if (isLiked) {
      removeFromFavorites(product?._id || product?.id);
      toast.success("Removed from liked items");
    } else {
      addToFavorites({
        id: product?._id || product?.id,
        name: product?.name,
        price: product?.price,
        image: product?.image,
      });
      toast.success("Added to liked items");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name,
      text: `Check out ${product?.name} on NearGud`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Toast for success could be annoying if system sheet already confirms, but okay to leave out or generic
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to clipboard if share failed (e.g. not supported in this context or permission denied)
        // But if user cancelled, maybe don't copy?
        // Usually if it fails we might want to copy as backup, or just do nothing if cancelled.
        // Let's rely on the else block for non-supported browsers, and catch block for errors.
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (loading && !product) {
    return (
      <PageTransition>
        <div className="w-full bg-slate-50 min-h-screen">
          <div className="h-[400px] bg-slate-200 animate-pulse rounded-b-[3rem]" />
          <div className="max-w-7xl mx-auto px-5 -mt-20 relative z-10">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
              <div className="space-y-6">
                <div className="h-10 bg-slate-100 rounded-2xl w-3/4 animate-pulse" />
                <div className="h-6 bg-slate-50 rounded-xl w-1/2 animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-14 bg-slate-100 rounded-2xl w-32 animate-pulse" />
                  <div className="h-14 bg-slate-100 rounded-2xl w-32 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto p-5 space-y-6">
            <div className="h-32 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
            <div className="h-60 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-50">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8">
            <FiShoppingBag className="text-4xl text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Product Disappeared!</h2>
          <p className="text-slate-500 font-medium mb-8 text-center max-w-xs">We couldn't find the product you're looking for. It might have been moved or removed.</p>
          <button
            onClick={() => navigate("/app")}
            className="w-full max-w-xs h-14 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-200">
            Keep Shopping
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="w-full pb-24 bg-slate-50/50">
        {/* Navigation Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 active:scale-95 transition-all">
              <FiArrowLeft className="text-xl" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[200px]">
              {product.name}
            </h2>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 active:scale-95 transition-all">
              <FiShare2 className="text-xl" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto md:grid md:grid-cols-2 md:gap-8 md:px-8 md:py-8 lg:gap-16">
          {/* Left Column: Image Section */}
          <div className="md:sticky md:top-24 h-fit">
            <div className="relative bg-white md:rounded-[2.5rem] overflow-hidden shadow-sm md:shadow-xl md:shadow-slate-200/50 border-b md:border border-slate-100">
              <ImageGallery images={productImages} productName={product.name} />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.flashSale && (
                  <Badge variant="flash" className="shadow-lg shadow-orange-200/50">Flash Sale</Badge>
                )}
                {product.isNew && (
                  <Badge variant="primary" className="bg-indigo-600 text-white border-0 shadow-lg shadow-indigo-200/50">New Arrival</Badge>
                )}
              </div>

              {/* Action Buttons on Image (Mobile) */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3 md:hidden">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className={`w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all ${isWishlisted
                    ? "bg-red-500 text-white shadow-red-200"
                    : "bg-white/90 backdrop-blur-sm text-slate-400 border border-white"
                    }`}>
                  <FiHeart className={`text-xl ${isWishlisted ? "fill-current" : ""}`} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Column: Content Section */}
          <div className="px-5 py-6 md:p-0">
            <div className="space-y-6">
              {/* Product Title & Brand */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
                    {product.name}
                  </h1>
                  <button
                    onClick={handleLike}
                    className={`hidden md:flex p-3 rounded-2xl transition-all ${isLiked
                      ? "bg-amber-100 text-amber-500"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}>
                    <FiStar className={`text-xl ${isLiked ? "fill-current" : ""}`} />
                  </button>
                </div>

                {product.rating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      <span className="text-xs font-black text-amber-700">{product.rating}</span>
                      <FiStar className="text-[10px] text-amber-700 fill-amber-700 ml-1" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {product.reviewCount} Ratings & Verified Reviews
                    </span>
                  </div>
                )}
              </div>

              {/* Price & Offers */}
              <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-100/50">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-slate-800">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.originalPrice > currentPrice && (
                    <span className="text-lg text-slate-300 line-through font-bold">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice > currentPrice && (
                  <div className="inline-flex items-center bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Save {formatPrice(product.originalPrice - currentPrice)} ({Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)}% OFF)
                  </div>
                )}
              </div>

              {/* Vendor & Trust */}
              {vendor && (
                <div className="p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-100/50">
                  <Link to={`/app/vendor/${vendor._id || vendor.id}`} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img src={vendor.storeLogo || "https://via.placeholder.com/100"} alt={vendor.storeName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                          {vendor.storeName || vendor.name}
                        </span>
                        {vendor.isVerified && <FiCheckCircle className="text-blue-500" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Store</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                      <FiArrowLeft className="rotate-180" />
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50">
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EEEFFF] text-[#6366F1] text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                      <FiMessageCircle className="text-sm" />
                      Chat Seller
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EEEFFF] text-[#6366F1] text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                      <FiShare2 className="text-sm" />
                      Share Product
                    </button>
                  </div>
                </div>
              )}

              {/* Variant Selections */}
              {product.variants && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Configuration</h4>
                    <span className="text-[10px] font-bold text-primary-600 underline">Size Chart</span>
                  </div>
                  <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-100/50">
                    <VariantSelector
                      variants={product.variants}
                      onVariantChange={setSelectedVariant}
                      currentPrice={product.price}
                    />
                  </div>
                </div>
              )}

              {/* Quantity & Action Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quantity</h4>
                  <div className="flex flex-col gap-4">
                    {/* Centered Quantity Selector */}
                    <div className="flex items-center justify-between bg-white border border-slate-100 shadow-sm rounded-2xl p-2 w-36">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-50"
                        disabled={quantity <= 1}>
                        <FiMinus strokeWidth={3} />
                      </motion.button>
                      <span className="flex-1 text-center font-black text-slate-900 text-lg">
                        {cartItem?.quantity || quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-50"
                        disabled={(cartItem?.quantity || quantity) >= (product.stockQuantity || 10)}>
                        <FiPlus strokeWidth={3} />
                      </motion.button>
                    </div>

                    {/* Full Width Add to Bag */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      disabled={product.stock === "out_of_stock" || product.isBuy === false}
                      className="w-full h-14 bg-[#EEEFFF] text-[#6366F1] rounded-2xl font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-3 border border-indigo-50 shadow-sm shadow-indigo-100/50">
                      <FiShoppingBag className="text-base" strokeWidth={2.5} />
                      {cartItem ? "Update Quantity" : "Add to Bag"}
                    </motion.button>
                  </div>
                </div>
                <div className="px-1 text-[10px] font-bold text-slate-400 italic">
                  {product.stockQuantity || 0} Units Available in Store
                </div>
              </div>

              {/* Product Info Tabs/Content */}
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-100/50">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 tracking-tight">Product Specifications</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">
                    {product.description}
                  </p>

                  {/* Base Attributes */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {product.mainColor && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Color</span>
                        <span className="text-xs font-black text-slate-800">{product.mainColor}</span>
                      </div>
                    )}
                    {product.unit && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Unit</span>
                        <span className="text-xs font-black text-slate-800">{product.unit}</span>
                      </div>
                    )}
                  </div>

                  {product.attributes && product.attributes.length > 0 && (
                    <div className="space-y-6">
                      {/* Grouped Attributes */}
                      {Object.entries(
                        product.attributes.reduce((acc, attr) => {
                          const group = attr.group || 'General';
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(attr);
                          return acc;
                        }, {})
                      ).map(([group, attrs], gIdx) => (
                        <div key={gIdx} className="space-y-3">
                          <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-widest px-1">{group}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {attrs.map((attr, idx) => (
                              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{attr.name || attr.attributeName}</span>
                                <span className="text-xs font-black text-slate-800">{attr.value || (attr.values && attr.values[0]?.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-100/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Verified Reviews</h3>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!user) {
                        toast.error("Please login to review");
                        navigate("/app/login");
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#EEEFFF] text-[#6366F1] text-[10px] font-black uppercase tracking-wider">
                    Add Review
                  </motion.button>
                </div>

                {productReviews.length > 0 ? (
                  <div className="space-y-6">
                    {productReviews.slice(0, 3).map((review, idx) => (
                      <div key={review._id || idx} className="space-y-3 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                              {review.customerName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <span className="block text-xs font-black text-slate-800 leading-none mb-1">
                                {review.customerName || "Verified Buyer"}
                              </span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <FiStar key={s} size={10} className={s <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-300">2 days ago</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                          "{review.review || review.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMessageCircle className="text-2xl text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No reviews yet</p>
                  </div>
                )}
              </div>

              {/* Similar Products */}
              {similarProducts.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">More for You</h3>
                    <Link to="/app/categories" className="text-[10px] font-black text-primary-600 uppercase tracking-widest underline">View All</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-12">
                    {similarProducts.map((p) => (
                      <MobileProductCard key={p._id || p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-5 pt-4 pb-8 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="hidden md:block flex-shrink-0 pr-8 border-r border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</div>
            <div className="text-2xl font-black text-slate-900 leading-none">{formatPrice(currentPrice)}</div>
          </div>

          <div className="flex-1 flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.stock === "out_of_stock" || product.isBuy === false}
              className={`flex-1 h-14 rounded-2xl font-black uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-2 border-2 whitespace-nowrap ${product.stock === "out_of_stock" || product.isBuy === false
                ? "bg-slate-50 border-slate-100 text-slate-300"
                : "bg-[#EEEFFF] border-indigo-50 text-[#6366F1]"
                }`}>
              <FiShoppingBag className="text-base shrink-0" />
              {cartItem ? "Update Quantity" : "Add to Bag"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (product.isBuy === false) return;
                if (cartItem) navigate("/app/checkout");
                else if (handleAddToCart()) navigate("/app/checkout");
              }}
              disabled={product.stock === "out_of_stock" || product.isBuy === false}
              className={`flex-1 h-14 rounded-2xl font-black uppercase text-[9px] tracking-wider transition-all shadow-xl flex items-center justify-center whitespace-nowrap ${product.stock === "out_of_stock" || product.isBuy === false
                ? "bg-slate-200 text-slate-400 shadow-none grayscale"
                : "bg-primary-600 text-white shadow-primary-200"
                }`}>
              Checkout Now
            </motion.button>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product}
        orderId={eligibleOrderId}
      />
    </PageTransition>
  );
};

export default MobileProductDetail;
