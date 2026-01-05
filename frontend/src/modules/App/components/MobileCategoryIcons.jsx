import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "../../../data/categories";
import { FiPackage, FiShoppingBag, FiStar, FiTag, FiZap } from "react-icons/fi";
import { IoShirtOutline, IoBagHandleOutline } from "react-icons/io5";
import { LuFootprints } from "react-icons/lu";

// Map category names to icons
const categoryIcons = {
  Clothing: IoShirtOutline,
  Footwear: LuFootprints,
  Bags: IoBagHandleOutline,
  Jewelry: FiStar,
  Accessories: FiTag,
  Athletic: FiZap,
};

const MobileCategoryIcons = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollYRef = useRef(0);
  const location = useLocation();
  const categoryRefs = useRef({});
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isIndicatorReady, setIsIndicatorReady] = useState(false);
  const previousIndicatorRef = useRef({ left: 0, width: 0 });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollYRef.current = currentScrollY;

      // Smooth transition: show icons when at top, hide when scrolled
      // Use a small threshold for immediate response
      setIsScrolling(currentScrollY >= 8);
    };

    // Use requestAnimationFrame for smooth 60fps updates
    let rafId = null;
    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          rafId = null;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Get current category from URL
  const getCurrentCategoryId = () => {
    const match = location.pathname.match(/\/(?:app\/)?category\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const currentCategoryId = getCurrentCategoryId();

  // Update sliding indicator position when category changes - copied from reference app
  useEffect(() => {
    const updateIndicator = (shouldScroll = true) => {
      const activeCategoryElement = categoryRefs.current[currentCategoryId];
      const container = scrollContainerRef.current;
      
      if (activeCategoryElement && container) {
        try {
          // Use offsetLeft for position relative to container (not affected by scroll)
          // This ensures the indicator stays aligned even when container scrolls
          const left = activeCategoryElement.offsetLeft;
          const width = activeCategoryElement.offsetWidth;
          
          // Ensure valid values
          if (width > 0) {
            // Always preserve the previous position in ref before updating
            setIndicatorStyle((prev) => {
              if (prev.width > 0) {
                previousIndicatorRef.current = prev;
              }
              // Update to new position - transition will handle the animation
              return { left, width };
            });
            // Enable transitions if not already enabled
            if (!isIndicatorReady) {
              setIsIndicatorReady(true);
            }
          }

          // Scroll the container to bring the active category into view (only when category changes)
          if (shouldScroll) {
            const containerScrollLeft = container.scrollLeft;
            const containerWidth = container.offsetWidth;
            const buttonLeft = left;
            const buttonWidth = width;
            const buttonRight = buttonLeft + buttonWidth;

            // Calculate scroll position to center the button or keep it visible
            const scrollPadding = 20; // Padding from edges
            let targetScrollLeft = containerScrollLeft;

            // If button is on the left side and partially or fully hidden
            if (buttonLeft < containerScrollLeft + scrollPadding) {
              targetScrollLeft = buttonLeft - scrollPadding;
            }
            // If button is on the right side and partially or fully hidden
            else if (buttonRight > containerScrollLeft + containerWidth - scrollPadding) {
              targetScrollLeft = buttonRight - containerWidth + scrollPadding;
            }

            // Smooth scroll to the target position
            if (targetScrollLeft !== containerScrollLeft) {
              container.scrollTo({
                left: Math.max(0, targetScrollLeft),
                behavior: 'smooth'
              });
            }
          }
        } catch (error) {
          console.warn('Error updating indicator:', error);
        }
      }
    };

    if (currentCategoryId) {
      // Update immediately with scroll
      updateIndicator(true);
      
      // Enable transitions if we already have a position (from previous category or initial load)
      if (indicatorStyle.width > 0 || previousIndicatorRef.current.width > 0) {
        setIsIndicatorReady(true);
      } else {
        // First time - enable transitions after position is set
        const enableTransitionTimeout = setTimeout(() => {
          setIsIndicatorReady(true);
        }, 150);
        
        return () => clearTimeout(enableTransitionTimeout);
      }
      
      // Also update after delays to handle any layout shifts and ensure smooth animation
      const timeout1 = setTimeout(() => updateIndicator(true), 50);
      const timeout2 = setTimeout(() => updateIndicator(true), 150);
      const timeout3 = setTimeout(() => updateIndicator(false), 300); // Last update without scroll to avoid conflicts
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
      };
    } else {
      // Don't reset position or transition state when no category - just hide
      // This ensures smooth transition when category is selected again
    }
  }, [currentCategoryId, location.pathname]);

  // Handle scroll to update line position
  useEffect(() => {
    if (scrollContainerRef.current) {
      let rafId = null;
      const handleScroll = () => {
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            if (currentCategoryId && categoryRefs.current[currentCategoryId] && scrollContainerRef.current) {
              const activeCategoryElement = categoryRefs.current[currentCategoryId];
              const container = scrollContainerRef.current;
              
              try {
                const left = activeCategoryElement.offsetLeft;
                const width = activeCategoryElement.offsetWidth;
                
                if (width > 0) {
                  setIndicatorStyle({ left, width });
                }
              } catch (error) {
                console.warn('Error updating indicator on scroll:', error);
              }
            }
            rafId = null;
          });
        }
      };
      
      scrollContainerRef.current.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener('scroll', handleScroll);
        }
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [currentCategoryId]);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => {
      if (currentCategoryId && categoryRefs.current[currentCategoryId] && scrollContainerRef.current) {
        const activeCategoryElement = categoryRefs.current[currentCategoryId];
        try {
          const left = activeCategoryElement.offsetLeft;
          const width = activeCategoryElement.offsetWidth;
          
          if (width > 0) {
            setIndicatorStyle({ left, width });
          }
        } catch (error) {
          console.warn('Error updating indicator on resize:', error);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentCategoryId]);

  // Category color mapping - matching the gradient colors
  const categoryColors = {
    1: {
      icon: "text-pink-500",
      text: "text-pink-600",
      indicator: "bg-pink-500",
    }, // Clothing - Pink
    2: {
      icon: "text-amber-600",
      text: "text-amber-700",
      indicator: "bg-amber-600",
    }, // Footwear - Brown/Amber
    3: {
      icon: "text-orange-500",
      text: "text-orange-600",
      indicator: "bg-orange-500",
    }, // Bags - Orange
    4: {
      icon: "text-green-500",
      text: "text-green-600",
      indicator: "bg-green-500",
    }, // Jewelry - Green
    5: {
      icon: "text-purple-500",
      text: "text-purple-600",
      indicator: "bg-purple-500",
    }, // Accessories - Purple
    6: {
      icon: "text-blue-500",
      text: "text-blue-600",
      indicator: "bg-blue-500",
    }, // Athletic - Blue
  };

  const isActiveCategory = (categoryId) => {
    return (
      location.pathname === `/app/category/${categoryId}` ||
      location.pathname === `/category/${categoryId}`
    );
  };

  // Get color for active category
  const getActiveColor = (categoryId) => {
    return (
      categoryColors[categoryId] || {
        icon: "text-primary-500",
        text: "text-primary-500",
        indicator: "bg-primary-500",
      }
    );
  };

  const isHomePage = location.pathname === "/" || location.pathname === "/app";

  return (
    <div className="relative" ref={containerRef}>
      <motion.div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}>
        {categories.map((category, index) => {
          const IconComponent = categoryIcons[category.name] || IoShirtOutline;
          const isActive = isActiveCategory(category.id);
          const activeColors =
            currentCategoryId && currentCategoryId === category.id
              ? getActiveColor(category.id)
              : null;
          
          const iconColorClass = isHomePage ? "text-white/85" : "text-black";
          const textColorClass = isHomePage ? "text-white/85" : "text-black";
          const indicatorColorClass = isHomePage ? "bg-white/85" : "bg-black";

          return (
            <div
              key={category.id}
              ref={(el) => {
                if (el) categoryRefs.current[category.id] = el;
              }}
              className="flex-shrink-0">
              <Link
                to={`/app/category/${category.id}`}
                className="flex flex-col items-center gap-1.5 w-16 relative">
                {!isScrolling && (
                  <div>
                    <IconComponent
                      className={`text-lg ${iconColorClass}`}
                      style={{
                        strokeWidth:
                          category.name === "Clothing" ||
                          category.name === "Bags"
                            ? 5.5
                            : 2,
                      }}
                    />
                  </div>
                )}
                <span className={`text-[10px] font-semibold text-center line-clamp-1 ${textColorClass}`}>
                  {category.name}
                </span>
              </Link>
            </div>
          );
        })}
      </motion.div>
      {/* Indicator line at bottom edge of header for selected category */}
      <div
        className={`absolute bottom-[-12px] h-1 rounded-t-lg pointer-events-none ${isHomePage ? 'bg-white/85' : 'bg-black'}`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.width > 0 && currentCategoryId ? 1 : 0,
          // Always enable transition if we have a width to prevent restarting
          transition: indicatorStyle.width > 0 && isIndicatorReady
            ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out'
            : 'opacity 0.2s ease-out',
          zIndex: 0,
        }}
      />
    </div>
  );
};

export default MobileCategoryIcons;
