import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
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
import HeroCarousel from "../components/HeroCarousel";
import HomeCategoryBubble from "../components/HomeCategoryBubble";
import TrendingReelsSection from "../components/TrendingReelsSection";
import LazyImage from "../../../components/LazyImage";
// import GreetingBar from "../components/GreetingBar";
import {
  fetchActiveBanners,
  fetchPublicProducts,
  fetchPublicVendors,
  fetchRecommendedProducts,
  fetchPublicBrands,
  fetchPublicCategories,
  fetchPublicReels
} from "../../../services/publicApi";
import { useAuthStore } from "../../../store/authStore";
import { useSettingsStore } from "../../../store/settingsStore";
import { useLocationStore } from "../../../store/locationStore";
import { useContentStore } from "../../../store/contentStore";
import { useUIStore } from "../../../store/useStore";
import { useTheme } from "../../../context/ThemeContext.jsx";
import ProductSkeleton from "../../../components/Skeletons/ProductCardSkeleton";
import usePullToRefresh from "../../../hooks/usePullToRefresh";
import toast from "react-hot-toast";
import PromoStrip from "../../../components/PromoStrip.jsx";
import LowestPricesEver from "../../../components/LowestPricesEver.jsx";
import PageTransition from "../../../components/PageTransition";
import { getTheme } from "../../../utils/themes.js";

// Skeletons
import HeroCarouselSkeleton from "../../../components/Skeletons/HeroCarouselSkeleton";
import CategoryBubblesSkeleton from "../../../components/Skeletons/CategoryBubblesSkeleton";
import PromoStripSkeleton from "../../../components/Skeletons/PromoStripSkeleton";
import VendorsSkeleton from "../../../components/Skeletons/VendorsSkeleton";
import ProductGridSkeleton from "../../../components/Skeletons/ProductGridSkeleton";

const MobileHome = () => {
  const { activeTab } = useTheme();
  const theme = getTheme(activeTab);
  const { user } = useAuthStore();
  const { settings, initialize: initializeSettings } = useSettingsStore();
  const { currentCity } = useLocationStore();

  const { content, fetchAllContent } = useContentStore();

  useEffect(() => {
    initializeSettings();
    fetchAllContent();
    // Force scroll to top on mount/return to home - repeated to override browser native behaviors
    const timers = [0, 50, 150].map(delay =>
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), delay)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [reels, setReels] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  // Loading states for progressive rendering
  const [loadingCritical, setLoadingCritical] = useState(true);
  const [loadingSecondary, setLoadingSecondary] = useState(true);
  const [loadingTertiary, setLoadingTertiary] = useState(true);

  // Track if data has been fetched to prevent double calls
  const hasFetchedRef = useRef(false);

  // Critical Data: Banners & Categories (Needed for "Above the Fold" content)
  const fetchCriticalData = async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    try {
      setLoadingCritical(true);
      const [bannersRes, categoriesRes] = await Promise.all([
        fetchActiveBanners({ city: currentCity?.name || '' }),
        fetchPublicCategories()
      ]);

      if (bannersRes.success) setBanners(bannersRes.data.banners || []);

      let validCategories = [];
      if (categoriesRes.success) {
        validCategories = (categoriesRes.data.categories || []).filter(cat => !cat.parentId);
        setCategories(validCategories);
        // Fetch product images for top 4 categories (for category cards display)
        if (validCategories.length > 0) {
          fetchCategoryProducts(validCategories.slice(0, 4));
        }
      }

      // Start fetching Secondary data once Critical is done
      fetchSecondaryData();
    } catch (error) {
      console.error("Critical Fetch Error:", error);
    } finally {
      setLoadingCritical(false);
    }
  };

  // Fetch products for category cards display
  const fetchCategoryProducts = async (catList) => {
    try {
      const productPromises = catList.map(cat =>
        fetchPublicProducts({ categoryId: cat._id || cat.id, limit: 4 })
      );
      const results = await Promise.all(productPromises);
      const newMap = {};
      results.forEach((res, index) => {
        if (res.success) {
          const catId = catList[index]._id || catList[index].id;
          newMap[catId] = res.data.products || [];
        }
      });
      setCategoryProducts(prev => ({ ...prev, ...newMap }));
    } catch (e) { console.error("Category product fetch error", e); }
  };

  // Secondary Data: Discounted Products, Vendors, Trending Reels
  const fetchSecondaryData = async () => {
    try {
      setLoadingSecondary(true);
      const [discountRes, vendorsRes, reelsRes] = await Promise.all([
        fetchPublicProducts({ limit: 10, hasDiscount: true, sort: '-discount' }),
        fetchPublicVendors({ limit: 6 }),
        fetchPublicReels({ limit: 10 })
      ]);

      if (discountRes.success) setDiscountedProducts(discountRes.data.products || []);
      if (vendorsRes.success) setVendors(vendorsRes.data.vendors || []);
      if (reelsRes.success) setReels(reelsRes.data.reels || []);

      // Start fetching Tertiary data
      fetchTertiaryData();
    } catch (error) {
      console.error("Secondary Fetch Error:", error);
    } finally {
      setLoadingSecondary(false);
    }
  };

  // Tertiary Data: New Arrivals, Recommended, Brands
  const fetchTertiaryData = async () => {
    try {
      setLoadingTertiary(true);
      const [arrivalsRes, recRes, brandsRes] = await Promise.all([
        fetchPublicProducts({ limit: 6, sort: '-createdAt' }),
        fetchRecommendedProducts({ limit: 10 }),
        fetchPublicBrands()
      ]);

      if (arrivalsRes.success) setNewArrivals(arrivalsRes.data.products || []);
      if (recRes.success) setRecommended(recRes.data.products || []);
      if (brandsRes.success) setBrands(brandsRes.data.brands || []);
    } catch (error) {
      console.error("Tertiary Fetch Error:", error);
    } finally {
      setLoadingTertiary(false);
    }
  };

  useEffect(() => {
    fetchCriticalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount, currentCity change handled via ref reset

  // Track last fetched city to refetch banners when city changes
  const lastFetchedCityRef = useRef(null);

  // Refetch banners when city changes (after initial load)
  useEffect(() => {
    const cityName = currentCity?.name || '';

    // Skip if this is the initial load (lastFetchedCityRef is null) or city hasn't changed
    if (lastFetchedCityRef.current === null) {
      lastFetchedCityRef.current = cityName;
      return;
    }

    if (lastFetchedCityRef.current !== cityName) {
      lastFetchedCityRef.current = cityName;
      // Refetch only banners when city changes
      const refetchBanners = async () => {
        try {
          const bannersRes = await fetchActiveBanners({ city: cityName });
          if (bannersRes.success) setBanners(bannersRes.data.banners || []);
        } catch (error) {
          console.error("Error refetching banners:", error);
        }
      };
      refetchBanners();
    }
  }, [currentCity]);

  const handleRefresh = async () => {
    hasFetchedRef.current = false; // Reset to allow refetch
    await fetchCriticalData();
  };

  const elementRef = useRef(null);
  const {
    pullDistance,
    isPulling,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh(handleRefresh);

  // ... (Keep other hooks) ...
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const headerHeight = useUIStore(state => state.headerHeight);
  const homeBackground = `linear-gradient(to bottom, ${theme.primary[0]} 0px, ${theme.primary[1]} ${headerHeight}px, ${theme.primary[2]} 100%)`;

  return (
    <PageTransition>
      <div
        ref={elementRef}
        className="w-full overflow-x-hidden scrollbar-hide min-h-screen"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${Math.min(pullDistance, 80)}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
        }}>

        <div style={{ background: homeBackground, paddingTop: `${headerHeight + 2}px` }}>
          <PromoStrip
            activeTab={activeTab}
            categories={categories}
            categoryProducts={categoryProducts}
            crazyDeals={discountedProducts}
            heroBanner={
              <HeroCarousel banners={banners} loading={loadingCritical} />
            }
          />

          {/* Featured Categories Bubbles */}
          {/* <HomeCategoryBubble categories={categories} loading={loading} /> */}

          {/* LowestPricesEver Section - Uses products from parent */}
          <LowestPricesEver activeTab={activeTab} products={discountedProducts} loading={loadingSecondary} />
        </div>

        {/* White background area for the rest of the page */}
        <div className="bg-[#f8fafc]">
          {/* Brand Logos Scroll */}
          <div className="py-2">
            <BrandLogosScroll brands={brands} loading={loadingTertiary} />
          </div>

          <FeaturedVendorsSection vendors={vendors} loading={loadingSecondary} theme={theme} />

          {/* Trending Reels section can be here or below */}
          <TrendingReelsSection reels={reels} loading={loadingSecondary} />

          <NewArrivalsSection products={newArrivals} loading={loadingTertiary} theme={theme} />

          {/* Optional Promotional Banners */}
          <div className="px-4 md:px-8 lg:px-12 py-4 max-w-screen-2xl mx-auto">
            <AnimatedBanner
              title="Flash Sale"
              subtitle="Up to 70% Off"
              image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop"
              theme={theme}
            />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="px-4 md:px-8 lg:px-12 py-8 max-w-screen-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Most Popular</h2>
              <Link to="/app/category/all" className="text-sm md:text-base font-bold" style={{ color: theme.accentColor }}>View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
              {loadingTertiary ? (
                Array(10).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                recommended.slice(0, 10).map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <DailyDealsSection products={discountedProducts} loading={loadingSecondary} theme={theme} />

          {/* More promotional content */}
          <div className="px-4 md:px-8 lg:px-12 py-4 max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-5 lg:gap-6">
              <AnimatedBanner
                title="New Season"
                image="https://images.unsplash.com/photo-1445205170230-053b830c6050?w=800&auto=format&fit=crop"
                compact
                theme={theme}
              />
              <AnimatedBanner
                title="Sports Gear"
                image="https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&auto=format&fit=crop"
                compact
                theme={theme}
              />
            </div>
          </div>

          <RecommendedSection products={recommended} loading={loadingTertiary} theme={theme} />

          {/* Final push tagline */}
          <div className="py-12 px-6 text-center">
            <h3 className="text-4xl font-black text-gray-200 opacity-50 mb-2 italic">NEARGUD</h3>
            <p className="text-gray-400 font-medium tracking-widest text-xs uppercase">Your Neighborhood, Delivered.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MobileHome;
