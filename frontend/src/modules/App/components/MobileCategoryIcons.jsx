import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBox, FiHome } from "react-icons/fi";
import { getIconComponent } from "../../../utils/categoryIcons";
import { useCategoryStore } from "../../../store/categoryStore";

const MobileCategoryIcons = ({ isTopRowVisible = true, colorScheme = 'white' }) => {
  // colorScheme: 'white' for home page, 'black' for category pages
  const iconColor = colorScheme === 'white' ? 'text-white' : 'text-gray-900';
  const iconColorInactive = colorScheme === 'white' ? 'text-white/90' : 'text-gray-600';
  const iconColorHover = colorScheme === 'white' ? 'text-white' : 'text-gray-900';
  const textColor = colorScheme === 'white' ? 'text-white' : 'text-gray-900';
  const textColorInactive = colorScheme === 'white' ? 'text-white' : 'text-gray-700';
  const indicatorBg = colorScheme === 'white' ? 'bg-white' : 'bg-gray-900';
  const indicatorShadow = colorScheme === 'white' ? 'shadow-[0_0_10px_rgba(255,255,255,0.6)]' : 'shadow-[0_0_10px_rgba(0,0,0,0.3)]';
  const { categories, fetchCategories, isLoading } = useCategoryStore();

  const mainCategories = useMemo(() => {
    return categories
      .filter(cat => !cat.parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const location = useLocation();
  const scrollContainerRef = useRef(null);
  const homeRef = useRef(null);
  const categoryRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  const getCurrentCategoryId = () => {
    const match = location.pathname.match(/\/(?:app\/)?category\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const currentCategoryId = getCurrentCategoryId();
  const isHome = location.pathname === '/app' || location.pathname === '/app/' || location.pathname === '/';

  useEffect(() => {
    let element = null;
    if (isHome && homeRef.current) {
      element = homeRef.current;
    } else if (currentCategoryId && categoryRefs.current[currentCategoryId]) {
      element = categoryRefs.current[currentCategoryId];
    }

    if (element) {
      setIndicatorStyle({
        left: element.offsetLeft,
        width: element.offsetWidth
      });
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentCategoryId, mainCategories]);

  return (
    <div className="relative w-full" style={{ marginTop: "0px" }}>

      <div
        ref={scrollContainerRef}
        className="relative flex items-start w-full overflow-x-auto no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Active Category Indicator */}
        {!isLoading && (isHome || currentCategoryId) && (
          <motion.div
            className={`absolute bottom-0 h-1 rounded-t-full z-10 ${indicatorBg} ${indicatorShadow}`}
            animate={{
              left: indicatorStyle.left + (indicatorStyle.width * 0.25),
              width: indicatorStyle.width * 0.5
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35
            }}
          />
        )}

        {isLoading && categories.length === 0 ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[20%] flex flex-col items-center gap-2">
              <motion.div
                animate={{ height: isTopRowVisible ? 32 : 0, opacity: isTopRowVisible ? 1 : 0 }}
                className="w-8 h-8 bg-white/20 rounded-full animate-pulse overflow-hidden"
              />
              <div className="w-10 h-2 bg-white/20 rounded animate-pulse" />
            </div>
          ))
        ) : (
          <>
            <Link
              to="/app"
              ref={homeRef}
              className="flex-shrink-0 w-[20%] flex flex-col items-center gap-0.5 group outline-none scroll-snap-align-start py-1 pb-2"
            >
              <motion.div
                initial={false}
                animate={{
                  height: isTopRowVisible ? 'auto' : 0,
                  scale: isTopRowVisible ? 1 : 0.5,
                  opacity: isTopRowVisible ? 1 : 0,
                  marginBottom: isTopRowVisible ? 6 : 0
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="relative flex items-center justify-center p-0.75 overflow-hidden"
              >
                <FiHome className={`
                  text-[18px] transition-all duration-300
                  ${isHome ? `${iconColor} scale-110 ${colorScheme === 'white' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]'}` : `${iconColorInactive} group-hover:${iconColorHover} group-hover:scale-105`}
                `} strokeWidth={1.5} />
              </motion.div>
              <motion.span
                animate={{ scale: isTopRowVisible ? 1 : 0.9 }}
                className={`
                  text-[10px] tracking-wide text-center transition-all duration-300 whitespace-nowrap px-1 w-full overflow-hidden text-ellipsis
                  ${isHome ? `${textColor} font-bold` : `${textColorInactive} font-medium opacity-80 group-hover:opacity-100`}
                `}>
                All
              </motion.span>
            </Link>

            {mainCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon, category.name);
              const categoryId = category._id || category.id;
              const isActive = currentCategoryId === categoryId;

              return (
                <Link
                  key={categoryId}
                  to={`/app/category/${categoryId}`}
                  ref={(el) => (categoryRefs.current[categoryId] = el)}
                  className="flex-shrink-0 w-[20%] flex flex-col items-center gap-0.5 group outline-none scroll-snap-align-start py-1 pb-2"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      height: isTopRowVisible ? 'auto' : 0,
                      scale: isTopRowVisible ? 1 : 0.5,
                      opacity: isTopRowVisible ? 1 : 0,
                      marginBottom: isTopRowVisible ? 6 : 0
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="relative flex items-center justify-center p-0.75 overflow-hidden"
                  >
                    {IconComponent ? (
                      <IconComponent className={`
                        text-[18px] transition-all duration-300
                        ${isActive ? `${iconColor} scale-110 ${colorScheme === 'white' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]'}` : `${iconColorInactive} group-hover:${iconColorHover} group-hover:scale-105`}
                      `} strokeWidth={1.5} />
                    ) : category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className={`w-6 h-6 object-contain transition-all duration-300 ${isActive ? 'scale-110 brightness-110' : 'brightness-90 opacity-90'}`}
                      />
                    ) : (
                      <FiBox className={`
                        text-[18px] transition-all duration-300
                        ${isActive ? `${iconColor} scale-110` : iconColorInactive}
                      `} strokeWidth={1.5} />
                    )}
                  </motion.div>

                  <motion.span
                    animate={{
                      scale: isTopRowVisible ? 1 : 0.9
                    }}
                    className={`
                  text-[10px] tracking-wide text-center transition-all duration-300 whitespace-nowrap px-1 w-full overflow-hidden text-ellipsis
                  ${isActive ? `${textColor} font-bold` : `${textColorInactive} font-medium opacity-80 group-hover:opacity-100`}
                `}>
                    {category.name}
                  </motion.span>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default MobileCategoryIcons;
