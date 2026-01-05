import React, { useState, useRef, useMemo } from "react";
import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
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
  // Check if we're in the mobile app section
  const isMobileApp = location.pathname.startsWith("/app");
  const productLink = isMobileApp
    ? `/app/product/${product.id}`
    : `/product/${product.id}`;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const triggerCartAnimation = useUIStore(
    (state) => state.triggerCartAnimation
  );

  const wishlistAddItem = useWishlistStore((state) => state.addItem);
  const wishlistRemoveItem = useWishlistStore((state) => state.removeItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);

  const isFavorite = isInWishlist(product.id);
  const [isAdding, setIsAdding] = useState(false);

  // Find current cart item - Memoized to prevent finding on every render if items haven't changed
  const cartItem = useMemo(() => cartItems.find((item) => item.id === product.id), [cartItems, product.id]);
  const inCartQty = cartItem?.quantity || 0;

  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showFlyingItem, setShowFlyingItem] = useState(false);
  const [flyingItemPos, setFlyingItemPos] = useState({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  });
  const buttonRef = useRef(null);

  // Memoize vendor to avoid repeated lookups
  const vendor = useMemo(() => product.vendorId ? getVendorById(product.vendorId) : null, [product.vendorId]);

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

    // Get cart bar position (prefer cart bar over header icon)
    setTimeout(() => {
      const cartBar = document.querySelector("[data-cart-bar]");
      let endX = window.innerWidth / 2;
      let endY = window.innerHeight - 100;

      if (cartBar) {
        const cartRect = cartBar.getBoundingClientRect();
        endX = cartRect.left + cartRect.width / 2;
        endY = cartRect.top + cartRect.height / 2;
      } else {
        // Fallback to cart icon in header
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
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
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

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      wishlistRemoveItem(product.id);
      toast.success("Removed from wishlist");
    } else {
      wishlistAddItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      toast.success("Added to wishlist");
    }
  };

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="rounded-xl overflow-hidden shadow-sm border border-gray-200 group cursor-pointer h-full flex flex-col bg-white"
        {...longPressHandlers}>
        <div className="relative">
          {/* Favorite Icon */}
          <div className="absolute top-1.5 right-1.5 z-10">
            <button
              onClick={handleFavorite}
              className="p-1 glass rounded-full shadow-lg transition-all duration-300 group hover:bg-white">
              <FiHeart
                className={`text-xs transition-all duration-300 ${isFavorite
                    ? "text-primary-700 fill-primary-700 scale-110"
                    : "text-gray-400 group-hover:text-primary-500"
                  }`}
              />
            </button>
          </div>

          {/* Product Image */}
          <Link to={productLink} className="block w-full">
            <div className="w-full aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden relative">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 mix-blend-multiply"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x300?text=Product+Image";
                }}
              />
            </div>
          </Link>
        </div>

        {/* Product Info */}
        <div className="p-2.5 flex-1 flex flex-col bg-white">
          <Link to={productLink}>
            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-xs transition-colors leading-tight min-h-[2.5em]">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] text-gray-500 mb-1 font-medium">
            {product.unit}
          </p>

          {/* Vendor Badge */}
          {vendor && (
            <div className="mb-2">
              <VendorBadge
                vendor={vendor}
                showVerified={true}
                size="sm"
                showLogo={true}
              />
            </div>
          )}

          {/* Rating */}
          {!hideRating && (
            <div className="flex items-center gap-1 mb-1.5">
              <div className="flex items-center bg-green-50 px-1 py-0.5 rounded border border-green-100">
                <span className="text-[9px] text-green-700 font-bold mr-0.5">
                  {product.rating || 4.2}
                </span>
                <FiStar className="text-[8px] text-green-700 fill-green-700" />
              </div>
              <span className="text-[9px] text-gray-400">
                ({product.reviewCount || 42})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && (
              <span className="text-[9px] font-bold text-green-600">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <LongPressMenu
        isOpen={showLongPressMenu}
        onClose={() => setShowLongPressMenu(false)}
        position={menuPosition}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleFavorite}
        onShare={handleShare}
        isInWishlist={isFavorite}
      />

      {showFlyingItem && (
        <FlyingItem
          image={product.image}
          startPosition={flyingItemPos.start}
          endPosition={flyingItemPos.end}
          onComplete={() => setShowFlyingItem(false)}
        />
      )}
    </>
  );
});

export default ProductCard;
