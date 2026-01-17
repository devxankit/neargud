import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiHeart, FiShoppingBag, FiMinus, FiPlus, FiArrowLeft, FiShare2, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCartStore } from '../../../store/useStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useFavoritesStore } from '../../../store/favoritesStore';
import { useReviewsStore } from '../../../store/reviewsStore';
import { useAuthStore } from '../../../store/authStore';
import { fetchPublicProductById, fetchPublicVendorById, fetchPublicProducts } from '../../../services/publicApi';
import { formatPrice } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import MobileLayout from '../../../components/Layout/Mobile/MobileLayout';
import ImageGallery from '../../../components/Product/ImageGallery';
import VariantSelector from '../../../components/Product/VariantSelector';
import MobileProductCard from '../components/MobileProductCard';
import PageTransition from '../../../components/PageTransition';
import Badge from '../../../components/Badge';
import ReviewModal from '../components/ReviewModal';

const MobileProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [eligibleOrderId, setEligibleOrderId] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const { user } = useAuthStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addProduct: addToFavorites, removeProduct: removeFromFavorites, isInProducts } = useFavoritesStore();
  const { fetchReviews, getReviews, checkEligibility } = useReviewsStore();

  const cartItem = useMemo(() => items.find((i) => i.id === (product?._id || product?.id)), [items, product]);
  const isWishlisted = product ? isInWishlist(product._id || product.id) : false;
  const isLiked = product ? isInProducts(product._id || product.id) : false;
  const productReviews = product ? getReviews(product._id || product.id) : [];

  const productImages = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0 ? product.images : [product.image];
  }, [product]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant && product.variants?.prices) {
      if (selectedVariant.size && product.variants.prices[selectedVariant.size]) {
        return product.variants.prices[selectedVariant.size];
      }
      if (selectedVariant.color && product.variants.prices[selectedVariant.color]) {
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
        const vendorId = typeof vId === 'object' ? (vId._id || vId.id) : vId;

        if (vendorId) {
          const vendorRes = await fetchPublicVendorById(vendorId);
          if (vendorRes.success) setVendor(vendorRes.data.vendor);
        }

        // Fetch similar products
        const similarRes = await fetchPublicProducts({
          categoryId: prodData.categoryId,
          limit: 4
        });
        if (similarRes.success) {
          const currentId = prodData._id || prodData.id;
          setSimilarProducts(similarRes.data.products.filter(p => (p._id || p.id) !== currentId));
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



  const handleQuantityChange = (change) => {
    if (cartItem) {
      const newQty = cartItem.quantity + change;
      if (newQty <= 0) {
        removeItem(product._id || product.id);
      } else {
        updateQuantity(product._id || product.id, newQty);
      }
    } else {
      const newQuantity = quantity + change;
      if (newQuantity >= 1 && newQuantity <= (product.stockQuantity || 10)) {
        if (product.isBuy !== false) {
          setQuantity(newQuantity);
        }
      }
    }
  };

  const handleAddToCart = () => {
    if (product?.isBuy === false) {
      toast.error('Ordering is currently disabled for this product');
      return;
    }
    if (product?.stock === 'out_of_stock') {
      toast.error('Product is out of stock');
      return;
    }

    let finalPrice = product?.price;
    if (selectedVariant && product?.variants?.prices) {
      if (selectedVariant.size && product.variants.prices[selectedVariant.size]) {
        finalPrice = product.variants.prices[selectedVariant.size];
      } else if (selectedVariant.color && product.variants.prices[selectedVariant.color]) {
        finalPrice = product.variants.prices[selectedVariant.color];
      }
    }

    addItem({
      id: product?._id || product?.id,
      name: product?.name,
      price: finalPrice,
      image: product?.image,
      quantity: quantity,
      variant: selectedVariant,
      applicableCoupons: product?.applicableCoupons,
      isCouponEligible: product?.isCouponEligible,
    });
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product?._id || product?.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: product?._id || product?.id,
        name: product?.name,
        price: product?.price,
        image: product?.image,
      });
      toast.success('Added to wishlist');
    }
  };

  const handleLike = () => {
    if (isLiked) {
      removeFromFavorites(product?._id || product?.id);
      toast.success('Removed from liked items');
    } else {
      addToFavorites({
        id: product?._id || product?.id,
        name: product?.name,
        price: product?.price,
        image: product?.image,
      });
      toast.success('Added to liked items');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on NearGud`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading && !product) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showHeader={false}>
          <div className="w-full bg-slate-50 min-h-screen">
            <div className="h-96 bg-slate-200 animate-pulse" />
            <div className="px-5 -mt-10 relative z-10">
              <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-white">
                <div className="space-y-4">
                  <div className="h-8 bg-slate-100 rounded-xl w-3/4 animate-pulse" />
                  <div className="h-6 bg-slate-50 rounded-lg w-1/2 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-10 bg-slate-100 rounded-xl w-32 animate-pulse" />
                    <div className="h-10 bg-slate-100 rounded-xl w-32 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse" />
              <div className="h-40 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Product Not Found</h2>
              <button
                onClick={() => navigate('/app')}
                className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
              >
                Go Back Home
              </button>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <MobileLayout showBottomNav={false} showCartBar={true} showHeader={false}>
        <div className="w-full pb-24 bg-white">
          {/* Back Button */}
          <div className="px-4 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="text-xl" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Product Image */}
          <div className="px-4 py-4">
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <ImageGallery images={productImages} productName={product.name} />
              {product.flashSale && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="flash">Flash Sale</Badge>
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="primary" className="bg-indigo-600 text-white border-0 shadow-lg shadow-indigo-200">New</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="px-5 py-2">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight flex-1">{product.name}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleLike}
                  className={`p-2.5 rounded-2xl transition-all active:scale-95 ${isLiked
                    ? 'bg-amber-50 text-amber-500'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                >
                  <FiStar className={`text-xl ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-2.5 rounded-2xl transition-all active:scale-95 ${isWishlisted
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                >
                  <FiHeart className={`text-xl ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Vendor Section */}
            {vendor && (
              <div className="mb-6 space-y-3">
                <Link
                  to={`/app/vendor/${vendor._id || vendor.id}`}
                  className="inline-flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition-all duration-300 border border-gray-100 rounded-2xl shadow-sm"
                >
                  {vendor.storeLogo && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <img
                        src={vendor.storeLogo}
                        alt={vendor.storeName || vendor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900">{vendor.storeName || vendor.name}</span>
                      {vendor.isVerified && (
                        <FiCheckCircle className="text-blue-500 text-sm" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FiStar className="text-xs text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-gray-600">
                        {vendor.rating?.toFixed(1) || '4.5'} ({vendor.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                  <FiArrowLeft className="rotate-180 text-gray-400" />
                </Link>
                <Link
                  to={`/app/chat?vendorId=${vendor._id || vendor.id}&vendorName=${encodeURIComponent(vendor.storeName || vendor.name)}&productId=${product._id || product.id}&productName=${encodeURIComponent(product.name)}&productImage=${encodeURIComponent(product.image)}&productPrice=${product.price}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-primary-100 text-primary-700 rounded-2xl transition-all active:scale-[0.98] shadow-sm text-sm font-bold"
                >
                  <FiMessageCircle />
                  <span>Chat with Seller</span>
                </Link>
              </div>
            )}

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700">{product.rating || '4.5'}</span>
                <FiStar className="text-[10px] text-emerald-700 fill-emerald-700 ml-0.5" />
              </div>
              <span className="text-xs font-medium text-gray-400">
                {product.reviewCount || '0'} Ratings & Reviews
              </span>
            </div>

            {/* Price section */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-400 line-through font-medium">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Stock and Unit */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${product.stock === 'out_of_stock'
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                {product.stock === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Unit: {product.unit}
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants && (
              <div className="mb-8 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Select Variation</h4>
                <VariantSelector
                  variants={product.variants}
                  onVariantChange={setSelectedVariant}
                  currentPrice={product.price}
                />
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="mb-8">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-800 active:scale-90 transition-transform"
                  >
                    <FiMinus strokeWidth={3} />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900 text-lg">
                    {cartItem?.quantity || quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-800 active:scale-90 transition-transform"
                    disabled={(cartItem?.quantity || quantity) >= (product.stockQuantity || 10)}
                  >
                    <FiPlus strokeWidth={3} />
                  </button>
                </div>
               {!cartItem && (
  <button
    onClick={handleAddToCart}
    disabled={product.stock === 'out_of_stock' || product.isBuy === false}
    className={`flex-1 h-14 rounded-2xl font-bold transition-all active:scale-[0.98] 
      flex items-center justify-center gap-2 border-2 
      ${
        product.stock === 'out_of_stock' || product.isBuy === false
          ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white border-primary-600 text-primary-700 hover:bg-primary-50'
      }`}
  >
    <FiShoppingBag />
    <span>
      {product.stock === 'out_of_stock'
        ? 'Out of Stock'
        : product.isBuy === false
        ? 'Ordering Disabled'
        : 'Add to Cart'}
    </span>
  </button>
)}

            </div>
          </div>

          {/* Description */}
          <div className="mb-8 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">Product Details</h3>
            <p className="text-gray-600 leading-relaxed text-sm font-medium">
              {product.description || `High-quality ${product.name.toLowerCase()} available in ${product.unit.toLowerCase()}. Carefully selected to ensure safety, performance, and best value for your requirements.`}
            </p>
            {product.attributes && product.attributes.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {product.attributes.map((attr, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{attr.name}</span>
                    <span className="text-xs font-bold text-gray-800">{attr.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mb-8 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900 tracking-tight">Reviews</h4>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="text-xs font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl uppercase tracking-wider"
              >
                Write Review
              </button>
            </div>

            {productReviews.length > 0 ? (
              <div className="space-y-6">
                {productReviews.slice(0, 3).map((review, idx) => (
                  <div key={review._id || idx} className="space-y-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 capitalize">
                          {review.customerName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-gray-800">{review.customerName || 'User'}</span>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar
                            key={s}
                            size={10}
                            className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      "{review.review || review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400 text-center py-4">No reviews yet for this product</p>
            )}
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">You May Also Like</h3>
                <Link to="/app/categories" className="text-xs font-bold text-primary-600 underline">SEE ALL</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {similarProducts.map((p) => (
                  <MobileProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 pb-8 z-40 safe-area-bottom">
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="w-14 h-14 bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          >
            <FiShare2 className="text-xl" />
          </button>
          {vendor?.deliveryAvailable !== false ? (
            <div className="flex-1 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 'out_of_stock' || product.isBuy === false}
                className={`flex-1 h-14 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border-2 ${product.stock === 'out_of_stock' || product.isBuy === false
                  ? 'bg-gray-50 border-gray-100 text-gray-400'
                  : 'bg-white border-primary-600 text-primary-600'
                  }`}
              >
                <FiShoppingBag />
                {product.isBuy === false ? 'DISABLED' : (cartItem ? 'UPDATE' : 'ADD TO CART')}
              </button>
              <button
                onClick={() => {
                  if (product.isBuy === false) return;
                  if (!cartItem) handleAddToCart();
                  navigate('/app/checkout');
                }}
                disabled={product.stock === 'out_of_stock' || product.isBuy === false}
                className={`flex-1 h-14 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg ${product.stock === 'out_of_stock' || product.isBuy === false
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary-600 text-white shadow-primary-100'
                  }`}
              >
                {product.isBuy === false ? 'DISABLED' : 'BUY NOW'}
              </button>
            </div>
          ) : (
            <Link
              to={`/app/chat?vendorId=${vendor?._id || vendor?.id}&vendorName=${encodeURIComponent(vendor?.storeName || '')}`}
              className="flex-1 h-14 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 bg-indigo-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              <FiMessageCircle className="text-xl" />
              <span>Chat to Buy</span>
            </Link>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          product={product}
          orderId={eligibleOrderId}
        />
      )}
    </MobileLayout>
    </PageTransition >
  );
};

export default MobileProductDetail;

