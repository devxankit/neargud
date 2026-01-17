import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore, useUIStore } from '../../../store/useStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { formatPrice } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import LazyImage from '../../../components/LazyImage';
import { useState, useRef } from 'react';
import useLongPress from '../../../hooks/useLongPress';
import LongPressMenu from './LongPressMenu';
import FlyingItem from './FlyingItem';
import VendorBadge from '../../../modules/vendor/components/VendorBadge';
import { getVendorById } from '../../../modules/vendor/data/vendors';

const MobileProductCard = ({ product }) => {
  const productId = product._id || product.id;
  const addItem = useCartStore((state) => state.addItem);
  const triggerCartAnimation = useUIStore((state) => state.triggerCartAnimation);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const isFavorite = isInWishlist(productId);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showFlyingItem, setShowFlyingItem] = useState(false);
  const [flyingItemPos, setFlyingItemPos] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  const buttonRef = useRef(null);

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Get button position
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const startX = buttonRect ? buttonRect.left + buttonRect.width / 2 : 0;
    const startY = buttonRect ? buttonRect.top + buttonRect.height / 2 : 0;

    // Get cart bar position (prefer cart bar over header icon)
    setTimeout(() => {
      const cartBar = document.querySelector('[data-cart-bar]');
      let endX = window.innerWidth / 2;
      let endY = window.innerHeight - 100;

      if (cartBar) {
        const cartRect = cartBar.getBoundingClientRect();
        endX = cartRect.left + cartRect.width / 2;
        endY = cartRect.top + cartRect.height / 2;
      } else {
        // Fallback to cart icon in header
        const cartIcon = document.querySelector('[data-cart-icon]');
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
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: 1,
      applicableCoupons: product.applicableCoupons,
      isCouponEligible: product.isCouponEligible,
    });
    triggerCartAnimation();
  };

  const handleFavorite = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isFavorite) {
      removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
      });
      toast.success('Added to wishlist');
    }
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
        url: window.location.origin + `/app/product/${productId}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/app/product/${productId}`);
      toast.success('Link copied to clipboard');
    }
  };

  const longPressHandlers = useLongPress(handleLongPress, 500);

  return (
    <>
      <Link to={`/app/product/${productId}`} className="block">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-[1.5rem] overflow-hidden mb-4 border border-slate-100 shadow-sm transition-all active:shadow-md"
          {...longPressHandlers}
        >
          <div className="flex gap-4 p-3 items-center">
            {/* Product Image */}
            <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 p-1">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-slate-800 text-sm line-clamp-2 uppercase tracking-tight">
                  {product.name}
                </h3>
                <button
                  onClick={handleFavorite}
                  className={`flex-shrink-0 p-2 rounded-xl transition-all ${isFavorite ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}
                >
                  <FiHeart
                    size={16}
                    fill={isFavorite ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{product.unit}</span>
                {product.stock === 'low_stock' && (
                  <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 uppercase">Low Stock</span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900 tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-slate-400 line-through decoration-slate-300 font-bold">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {product.isBuy !== false && (
                  <button
                    ref={buttonRef}
                    onClick={handleAddToCart}
                    className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-200 active:scale-90 transition-transform"
                  >
                    <FiShoppingBag size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

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
          image={product.image}
          startPosition={flyingItemPos.start}
          endPosition={flyingItemPos.end}
          onComplete={() => setShowFlyingItem(false)}
        />
      )}
    </>
  );
};

export default MobileProductCard;

