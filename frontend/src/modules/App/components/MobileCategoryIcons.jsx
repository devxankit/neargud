import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBox } from "react-icons/fi";
import { getIconComponent } from "../../../utils/categoryIcons";
import { fetchPublicCategories } from "../../../services/publicApi";

const MobileCategoryIcons = ({ isTopRowVisible = true }) => {
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
        left: element.offsetLeft,
        width: element.offsetWidth
      });
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentCategoryId, categories]);

  return (
    <div className="relative w-full" style={{ marginTop: "-20px" }}>

      <div
        ref={scrollContainerRef}
        className="flex items-start w-full overflow-x-auto no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[20%] flex flex-col items-center gap-2">
              <motion.div
                animate={{ height: isTopRowVisible ? 32 : 0, opacity: isTopRowVisible ? 1 : 0 }}
                className="w-8 h-8 bg-white/20 rounded-full animate-pulse overflow-hidden"
              />
              <div className="w-10 h-2 bg-white/20 rounded animate-pulse" />
            </div>
          ))
        ) : (
          categories.map((category) => {
            const IconComponent = getIconComponent(category.icon, category.name);
            const categoryId = category._id || category.id;
            const isActive = currentCategoryId === categoryId;

            return (
              <Link
                key={categoryId}
                to={`/app/category/${categoryId}`}
                ref={(el) => (categoryRefs.current[categoryId] = el)}
                className="flex-shrink-0 w-[20%] flex flex-col items-center gap-0.5 group outline-none scroll-snap-align-start py-1"
              >
                <motion.div
                  initial={false}
                  animate={{
                    height: isTopRowVisible ? 'auto' : 0,
                    opacity: isTopRowVisible ? 1 : 0,
                    marginBottom: isTopRowVisible ? 4 : 0
                  }}
                  className="relative flex items-center justify-center p-1 overflow-hidden"
                >
                  {IconComponent ? (
                    <IconComponent className={`
                        text-[24px] transition-all duration-300
                        ${isActive ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-white/90 group-hover:text-white group-hover:scale-105"}
                      `} strokeWidth={1.5} />
                  ) : category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className={`w-7 h-7 object-contain transition-all duration-300 ${isActive ? 'scale-110 brightness-110' : 'brightness-90 opacity-90'}`}
                    />
                  ) : (
                    <FiBox className={`
                        text-[24px] transition-all duration-300
                        ${isActive ? "text-white scale-110" : "text-white/90"}
                      `} strokeWidth={1.5} />
                  )}

                  {/* Subtle active dot indicator */}
                  {/* {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute -bottom-2 w-1 h-1 bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )} */}
                </motion.div>

                <span className={`
                  text-[13px] tracking-wide text-center transition-all duration-300 whitespace-nowrap px-1 w-full overflow-hidden text-ellipsis
                  ${isActive ? "text-white font-bold opacity-100" : "text-white font-medium opacity-80 group-hover:opacity-100"}
                `}>
                  {category.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileCategoryIcons;
