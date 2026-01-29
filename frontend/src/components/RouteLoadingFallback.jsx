import { motion } from 'framer-motion';

const RouteLoadingFallback = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
                {/* Animated loader */}
                <motion.div
                    className="w-16 h-16 mx-auto mb-4"
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        rotate: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        },
                        scale: {
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                    }}
                >
                    <svg
                        viewBox="0 0 50 50"
                        className="w-full h-full"
                    >
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            strokeDasharray="80, 200"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>

                {/* Loading text */}
                <motion.p
                    className="text-gray-600 font-semibold text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    Loading...
                </motion.p>
            </div>
        </div>
    );
};

export default RouteLoadingFallback;
