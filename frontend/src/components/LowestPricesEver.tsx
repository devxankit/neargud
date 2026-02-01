import { useRef, useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTheme } from '../utils/themes';
// @ts-ignore
import { useContentStore } from '../store/contentStore';
// @ts-ignore
import { useCartStore } from '../store/useStore';
// @ts-ignore
import { useWishlistStore } from '../store/wishlistStore';
import { FiHeart, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface LowestPricesEverProps {
  activeTab?: string;
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Product Card Component - Defined outside to prevent recreation on every render
const ProductCard = memo(({
  product,
  theme
}: {
  product: any;
  theme: any;
}) => {
  const navigate = useNavigate();
  const toggleWishlist = useWishlistStore((state: any) => state.toggleWishlist);
  const productId = product._id || product.id;

  // Directly subscribe to state changes to trigger re-render
  const isFavorite = useWishlistStore((state: any) =>
    state.items.some((item: any) => (item._id || item.id) === productId)
  );

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleWishlist(product);
      if (isFavorite) {
        toast.success('Removed from wishlist');
      } else {
        toast.success('Added to wishlist');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update wishlist');
    }
  };

  const originalPrice = product.originalPrice || product.price * 1.2;
  const discount = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;





  const cardBgColor = hexToRgba(theme.accentColor, 0.05);
  const linkBgColor = hexToRgba(theme.accentColor, 0.12);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex-shrink-0 w-[140px]"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="bg-white rounded-lg overflow-hidden flex flex-col relative h-full" style={{ boxShadow: '0 1px 1px rgba(0, 0, 0, 0.03)' }}>
        <div onClick={() => navigate(`/app/product/${productId}`)} className="relative block cursor-pointer">
          <div className="w-full h-28 bg-neutral-100 flex items-center justify-center overflow-hidden relative">
            <img src={product.image || product.imageUrl || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-contain" />
            {discount > 0 && <div className="absolute top-1 left-1 z-10 text-white text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: theme.accentColor }}>{discount}% OFF</div>}
            <button
              onClick={handleFavorite}
              className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm bg-white/95 text-neutral-700"
              style={isFavorite ? { color: theme.accentColor, backgroundColor: hexToRgba(theme.accentColor, 0.1) } : {}}
            >
              <FiHeart size={10} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="p-1.5 flex-1 flex flex-col" style={{ background: cardBgColor }}>
          <div className="flex gap-0.5 mb-0.5">
            <div className="bg-neutral-200 text-neutral-700 text-[8px] font-medium px-1 py-0.5 rounded">{product.unit || '1 unit'}</div>
          </div>

          <div onClick={() => navigate(`/app/product/${productId}`)} className="mb-0.5 cursor-pointer">
            <h3 className="text-[10px] font-bold text-neutral-900 line-clamp-2 leading-tight">{product.name}</h3>
          </div>

          <div className="flex items-center gap-0.5 mb-0.5">
            <FiStar size={8} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[8px] text-neutral-500">({product.reviewCount || 85})</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-neutral-900">₹{product.price}</span>
              {originalPrice > product.price && <span className="text-[8px] text-neutral-400 line-through">₹{originalPrice}</span>}
            </div>
          </div>

          <div
            onClick={(e) => { e.stopPropagation(); navigate(`/app/product/${productId}`); }}
            className="w-full text-[8px] font-medium py-0.5 rounded-lg flex items-center justify-between px-1 transition-colors mt-2 cursor-pointer"
            style={{ backgroundColor: linkBgColor, color: theme.accentColor }}
          >
            <span>See more</span>
            <svg width="6" height="6" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L8 4L0 8Z" fill={theme.accentColor} /></svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default function LowestPricesEver({ activeTab = 'all' }: LowestPricesEverProps) {
  const { content } = useContentStore();
  const lowestPricesTitle = content?.homepage?.lowestPrices?.title || 'LOWEST PRICES EVER';
  const theme = getTheme(activeTab);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setFontLoaded(true), 300);
  }, []);

  const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscountedProducts = async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const { fetchPublicProducts } = await import('../services/publicApi');
      const res = await fetchPublicProducts({ limit: 10, hasDiscount: true, sort: '-discount' });
      if (res.success && res.data.products && res.data.products.length > 0) {
        setDiscountedProducts(res.data.products);
      } else {
        // Fallback mock data
        setDiscountedProducts([
          { _id: 'lp1', name: 'Super Saver Item', price: 99, originalPrice: 499, image: 'https://via.placeholder.com/300' },
          { _id: 'lp2', name: 'Budget Friendly', price: 149, originalPrice: 299, image: 'https://via.placeholder.com/300' },
          { _id: 'lp3', name: 'Mega Discount', price: 299, originalPrice: 999, image: 'https://via.placeholder.com/300' },
          { _id: 'lp4', name: 'Clearance Sale', price: 499, originalPrice: 1299, image: 'https://via.placeholder.com/300' },
          { _id: 'lp5', name: 'Store Special', price: 199, originalPrice: 399, image: 'https://via.placeholder.com/300' },
        ]);
      }
    } catch (error) {
      console.error("Error fetching discounted products:", error);
      // Fallback on error
      setDiscountedProducts([
        { _id: 'lp1', name: 'Super Saver Item', price: 99, originalPrice: 499, image: 'https://via.placeholder.com/300' },
        { _id: 'lp2', name: 'Budget Friendly', price: 149, originalPrice: 299, image: 'https://via.placeholder.com/300' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountedProducts();
  }, [activeTab]);


  if (discountedProducts.length === 0 && !loading) return null;

  return (
    <div className="relative w-full overflow-x-hidden pt-6 pb-6 mt-2" style={{
      background: `linear-gradient(to bottom, transparent 0%, ${theme.primary[3]} 15%, ${theme.secondary[2]} 100%)`,
    }}>
      <div className="px-4 relative z-20 mt-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px" style={{ backgroundColor: '#000', opacity: 0.2 }}></div>
          <h2 className="font-black text-[24px] text-center" style={{
            fontFamily: '"Poppins", sans-serif',
            opacity: fontLoaded ? 1 : 0,
            transition: 'opacity 0.2s',
            textShadow: '1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff, 0px 2px 4px rgba(0,0,0,0.1)',
            color: '#000'
          }}>
            {lowestPricesTitle}
          </h2>
          <div className="flex-1 h-px" style={{ backgroundColor: '#000', opacity: 0.2 }}></div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto scrollbar-hide px-4" style={{ scrollSnapType: 'x mandatory' }}>
        {loading ? [1, 2, 3, 4].map(i => <div key={i} className="flex-shrink-0 w-[140px] bg-white rounded-lg h-48 animate-pulse shadow-sm" />) : discountedProducts.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}
