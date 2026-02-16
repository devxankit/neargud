import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiClock, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import { fetchPublicProducts, fetchPublicVendors } from '../../../services/publicApi';
import { getImageUrl } from '../../../utils/helpers';

const SearchSuggestions = ({
  query,
  isOpen,
  onSelect,
  onClose,
  recentSearches = [],
  onDeleteRecent
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || !isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const [prodRes, venRes] = await Promise.all([
          fetchPublicProducts({ search: query, limit: 4 }),
          fetchPublicVendors({ search: query, limit: 2 })
        ]);

        let combined = [];
        if (venRes.success) {
          combined = [...combined, ...(venRes.data.vendors || []).map(v => ({
            id: v._id || v.id,
            name: v.storeName || v.name,
            image: getImageUrl(v.storeLogo),
            type: 'shop'
          }))];
        }
        if (prodRes.success) {
          combined = [...combined, ...(prodRes.data.products || []).map(p => ({
            id: p._id || p.id,
            name: p.name,
            image: getImageUrl(p.images?.[0] || p.image),
            type: 'product'
          }))];
        }
        setSuggestions(combined);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen || !query) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && query.length === 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-gray-600">Recent Searches</span>
                <button
                  onClick={() => {
                    recentSearches.forEach((_, index) => onDeleteRecent(index));
                  }}
                  className="text-xs text-primary-600 font-medium"
                >
                  Clear All
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(search)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <FiClock className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-700 flex-1">{search}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRecent(index);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <FiX className="text-gray-500 text-xs" />
                  </button>
                </motion.button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {(suggestions.length > 0 || loading) && (
            <div className="p-2">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Suggestions</span>
                {loading && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}
              </div>
              {suggestions.map((item, index) => (
                <motion.button
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(item.name, item.type, item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${item.type === 'shop' ? 'bg-rose-50' : 'bg-blue-50'}`}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=${item.type === 'shop' ? 'FFE4E6' : 'EFF6FF'}&color=${item.type === 'shop' ? 'E11D48' : '3B82F6'}&size=64&bold=true`;
                        }}
                      />
                    ) : (
                      <div className={item.type === 'shop' ? 'text-rose-500' : 'text-blue-500'}>
                        {item.type === 'shop' ? <FiShoppingBag className="text-sm" /> : <FiSearch className="text-sm" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 font-medium group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </span>
                    {item.type === 'shop' && (
                      <span className="ml-2 text-[10px] font-black text-rose-500 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded">
                        Shop
                      </span>
                    )}
                  </div>
                  <FiTrendingUp className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          )}

          {suggestions.length === 0 && recentSearches.length === 0 && query.length > 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No suggestions found</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchSuggestions;

