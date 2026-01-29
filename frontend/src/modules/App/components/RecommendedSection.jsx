import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiThumbsUp, FiArrowRight } from "react-icons/fi";
import ProductCard from "../../../components/ProductCard";


const RecommendedSection = ({ products = [], loading = false, theme = null }) => {
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <div
      className={`px-4 py-5 rounded-2xl mx-2 transition-all duration-500 ${!theme ? "bg-gradient-to-br from-blue-50/50 via-white to-purple-50/40" : ""}`}
      style={theme ? {
        background: `linear-gradient(135deg, ${theme.primary[3]?.replace('rgb', 'rgba').replace(')', ', 0.3)') || 'rgba(255,255,255,0.5)'} 0%, rgba(255,255,255,0.8) 50%, ${theme.primary[2]?.replace('rgb', 'rgba').replace(')', ', 0.2)') || 'rgba(255,255,255,0.4)'} 100%)`,
        border: `1px solid ${theme.primary[1]}20`
      } : {}}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shadow-lg border border-white/20 ${!theme ? "bg-gradient-to-br from-blue-500 to-purple-500" : ""}`}
            style={theme ? { backgroundColor: theme.accentColor } : {}}
          >
            <FiThumbsUp className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black tracking-tight leading-tight" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.4)' }}>
              Recommended for You
            </h2>
            <p className="text-[10px] text-black/70 font-black uppercase tracking-widest mt-0.5">Curated just for you</p>
          </div>
        </div>
        <Link
          to="/app/search"
          className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 bg-white/40 backdrop-blur-md rounded-full shadow-sm hover:bg-white/60 transition-all active:scale-95"
          style={{ color: '#000000' }}>
          <span>See All</span>
          <FiArrowRight className="text-sm" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 text-xs font-semibold">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-36 aspect-[3/4] bg-gray-200 animate-pulse rounded-xl" />
          ))
        ) : (
          products.map((product, index) => (
            <motion.div
              key={product._id || product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-36"
              style={{ minWidth: "144px" }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedSection;
