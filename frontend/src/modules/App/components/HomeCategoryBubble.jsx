import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LazyImage from "../../../components/LazyImage";

const HomeCategoryBubble = ({ categories, loading }) => {
    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse border-2 border-white shadow-sm" />
                        <div className="w-12 h-2.5 bg-gray-200 animate-pulse rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-6">
            {categories.map((category, index) => (
                <motion.div
                    key={category._id || category.id}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: index * 0.05
                    }}
                    className="flex-shrink-0"
                >
                    <Link
                        to={`/app/category/${category._id || category.id}`}
                        className="flex flex-col items-center gap-3 group"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg ring-2 ring-primary-500/20 group-hover:ring-primary-500 transition-all duration-300">
                                <LazyImage
                                    src={category.image || `https://via.placeholder.com/150?text=${category.name}`}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            {category.isNew && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ring-2 ring-white">
                                    New
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-primary-600 transition-colors">
                            {category.name}
                        </span>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

export default HomeCategoryBubble;
