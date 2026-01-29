import { motion } from 'framer-motion';

const HeroCarouselSkeleton = () => {
    return (
        <div className="relative w-full h-[320px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mx-4 my-4">
            {/* Shimmer effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                    x: ['-100%', '100%'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Content outline */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Top badge */}
                <div className="w-20 h-6 bg-white/40 rounded-full" />

                {/* Center text */}
                <div className="space-y-3">
                    <div className="w-3/4 h-8 bg-white/40 rounded" />
                    <div className="w-1/2 h-6 bg-white/40 rounded" />
                </div>

                {/* Bottom indicator dots */}
                <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-2 h-2 bg-white/40 rounded-full" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroCarouselSkeleton;
