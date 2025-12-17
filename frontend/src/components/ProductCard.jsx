import { FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useCartStore, useUIStore } from "../store/useStore";
import { useWishlistStore } from "../store/wishlistStore";
import { formatPrice } from "../utils/helpers";
import toast from "react-hot-toast";
import LazyImage from "./LazyImage";
import { useState, useRef } from "react";
import useLongPress from "../hooks/useLongPress";
import LongPressMenu from "../modules/App/components/LongPressMenu";
import FlyingItem from "../modules/App/components/FlyingItem";
import VendorBadge from "../modules/vendor/components/VendorBadge";
import { getVendorById } from "../modules/vendor/data/vendors";

const ProductCard = ({ product, hideRating = false }) => {
  const location = useLocation();
  // Check if we're in the mobile app section
  const isMobileApp = location.pathname.startsWith("/app");
  const productLink = isMobileApp
    ? `/app/product/${product.id}`
    : `/product/${product.id}`;
  const { items: cartItems, addItem, updateQuantity } = useCartStore();
  const triggerCartAnimation = useUIStore(
    (state) => state.triggerCartAnimation
  );
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const isFavorite = isInWishlist(product.id);
  const [isAdding, setIsAdding] = useState(false);

  // Find current cart item
  const cartItem = cartItems.find((item) => item.id === product.id);
  const inCartQty = cartItem?.quantity || 0;
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showFlyingItem, setShowFlyingItem] = useState(false);
  const [flyingItemPos, setFlyingItemPos] = useState({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  });
  const buttonRef = useRef(null);
  const cartIconRef = useRef(null);

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
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
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
        style={{ willChange: "transform", transform: "translateZ(0)" }}
        className="rounded-xl overflow-hidden shadow-sm border border-gray-200 group cursor-pointer h-full flex flex-col bg-gradient-to-b from-neutral-100 to-red-50"
        {...longPressHandlers}>
        <div className="relative">
          {/* Favorite Icon */}
          <div className="absolute top-1.5 right-1.5 z-10">
            <button
              onClick={handleFavorite}
              className="p-1 glass rounded-full shadow-lg transition-all duration-300 group">
              <FiHeart
                className={`text-xs transition-all duration-300 ${
                  isFavorite
                    ? "text-red-500 fill-red-500 scale-110"
                    : "text-gray-600"
                }`}
              />
            </button>
          </div>

          {/* Product Image */}
          <Link to={productLink}>
            <div className="w-full h-32 bg-neutral-100 flex items-center justify-center overflow-hidden relative">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain max-w-[85%] max-h-[85%]"
                style={{ willChange: "transform", transform: "translateZ(0)" }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x300?text=Product+Image";
                }}
              />
            </div>
          </Link>
        </div>

        {/* Product Info */}
        <div className="p-2 flex-1 flex flex-col bg-red-50/80">
          <Link to={productLink}>
            <h3 className="font-bold text-gray-800 mb-0.5 line-clamp-2 text-xs transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] text-gray-500 mb-0.5 font-medium">
            {product.unit}
          </p>
          
          {/* Vendor Badge */}
          {product.vendorId && (
            <div className="mb-1">
              <VendorBadge 
                vendor={getVendorById(product.vendorId)} 
                showVerified={true}
                size="sm"
                showLogo={true}
              />
            </div>
          )}

          {/* Rating */}
          {product.rating && !hideRating && (
            <div className="flex items-center gap-0.5 mb-0.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`text-[8px] ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] text-gray-600 font-medium">
                {product.rating}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-gray-800">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[9px] text-gray-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add Button or Quantity Control */}
          {inCartQty === 0 ? (
          <motion.button
            ref={buttonRef}
            onClick={handleAddToCart}
            disabled={product.stock === "out_of_stock" || isAdding}
            whileTap={{ scale: 0.95 }}
            animate={
              isAdding
                ? {
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            style={{ willChange: "transform", transform: "translateZ(0)" }}
              className={`w-full py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1 mt-auto border-2 ${
              product.stock === "out_of_stock"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
                  : "border-red-600 text-red-600 bg-transparent hover:bg-red-50"
              }`}>
              <FiShoppingBag className="text-xs transition-transform" />
            <span>
              {product.stock === "out_of_stock"
                ? "Out of Stock"
                : isAdding
                ? "Adding..."
                  : "ADD"}
            </span>
          </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-2 bg-red-600 rounded-lg px-2 py-1.5 mt-auto"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (inCartQty > 1) {
                    updateQuantity(product.id, inCartQty - 1);
                  } else {
                    // Remove from cart if quantity becomes 0
                    updateQuantity(product.id, 0);
                  }
                }}
                className="w-6 h-6 flex items-center justify-center text-white font-bold hover:bg-red-700 rounded transition-colors"
              >
                −
              </motion.button>
              <motion.span
                key={inCartQty}
                initial={{ scale: 1.2, y: -4 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="text-sm font-bold text-white min-w-[1.5rem] text-center"
              >
                {inCartQty}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, inCartQty + 1);
                }}
                className="w-6 h-6 flex items-center justify-center text-white font-bold hover:bg-red-700 rounded transition-colors"
              >
                +
              </motion.button>
            </motion.div>
          )}
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
};

export default ProductCard;
