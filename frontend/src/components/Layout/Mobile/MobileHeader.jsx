import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { FiShoppingBag, FiUser, FiHeart, FiSearch, FiMapPin } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCartStore, useUIStore } from "../../../store/useStore";
import { useAuthStore } from "../../../store/authStore";
import { useWishlistStore } from "../../../store/wishlistStore";
import { appLogo } from "../../../data/logos";
import { useSettingsStore } from "../../../store/settingsStore";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Lottie from "lottie-react";
import shoppingCartAnimation from "../../../../data/animations/shopping cart.json";
import SearchBar from "../../SearchBar";
import MobileCategoryIcons from "../../../modules/App/components/MobileCategoryIcons";
import LocationSelectionModal from "../../LocationSelectionModal";
import { useLocationStore } from "../../../store/locationStore";
import { useTheme } from "../../../context/ThemeContext.jsx";
import { getTheme } from "../../../utils/themes.js";
import { useCategoryStore } from "../../../store/categoryStore";

const MobileHeader = () => {
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [positionsReady, setPositionsReady] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [animationPositions, setAnimationPositions] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });
  const [isTopRowVisible, setIsTopRowVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const logoRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHeaderHidden = useRef(false);

  const itemCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useUIStore((state) => state.toggleCart);
  const { initialize: initializeSettings } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { theme } = useTheme();

  // Location Store
  const { currentCity, initialize: initializeLocation } = useLocationStore();

  useEffect(() => {
    initializeSettings();
    initializeLocation();
  }, []);

  const getCurrentCategoryId = () => {
    const match = location.pathname.match(
      /\/(?:app\/)?category\/([a-zA-Z0-9]+)/,
    );
    return match ? match[1] : null;
  };

  const currentCategoryId = getCurrentCategoryId();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === "/app" || path === "/app/") return "home";
    if (path.startsWith("/app/product/")) return "product";
    if (path.startsWith("/app/category/")) return "category";
    if (path === "/app/search") return "search";
    if (path === "/app/wishlist") return "wishlist";
    if (path === "/app/profile") return "profile";
    if (path === "/app/orders") return "orders";
    return "default";
  };

  const currentPage = getCurrentPage();

  const categories = useCategoryStore((state) => state.categories);

  const categoryThemeTab = useMemo(() => {
    if (!currentCategoryId) return "all";

    const themeMap = {
      '1': 'fashion',
      '2': 'footwear',
      '3': 'leather',
      '4': 'jewelry',
      '5': 'winter',
      '6': 'sports',
    };

    if (themeMap[currentCategoryId]) return themeMap[currentCategoryId];

    // Fallback to name-based mapping from store
    const category = categories.find(c => c.id === currentCategoryId || c._id === currentCategoryId);
    if (!category || !category.name) return "all";

    const name = category.name.toLowerCase();
    if (name.includes("cloth") || name.includes("fashion")) return "fashion";
    if (name.includes("shoe") || name.includes("footwear")) return "footwear";
    if (name.includes("bag") || name.includes("leather")) return "leather";
    if (name.includes("jewel")) return "jewelry";
    if (name.includes("winter")) return "winter";
    if (name.includes("sport")) return "sports";
    if (name.includes("beauty")) return "beauty";
    if (name.includes("electron")) return "electronics";
    if (name.includes("grocer")) return "grocery";

    return "all";
  }, [currentCategoryId, categories]);

  const headerBackground = useMemo(() => {
    if (currentCategoryId) {
      const categoryTheme = getTheme(categoryThemeTab);
      return `linear-gradient(to bottom, ${categoryTheme.primary[0]} 0%, ${categoryTheme.primary[1]} 100%)`;
    }

    if (currentPage === "home") {
      return `linear-gradient(to bottom, ${theme.primary[0]} 0%, ${theme.primary[1]} 100%)`;
    }

    const pageGradients = {
      product: "linear-gradient(to bottom, #f3f4f6 0%, #ffffff 100%)",
      search: "linear-gradient(to bottom, #fff7ed 0%, #ffffff 100%)",
      wishlist: "linear-gradient(to bottom, #fef2f2 0%, #ffffff 100%)",
      profile: "linear-gradient(to bottom, #f0fdf4 0%, #ffffff 100%)",
      orders: "linear-gradient(to bottom, #eff6ff 0%, #ffffff 100%)",
      default: "linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)",
    };

    return pageGradients[currentPage] || pageGradients.default;
  }, [currentCategoryId, currentPage, theme, categoryThemeTab]);

  const currentHeaderTheme = useMemo(() => {
    if (currentCategoryId) return getTheme(categoryThemeTab);
    if (currentPage === "home") return theme;
    return null; // Not a themed header
  }, [currentCategoryId, categoryThemeTab, currentPage, theme]);

  const setGlobalHeaderHeight = useUIStore(state => state.setHeaderHeight);
  const headerRef = useRef(null);

  // Measure and sync header height globally
  useEffect(() => {
    if (!headerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === headerRef.current) {
          setGlobalHeaderHeight(entry.target.offsetHeight);
        }
      }
    });

    resizeObserver.observe(headerRef.current);
    // Initial measurement
    setGlobalHeaderHeight(headerRef.current.offsetHeight);

    return () => resizeObserver.disconnect();
  }, [setGlobalHeaderHeight]);

  useEffect(() => {
    let ticking = false;
    const SCROLL_THRESHOLD = 15; // Increased threshold

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);
          const lastScrollY = lastScrollYRef.current;
          const scrollDiff = currentScrollY - lastScrollY;

          // Detect if near bottom of page
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const isNearBottom = (windowHeight + currentScrollY) >= (documentHeight - 100);

          const shouldShowTopRow = currentScrollY < 10;

          setIsTopRowVisible(shouldShowTopRow);
          isHeaderHidden.current = !shouldShowTopRow;

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart animation
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

    const timer = setTimeout(calculatePositions, 800);
    return () => clearTimeout(timer);
  }, [hasPlayed]);

  const animationContent =
    showCartAnimation && positionsReady ? (
      <motion.div
        className="fixed pointer-events-none z-[10000]"
        initial={{
          x: animationPositions.startX - 24,
          y: animationPositions.startY - 24,
          scale: 0.6,
          opacity: 0,
        }}
        animate={{
          x: animationPositions.endX - 24,
          y: animationPositions.endY - 24,
          scale: [0.6, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        onAnimationComplete={() => setShowCartAnimation(false)}>
        <div className="w-12 h-12">
          <DotLottieReact
            src="https://lottie.host/083a2680-e854-4006-a50b-674276be82cd/oQMRcuZUkS.lottie"
            autoplay
          />
        </div>
      </motion.div>
    ) : null;

  // Reset header visibility when path or category changes
  useEffect(() => {
    setIsTopRowVisible(true);
  }, [location.pathname, currentCategoryId]);

  const headerContent = (
    <motion.header
      key="mobile-header"
      ref={headerRef} // Added ref here
      className={`fixed top-0 left-0 right-0 z-[9999] ${currentPage === "home" ? "border-b-2 border-black/30" : "border-b border-white/30"
        }`}
      style={{
        background: headerBackground,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: currentPage === "home" ? "none" : "0 10px 30px rgba(0,0,0,0.08)",
        overflow: "visible",
      }}
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}>
      <div className="px-3 md:px-8 lg:px-12 pb-1 flex flex-col md:max-w-none mx-auto">
        {/* Top Row - Hides on scroll */}
        <motion.div
          animate={{
            height: isTopRowVisible ? "auto" : 0,
            opacity: isTopRowVisible ? 1 : 0,
            marginBottom: isTopRowVisible ? 8 : 0,
            paddingTop: isTopRowVisible ? 12 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{ willChange: 'height, opacity' }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center">
              <Link to="/app" className="flex items-center">
                <div ref={logoRef} className="relative">
                  {/* Animation behind logo */}
                  <div
                    className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none"
                    style={{ transform: "scale(3)" }}>
                    <Lottie
                      animationData={shoppingCartAnimation}
                      loop={true}
                      autoplay={true}
                      renderer="canvas"
                      rendererSettings={{
                        preserveAspectRatio: "xMidYMid slice",
                        clearCanvas: true,
                      }}
                      style={{ width: "30px", height: "30px", opacity: 0.6 }}
                    />
                  </div>
                  <img
                    src={appLogo.src}
                    alt={appLogo.alt}
                    className="h-9 md:h-10 lg:h-11 w-auto object-contain"
                    style={{
                      transform: "scale(2.4)",
                      transformOrigin: "left center",
                      filter: "drop-shadow(0 6px 15px rgba(0,0,0,0.3))",
                    }}
                  />
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Location Selector Button */}
              <button
                onClick={() => setShowLocationModal(true)}
                className={`p-1.5 md:p-2 rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-md active:scale-95 transition-all relative flex items-center justify-center gap-1.5 ${currentCity ? 'pl-2 pr-3' : ''}`}
                aria-label="Select Location"
              >
                <FiMapPin className="text-gray-800 text-lg md:text-xl" />
                {currentCity && (
                  <span className="text-[10px] md:text-[11px] font-black text-gray-800 tracking-wide max-w-[80px] md:max-w-[120px] truncate leading-none pt-0.5">
                    {currentCity.name}
                  </span>
                )}
              </button>

              <button
                ref={cartRef}
                onClick={toggleCart}
                className="p-1.5 md:p-2 rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-md active:scale-95 transition-all relative">
                <FiShoppingBag className="text-lg md:text-xl text-gray-800" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search Bar - ALWAYS STICKY */}
        <motion.div
          animate={{
            paddingTop: isTopRowVisible ? 0 : 8,
            paddingBottom: isTopRowVisible ? 4 : 8
          }}
          className="w-full relative z-10"
          style={{ overflow: 'visible' }}
        >
          <SearchBar />
        </motion.div>

        {/* Categories - Always visible, but icons fold via internal logic */}
        <div className="w-full mt-2 pb-2">
          <MobileCategoryIcons
            isTopRowVisible={isTopRowVisible}
            colorScheme={currentHeaderTheme ? (currentHeaderTheme.isDark ? 'white' : 'black') : 'black'}
          />
        </div>
      </div>
    </motion.header>
  );

  return (
    <>
      {headerContent}
      {typeof document !== "undefined" &&
        showCartAnimation &&
        positionsReady &&
        createPortal(animationContent, document.body)}

      {/* Location Modal */}
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
};

export default MobileHeader;
