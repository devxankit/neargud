import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import ProductCard from "../../../components/ProductCard";
import AnimatedBanner from "../components/AnimatedBanner";
import NewArrivalsSection from "../components/NewArrivalsSection";
import DailyDealsSection from "../components/DailyDealsSection";
import RecommendedSection from "../components/RecommendedSection";
import FeaturedVendorsSection from "../components/FeaturedVendorsSection";
import BrandLogosScroll from "../../../components/Home/BrandLogosScroll";
import LazyImage from "../../../components/LazyImage";
import { getMostPopular, getTrending, getFlashSale } from "../../../data/products";
import { categories } from "../../../data/categories";
import PageTransition from "../../../components/PageTransition";
import usePullToRefresh from "../../../hooks/usePullToRefresh";
import toast from "react-hot-toast";
import PromoStrip from "../../../components/PromoStrip";
import LowestPricesEver from "../../../components/LowestPricesEver";
import { useTheme } from "/src/context/ThemeContext";

const MobileHome = () => {
  const { activeTab } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [autoSlidePaused, setAutoSlidePaused] = useState(false);

  const slides = [
    { image: "/images/hero/slide1.png" },
    { image: "/images/hero/slide2.png" },
    { image: "/images/hero/slide3.png" },
    { image: "/images/hero/slide4.png" },
  ];

  const mostPopular = getMostPopular();
  const trending = getTrending();
  const flashSale = getFlashSale();

  // Auto-slide disabled - banners are manually scrollable only

  // Minimum swipe distance (in pixels) to trigger slide change
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    e.stopPropagation();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      setTouchStart(touch.clientX);
      setTouchEnd(null);
      setDragOffset(0);
      setAutoSlidePaused(true);
    }
  };

  const onTouchMove = (e) => {
    if (touchStart === null) return;
    e.stopPropagation();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const diff = touchStart - currentX;
      const containerWidth = e.currentTarget?.offsetWidth || 400;
      const maxDrag = containerWidth * 0.5;
      setDragOffset(Math.max(-maxDrag, Math.min(maxDrag, diff)));
      setTouchEnd(currentX);
    }
  };

  const onTouchEnd = (e) => {
    if (e) e.stopPropagation();

    if (touchStart === null) {
      setAutoSlidePaused(false);
      return;
    }

    const distance = touchStart - (touchEnd || touchStart);
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setDragOffset(0);
    setAutoSlidePaused(false);
  };

  // Pull to refresh handler
  const handleRefresh = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success("Refreshed");
        resolve();
      }, 1000);
    });
  };

  const {
    pullDistance,
    isPulling,
    isRefreshing,
    elementRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh(handleRefresh);

  return (
    <PageTransition>
      <MobileLayout>
        <div
          ref={elementRef}
          className="w-full overflow-x-hidden scrollbar-hide"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateY(${Math.min(pullDistance, 80)}px)`,
            transition: isPulling ? "none" : "transform 0.3s ease-out",
          }}>
          {/* PromoStrip - HOUSEFULL SALE Section with Hero Banner inside */}
          <PromoStrip
            activeTab={activeTab}
            heroBanner={
              <div className="py-2">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingLeft: '1.5rem' }}>
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 rounded-2xl overflow-hidden"
                      style={{
                        width: '75%',
                        maxWidth: '280px',
                        height: '320px',
                        scrollSnapAlign: 'start',
                        marginLeft: index === 0 ? '0' : '0'
                      }}>
                      <LazyImage
                        src={slide.image}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400x200?text=Banner+${index + 1}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          {/* LowestPricesEver Section */}
          <LowestPricesEver activeTab={activeTab} />

          {/* Brand Logos Scroll */}
          <div className="mt-6">
            <BrandLogosScroll />
          </div>

          {/* Featured Vendors Section */}
          <FeaturedVendorsSection />

          {/* Animated Banner */}
          <AnimatedBanner />

          {/* New Arrivals */}
          <NewArrivalsSection />

          {/* Promotional Banners */}
          <div className="py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4">
              <Link to="/app/offers" className="block flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative w-[calc(50vw-1.5rem)] h-32 rounded-xl overflow-hidden shadow-lg">
                  <LazyImage
                    src="/images/banners/babycare-WEB.avif"
                    alt="Baby Care"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Baby+Care";
                    }}
                  />
                </motion.div>
              </Link>
              <Link to="/app/offers" className="block flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative w-[calc(50vw-1.5rem)] h-32 rounded-xl overflow-hidden shadow-lg">
                  <LazyImage
                    src="/images/banners/pharmacy-WEB.avif"
                    alt="Pharmacy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Pharmacy";
                    }}
                  />
                </motion.div>
              </Link>
              <Link to="/app/offers" className="block flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative w-[calc(50vw-1.5rem)] h-32 rounded-xl overflow-hidden shadow-lg">
                  <LazyImage
                    src="/images/banners/Pet-Care_WEB.avif"
                    alt="Pet Care"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Pet+Care";
                    }}
                  />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Most Popular */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Most Popular</h2>
              <Link
                to="/app/search"
                className="text-sm text-primary-600 font-semibold">
                See All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mostPopular.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Daily Deals */}
          <DailyDealsSection />

          {/* Trending Banner */}
          <div className="px-4 py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative w-full h-40 rounded-xl overflow-hidden shadow-lg">
              <LazyImage
                src="/images/hero/banner2.png"
                alt="Trending Items Banner"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x300?text=Banner";
                }}
              />
            </motion.div>
          </div>

          {/* Flash Sale */}
          {flashSale.length > 0 && (
            <div className="px-4 py-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Flash Sale
                  </h2>
                  <p className="text-xs text-gray-600">Limited time offers</p>
                </div>
                <Link
                  to="/app/flash-sale"
                  className="text-sm text-primary-600 font-semibold">
                  See All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {flashSale.slice(0, 4).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Items */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Trending Now</h2>
              <Link
                to="/app/search"
                className="text-sm text-primary-600 font-semibold">
                See All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {trending.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommended for You */}
          <RecommendedSection />

          {/* Tagline Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="px-4 py-12 text-left"
          >
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-400 leading-tight flex items-center justify-start gap-3 flex-wrap"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span>Shop from 50+ Trusted Vendors</span>
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className="text-primary-500 inline-block"
              >
                <FiHeart className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl fill-primary-500" />
              </motion.span>
            </motion.h2>
          </motion.div>

          {/* Bottom Spacing */}
          <div className="h-4" />
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileHome;
