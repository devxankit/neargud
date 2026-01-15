import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPublicCategories } from "../../../services/publicApi";
import { motion } from "framer-motion";
import { categories } from "../../../data/categories";
import LazyImage from "../../../components/LazyImage";

const MobileCategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchPublicCategories();
        if (res.success) {
          setCategories(res.data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-4">
        <div className="h-6 w-40 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-20 space-y-2">
              <div className="w-16 h-16 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-3 w-12 bg-gray-100 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="px-4 py-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Browse Categories
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {categories.filter(c => !c.parentId).map((category, index) => (
          <motion.div
            key={category._id || category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0">
            <Link
              to={`/app/category/${category._id || category.id}`}
              className="flex flex-col items-center gap-2 w-20">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-gray-200">
                <LazyImage
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/64x64?text=Category";
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobileCategoryGrid;
