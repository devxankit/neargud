import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiGrid, FiSearch, FiUser } from "react-icons/fi";
import { useAuthStore } from "../../../store/authStore";
import ReelIcon from "../../Icons/ReelIcon";

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isReelsPage = location.pathname === '/app/reels';

  const navItems = [
    { path: "/app", icon: FiHome, label: "Home" },
    { path: "/app/categories", icon: FiGrid, label: "Categories" },
    { path: "/app/reels", icon: ReelIcon, label: "Reels", isCustomIcon: true },
    { path: "/app/search", icon: FiSearch, label: "Search" },
    {
      path: isAuthenticated ? "/app/profile" : "/app/login",
      icon: FiUser,
      label: "Profile",
    },
  ];

  const isActive = (path) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  // Animation variants for icon - adjust colors for reels page
  const iconVariants = {
    inactive: {
      scale: 1,
      color: isReelsPage ? "#9CA3AF" : "#878787", // Lighter gray for reels dark background
    },
    active: {
      scale: 1.1,
      color: "#DC2626", // Primary Buttons color (red) - same for both
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const navContent = (
    <nav className={`fixed bottom-0 left-0 right-0 border-t border-l border-r z-[9999] safe-area-bottom ${
      isReelsPage 
        ? 'bg-black border-gray-800 shadow-[0_-2px_10px_rgba(255,255,255,0.1)]' 
        : 'bg-white border-accent-200/30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'
    }`}>
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center justify-center flex-1 h-full relative">
              <motion.div
                className="relative flex items-center justify-center w-12 h-12"
                whileTap={{ scale: 0.9 }}>
                {/* Active Indicator Background */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-full ${
                      isReelsPage ? 'bg-gray-800' : 'bg-primary-50'
                    }`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  variants={iconVariants}
                  initial="inactive"
                  animate={active ? "active" : "inactive"}
                  transition={{ duration: 0.2 }}
                  style={{ color: active ? "#DC2626" : (isReelsPage ? "#9CA3AF" : "#878787") }}>
                  {item.isCustomIcon ? (
                    <Icon className="text-2xl w-6 h-6" />
                  ) : (
                    <Icon
                      className="text-2xl"
                      style={{
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: 2,
                      }}
                    />
                  )}
                </motion.div>

                {/* Badge */}
                {item.badge && (
                  <motion.span
                    key={item.badge}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white shadow-md z-20 flex items-center justify-center"
                    style={{ backgroundColor: "#ffc101" }}>
                    <span className="text-[8px] font-bold text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  // Use portal to render outside of transformed containers (like PageTransition)
  return createPortal(navContent, document.body);
};

export default MobileBottomNav;
