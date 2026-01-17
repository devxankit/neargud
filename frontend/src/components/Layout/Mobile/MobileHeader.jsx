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
  const lastScrollYRef = useRef(0);
  const logoRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = useCartStore((state) => state.getItemCount());
  const toggleCart = useUIStore((state) => state.toggleCart);
  const { initialize: initializeSettings } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { theme } = useTheme();

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

  const getCategoryThemeTab = (catId) => {
    const themeMap = {
      1: "fashion",
      2: "footwear",
      3: "leather",
      4: "jewelry",
      5: "winter",
      6: "sports",
    };
    return themeMap[catId] || "all";
  };

  const headerBackground = useMemo(() => {
    if (currentCategoryId) {
      const categoryThemeTab = getCategoryThemeTab(currentCategoryId);
      const categoryTheme = getTheme(categoryThemeTab);
      return `linear-gradient(to bottom, ${categoryTheme.primary[3]} 0%, ${categoryTheme.primary[2]} 50%, ${categoryTheme.primary[1]} 100%)`;
    }

    if (currentPage === "home") {
      return `linear-gradient(to bottom, ${theme.primary[3]} 0%, ${theme.primary[2]} 50%, ${theme.primary[1]} 100%)`;
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
  }, [currentCategoryId, currentPage, theme]);

  // Hide header on scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const lastScrollY = lastScrollYRef.current;

          if (currentScrollY < 20) setIsTopRowVisible(true);
          else if (currentScrollY < lastScrollY) setIsTopRowVisible(true);
          else if (currentScrollY > lastScrollY && currentScrollY > 120)
            setIsTopRowVisible(false);

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
        onAnimationComplete={() => setShowCartAnimation(false)}
      >
        <div className="w-12 h-12">
          <DotLottieReact
            src="https://lottie.host/083a2680-e854-4006-a50b-674276be82cd/oQMRcuZUkS.lottie"
            autoplay
          />
        </div>
      </motion.div>
    ) : null;

  const headerContent = (
    <motion.header
      key="mobile-header"
      className="fixed top-0 left-0 right-0 z-[9999] border-b border-white/30"
      style={{
        background: headerBackground,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: isTopRowVisible ? 0 : -60, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <div className="px-4 pt-4 pb-3 flex flex-col gap-5 max-w-[640px] mx-auto">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <Link to="/app" className="flex items-center">
              <div ref={logoRef}>
                <img
                  src={appLogo.src}
                  alt={appLogo.alt}
                  className="h-14 w-auto object-contain"
                  style={{
                    transform: "scale(2.6)",
                    transformOrigin: "left center",
                    filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.35))"
                  }}

                />
              </div>
            </Link>
          </div>

          {/* <div className="absolute left-1/2 -translate-x-1/2">
            <LocationSelector className="scale-95" />
          </div> */}
          <div className="flex items-center gap-2">

            <button
              ref={cartRef}
              onClick={toggleCart}
              className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-md active:scale-95 transition-all relative"
            >
              <FiShoppingBag className="text-xl text-gray-800" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full relative z-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60">
            <SearchBar />
          </div>
        </div>

        {/* Categories */}
        <div className="w-full mt-2">
          <MobileCategoryIcons isTopRowVisible={isTopRowVisible} />
        </div>
      </div>
    </motion.header>
  );

  return (
    <>
      {headerContent}
      {typeof document !== "undefined" && showCartAnimation && positionsReady &&
        createPortal(animationContent, document.body)}
    </>
  );
};

export default MobileHeader;
