import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiClock, FiTrendingUp, FiX } from "react-icons/fi";
import { getImageUrl } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT_SEARCHES = 5;
const MAX_SUGGESTIONS = 5;



const placeholderTexts = [
  "Search 'Milk' or 'Bread'...",
  "Everything you need, in 20 mins",
  "Find fresh groceries...",
  "Search 50+ local stores...",
  "What are you looking for?"
];

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileApp = location.pathname.startsWith("/app");

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // ============================
  // Recent Searches Helpers
  // ============================
  const getRecentSearches = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
    } catch {
      return [];
    }
  }, []);

  const saveRecentSearch = useCallback((value) => {
    if (!value.trim()) return;
    const recent = getRecentSearches();
    const updated = [
      value.trim(),
      ...recent.filter((s) => s !== value.trim())
    ].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [getRecentSearches]);

  const recentSearches = useMemo(() => getRecentSearches(), [getRecentSearches, showDropdown]);

  // ============================
  // Animated Placeholder
  // ============================
  useEffect(() => {
    if (!isFocused && !query.trim()) {
      const interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [isFocused, query]);

  // ============================
  // Fetch Suggestions (Debounced)
  // ============================
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { fetchPublicProducts, fetchPublicVendors } = await import("../services/publicApi");

        const [prodRes, venRes] = await Promise.all([
          fetchPublicProducts({
            search: query.trim(),
            limit: Math.floor(MAX_SUGGESTIONS / 2) + 2
          }),
          fetchPublicVendors({
            search: query.trim(),
            limit: 3
          })
        ]);

        let combinedSuggestions = [];

        if (prodRes.success) {
          const prods = (prodRes.data.products || []).map((p) => ({
            id: p._id || p.id,
            name: p.name,
            image: getImageUrl(p.images?.[0] || p.image),
            price: p.price,
            category: p.category?.name || "General",
            type: 'product'
          }));
          combinedSuggestions = [...combinedSuggestions, ...prods];
        }

        if (venRes.success) {
          const vens = (venRes.data.vendors || []).map((v) => ({
            id: v._id || v.id,
            name: v.storeName || v.name,
            image: getImageUrl(v.storeLogo),
            type: 'vendor',
            address: v.address
          }));
          combinedSuggestions = [...vens, ...combinedSuggestions]; // Shops first
        }

        setSuggestions(combinedSuggestions.slice(0, MAX_SUGGESTIONS + 2));
      } catch (err) {
        console.error("Suggestion Error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // ============================
  // Outside Click Close
  // ============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================
  // Keyboard Navigation
  // ============================
  const totalItems = useMemo(() => {
    if (query.trim()) return suggestions.length;
    return recentSearches.length;
  }, [query, suggestions, recentSearches]);

  const handleKeyDown = (e) => {
    if (!showDropdown && e.key === "ArrowDown") {
      setShowDropdown(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) handleSelect(selectedIndex);
      else handleSubmit();
    }

    if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  // ============================
  // Navigation Logic
  // ============================
  const goToSearch = (value) => {
    const route = isMobileApp
      ? `/app/search?q=${encodeURIComponent(value)}`
      : `/search?q=${encodeURIComponent(value)}`;

    navigate(route);
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    saveRecentSearch(query);
    goToSearch(query);
    setShowDropdown(false);
  };

  const handleSelect = (index) => {
    if (query.trim()) {
      const item = suggestions[index];
      if (!item) return;

      let route;
      if (item.type === 'vendor') {
        route = isMobileApp ? `/app/vendor/${item.id}` : `/vendor/${item.id}`;
      } else {
        route = isMobileApp ? `/app/product/${item.id}` : `/product/${item.id}`;
      }
      navigate(route);
    } else {
      if (index < recentSearches.length) {
        const value = recentSearches[index];
        saveRecentSearch(value);
        goToSearch(value);
      }
    }

    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // ============================
  // Render
  // ============================
  return (
    <div ref={wrapperRef} className={`relative w-full md:max-w-4xl mx-auto group transition-all duration-300 ${isFocused ? "z-[1001]" : "z-10"}`}>
      {/* Animated Glow Backdrop */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute -inset-1.5 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-blue-500/20 rounded-[22px] blur-xl z-[100]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <div className={`
          relative flex items-center bg-white/95 backdrop-blur-xl border transition-all duration-300 rounded-2xl overflow-hidden
          ${isFocused ? "border-purple-500/50 shadow-2xl shadow-purple-200/50 ring-4 ring-purple-500/5" : "border-gray-200 shadow-lg shadow-gray-200/20"}
          h-14 md:h-13 lg:h-14
        `}>
          <div className="pl-4 md:pl-5 lg:pl-6 flex items-center justify-center pointer-events-none">
            <FiSearch className={`text-xl transition-colors duration-300 ${isFocused ? "text-purple-600" : "text-gray-400"}`} />
          </div>

          <div className="relative flex-1">
            {!query && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none w-full">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="text-gray-400 text-sm md:text-base font-medium whitespace-nowrap"
                  >
                    {placeholderTexts[placeholderIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowDropdown(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="w-full pl-4 pr-10 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 text-base md:text-base font-medium placeholder:text-transparent h-full"
            />
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-1 pr-2">
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1.5 lg:p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Clear"
              >
                <FiX className="text-lg lg:text-base" />
              </button>
            )}

            <button
              onClick={handleSubmit}
              className={`
                px-4 md:px-6 lg:px-8 py-2 md:py-2 rounded-xl font-black text-[14px] md:text-sm uppercase tracking-widest transition-all flex items-center gap-2
                ${query.trim()
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}
              `}
            >
              <span className="hidden sm:inline">Search</span>
              <FiSearch className="sm:hidden text-base md:text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Dropdown */}
      <AnimatePresence>
        {showDropdown && (suggestions.length > 0 || recentSearches.length > 0 || !query.trim()) && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute z-[1001] mt-3 w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-100 py-3"
          >
            {/* Results for query */}
            {query.trim() && suggestions.length > 0 ? (
              <div className="px-3">
                <p className="px-4 py-2 text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                  Search Results
                </p>
                <div className="space-y-1">
                  {suggestions.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}-${index}`}
                      onClick={() => handleSelect(index)}
                      className={`
                        w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group/item
                        ${selectedIndex === index ? "bg-purple-50 ring-1 ring-purple-100" : "hover:bg-gray-50"}
                      `}
                    >
                      <div className="relative h-12 w-12 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=${item.type === 'vendor' ? 'FFE4E6' : 'EFF6FF'}&color=${item.type === 'vendor' ? 'E11D48' : '3B82F6'}&size=128&bold=true`;
                          }}
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate text-sm mb-0.5 group-hover/item:text-purple-600 transition-colors">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.type === 'vendor' ? (
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Shop</span>
                          ) : (
                            <>
                              <span className="text-xs font-black text-gray-800">₹{item.price}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.category}</span>
                            </>
                          )}
                        </div>
                        {item.type === 'vendor' && item.address && (
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {typeof item.address === 'string'
                              ? item.address
                              : `${item.address.city || ''}${item.address.city && item.address.state ? ', ' : ''}${item.address.state || ''}`}
                          </p>
                        )}
                      </div>
                      <div className="text-gray-300 group-hover/item:text-purple-400 group-hover/item:translate-x-1 transition-all">
                        <FiTrendingUp className="rotate-45" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : query.trim() && !suggestions.length ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiSearch className="text-gray-300 text-2xl" />
                </div>
                <p className="text-gray-900 font-bold mb-1">No products found</p>
                <p className="text-xs text-gray-500">Try adjusting your keywords or browse popular categories</p>
              </div>
            ) : null}

            {/* Recent Searches (Shown when empty query) */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="px-3">
                  <p className="px-4 py-3 text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                    <FiClock className="text-xs" /> Recent Activity
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {recentSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all
                          ${selectedIndex === index ? "bg-purple-50 text-purple-600 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                        `}
                      >
                        <FiClock className={`text-sm ${selectedIndex === index ? "text-purple-500" : "text-gray-300"}`} />
                        <span className="text-sm truncate">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestions Footer */}
            {!query.trim() && (
              <div className="mt-4 px-6 py-4 lg:py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between rounded-b-3xl">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="absolute w-4 h-4 rounded-full bg-green-500/20 animate-ping"></div>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Live Inventory</span>
                </div>
                <button className="text-[10px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-[0.2em] hover:translate-x-1 transition-transform">
                  Explore Everything
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
