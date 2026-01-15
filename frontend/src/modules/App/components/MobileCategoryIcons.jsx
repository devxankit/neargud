import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiTag, FiZap, FiBox } from "react-icons/fi";
import { IoShirtOutline, IoBagHandleOutline } from "react-icons/io5";
import { LuFootprints } from "react-icons/lu";
import { fetchPublicCategories } from "../../../services/publicApi";

// Premium Category Config with vibrant color palettes
const categoryConfig = {
  Clothing: { icon: IoShirtOutline, color: "text-rose-600", bg: "bg-rose-50", gradient: "from-rose-500 to-pink-600" },
  Clothes: { icon: IoShirtOutline, color: "text-rose-600", bg: "bg-rose-50", gradient: "from-rose-500 to-pink-600" },
  Footwear: { icon: LuFootprints, color: "text-amber-600", bg: "bg-amber-50", gradient: "from-amber-400 to-orange-600" },
  Bags: { icon: IoBagHandleOutline, color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-indigo-600" },
  Jewelry: { icon: FiStar, color: "text-yellow-600", bg: "bg-yellow-50", gradient: "from-yellow-400 to-amber-600" },
  Accessories: { icon: FiTag, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-teal-600" },
  Athletic: { icon: FiZap, color: "text-orange-600", bg: "bg-orange-50", gradient: "from-orange-400 to-red-600" },
  Sports: { icon: FiZap, color: "text-orange-600", bg: "bg-orange-50", gradient: "from-orange-400 to-red-600" },
  Default: { icon: FiBox, color: "text-purple-600", bg: "bg-purple-50", gradient: "from-purple-500 to-indigo-600" },
};

const MobileCategoryIcons = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const categoryRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchPublicCategories();
      const categoryData = res.data?.categories || res.categories || (Array.isArray(res) ? res : []);

      if (categoryData.length > 0) {
        const mainCategories = categoryData
          .filter(cat => !cat.parentId)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(mainCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCurrentCategoryId = () => {
    const match = location.pathname.match(/\/(?:app\/)?category\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const currentCategoryId = getCurrentCategoryId();

  useEffect(() => {
    if (currentCategoryId && categoryRefs.current[currentCategoryId]) {
      const element = categoryRefs.current[currentCategoryId];
      setIndicatorStyle({
        left: element.offsetLeft + 16,
        width: element.offsetWidth - 32
      });
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentCategoryId, categories]);

  const isHomePage = location.pathname === "/" || location.pathname === "/app";

  return (
    <div className="relative w-full">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar py-3 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-20">
              <div className="w-14 h-14 bg-white/20 rounded-2xl animate-pulse ring-1 ring-white/10" />
              <div className="w-12 h-2 bg-white/20 rounded animate-pulse" />
            </div>
          ))
        ) : (
          categories.map((category) => {
            const config = categoryConfig[category.name] || categoryConfig.Default;
            const IconComponent = config.icon;
            const categoryId = category._id || category.id;
            const isActive = currentCategoryId === categoryId;

            return (
              <Link
                key={categoryId}
                to={`/app/category/${categoryId}`}
                ref={(el) => (categoryRefs.current[categoryId] = el)}
                className="flex-shrink-0 flex flex-col items-center gap-2.5 group outline-none scroll-snap-align-start px-2"
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className="relative"
                >
                  {/* Glassmorphic Layer Background for all icons */}
                  <div className={`
                    w-15 h-15 rounded-[22px] flex items-center justify-center transition-all duration-500 relative z-10 overflow-hidden
                    ${isActive
                      ? (isHomePage ? "bg-white shadow-[0_10px_25px_-5px_rgba(255,255,255,0.4)]" : "bg-white shadow-lg shadow-gray-200 ring-4 ring-gray-50")
                      : (isHomePage ? "bg-white/15 backdrop-blur-xl border border-white/25 shadow-sm" : "bg-white border border-gray-100 shadow-sm")}
                  `}>
                    {/* Inner Vibrant Glow for Active */}
                    {isActive && !isHomePage && (
                      <div className={`absolute inset-0 bg-gradient-to-tr ${config.gradient} opacity-10`} />
                    )}

                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className={`w-10 h-10 object-contain transition-all duration-500 ${isActive ? 'scale-110 brightness-110' : 'brightness-90 group-hover:brightness-100 group-hover:scale-105'}`}
                      />
                    ) : (
                      <IconComponent className={`
                        text-2xl transition-all duration-500 relative z-20
                        ${isActive
                          ? (isHomePage ? "text-gray-900 scale-110" : `${config.color} scale-110`)
                          : (isHomePage ? "text-white" : "text-gray-400 group-hover:text-gray-600")}
                      `} />
                    )}
                  </div>

                  {/* Aesthetic Pulse for Active */}
                  {isActive && (
                    <motion.div
                      layoutId="pulse-ring"
                      className={`absolute -inset-1 rounded-[26px] bg-gradient-to-tr ${isHomePage ? 'from-white/40 to-white/10' : config.gradient.replace('to-', 'to-').replace('from-', 'from-') + ' opacity-20'} z-0`}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1.05, opacity: 0.2 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </motion.div>

                <span className={`
                  text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300
                  ${isActive
                    ? (isHomePage ? "text-white drop-shadow-md" : "text-gray-900 font-black")
                    : (isHomePage ? "text-white/80" : "text-gray-400 group-hover:text-gray-600")}
                `}>
                  {category.name}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {/* Premium Floating Indicator */}
      <AnimatePresence>
        {currentCategoryId && (
          <motion.div
            layoutId="category-dot"
            className={`absolute bottom-0 h-1 rounded-full ${isHomePage ? 'bg-white' : 'bg-gray-900'} z-20`}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileCategoryIcons;
