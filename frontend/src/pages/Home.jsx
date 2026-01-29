import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useTheme } from "/src/context/ThemeContext";
import Header from '../components/Layout/Header';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import BottomNavigation from '../components/BottomNavigation';
import HeroBanner from '../components/Home/HeroBanner';
import BrandLogosScroll from '../components/Home/BrandLogosScroll';
import CategoriesSection from '../components/Home/CategoriesSection';
import PromotionalBanners from '../components/Home/PromotionalBanners';
import MostPopularSection from '../components/Home/MostPopularSection';
import TrendingBanner from '../components/Home/TrendingBanner';
import TrendingItemsSection from '../components/Home/TrendingItemsSection';
import FlashSaleSection from '../components/Home/FlashSaleSection';
import PopularBrandsSection from '../components/Home/PopularBrandsSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import AnimatedBanner from '../modules/App/components/AnimatedBanner';
import NewArrivalsSection from '../modules/App/components/NewArrivalsSection';
import DailyDealsSection from '../modules/App/components/DailyDealsSection';
import ProductCard from '../components/ProductCard';
import LazyImage from '../components/LazyImage';
import TransitionGradient from '../components/TransitionGradient';
import { getMostPopular, getTrending, getFlashSale, getRecommendedProducts } from '../data/products';
import { FiThumbsUp, FiArrowRight } from 'react-icons/fi';
import PageTransition from '../components/PageTransition';
import useResponsiveHeaderPadding from '../hooks/useResponsiveHeaderPadding';
import PromoStrip from '../components/PromoStrip';
import LowestPricesEver from '../components/LowestPricesEver';

const Home = () => {
  const { responsivePadding, isDesktop } = useResponsiveHeaderPadding();
  const { theme, activeTab } = useTheme();

  const mostPopular = getMostPopular();
  const trending = getTrending();
  const flashSale = getFlashSale();
  const recommended = getRecommendedProducts(12);

  // Ensure body scroll is restored when component mounts
  useEffect(() => {
    document.body.style.overflowY = '';
    return () => {
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: '#6d28d9' }}>
        <Header />
        <Navbar />
        <main className="w-full overflow-x-hidden" style={{ paddingTop: isDesktop ? `${responsivePadding}px` : '0px' }}>
          {/* Desktop Layout - Redesigned with multi-column layout */}
          <div className="hidden md:block">
            <div className="mx-auto desktop-container" style={{ maxWidth: '996px', padding: '0 8px' }}>
              {/* Hero Banner - Now using optimized HeroBanner component */}
              <div className="pt-3 pb-2">
                <HeroBanner />
              </div>

              {/* Transition Gradient */}
              <TransitionGradient />

              {/* Brand Logos Scroll */}
              <div className="py-3">
                <BrandLogosScroll />
              </div>

              {/* Animated Banner */}
              <div className="py-3">
                <AnimatedBanner />
              </div>

              {/* New Arrivals Section */}
              <div className="py-4">
                <NewArrivalsSection />
              </div>

              {/* Promotional Banners - Grid Layout with more banners */}
              <div className="py-4">
                <div className="grid grid-cols-4 gap-3">
                  <Link to="/app/offers" className="block">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative w-full h-32 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <LazyImage
                        src="/images/banners/babycare-WEB.avif"
                        alt="Baby Care"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x200?text=Baby+Care";
                        }}
                      />
                    </motion.div>
                  </Link>
                  <Link to="/app/offers" className="block">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative w-full h-32 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <LazyImage
                        src="/images/banners/pharmacy-WEB.avif"
                        alt="Pharmacy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x200?text=Pharmacy";
                        }}
                      />
                    </motion.div>
                  </Link>
                  <Link to="/app/offers" className="block">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative w-full h-32 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <LazyImage
                        src="/images/banners/Pet-Care_WEB.avif"
                        alt="Pet Care"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x200?text=Pet+Care";
                        }}
                      />
                    </motion.div>
                  </Link>
                  <Link to="/app/offers" className="block">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative w-full h-32 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <LazyImage
                        src="/images/banners/babycare-WEB.avif"
                        alt="Special Offers"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x200?text=Special+Offers";
                        }}
                      />
                    </motion.div>
                  </Link>
                </div>
              </div>

              {/* Most Popular Section - 6-column Grid with more products */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Most Popular</h2>
                  <Link
                    to="/app/search"
                    className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    See All
                  </Link>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 smooth-reveal">
                  {mostPopular.slice(0, 12).map((product) => (
                    <div key={product.id} className="animate-fade-in">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Deals Section */}
              <div className="py-4">
                <DailyDealsSection />
              </div>

              {/* Trending Banner */}
              <div className="py-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg"
                >
                  <LazyImage
                    src="/images/hero/banner2.png"
                    alt="Trending Items Banner"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/1200x300?text=Banner";
                    }}
                  />
                </motion.div>
              </div>

              {/* Flash Sale Section - 6-column Grid with more products */}
              {flashSale.length > 0 && (
                <div className="py-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl px-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Flash Sale
                      </h2>
                      <p className="text-sm text-gray-600">Limited time offers</p>
                    </div>
                    <Link
                      to="/app/flash-sale"
                      className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                      See All
                    </Link>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {flashSale.slice(0, 12).map((product) => (
                      <div key={product.id} className="animate-fade-in">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Items Section - 6-column Grid with more products */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Trending Now</h2>
                  <Link
                    to="/app/search"
                    className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    See All
                  </Link>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {trending.slice(0, 12).map((product) => (
                    <div key={product.id} className="animate-fade-in">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Section - 6-column Grid with more products */}
              {recommended.length > 0 && (
                <div className="py-4 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/40 rounded-2xl px-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-md">
                        <FiThumbsUp className="text-white text-lg" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                          Recommended for You
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">Curated just for you</p>
                      </div>
                    </div>
                    <Link
                      to="/app/search"
                      className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                      <span>See All</span>
                      <FiArrowRight className="text-sm" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {recommended.slice(0, 12).map((product) => (
                      <div key={product.id} className="animate-fade-in">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Product Sections - Best Sellers */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Best Sellers</h2>
                  <Link
                    to="/app/search"
                    className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    See All
                  </Link>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {mostPopular.slice(12, 18).map((product) => (
                    <div key={product.id} className="animate-fade-in">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tagline Section */}
              <div className="py-8 text-left smooth-reveal">
                <h2 className="text-5xl lg:text-6xl font-black text-gray-400 leading-tight flex items-center justify-start gap-3 flex-wrap">
                  <span>Bringing Shopping to Your Fingertips.</span>
                  <span className="text-red-500 inline-block heart-pulse">
                    <FiHeart className="text-6xl lg:text-7xl fill-red-500" />
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Restructured for seamless integration */}
          <div className="md:hidden">
            {/* Continuous purple background container */}
            <div className="relative" style={{
              background: 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 100%)',
              marginTop: '-1px' // Eliminate any tiny gaps
            }}>
              <div className="px-4">
                <PromoStrip activeTab={activeTab} />
              </div>

              {/* Subtle gradient transition at the bottom of the purple section */}
              <div className="h-8 w-full" style={{
                background: 'linear-gradient(180deg, rgba(124, 58, 237, 1) 0%, rgba(248, 250, 252, 1) 100%)'
              }} />
            </div>

            {/* Bottom Content Sheet (Light bg) - Integrated seamlessly */}
            <div className="bg-[#F8FAFC] pt-2 pb-24 mt-0 min-h-screen relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <LowestPricesEver activeTab={activeTab} />
                <BrandLogosScroll />
                <CategoriesSection />
                <PromotionalBanners />
                <MostPopularSection />
                <TrendingBanner />
                <TrendingItemsSection />
                <FlashSaleSection />
                <PopularBrandsSection />
                <FeaturesSection />
              </div>
            </div>
          </div>
          <style>{`
            @media (min-width: 1280px) {
              .desktop-container {
                max-width: 1600px !important;
                padding: 0 16px !important;
              }
            }
          `}</style>
        </main>
        <Footer />
        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default Home;

