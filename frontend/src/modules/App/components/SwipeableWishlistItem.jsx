import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useCartStore } from '../../../store/useStore';
import { formatPrice } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import LazyImage from '../../../components/LazyImage';
import useSwipeGesture from '../../../hooks/useSwipeGesture';

const SwipeableWishlistItem = ({ item, index, onMoveToCart, onRemove }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleted, setIsDeleted] = useState(false);
  const deletedItemRef = useRef(null);
  const { removeItem, addItem: addToWishlist } = useWishlistStore();

  const handleSwipeRight = async () => {
    setIsDeleted(true);
    deletedItemRef.current = { ...item };
    const id = item._id || item.id;
    try {
      await onRemove(id);
      toast.success('Removed from wishlist', {
        duration: 3000,
        action: {
          label: 'Undo',
          onClick: async () => {
            if (deletedItemRef.current) {
              await addToWishlist(deletedItemRef.current);
              setIsDeleted(false);
              deletedItemRef.current = null;
              toast.success('Item restored');
            }
          },
        },
      });
    } catch (err) {
      setIsDeleted(false);
      toast.error('Failed to remove item');
    }
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeRight: handleSwipeRight,
    threshold: 100,
  });

  useEffect(() => {
    if (swipeHandlers.swipeState.isSwiping) {
      setSwipeOffset(Math.max(0, swipeHandlers.swipeState.offset));
    } else if (!swipeHandlers.swipeState.isSwiping && swipeOffset < 100) {
      setSwipeOffset(0);
    }
  }, [
    swipeHandlers.swipeState.isSwiping,
    swipeHandlers.swipeState.offset,
    swipeOffset,
  ]);

  if (isDeleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, x: swipeOffset }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="glass-card rounded-2xl p-4 mb-3 relative"
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
    >
      {/* Delete Background */}
      {swipeOffset > 0 && (
        <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-4">
          <FiTrash2 className="text-white text-xl" />
        </div>
      )}

      <div className="flex gap-4 relative z-10">
        {/* Product Image */}
        <Link to={`/app/product/${item._id || item.id}`} className="flex-shrink-0">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
            <LazyImage
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x200?text=Product';
              }}
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/app/product/${item._id || item.id}`}>
            <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">
              {item.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-lg font-bold text-primary-600">
              {formatPrice(item.price)}
            </p>
            {item.originalPrice && (
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(item.originalPrice)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {item.isBuy !== false ? (
              <button
                onClick={() => onMoveToCart(item)}
                className="flex-1 py-2.5 gradient-green text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-glow-green transition-all"
              >
                <FiShoppingBag className="text-base" />
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="flex-1 py-2.5 bg-gray-50 text-gray-400 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-100 cursor-not-allowed"
              >
                Not Buyable
              </button>
            )}
            <button
              onClick={() => onRemove(item._id || item.id)}
              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
              <FiTrash2 className="text-base" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeableWishlistItem;

