import React, { useState, useRef, useMemo } from "react";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore, useUIStore } from "../store/useStore";
import { useWishlistStore } from "../store/wishlistStore";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";
import LazyImage from "./LazyImage";
import useLongPress from "../hooks/useLongPress";
import LongPressMenu from "../modules/App/components/LongPressMenu";
import FlyingItem from "../modules/App/components/FlyingItem";
import VendorBadge from "../modules/vendor/components/VendorBadge";
import { getVendorById } from "../modules/vendor/data/vendors";

const ProductCard = React.memo(({ product, hideRating = false }) => {
  const location = useLocation();
  const productId = product._id || product.id;

  // Check if we're in the mobile app section
  const isMobileApp = location.pathname.startsWith("/app");
  const productLink = isMobileApp
    ? `/app/product/${productId}`
    : `/product/${productId}`;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const triggerCartAnimation = useUIStore(
    (state) => state.triggerCartAnimation,
  );

  const wishlistAddItem = useWishlistStore((state) => state.addItem);
  const wishlistRemoveItem = useWishlistStore((state) => state.removeItem);

  // Directly subscribe to state changes to trigger re-render
  const isFavorite = useWishlistStore((state) =>
    state.items.some((item) => (item._id || item.id) === productId),
  );
  const [isAdding, setIsAdding] = useState(false);

  // Find current cart item
  const cartItem = useMemo(
    () => cartItems.find((item) => item.id === productId),
    [cartItems, productId],
  );
  const inCartQty = cartItem?.quantity || 0;

  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showFlyingItem, setShowFlyingItem] = useState(false);
  const [flyingItemPos, setFlyingItemPos] = useState({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  });
  const buttonRef = useRef(null);

  // Memoize vendor to support both populated object and static lookup
  const vendor = useMemo(() => {
    if (product.vendorId && typeof product.vendorId === "object") {
      return product.vendorId;
    }
    return product.vendorId ? getVendorById(product.vendorId) : null;
  }, [product.vendorId]);

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsAdding(true);

    // Get button position
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const startX = buttonRect ? buttonRect.left + buttonRect.width / 2 : 0;
    const startY = buttonRect ? buttonRect.top + buttonRect.height / 2 : 0;

    // Get cart bar position
    setTimeout(() => {
      const cartBar = document.querySelector("[data-cart-bar]");
      let endX = window.innerWidth / 2;
      let endY = window.innerHeight - 100;

      if (cartBar) {
        const cartRect = cartBar.getBoundingClientRect();
        endX = cartRect.left + cartRect.width / 2;
        endY = cartRect.top + cartRect.height / 2;
      } else {
        const cartIcon = document.querySelector("[data-cart-icon]");
        if (cartIcon) {
          const cartRect = cartIcon.getBoundingClientRect();
          endX = cartRect.left + cartRect.width / 2;
          endY = cartRect.top + cartRect.height / 2;
        }
      }

      setFlyingItemPos({
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
      });
      setShowFlyingItem(true);
    }, 50);

    addItem({
      id: productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || product.image,
      quantity: 1,
      applicableCoupons: product.applicableCoupons,
      isCouponEligible: product.isCouponEligible,
    });
    triggerCartAnimation();
    toast.success("Added to cart!");
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleLongPress = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setShowLongPressMenu(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: window.location.origin + productLink,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + productLink);
      toast.success("Link copied to clipboard");
    }
  };

  const longPressHandlers = useLongPress(handleLongPress, 500);

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate(isMobileApp ? "/app/login" : "/login", {
        state: { from: location },
      });
      return;
    }
    try {
      await toggleWishlist(product);
      if (!isFavorite) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update wishlist");
    }
  };

  // Memoize discount calculation
  const discount = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
    }
    return 0;
  }, [product.price, product.originalPrice]);

  return (
    <>
      <div
        className="product-card rounded-xl overflow-hidden shadow-sm border border-gray-200 group cursor-pointer h-full flex flex-col bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-98"
        {...longPressHandlers}>
        <div className="relative">
          <div className="absolute top-1.5 right-1.5 z-10 md:top-3 md:right-3">
            <button
              onClick={handleFavorite}
              className="p-1 md:p-2 glass rounded-full shadow-lg transition-all duration-300 group hover:bg-white">
              <FiHeart
                className={`text-xs md:text-sm transition-all duration-300 ${isFavorite
                  ? "text-primary-700 fill-primary-700 scale-110"
                  : "text-gray-400 group-hover:text-primary-500"
                  }`}
              />
            </button>
          </div>

          <Link to={productLink} className="block w-full">
            <div className="w-full aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden relative">
              <LazyImage
                src={product.images?.[0] || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-2 md:p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </Link>
        </div>

        <div className="p-2.5 md:p-4 flex-1 flex flex-col bg-white">
          <Link to={productLink}>
            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-xs md:text-sm lg:text-base transition-colors leading-tight min-h-[2.5em] group-hover:text-primary-600">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] md:text-xs text-gray-500 mb-1 font-medium">
            {product.unit}
          </p>

          {vendor && (
            <div className="mb-2 md:mb-3">
              <VendorBadge
                vendor={vendor}
                showVerified={true}
                size="sm"
                showLogo={true}
              />
            </div>
          )}

          {!hideRating && product.rating > 0 && product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-1.5 md:mb-2 text-xs md:text-sm">
              <div className="flex items-center bg-green-50 px-1 py-0.5 md:px-1.5 md:py-1 rounded border border-green-100">
                <span className="text-[9px] md:text-xs text-green-700 font-bold mr-0.5">
                  {product.rating}
                </span>
                <FiStar className="text-[8px] md:text-xs text-green-700 fill-green-700" />
              </div>
              <span className="text-[9px] md:text-xs text-gray-400">
                ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="flex items-center flex-wrap gap-1.5 mt-auto">
            <span className="text-sm md:text-base lg:text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[9px] md:text-xs font-bold text-green-600">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>
      </div>

      <LongPressMenu
        isOpen={showLongPressMenu}
        onClose={() => setShowLongPressMenu(false)}
        position={menuPosition}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleFavorite}
        onShare={handleShare}
        isInWishlist={isFavorite}
        isBuy={product.isBuy}
      />

      {showFlyingItem && (
        <FlyingItem
          image={product.images?.[0] || product.image}
          startPosition={flyingItemPos.start}
          endPosition={flyingItemPos.end}
          onComplete={() => setShowFlyingItem(false)}
        />
      )}
    </>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
