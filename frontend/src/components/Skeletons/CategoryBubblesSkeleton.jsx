import { motion } from 'framer-motion';

const CategoryBubblesSkeleton = () => {
    return (
        <div className="flex gap-4 px-4 py-6 overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    {/* Icon circle */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: i * 0.1,
                            }}
                        />
                    </div>

                    {/* Label */}
                    <div className="w-12 h-3 bg-gray-200 rounded overflow-hidden relative">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: i * 0.1,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryBubblesSkeleton;
