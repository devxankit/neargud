import { motion } from 'framer-motion';

const VendorCardSkeleton = () => {
    return (
        <div className="flex-shrink-0 w-[280px]">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm overflow-hidden relative">
                {/* Shimmer overlay */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />

                {/* Vendor header */}
                <div className="flex items-center gap-3 mb-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full" />

                    <div className="flex-1 space-y-2">
                        {/* Name */}
                        <div className="w-32 h-4 bg-gray-200 rounded" />
                        {/* Badge */}
                        <div className="w-20 h-3 bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-3">
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>

                {/* Product images */}
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const VendorsSkeleton = () => {
    return (
        <div className="px-4 py-6">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="w-40 h-6 bg-gray-200 rounded mb-2" />
                    <div className="w-32 h-3 bg-gray-200 rounded" />
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded-full" />
            </div>

            {/* Vendor cards */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {[1, 2].map((i) => (
                    <VendorCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export default VendorsSkeleton;
