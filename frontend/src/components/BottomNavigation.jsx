import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const BottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            icon: (
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: location.pathname === '/' ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: location.pathname === '/' ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.path
                            d="M9 22V12H15V22"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: location.pathname === '/' ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    </svg>
                </motion.div>
            ),
            path: '/',
            isActive: location.pathname === '/',
        },
        {
            id: 'categories',
            label: 'Categories',
            icon: (
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: location.pathname.includes('/category') ? 360 : 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>
            ),
            path: '/categories',
            isActive: location.pathname.includes('/category'),
        },
        {
            id: 'search',
            label: 'Search',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            path: '/search',
            isActive: location.pathname === '/search',
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: (
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: location.pathname.includes('/orders') ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            initial={{ scale: 1 }}
                            animate={{ scale: location.pathname.includes('/orders') ? 1.1 : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <motion.circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{
                                scale: location.pathname.includes('/orders') ? 1 : 0,
                                y: location.pathname.includes('/orders') ? -2 : 0
                            }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        />
                        <motion.path
                            d="M12 9v6M9 12h6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: location.pathname.includes('/orders') ? 1 : 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        />
                    </svg>
                </motion.div>
            ),
            path: '/orders',
            isActive: location.pathname.includes('/orders'),
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: (
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: location.pathname.includes('/profile') ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.circle
                            cx="12"
                            cy="8"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                            initial={{ scaleY: 1 }}
                            animate={{ scaleY: location.pathname.includes('/profile') ? 1.2 : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <motion.path
                            d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ scaleY: 1 }}
                            animate={{ scaleY: location.pathname.includes('/profile') ? 1.1 : 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        />
                    </svg>
                </motion.div>
            ),
            path: '/profile',
            isActive: location.pathname.includes('/profile'),
        },
    ];

    const handleNavClick = (path) => {
        navigate(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => (
                    <motion.button
                        key={item.id}
                        onClick={() => handleNavClick(item.path)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[60px] ${item.isActive
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            backgroundColor: item.isActive ? theme.primary[0] : 'transparent',
                        }}
                    >
                        <div className="relative">
                            {item.icon}
                            <AnimatePresence>
                                {item.isActive && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <motion.span
                            className={`text-xs mt-1 font-medium ${item.isActive ? 'text-white' : 'text-gray-600'
                                }`}
                            animate={{
                                scale: item.isActive ? 1.05 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                        >
                            {item.label}
                        </motion.span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default BottomNavigation;
