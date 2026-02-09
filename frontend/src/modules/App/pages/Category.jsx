import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiFilter, FiArrowLeft, FiGrid, FiList, FiX, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../../../components/ProductCard";
import ProductListItem from "../components/ProductListItem";
import { fetchPublicCategories, fetchPublicProducts, fetchActiveBanners, fetchPublicVendors } from "../../../services/publicApi";
import { useCategoryStore } from "../../../store/categoryStore";
import { useLocationStore } from "../../../store/locationStore";
import PageTransition from "../../../components/PageTransition";
import LazyImage from "../../../components/LazyImage";
import PromoStrip from "../../../components/PromoStrip.jsx";
import LowestPricesEver from "../../../components/LowestPricesEver.jsx";
import BrandLogosScroll from "../../../components/Home/BrandLogosScroll";
import FeaturedVendorsSection from "../components/FeaturedVendorsSection";
import NewArrivalsSection from "../components/NewArrivalsSection";
import RecommendedSection from "../components/RecommendedSection";
import { useTheme } from "../../../context/ThemeContext.jsx";
import { getTheme } from "../../../utils/themes.js";
import { useUIStore } from "../../../store/useStore";
import { useContentStore } from "../../../store/contentStore";
import HeroCarousel from "../components/HeroCarousel";

const MobileCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const categoryId = id;
  const { categories } = useCategoryStore();
  const { currentCity } = useLocationStore();
  const headerHeight = useUIStore(state => state.headerHeight);
  const fetchHomepageContent = useContentStore(state => state.fetchHomepageContent);

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [crazyDeals, setCrazyDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const cityName = currentCity?.name || '';
      const [catsRes, categoryBannersRes, vendorsRes, arrivalsRes, recommendedRes, dealsRes] = await Promise.all([
        fetchPublicCategories(),
        fetchActiveBanners({ categoryId: id, city: cityName }),
        fetchPublicVendors(),
        fetchPublicProducts({ categoryId: id, limit: 6, sort: '-createdAt' }),
        fetchPublicProducts({ categoryId: id, limit: 10, sort: '-popularity' }),
        fetchPublicProducts({ categoryId: id, limit: 10, hasDiscount: true, sort: '-discount' }),
        fetchHomepageContent()
      ]);
      if (catsRes) {
        const allCats = catsRes.data.categories || [];
        const currentCat = allCats.find(c => (c._id === id || c.id === id));
        setCategory(currentCat);
        setSubcategories(allCats.filter(c => c.parentId === id));
      }

      // Use category-specific banners, or fallback to homepage banners (with city filter)
      let bannersData = categoryBannersRes?.data?.banners || [];
      if (bannersData.length === 0) {
        // Fetch homepage banners as fallback with city filter
        const homeBannersRes = await fetchActiveBanners({ city: cityName });
        bannersData = homeBannersRes?.data?.banners || [];
      }
      setBanners(bannersData);

      if (vendorsRes.success) setVendors(vendorsRes.data.vendors || []);
      if (arrivalsRes.success) setNewArrivals(arrivalsRes.data.products || []);
      if (recommendedRes.success) setRecommended(recommendedRes.data.products || []);
      if (dealsRes?.success) setCrazyDeals(dealsRes.data.products || []);

    } catch (error) {
      console.error("Error fetching category page data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (pageNum = 1, append = false) => {
    try {
      setProductsLoading(true);
      const params = {
        categoryId: id,
        page: pageNum,
        limit: 10,
        ...filters
      };
      const res = await fetchPublicProducts(params);
      if (res.success) {
        const newProducts = res.data.products;
        setCategoryProducts(prev => append ? [...prev, ...newProducts] : newProducts);
        setHasMore(newProducts.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, currentCity]);

  useEffect(() => {
    fetchProducts(1, false);
  }, [id, filters]);

  const getThemeTab = (catId, catName) => {
    const themeMap = {
      '1': 'fashion',
      '2': 'footwear',
      '3': 'leather',
      '4': 'jewelry',
      '5': 'winter',
      '6': 'sports',
    };

    if (themeMap[catId]) return themeMap[catId];
    if (!catName) return 'all';
    const name = catName.toLowerCase();
    if (name.includes('cloth') || name.includes('fashion')) return 'fashion';
    if (name.includes('shoe') || name.includes('footwear')) return 'footwear';
    if (name.includes('bag') || name.includes('leather')) return 'leather';
    if (name.includes('jewel')) return 'jewelry';
    if (name.includes('winter')) return 'winter';
    if (name.includes('sport')) return 'sports';
    if (name.includes('beauty')) return 'beauty';
    if (name.includes('electron')) return 'electronics';
    if (name.includes('grocer')) return 'grocery';
    return 'all';
  };

  const activeTab = useMemo(() => getThemeTab(id, category?.name), [id, category?.name]);
  const theme = useMemo(() => getTheme(activeTab), [activeTab]);

  const loadMore = () => {
    if (!productsLoading && hasMore) {
      fetchProducts(page + 1, true);
    }
  };

  const filterButtonRef = useRef(null);

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.minRating || filters.category;

  if (loading && !category) {
    return (
      <PageTransition>
        <div className="animate-pulse p-4">
          <div className="w-full h-40 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition key={id}>
      <div className="w-full overflow-x-hidden">
        <div style={{
          background: `linear-gradient(to bottom, ${theme.primary[0]} 0px, ${theme.primary[1]} ${headerHeight}px, ${theme.primary[2]} 100%)`,
          paddingTop: `${headerHeight + 2}px`
        }}>
          {/* PromoStrip with banners - same as Home page */}
          <PromoStrip
            activeTab={activeTab}
            categoryName={category?.name}
            categoryId={id}
            categories={subcategories}
            crazyDeals={crazyDeals}
            activeBanner={banners[0]}
            heroBanner={
              <HeroCarousel banners={banners} loading={loading} />
            }
          />

          {/* Categories / Tags Section */}
          {subcategories.length > 0 && (
            <div className="px-4 py-8 mt-1">
              <h2
                className="text-xl font-black tracking-tight mb-4 px-1"
                style={{
                  color: '#000000',
                  textShadow: '0 1px 1px rgba(255,255,255,0.4)'
                }}
              >
                Explore More
              </h2>
              <div className="grid grid-cols-4 gap-3 px-1">
                {subcategories.map((sub) => (
                  <Link key={sub._id || sub.id} to={`/app/category/${sub._id || sub.id}`} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 group-hover:scale-105 transition-all duration-300 ring-1 ring-black/5 group-hover:ring-primary-500/30">
                      <LazyImage src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    </div>
                    <span
                      className="text-[10px] font-black text-center uppercase tracking-tighter truncate w-full px-1"
                      style={{ color: '#000000' }}
                    >
                      {sub.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Features Sections */}
          <LowestPricesEver activeTab={activeTab} categoryId={id} />
        </div>

        <div className="bg-[#f8fafc]">
          <FeaturedVendorsSection vendors={vendors} loading={loading} theme={theme} />
          <NewArrivalsSection products={newArrivals} loading={loading} theme={theme} />
          <RecommendedSection products={recommended} loading={loading} theme={theme} />

          {/* Main Product Feed Sticky Header */}
          <div
            className="px-4 py-4 backdrop-blur-3xl border-b sticky top-0 z-30 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderBottomColor: 'rgba(0,0,0,0.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1
                  className="text-2xl font-black tracking-tight leading-tight"
                  style={{
                    color: '#111827',
                    textShadow: '0 1px 1px rgba(255,255,255,0.5)'
                  }}
                >
                  {category?.name || "All Products"}
                </h1>
                <div
                  className="w-12 h-1.5 rounded-full mt-1"
                  style={{ backgroundColor: activeTab === 'all' ? '#10b981' : theme?.accentColor }}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? "bg-white shadow-sm text-primary-600" : "text-gray-400"}`}
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? "bg-white shadow-sm text-primary-600" : "text-gray-400"}`}
                  >
                    <FiList />
                  </button>
                </div>
                <button
                  ref={filterButtonRef}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 rounded-xl border transition-all relative ${showFilters ? "bg-primary-50 border-primary-100 text-primary-600" : "bg-white border-gray-200 text-gray-600"}`}
                >
                  <FiFilter />
                  {hasActiveFilters && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="py-4 grid grid-cols-2 gap-3 border-t border-gray-100 mt-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full p-2.5 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full p-2.5 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <div className="col-span-2 flex gap-2">
                      <button onClick={clearFilters} className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl">Clear All</button>
                      <button onClick={() => setShowFilters(false)} className="flex-[2] py-2 text-xs font-bold text-white gradient-green rounded-xl shadow-lg shadow-green-500/20">Apply</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Grid/List */}
          <div className="px-4 py-6 pb-20">
            {productsLoading && categoryProducts.length === 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                {Array(6).fill(0).map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-64" />)}
              </div>
            ) : categoryProducts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFilter className="text-4xl text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No products found</h3>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                  {categoryProducts.map((product) => (
                    viewMode === 'grid' ? (
                      <ProductCard key={product._id || product.id} product={product} />
                    ) : (
                      <ProductListItem key={product._id || product.id} product={product} />
                    )
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={loadMore}
                      disabled={productsLoading}
                      className="px-10 py-4 bg-white shadow-sm border border-gray-100 rounded-2xl text-gray-600 font-bold active:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                    >
                      {productsLoading && <FiLoader className="animate-spin" />}
                      {productsLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MobileCategory;
