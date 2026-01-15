import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FiShoppingBag,
  FiUser,
  FiHeart,
  FiSearch,
} from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCartStore, useUIStore } from "../../../store/useStore";
import { useAuthStore } from "../../../store/authStore";
import { useWishlistStore } from "../../../store/wishlistStore";
import { appLogo } from "../../../data/logos";
import { useSettingsStore } from "../../../store/settingsStore";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SearchBar from "../../SearchBar";
import MobileCategoryIcons from "../../../modules/App/components/MobileCategoryIcons";
import LocationSelector from "../../LocationSelector";
import { useTheme } from "/src/context/ThemeContext";
import { getTheme } from "../../../utils/themes";

const MobileHeader = () => {
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [positionsReady, setPositionsReady] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [animationPositions, setAnimationPositions] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });
  const [isTopRowVisible, setIsTopRowVisible] = useState(true);
  const [topRowHeight, setTopRowHeight] = useState(70);
  const lastScrollYRef = useRef(0);
  const topRowRef = useRef(null);
  const logoRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useUIStore((state) => state.toggleCart);
  const { settings, initialize: initializeSettings } = useSettingsStore();
  const { user, isAuthenticated } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { theme, activeTab } = useTheme();

  useEffect(() => {
    initializeSettings();
  }, []);

  const getCurrentCategoryId = () => {
    const match = location.pathname.match(/\/(?:app\/)?category\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const currentCategoryId = getCurrentCategoryId();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/app' || path === '/app/') return 'home';
    if (path.startsWith('/app/product/')) return 'product';
    if (path.startsWith('/app/category/')) return 'category';
    if (path === '/app/search') return 'search';
    if (path === '/app/wishlist') return 'wishlist';
    if (path === '/app/profile') return 'profile';
    if (path === '/app/orders') return 'orders';
    if (path === '/app/checkout') return 'checkout';
    if (path === '/app/offers') return 'offers';
    if (path === '/app/daily-deals') return 'dailyDeals';
    if (path === '/app/flash-sale') return 'flashSale';
    if (path.startsWith('/app/vendor/')) return 'vendor';
    return 'default';
  };

  const currentPage = getCurrentPage();

  const getCategoryThemeTab = (catId) => {
    const themeMap = {
      1: 'fashion',
      2: 'footwear',
      3: 'leather',
      4: 'jewelry',
      5: 'winter',
      6: 'sports',
    };
    return themeMap[catId] || 'all';
  };

  const headerBackground = useMemo(() => {
    if (currentCategoryId) {
      const categoryThemeTab = getCategoryThemeTab(currentCategoryId);
      const categoryTheme = getTheme(categoryThemeTab);
      return `linear-gradient(to bottom, ${categoryTheme.primary[3]} 0%, ${categoryTheme.primary[2]} 50%, ${categoryTheme.primary[1]} 100%)`;
    }

    if (currentPage === 'home') {
      return `linear-gradient(to bottom, ${theme.primary[3]} 0%, ${theme.primary[2]} 50%, ${theme.primary[1]} 100%)`;
    }

    const pageGradients = {
      product: 'linear-gradient(to bottom, #f3f4f6 0%, #ffffff 100%)',
      search: 'linear-gradient(to bottom, #fff7ed 0%, #ffffff 100%)',
      wishlist: 'linear-gradient(to bottom, #fef2f2 0%, #ffffff 100%)',
      profile: 'linear-gradient(to bottom, #f0fdf4 0%, #ffffff 100%)',
      orders: 'linear-gradient(to bottom, #eff6ff 0%, #ffffff 100%)',
      default: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
    };

    return pageGradients[currentPage] || pageGradients.default;
  }, [currentCategoryId, currentPage, location.pathname, theme, activeTab]);

  useEffect(() => {
    const measureHeight = () => {
      if (topRowRef.current) {
        // Use a slight delay to ensure everything is rendered
        setTimeout(() => {
          const header = document.querySelector('header[key="mobile-header"]');
          if (header) setTopRowHeight(header.offsetHeight);
        }, 100);
      }
    };
    measureHeight();
    window.addEventListener("resize", measureHeight);
    return () => window.removeEventListener("resize", measureHeight);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const lastScrollY = lastScrollYRef.current;
          if (currentScrollY < 10) setIsTopRowVisible(true);
          else if (currentScrollY < lastScrollY) setIsTopRowVisible(true);
          else if (currentScrollY > lastScrollY && currentScrollY > 100) setIsTopRowVisible(false);
          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const calculatePositions = () => {
      if (logoRef.current && cartRef.current) {
        const logoRect = logoRef.current.getBoundingClientRect();
        const cartRect = cartRef.current.getBoundingClientRect();
        const positions = {
          startX: logoRect.left + logoRect.width / 2,
          startY: logoRect.top + logoRect.height / 2,
          endX: cartRect.left + cartRect.width / 2,
          endY: cartRect.top + cartRect.height / 2,
        };
        if (positions.startX > 0 && positions.endX > 0 && !hasPlayed) {
          setAnimationPositions(positions);
          setPositionsReady(true);
          setShowCartAnimation(true);
          setHasPlayed(true);
        }
      }
    };
    const timer = setTimeout(calculatePositions, 500);
    return () => clearTimeout(timer);
  }, [hasPlayed]);

  const animationContent = showCartAnimation && positionsReady ? (
    <motion.div
      className="fixed pointer-events-none z-[10000]"
      initial={{ x: animationPositions.startX - 24, y: animationPositions.startY - 24, scale: 0.8, opacity: 0 }}
      animate={{ x: animationPositions.endX - 24, y: animationPositions.endY - 24, scale: [0.8, 1, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 3, ease: "easeInOut" }}
      onAnimationComplete={() => setShowCartAnimation(false)}
    >
      <div className="w-12 h-12">
        <DotLottieReact src="https://lottie.host/083a2680-e854-4006-a50b-674276be82cd/oQMRcuZUkS.lottie" autoplay />
      </div>
    </motion.div>
  ) : null;

  const headerContent = (
    <motion.header
      key="mobile-header"
      className="fixed top-0 left-0 right-0 z-[9999] shadow-sm border-b border-gray-100"
      style={{
        background: headerBackground,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      animate={{ y: isTopRowVisible ? 0 : -80 }} // Partial hide to keep categories mostly visible or hide cleaner
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div className="px-4 pt-4 pb-3 flex flex-col gap-4">
        {/* Top Row: Branding and Actions */}
        <motion.div
          ref={topRowRef}
          className="flex items-center justify-between"
          animate={{ opacity: isTopRowVisible ? 1 : 0 }}
        >
          <div className="flex items-center gap-3">
            <Link to="/app/profile" className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center overflow-hidden shadow-sm">
              {isAuthenticated && user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-xl text-gray-800" />
              )}
            </Link>
            <LocationSelector />
          </div>

          <div className="flex items-center gap-2">
            <Link to="/app/wishlist" className="p-2.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 relative">
              <FiHeart className="text-xl text-gray-800" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
            <button ref={cartRef} onClick={toggleCart} className="p-2.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 relative">
              <FiShoppingBag className="text-xl text-gray-800" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="w-full relative z-10">
          <SearchBar />
        </div>

        {/* Categories Section */}
        <div className="w-full pt-1">
          <MobileCategoryIcons />
        </div>
      </div>
    </motion.header>
  );

  return (
    <>
      {typeof document !== 'undefined' && createPortal(headerContent, document.body)}
      {typeof document !== 'undefined' && createPortal(animationContent, document.body)}
    </>
  );
};

export default MobileHeader;
