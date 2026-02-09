import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

const CategoryTabs = () => {
    const { activeTab, setActiveTab, tabs, theme } = useTheme();

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className="px-4 py-4 bg-white">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-smooth">
                {tabs.map((tab, index) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex-shrink-0 flex flex-col items-center min-w-[70px] py-3 px-2 rounded-2xl transition-all duration-300 relative ${isActive
                                ? 'text-white shadow-lg'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            style={{
                                backgroundColor: isActive ? theme.primary[0] : 'transparent',
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                            {/* Active indicator background */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBackground"
                                    className="absolute inset-0 rounded-2xl"
                                    style={{ backgroundColor: theme.primary[0] }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}

                            <motion.div
                                className="relative z-10 mb-1.5 w-6 h-6 flex items-center justify-center"
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                {tab.icon}
                            </motion.div>

                            <span
                                className={`text-xs font-semibold relative z-10 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-600'
                                    }`}
                            >
                                {tab.label}
                            </span>

                            {/* Subtle glow effect for active tab */}
                            {isActive && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl opacity-50"
                                    style={{
                                        background: `linear-gradient(135deg, ${theme.primary[1]}, ${theme.primary[2]})`,
                                        filter: 'blur(8px)',
                                    }}
                                    animate={{
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Active tab indicator line */}
            <motion.div
                className="mt-2 h-0.5 bg-gradient-to-r rounded-full mx-4"
                style={{
                    background: `linear-gradient(to right, ${theme.primary[0]}, ${theme.primary[1]}, ${theme.primary[2]})`,
                }}
                layoutId="activeTabIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </div>
    );
};

export default CategoryTabs;
