import { motion } from 'framer-motion';

const PromoStripSkeleton = () => {
    return (
        <div className="w-full px-4 py-6 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Banner text skeleton */}
            <div className="flex justify-center items-center gap-3 mb-6">
                <div className="w-6 h-8 bg-gray-200 rounded" />
                <div className="w-40 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded overflow-hidden relative">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
                <div className="w-6 h-8 bg-gray-200 rounded" />
            </div>

            {/* Cards grid */}
            <div className="flex gap-3">
                {/* Crazy Deals card */}
                <div className="w-24 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden relative">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                {/* Category cards grid */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-white/60 rounded-lg border border-gray-200 overflow-hidden relative"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'linear',
                                    delay: i * 0.1,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromoStripSkeleton;
