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
import { useTheme } from "../../../context/ThemeContext";
import ProductSkeleton from "../../../components/Skeletons/ProductCardSkeleton";
import usePullToRefresh from "../../../hooks/usePullToRefresh";
import toast from "react-hot-toast";
import PromoStrip from "../../../components/PromoStrip";
import LowestPricesEver from "../../../components/LowestPricesEver";
import PageTransition from "../../../components/PageTransition";
import { getTheme } from "../../../utils/themes";

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
  }, [initializeSettings, fetchAllContent]);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mostPopular, setMostPopular] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [brands, setBrands] = useState([]);
  const [reels, setReels] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  // Loading states for progressive rendering
  const [loadingCritical, setLoadingCritical] = useState(true);
  const [loadingSecondary, setLoadingSecondary] = useState(true);
  const [loadingTertiary, setLoadingTertiary] = useState(true);

  // Critical Data: Banners & Categories (Needed for "Above the Fold" content)
  const fetchCriticalData = async () => {
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
      }

      // Start fetching Secondary data once Critical is done
      fetchSecondaryData(validCategories);
    } catch (error) {
      console.error("Critical Fetch Error:", error);
    } finally {
      setLoadingCritical(false);
    }
  };

  // Secondary Data: Daily Deals, Vendors, Trending Reels
  const fetchSecondaryData = async (catList) => {
    try {
      setLoadingSecondary(true);
      const [dealsRes, vendorsRes, reelsRes] = await Promise.all([
        fetchPublicProducts({ limit: 4, sort: '-discountPercent' }),
        fetchPublicVendors({ limit: 6 }),
        fetchPublicReels({ limit: 10 })
      ]);

      if (dealsRes.success) setDailyDeals(dealsRes.data.products || []);
      if (vendorsRes.success) setVendors(vendorsRes.data.vendors || []);
      if (reelsRes.success) setReels(reelsRes.data.reels || []);

      // Start fetching Tertiary data
      fetchTertiaryData();
      // Also fetch some top products per top categories
      fetchCategoryProducts(catList.slice(0, 3));
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

  useEffect(() => {
    fetchCriticalData();
  }, [currentCity]);

  const handleRefresh = async () => {
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
            crazyDeals={dailyDeals}
            heroBanner={
              <HeroCarousel banners={banners} loading={loadingCritical} />
            }
          />

          {/* Featured Categories Bubbles */}
          {/* <HomeCategoryBubble categories={categories} loading={loading} /> */}

          {/* LowestPricesEver Section */}
          <LowestPricesEver activeTab={activeTab} />
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
          <div className="px-4 py-4">
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
            className="px-4 py-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Most Popular</h2>
              <Link to="/app/category/all" className="text-sm font-bold" style={{ color: theme.accentColor }}>View All</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {loadingTertiary ? (
                Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                recommended.slice(0, 4).map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <DailyDealsSection products={dailyDeals} loading={loadingSecondary} theme={theme} />

          {/* More promotional content */}
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
