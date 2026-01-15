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
        setQuantity(newQuantity);
      }
    }
  };

  const handleAddToCart = () => {
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
      removeFromWishlist(product?._id || product?._id);
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
        <div className="w-full bg-slate-50/50 pb-32">
          {/* Header Actions */}
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-transparent">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/50 flex items-center justify-center text-slate-800 transition-all active:scale-90"
            >
              <FiArrowLeft size={24} />
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/50 flex items-center justify-center text-slate-800 transition-all active:scale-90"
              >
                <FiShare2 size={24} />
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 rounded-2xl backdrop-blur-md shadow-lg border border-white/50 flex items-center justify-center transition-all active:scale-90 ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-rose-500'}`}
              >
                <FiHeart size={24} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Product Image Gallery */}
          <div className="w-full bg-white rounded-b-[3.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden relative border-b border-slate-100">
            <ImageGallery images={productImages} productName={product.name} />
            {product.flashSale && (
              <div className="absolute top-24 left-6">
                <Badge variant="flash">Flash Sale</Badge>
              </div>
            )}
            {product.isNew && (
              <div className="absolute top-24 left-32">
                <Badge variant="primary" className="bg-indigo-600 text-white border-0 shadow-lg shadow-indigo-200">New Arrival</Badge>
              </div>
            )}
          </div>

          {/* Product Main Info Card */}
          <div className="px-5 -mt-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 border border-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                  <FiStar className="text-orange-500 fill-orange-500" size={12} />
                  <span className="text-[10px] font-black text-orange-700 ml-1">{product.rating || '4.5'}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.reviewCount || '120'} Reviews</span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-4 uppercase">{product.name}</h1>
              <p className="text-slate-500 font-bold text-sm mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                {product.unit}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Total Price</span>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {formatPrice(currentPrice)}
                    </span>
                    {product.originalPrice && product.originalPrice > currentPrice && (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-400 line-through decoration-slate-300">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                          {Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-800 active:scale-90 transition-transform"
                  >
                    <FiMinus size={18} strokeWidth={3} />
                  </button>
                  <span className="w-10 text-center font-black text-slate-800">{cartItem?.quantity || quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-800 active:scale-90 transition-transform"
                    disabled={(cartItem?.quantity || quantity) >= (product.stockQuantity || 10)}
                  >
                    <FiPlus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detailed Content */}
          <div className="px-5 mt-8 space-y-8">
            {/* Vendor High End Section */}
            {vendor && (
              <Link
                to={`/app/vendor/${vendor._id || vendor.id}`}
                className="block group"
              >
                <div className="bg-white rounded-[2rem] p-5 shadow-lg shadow-slate-200/30 border border-slate-100 flex items-center gap-4 transition-all active:scale-[0.98]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-100 shadow-sm group-hover:border-primary-200 transition-colors">
                      {vendor.storeLogo ? (
                        <img src={vendor.storeLogo} alt={vendor.storeName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <FiShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    {vendor.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-md">
                        <FiCheckCircle size={10} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Dispatched by</span>
                    <h4 className="font-black text-slate-900 tracking-tight text-lg">{vendor.storeName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <FiStar size={10} className="text-orange-400 fill-orange-400" />
                        <span className="text-xs font-black text-slate-700">{vendor.rating || '4.8'}</span>
                      </div>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-xs font-bold text-slate-400 line-clamp-1">{vendor.address?.city || 'Near You'}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                    <FiArrowLeft className="rotate-180" size={20} />
                  </div>
                </div>
              </Link>
            )}

            {/* Variant Selector Enhancement */}
            {product.variants && (
              <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/30 border border-slate-100">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Option</h4>
                <VariantSelector
                  variants={product.variants}
                  onVariantChange={setSelectedVariant}
                  currentPrice={product.price}
                />
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/30 border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">Description</h4>
              <div className="relative z-10 prose prose-slate">
                <p className="text-slate-600 font-medium leading-relaxed text-sm">
                  {product.description || `Experience the premium quality of our ${product.name}. This ${product.unit.toLowerCase()} is sourced directly from certified suppliers to guarantee maximum freshness and authenticity. Ideal for your daily lifestyle needs.`}
                </p>
                {product.attributes && product.attributes.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {product.attributes.map((attr, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
                        <span className="block text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">{attr.name}</span>
                        <span className="text-xs font-bold text-slate-800">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/30 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Reviews</h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error('Please login to write a review');
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-primary-100"
                  >
                    Write Review
                  </button>
                  <div className="flex items-center gap-1">
                    <FiStar className="text-orange-400 fill-orange-400" size={14} />
                    <span className="text-sm font-black text-slate-800">{product.rating || '0.0'}</span>
                  </div>
                </div>
              </div>

              {productReviews.length > 0 ? (
                <div className="space-y-6">
                  {productReviews.map((review, idx) => (
                    <div key={review._id || idx} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                            {review.customerName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                              {review.customerName || 'Verified Customer'}
                            </h5>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FiStar
                                  key={s}
                                  size={8}
                                  className={s <= review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed italic ml-10">
                        "{review.review || review.comment}"
                      </p>

                      {review.vendorResponse && (
                        <div className="mt-3 ml-10 p-3 bg-primary-50/50 rounded-2xl border border-primary-100/30">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                              <FiCheckCircle size={8} className="text-white" />
                            </div>
                            <span className="text-[9px] font-black text-primary-700 uppercase tracking-widest">Vendor Response</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                            {review.vendorResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">No reviews yet for this product</p>
                </div>
              )}
            </div>

            {/* Similar Products Grid */}
            {similarProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 px-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">You May Also Like</h3>
                  <Link to="/app/categories" className="text-xs font-black text-primary-600 underline underline-offset-4 tracking-tighter decoration-primary-200">VIEW ALL</Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {similarProducts.map((p) => (
                    <MobileProductCard key={p._id || p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Review Modal */}
            {isReviewModalOpen && (
              <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                product={product}
                orderId={eligibleOrderId}
              />
            )}
          </div>
        </div>

        {/* High-End Sticky Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-5 pb-8 bg-white/80 backdrop-blur-2xl border-t border-slate-100/50">
          <div className="flex gap-4">
            <Link
              to={`/app/chat?vendorId=${vendor?._id || vendor?.id}&vendorName=${encodeURIComponent(vendor?.storeName || '')}`}
              className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            >
              <FiMessageCircle size={28} />
            </Link>

            <div className="flex-1 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 'out_of_stock'}
                className={`flex-1 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border-2 ${product.stock === 'out_of_stock'
                  ? 'bg-slate-100 border-slate-200 text-slate-400'
                  : 'bg-white border-primary-600 text-primary-600 hover:bg-primary-50'
                  }`}
              >
                <FiShoppingBag size={18} strokeWidth={2.5} />
                {cartItem ? 'UPDATE CART' : 'ADD TO CART'}
              </button>

              <button
                onClick={() => {
                  if (!cartItem) handleAddToCart();
                  navigate('/checkout');
                }}
                disabled={product.stock === 'out_of_stock'}
                className={`flex-1 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl shadow-primary-200 ${product.stock === 'out_of_stock'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileProductDetail;

