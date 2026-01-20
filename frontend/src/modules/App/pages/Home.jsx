import { useState, useEffect, useMemo } from "react";
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
import { useTheme } from "../../../context/ThemeContext";
import ProductSkeleton from "../../../components/Skeletons/ProductCardSkeleton";
import usePullToRefresh from "../../../hooks/usePullToRefresh";
import toast from "react-hot-toast";
import PromoStrip from "../../../components/PromoStrip";
import LowestPricesEver from "../../../components/LowestPricesEver";
import PageTransition from "../../../components/PageTransition";
import { useContentStore } from "../../../store/contentStore";
import { getTheme } from "../../../utils/themes";

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
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        bannersRes,
        categoriesRes,
        popularRes,
        flashRes,
        recommendedRes,
        vendorsRes,
        arrivalsRes,
        dailyDealsRes,
        trendingRes,
        brandsRes,
        reelsRes
      ] = await Promise.all([
        fetchActiveBanners({ city: currentCity?.name || '' }),
        fetchPublicCategories(),
        fetchPublicProducts({ limit: 6, sort: '-popularity' }),
        fetchPublicProducts({ limit: 4, flashSale: true }),
        fetchRecommendedProducts(),
        fetchPublicVendors(),
        fetchPublicProducts({ limit: 6, sort: '-createdAt' }),
        fetchPublicProducts({ limit: 8, isCrazyDeal: true }),
        fetchPublicProducts({ limit: 6, isTrending: true }),
        fetchPublicBrands(),
        fetchPublicReels()
      ]);

      if (bannersRes.success) setBanners(bannersRes.data.banners || []);
      if (categoriesRes.success) {
        setCategories((categoriesRes.data.categories || []).filter(cat => !cat.parentId));
      }
      if (popularRes.success) setMostPopular(popularRes.data.products || []);
      if (flashRes.success) setFlashSale(flashRes.data.products || []);
      if (recommendedRes.success) setRecommended(recommendedRes.data.products || []);
      if (vendorsRes.success) setVendors(vendorsRes.data.vendors || []);
      if (arrivalsRes.success) setNewArrivals(arrivalsRes.data.products || []);
      if (dailyDealsRes.success) setDailyDeals(dailyDealsRes.data.products || []);
      if (trendingRes.success) setTrending(trendingRes.data.products || []);
      if (brandsRes.success) setBrands(brandsRes.data.brands || []);
      if (reelsRes && (reelsRes.success || reelsRes.data)) setReels(reelsRes.data?.reels || reelsRes.success?.data?.reels || []);

      // Fetch products for top 4 categories for PromoStrip
      if (categoriesRes.success) {
        const cats = (categoriesRes.data.categories || []).filter(cat => !cat.parentId).slice(0, 4);
        const catProductsMap = {};

        await Promise.all(cats.map(async (cat) => {
          try {
            const res = await fetchPublicProducts({ categoryId: cat._id || cat.id, limit: 4 });
            if (res.success) {
              catProductsMap[cat._id || cat.id] = res.data.products;
            }
          } catch (e) {
            console.error(`Error fetching products for category ${cat.name}:`, e);
          }
        }));

        setCategoryProducts(catProductsMap);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... (Keep existing useEffect for mock data if needed, or remove) ...
  useEffect(() => {
    // ... mock data logic ...
  }, [loading]);

  useEffect(() => {
    fetchData();
  }, [currentCity]);

  const handleRefresh = async () => {
    await fetchData();
    toast.success("Feed updated");
  };

  const {
    pullDistance,
    isPulling,
    elementRef,
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

  return (
    <MobileLayout>
      <div
        ref={elementRef}
        className="w-full overflow-x-hidden scrollbar-hide min-h-screen"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${Math.min(pullDistance, 80)}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
          background: `linear-gradient(to bottom, ${theme.primary[0]} 0%, ${theme.primary[1]} 15%, #f8fafc 30%, #f8fafc 100%)`
        }}>

        <PromoStrip
          activeTab={activeTab}
          categories={categories}
          categoryProducts={categoryProducts}
          crazyDeals={dailyDeals}
          heroBanner={
            <HeroCarousel banners={banners} loading={loading} />
          }
        />

        {/* Featured Categories Bubbles */}
        {/* <HomeCategoryBubble categories={categories} loading={loading} /> */}

        {/* LowestPricesEver Section */}
        <LowestPricesEver activeTab={activeTab} />

        {/* Brand Logos Scroll */}
        <div className="py-2">
          <BrandLogosScroll brands={brands} loading={loading} />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Featured Vendors Section */}
          <motion.div variants={itemVariants}>
            <FeaturedVendorsSection vendors={vendors} loading={loading} />
          </motion.div>

          {/* Trending Visuals (Reels) */}
          <motion.div variants={itemVariants}>
            <TrendingReelsSection reels={reels} loading={loading} />
          </motion.div>

          {/* Trending Now Products (NEW) */}
          <motion.div variants={itemVariants} className="px-4 pt-2 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">{content?.homepage?.trendingTitle || "Trending Now"}</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full mt-1" />
              </div>
              <Link to="/app/trending" className="text-sm text-pink-600 font-bold bg-pink-50 px-3 py-1.5 rounded-full">See All</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {loading
                ? [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
                : trending.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
            </div>
          </motion.div>

          {/* Animated Banner */}
          <motion.div variants={itemVariants}>
            <AnimatedBanner />
          </motion.div>

          {/* New Arrivals */}
          <motion.div variants={itemVariants}>
            <NewArrivalsSection products={newArrivals} loading={loading} />
          </motion.div>

          {/* ... Rest of existing sections ... */}
          {/* Promotional Banners */}
          <motion.div variants={itemVariants} className="py-4">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-4">
              {[
                { id: 1, img: "/images/banners/babycare-WEB.avif", label: "Baby Care" },
                { id: 2, img: "/images/banners/pharmacy-WEB.avif", label: "Pharmacy" },
                { id: 3, img: "/images/banners/Pet-Care_WEB.avif", label: "Pet Care" }
              ].map((promo) => (
                <Link key={promo.id} to="/app/offers" className="block flex-shrink-0">
                  <div className="relative w-72 h-36 rounded-2xl overflow-hidden shadow-xl group border-2 border-white">
                    <LazyImage
                      src={promo.img}
                      alt={promo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { e.target.src = `https://via.placeholder.com/400x200?text=${promo.label}`; }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-white font-bold text-sm tracking-wide">{promo.label}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Most Popular */}
          <motion.div variants={itemVariants} className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Most Popular</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full mt-1" />
              </div>
              <Link to="/app/search" className="text-sm text-primary-600 font-bold bg-primary-50 px-3 py-1.5 rounded-full">See All</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {loading
                ? [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
                : mostPopular.map((product, index) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
            </div>
          </motion.div>

          {/* Daily Deals */}
          <motion.div variants={itemVariants}>
            <DailyDealsSection products={dailyDeals} loading={loading} />
          </motion.div>

          {/* Flash Sale */}
          {flashSale.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="px-4 py-8 bg-gradient-to-br from-red-50 to-orange-50 my-6 cursor-pointer active:bg-orange-100 transition-colors"
              onClick={(e) => {
                // Prevent navigation if clicking on a product card or specific link
                if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.product-card')) return;
                window.location.href = '/app/flash-sale';
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Flash Sale</span>
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-sm">LIVE</span>
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Extra discounts for next 2 hours</p>
                </div>
                <Link to="/app/flash-sale" className="text-sm font-bold text-red-600">See All</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {flashSale.map((product) => (
                  <div key={product._id || product.id} className="min-w-[160px] product-card">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommended for You */}
          <motion.div variants={itemVariants}>
            <RecommendedSection products={recommended} loading={loading} />
          </motion.div>
        </motion.div>

        {/* Massive Tagline Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="px-6 py-20 text-center bg-gradient-to-br from-white to-gray-50 mt-12 mb-8 rounded-3xl mx-4 shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 opacity-30" />
          <h2 className="text-4xl font-black text-gray-300 leading-tight mb-4 relative z-10">
            Shop from <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-primary-700">50+</span> <br />Trusted Vendors
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Made with</span>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiHeart className="text-xl text-primary-500 fill-primary-500" />
            </motion.div>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">for you</span>
          </div>
        </motion.div>

      </div>
    </MobileLayout>
  );
};

export default MobileHome;
