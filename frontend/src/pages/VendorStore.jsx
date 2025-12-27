import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiShoppingBag, FiCheckCircle, FiFilter, FiGrid, FiList, FiShare2, FiHeart, FiGlobe, FiInfo, FiSearch, FiMessageCircle, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getVendorById } from '../modules/vendor/data/vendors';
import { getVendorReels } from '../utils/reelHelpers';
import { products } from '../data/products';
import { formatPrice } from '../utils/helpers';
import ProductCard from '../components/ProductCard';
import ProductListItem from '../modules/App/components/ProductListItem';
import Header from '../components/Layout/Header';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import MobileLayout from '../components/Layout/Mobile/MobileLayout';
import PageTransition from '../components/PageTransition';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import useResponsiveHeaderPadding from '../hooks/useResponsiveHeaderPadding';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import Badge from '../components/Badge';

const VendorStore = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { responsivePadding } = useResponsiveHeaderPadding();
  const vendor = getVendorById(id);
  const productIdRef = useRef(null);

  // Follower Logic
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(vendor?.followers || 50);

  useEffect(() => {
    if (vendor) {
      const followed = JSON.parse(localStorage.getItem('user_followed_vendors') || '[]');
      if (followed.includes(vendor.id)) {
        setIsFollowing(true);
      }
    }
  }, [vendor]);

  const handleFollow = () => {
    const followed = JSON.parse(localStorage.getItem('user_followed_vendors') || '[]');
    let newFollowed;
    if (isFollowing) {
      newFollowed = followed.filter(id => id !== vendor.id);
      setFollowers(prev => prev - 1);
      setIsFollowing(false);
    } else {
      newFollowed = [...followed, vendor.id];
      setFollowers(prev => prev + 1);
      setIsFollowing(true);
    }
    localStorage.setItem('user_followed_vendors', JSON.stringify(newFollowed));
  };

  // Check if we're in the mobile app section
  const isMobileApp = location.pathname.startsWith('/app');

  // Get productId from query params
  const productIdFromQuery = searchParams.get('productId');

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: false,
  });

  // Get vendor products
  const vendorProducts = useMemo(() => {
    if (!vendor) return [];
    return products.filter((p) => {
      const productVendorId = typeof p.vendorId === 'string'
        ? parseInt(p.vendorId.replace('vendor-', ''))
        : p.vendorId;
      const vendorIdNum = typeof vendor.id === 'string'
        ? parseInt(vendor.id)
        : vendor.id;
      return productVendorId === vendorIdNum || p.vendorId === vendor.id || p.vendorId === vendorIdNum;
    });
  }, [vendor]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...vendorProducts];

    // Apply filters
    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(filters.maxPrice));
    }
    if (filters.minRating) {
      filtered = filtered.filter((p) => (p.rating || 0) >= parseFloat(filters.minRating));
    }
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stock !== 'out_of_stock');
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // Popular (by rating and review count)
        filtered.sort((a, b) => {
          const scoreA = (a.rating || 0) * (a.reviewCount || 0);
          const scoreB = (b.rating || 0) * (b.reviewCount || 0);
          return scoreB - scoreA;
        });
    }

    return filtered;
  }, [vendorProducts, filters, sortBy]);

  const { displayedItems, hasMore, loadMore, loadMoreRef } = useInfiniteScroll(
    filteredProducts,
    12,
    12
  );

  // Scroll to product if productId is in query params
  useEffect(() => {
    if (productIdFromQuery && productIdRef.current && isMobileApp) {
      // Small delay to ensure products are rendered
      setTimeout(() => {
        productIdRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  }, [productIdFromQuery, displayedItems, isMobileApp]);

  if (!vendor) {
    if (isMobileApp) {
      return (
        <PageTransition>
          <MobileLayout showBottomNav={true} showCartBar={true}>
            <div className="w-full flex items-center justify-center min-h-[60vh] px-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Vendor Not Found</h2>
                <button
                  onClick={() => navigate('/app')}
                  className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Go Back Home
                </button>
              </div>
            </div>
          </MobileLayout>
        </PageTransition>
      );
    }

    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 w-full overflow-x-hidden">
          <Header />
          <Navbar />
          <main className="w-full overflow-x-hidden flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Vendor Not Found</h2>
              <Link to="/" className="gradient-green text-white px-6 py-3 rounded-xl font-semibold">
                Go Back Home
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Mobile App Layout
  if (isMobileApp) {
    const [activeTab, setActiveTab] = useState('shop');

    const handleChatClick = () => {
      navigate(`/app/chat?vendorId=${vendor.id}&vendorName=${encodeURIComponent(vendor.storeName)}`);
    };

    return (
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true} showHeader={false}>
          <div className="w-full pb-24 bg-gray-50 min-h-screen">
            {/* Banner Section */}
            <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800">
              {/* Back Button & Share */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
                    <FiSearch size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
                    <FiShare2 size={20} />
                  </button>
                </div>
              </div>

              {/* Cover Image (if supported later) */}
              <div className="absolute inset-0 opacity-20 pattern-dots"></div>
            </div>

            {/* Profile Section */}
            <div className="px-4 -mt-12 relative z-10">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-20 -mt-10 rounded-xl border-4 border-white bg-white shadow-sm overflow-hidden">
                    {vendor.storeLogo ? (
                      <img
                        src={vendor.storeLogo}
                        alt={vendor.storeName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/logos/logo.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <FiShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 -mt-2">
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-full text-sm font-semibold shadow-lg transition-all ${isFollowing
                        ? 'bg-gray-100 text-gray-800 border border-gray-200'
                        : 'bg-black text-white shadow-gray-200'
                        }`}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">{vendor.storeName}</h1>
                    {vendor.isVerified && (
                      <FiCheckCircle className="text-blue-500" title="Verified Vendor" />
                    )}
                  </div>
                  {vendor.storeDescription && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{vendor.storeDescription}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-gray-900">{vendor.rating || '4.8'}</span>
                      <span className="text-gray-500">({vendor.reviewCount || 124} reviews)</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="font-semibold text-gray-900">
                      {followers} <span className="font-normal text-gray-500">Followers</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-500">{vendor.totalProducts || vendorProducts.length} Items</span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-4 gap-2 mt-6 mb-2">
                    <a
                      href={`tel:${vendor.phone || '+919876543210'}`}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-xl border border-red-100 bg-white flex items-center justify-center text-red-500 shadow-sm group-active:scale-95 transition-transform">
                        <FiPhone size={20} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${vendor.phone || '919876543210'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-xl border border-green-100 bg-white flex items-center justify-center text-green-500 shadow-sm group-active:scale-95 transition-transform">
                        <FaWhatsapp size={22} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                    </a>

                    <button
                      onClick={handleChatClick}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-xl border border-orange-100 bg-white flex items-center justify-center text-orange-500 shadow-sm group-active:scale-95 transition-transform">
                        <FiMessageCircle size={22} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Chat</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vendor.storeName} ${vendor.address?.city || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-xl border border-blue-100 bg-white flex items-center justify-center text-blue-500 shadow-sm group-active:scale-95 transition-transform">
                        <FiMapPin size={20} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Navigate</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-[60px] md:top-[70px] z-20 bg-gray-50 pt-2 pb-1 px-4">
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                {['Shop', 'Photos', 'Videos', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.toLowerCase()
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 mt-2">
              {activeTab === 'shop' && (
                <div className="pb-20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">All Products ({filteredProducts.length})</h3>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 shadow-sm"
                    >
                      <FiFilter size={18} />
                    </button>
                  </div>

                  {/* Filter Panel */}
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Min Price</label>
                            <input
                              type="number"
                              value={filters.minPrice}
                              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                              className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Max Price</label>
                            <input
                              type="number"
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                              className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {filteredProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {displayedItems.map((product) => (
                          <div
                            key={product.id}
                            ref={productIdFromQuery && parseInt(productIdFromQuery) === product.id ? productIdRef : null}
                            className={productIdFromQuery && parseInt(productIdFromQuery) === product.id ? 'ring-2 ring-primary-500 rounded-lg' : ''}>
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
                      {hasMore && (
                        <div ref={loadMoreRef} className="text-center py-8">
                          <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiShoppingBag className="text-3xl text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No Products Found</h3>
                      <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 min-h-[200px]">
                  <h3 className="font-bold text-gray-900 mb-4">Photos</h3>
                  {/* Placeholder for photos */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={`https://source.unsplash.com/random/300x300/?store,shop,${i}`}
                          alt="Store Photo"
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-8">More photos coming soon!</p>
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="pb-20">
                  <h3 className="font-bold text-gray-900 mb-4 px-1">Videos</h3>
                  {(() => {
                    const reels = getVendorReels(vendor.id);
                    if (reels.length > 0) {
                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {reels.map((reel) => (
                            <div key={reel.id} onClick={() => navigate(`/app/reels?reel=${reel.id}`)} className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative cursor-pointer">
                              <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover opacity-80" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                </div>
                              </div>
                              <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-[10px]">
                                <FiHeart size={10} className="fill-white" /> {reel.likes}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiMessageCircle className="text-3xl text-gray-300 transform rotate-90" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">No Videos Yet</h3>
                          <p className="text-gray-500 text-sm mt-1">This vendor hasn't uploaded any reels.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiStar className="text-gray-300 text-2xl" />
                  </div>
                  <h3 className="font-bold text-gray-900">Reviews Coming Soon</h3>
                  <p className="text-gray-500 text-sm mt-1">Store reviews are not available yet.</p>
                </div>
              )}
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  // Desktop Layout
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 w-full overflow-x-hidden">
        <Header />
        <Navbar />
        <main className="w-full overflow-x-hidden" style={{ paddingTop: `${responsivePadding}px` }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumbs */}
            <Breadcrumbs />

            {/* Vendor Header */}
            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Vendor Logo */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {vendor.storeLogo ? (
                      <img
                        src={vendor.storeLogo}
                        alt={vendor.storeName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/logos/logo.png';
                        }}
                      />
                    ) : (
                      <FiShoppingBag className="text-3xl text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">{vendor.storeName}</h1>
                    {vendor.isVerified && (
                      <FiCheckCircle className="text-green-600" title="Verified Vendor" />
                    )}
                  </div>
                  {vendor.storeDescription && (
                    <p className="text-gray-600 mb-3">{vendor.storeDescription}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {vendor.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <FiStar className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-800">{vendor.rating}</span>
                        <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
                      </div>
                    )}
                    <div className="text-gray-600">
                      <span className="font-semibold">{vendor.totalProducts || vendorProducts.length}</span> Products
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold">{vendor.totalSales || 0}</span> Sales
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and View Options */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <FiFilter />
                  <span className="text-sm font-semibold">Filters</span>
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <FiList />
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card rounded-xl p-4 mb-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Price
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Price
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="1000"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Rating
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Ratings</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Star</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">In Stock Only</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => setFilters({ minPrice: '', maxPrice: '', minRating: '', inStock: false })}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {displayedItems.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedItems.map((product, index) => (
                      <ProductListItem key={product.id} product={product} index={index} />
                    ))}
                  </div>
                )}
                {hasMore && (
                  <div ref={loadMoreRef} className="text-center py-8">
                    <p className="text-gray-500">Loading more products...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default VendorStore;

