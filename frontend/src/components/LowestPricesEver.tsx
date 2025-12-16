import { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { getTheme } from '../utils/themes';
import { useCartStore } from '../store/useStore';

interface LowestPricesEverProps {
  activeTab?: string;
}

// Product Card Component - Defined outside to prevent recreation on every render
const ProductCard = memo(({ 
  product, 
  cartQuantity,
  onAddToCart,
  onUpdateQuantity
}: { 
  product: any; 
  cartQuantity: number;
  onAddToCart: (product: any, element?: HTMLElement | null) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}) => {
  const navigate = useNavigate();
  
  // Calculate discount - use originalPrice if available, otherwise calculate from price
  const originalPrice = product.originalPrice || product.price * 1.2; // Fallback if no originalPrice
  const discount = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;

  // Use cartQuantity from props
  const inCartQty = cartQuantity;

  return (
    <div
      className="flex-shrink-0 w-[140px]"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="bg-white rounded-lg overflow-hidden flex flex-col relative h-full" style={{ boxShadow: '0 1px 1px rgba(0, 0, 0, 0.03)' }}>
        {/* Product Image Area */}
        <div
          onClick={() => navigate(`/product/${product.id}`)}
          className="relative block cursor-pointer"
        >
          <div className="w-full h-28 bg-neutral-100 flex items-center justify-center overflow-hidden relative">
            {product.image || product.imageUrl ? (
              <img
                src={product.image || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-4xl">
                {product.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Red Discount Badge - Top Left */}
            {discount > 0 && (
              <div className="absolute top-1 left-1 z-10 bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                {discount}% OFF
              </div>
            )}

            {/* Heart Icon - Top Right */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle wishlist toggle
              }}
              className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
              aria-label="Add to wishlist"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-neutral-700"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* ADD Button or Quantity Stepper - Overlaid on bottom right of image */}
            <div className="absolute bottom-1.5 right-1.5 z-10">
              <AnimatePresence mode="wait">
                {inCartQty === 0 ? (
                  <motion.button
                    key="add-button"
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddToCart(product, e.currentTarget);
                    }}
                    className="bg-white/95 backdrop-blur-sm text-orange-600 border-2 border-orange-600 text-[10px] font-semibold px-2 py-1 rounded shadow-md hover:bg-white transition-colors"
                  >
                    ADD
                  </motion.button>
                ) : (
                  <motion.div
                    key="stepper"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 bg-orange-600 rounded px-1.5 py-1 shadow-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onUpdateQuantity(product.id.toString(), inCartQty - 1);
                      }}
                      className="w-4 h-4 flex items-center justify-center text-white font-bold hover:bg-orange-700 rounded transition-colors p-0 leading-none"
                      style={{ lineHeight: 1, fontSize: '14px' }}
                    >
                      <span className="relative top-[-1px]">−</span>
                    </motion.button>
                    <motion.span
                      key={inCartQty}
                      initial={{ scale: 1.2, y: -2 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="text-white font-bold min-w-[0.75rem] text-center"
                      style={{ fontSize: '12px' }}
                    >
                      {inCartQty}
                    </motion.span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onUpdateQuantity(product.id.toString(), inCartQty + 1);
                      }}
                      className="w-4 h-4 flex items-center justify-center text-white font-bold hover:bg-orange-700 rounded transition-colors p-0 leading-none"
                      style={{ lineHeight: 1, fontSize: '14px' }}
                    >
                      <span className="relative top-[-1px]">+</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-1.5 flex-1 flex flex-col" style={{ background: '#fef2f2' }}>
          {/* Light Grey Tags */}
          <div className="flex gap-0.5 mb-0.5">
            <div className="bg-neutral-200 text-neutral-700 text-[8px] font-medium px-1 py-0.5 rounded">
              {product.unit || '1 unit'}
            </div>
            {product.unit && (product.unit.includes('g') || product.unit.includes('kg')) && (
              <div className="bg-neutral-200 text-neutral-700 text-[8px] font-medium px-1 py-0.5 rounded">
                {product.unit.replace(/[gk]/gi, '').trim()} GSM
              </div>
            )}
          </div>

          {/* Product Name */}
          <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="mb-0.5 cursor-pointer"
          >
            <h3 className="text-[10px] font-bold text-neutral-900 line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-0.5 mb-0.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill={i < Math.floor(product.rating || 4) ? '#fbbf24' : '#e5e7eb'}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-[8px] text-neutral-500">({product.reviewCount || 85})</span>
          </div>

          {/* Delivery Time */}
          <div className="text-[9px] text-neutral-600 mb-0.5">
            20 MINS
          </div>

          {/* Discount - Blue Text */}
          {discount > 0 && (
            <div className="text-[9px] text-blue-600 font-semibold mb-0.5">
              {discount}% OFF
            </div>
          )}

          {/* Price */}
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-bold text-neutral-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {originalPrice && originalPrice > product.price && (
                <span className="text-[10px] text-neutral-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Link */}
          <Link
            to={`/app/category/${product.categoryId || 'all'}`}
            className="w-full bg-red-100 text-red-700 text-[8px] font-medium py-0.5 rounded-lg flex items-center justify-between px-1 hover:bg-red-200 transition-colors mt-auto"
          >
            <span>See more like this</span>
            <div className="flex items-center gap-0.5">
              <div className="w-px h-2 bg-red-300"></div>
              <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0L8 4L0 8Z" fill="#dc2626"/>
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if the product ID or cart quantity changes
  // Functions are stable references, so we don't need to compare them
  return (
    prevProps.product.id === nextProps.product.id && 
    prevProps.cartQuantity === nextProps.cartQuantity
  );
});

ProductCard.displayName = 'ProductCard';

export default function LowestPricesEver({ activeTab = 'all' }: LowestPricesEverProps) {
  const theme = getTheme(activeTab);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((state) => state.items);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Preload and wait for font to load to prevent FOUT
  useEffect(() => {
    if (document.fonts && document.fonts.check) {
      // Check if font is already loaded
      if (document.fonts.check('1em "Poppins"')) {
        setFontLoaded(true);
        return;
      }

      // Wait for font to load
      const checkFont = async () => {
        try {
          await document.fonts.load('1em "Poppins"');
          setFontLoaded(true);
        } catch (e) {
          // Fallback: show after timeout
          setTimeout(() => setFontLoaded(true), 300);
        }
      };

      checkFont();
    } else {
      // Fallback for browsers without Font Loading API
      setTimeout(() => setFontLoaded(true), 300);
    }
  }, []);

  // Memoize cart items lookup for performance
  const cartItemsMap = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      map.set(item.id.toString(), item.quantity);
    });
    return map;
  }, [items]);

  // Category keyword mapping for filtering products
  const categoryKeywordMap: Record<string, string[]> = {
    fashion: ['t-shirt', 'shirt', 'jeans', 'dress', 'gown', 'skirt', 'blazer', 'jacket', 'cardigan', 'sweater', 'flannel', 'maxi', 'sneakers', 'pumps', 'boots', 'heels', 'shoes', 'bag', 'crossbody', 'handbag', 'necklace', 'watch', 'wristwatch', 'sunglasses', 'belt', 'scarf'],
    wedding: ['sneakers', 'pumps', 'boots', 'heels', 'shoes'],
    electronics: ['bag', 'crossbody', 'handbag'],
    beauty: ['necklace', 'watch', 'wristwatch'],
    winter: ['sunglasses', 'belt', 'scarf'],
    sports: ['athletic', 'running', 'track', 'sporty'],
    grocery: ['snacks', 'atta-rice', 'dairy-breakfast', 'masala-oil', 'biscuits-bakery', 'cold-drinks', 'fruits-veg'],
  };

  // Get products with discounts for this section, filtered by activeTab
  const getFilteredProducts = () => {
    let filtered = products;
    
    if (activeTab !== 'all') {
      const keywords = categoryKeywordMap[activeTab] || [];
      if (keywords.length > 0) {
        filtered = products.filter((product) => {
          const productName = product.name.toLowerCase();
          return keywords.some((keyword) => productName.includes(keyword));
        });
      }
    }
    
    return filtered
      .filter((product) => {
        if (!product.originalPrice) return false;
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        return discount > 0;
      })
      .slice(0, 10); // Show top 10 discounted products
  };

  const discountedProducts = getFilteredProducts();

  // Get cart functions once at parent level
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // Memoize callbacks to prevent ProductCard re-renders
  const handleAddToCart = useCallback((product: any, element?: HTMLElement | null) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.imageUrl,
      quantity: 1,
    });
  }, [addItem]);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  }, [updateQuantity]);

  // Don't render if no products found
  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative w-full overflow-x-hidden"
      style={{
        background: `linear-gradient(to bottom, ${theme.primary[3]}, ${theme.primary[3]}, ${theme.secondary[1]}, ${theme.secondary[2]})`,
        marginTop: '0px', // No gap for seamless blend
        paddingTop: '12px',
        paddingBottom: '16px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* White Zip/Scalloped Divider at Top - Upward-pointing semicircles */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '30px', zIndex: 10, opacity: 0.95 }}>
        <svg
          viewBox="0 0 1200 30"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ display: 'block' }}
        >
          {/* White scalloped pattern with upward semicircles - clearly visible */}
          <path
            d="M0,30 L0,15 
               Q25,0 50,15 
               T100,15 
               T150,15 
               T200,15 
               T250,15 
               T300,15 
               T350,15 
               T400,15 
               T450,15 
               T500,15 
               T550,15 
               T600,15 
               T650,15 
               T700,15 
               T750,15 
               T800,15 
               T850,15 
               T900,15 
               T950,15 
               T1000,15 
               T1050,15 
               T1100,15 
               T1150,15 
               L1200,15 
               L1200,30 Z"
            fill="white"
            stroke="white"
            strokeWidth="0"
          />
        </svg>
      </div>

      {/* LOWEST PRICES EVER Banner */}
      <div className="px-4 relative z-20" style={{ marginTop: '30px', marginBottom: '12px' }} data-section="lowest-prices">
        <div className="flex items-center justify-center gap-2 mb-1">
          {/* Left horizontal line */}
          <div className="flex-1 h-px bg-neutral-300"></div>
          
          <h2 
            className="font-black text-center whitespace-nowrap"
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '28px',
                color: '#000000',
                opacity: fontLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-in',
                textShadow: 
                  '-1.5px -1.5px 0 white, 1.5px -1.5px 0 white, -1.5px 1.5px 0 white, 1.5px 1.5px 0 white, ' +
                  '-1.5px 0px 0 white, 1.5px 0px 0 white, 0px -1.5px 0 white, 0px 1.5px 0 white, ' +
                  '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, ' +
                  '3px 3px 4px rgba(0, 0, 0, 0.5), ' +
                  '2px 2px 3px rgba(0, 0, 0, 0.6), ' +
                  '1px 1px 2px rgba(0, 0, 0, 0.7), ' +
                  '0px 2px 1px rgba(0, 0, 0, 0.4)',
                letterSpacing: '0.8px',
                fontWeight: 900,
                lineHeight: '1.1',
                transform: 'perspective(500px) rotateX(2deg) rotateY(-1deg)',
                transformStyle: 'preserve-3d',
              } as React.CSSProperties}
          >
            LOWEST PRICES EVER
          </h2>
          
          {/* Right horizontal line */}
          <div className="flex-1 h-px bg-neutral-300"></div>
        </div>
      </div>

      {/* Horizontal Scrollable Product Cards */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {discountedProducts.map((product) => {
          const cartQuantity = cartItemsMap.get(product.id.toString()) || 0;
          return (
            <ProductCard 
              key={product.id} 
              product={product} 
              cartQuantity={cartQuantity}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
            />
          );
        })}
      </div>
    </div>
  );
}

