import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiShoppingBag, FiCheckCircle, FiClock, FiMail, FiFilter, FiGrid, FiList, FiShare2, FiHeart, FiGlobe, FiInfo, FiSearch, FiMessageCircle, FiPhone, FiMapPin, FiLoader, FiUser, FiPlay } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
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
import Badge from '../components/Badge';

const VendorStore = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { responsivePadding } = useResponsiveHeaderPadding();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productIdRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Follower Logic
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);

  // Sync activeTab with URL
  const activeTab = searchParams.get('tab') || 'shop';
  const setActiveTab = (tab) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    });
  };

  // Fetch Vendor and Products
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const { fetchPublicVendorById, fetchPublicProducts } = await import('../services/publicApi');
        const res = await fetchPublicVendorById(id);

        if (res.success && res.data.vendor) {
          const vendorData = res.data.vendor;
          setVendor(vendorData);
          setFollowers(vendorData.followers || 50);

          // Check following status
          const followed = JSON.parse(localStorage.getItem('user_followed_vendors') || '[]');
          if (followed.includes(vendorData._id || vendorData.id)) {
            setIsFollowing(true);
          }

          // Fetch Products
          const productsRes = await fetchPublicProducts({
            vendorId: id,
            page,
            limit: 12
          });
          if (productsRes.success) {
            if (page === 1) {
              setProducts(productsRes.data.products || []);
            } else {
              setProducts(prev => [...prev, ...(productsRes.data.products || [])]);
            }
            setTotalPages(productsRes.data.totalPages || 1);
          }
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id, page]);

  const handleFollow = () => {
    const followed = JSON.parse(localStorage.getItem('user_followed_vendors') || '[]');
    let newFollowed;
    const vendorId = vendor._id || vendor.id;
    if (isFollowing) {
      newFollowed = followed.filter(vId => vId !== vendorId);
      setFollowers(prev => prev - 1);
      setIsFollowing(false);
    } else {
      newFollowed = [...followed, vendorId];
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

  // Filter and sort products (Client-side for now, can be moved to API)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

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
        filtered.sort((a, b) => b.createdAt?.localeCompare(a.createdAt));
        break;
      default:
        // Popular
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [products, filters, sortBy]);

  // Infinite scroll logic
  const hasMore = page < totalPages;
  const isLoading = loading;
  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };
  const displayedItems = filteredProducts;

  // Infinite scroll observer for mobile
  useEffect(() => {
    if (!hasMore || isLoading || !isMobileApp) return;

    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.1 });

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isMobileApp, loadMore]);

  // Scroll to product if productId is in query params
  useEffect(() => {
    if (productIdFromQuery && productIdRef.current && isMobileApp) {
      // Small delay to ensure products are rendered
      setTimeout(() => {
        productIdRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, [productIdFromQuery, displayedItems, isMobileApp]);

  if (loading && !vendor) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true} showHeader={false} style={{ paddingTop: 0 }}>
          <div className="w-full bg-slate-50 min-h-screen">
            {/* Banner Skeleton */}
            <div className="relative h-56 bg-slate-200 animate-pulse overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
            {/* Profile Skeleton */}
            <div className="px-4 -mt-16 relative z-10">
              <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-white">
                <div className="w-24 h-24 -mt-14 rounded-2xl bg-slate-100 animate-pulse border-[6px] border-white shadow-lg" />
                <div className="mt-5 space-y-4">
                  <div className="h-8 bg-slate-100 rounded-xl w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-50 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-16 bg-slate-50 rounded-2xl w-full animate-pulse mt-4" />
                </div>
              </div>
            </div>
            {/* Grid Skeleton */}
            <div className="px-4 mt-8 grid grid-cols-2 gap-4 pb-20">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-[1.5rem] border border-slate-100 p-2 space-y-3 shadow-sm">
                  <div className="w-full aspect-square bg-slate-50 rounded-2xl animate-pulse" />
                  <div className="px-1 space-y-2">
                    <div className="h-3 bg-slate-50 rounded w-5/6 animate-pulse" />
                    <div className="h-3 bg-slate-50 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  if (!loading && !vendor) {
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
              <Link to="/app" className="gradient-green text-white px-6 py-3 rounded-xl font-semibold">
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

    const handleChatClick = () => {
      navigate(`/app/chat?vendorId=${vendor._id || vendor.id}&vendorName=${encodeURIComponent(vendor.storeName || vendor.businessName || vendor.name)}`);
    };

    return (
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true} showHeader={false} style={{ paddingTop: 0 }}>
          <div className="w-full pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-screen">
            {/* Banner Section */}
            <div className="relative h-56 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 overflow-hidden">
              {/* Back Button & Share */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg hover:bg-white/20 transition-all"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/app/search?vendorId=${vendor._id || vendor.id}`)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                    <FiSearch size={20} />
                  </button>
                  <button
                    onClick={async () => {
                      const shareData = {
                        title: vendor.storeName,
                        text: `Check out ${vendor.storeName} on NearGud`,
                        url: window.location.href,
                      };
                      if (navigator.share) {
                        try {
                          await navigator.share(shareData);
                        } catch (err) {
                          console.error('Error sharing:', err);
                        }
                      } else {
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied to clipboard");
                        } catch (err) {
                          toast.error("Failed to copy link");
                        }
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg hover:bg-white/20 transition-all">
                    <FiShare2 size={20} />
                  </button>
                </div>
              </div>

              {/* Cover Image/Overlay */}
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Profile Section */}
            <div className="px-4 -mt-16 relative z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-xl shadow-gray-200/50 border border-white">
                <div className="flex justify-between items-start">
                  <div className="w-24 h-24 -mt-14 rounded-2xl border-[6px] border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
                    {vendor.storeLogo ? (
                      <img
                        src={vendor.storeLogo}
                        alt={vendor.storeName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(vendor.storeName) + '&background=random';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                        <FiShoppingBag size={28} />
                      </div>
                    )}
                  </div>

                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{vendor.storeName}</h1>
                    {vendor.isVerified && (
                      <div className="bg-blue-50 text-blue-600 p-1 rounded-full border border-blue-100">
                        <FiCheckCircle size={14} fill="currentColor" className="text-white" />
                      </div>
                    )}
                  </div>
                  {vendor.storeDescription && (
                    <p className="text-slate-500 text-sm mt-1.5 leading-relaxed line-clamp-2">{vendor.storeDescription}</p>
                  )}

                  <div className="flex items-center justify-between mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div className="flex flex-col items-center flex-1">
                      <div className="flex items-center gap-1">
                        <FiStar className="text-orange-400 fill-orange-400" size={14} />
                        <span className="font-extrabold text-slate-900 text-base">{vendor.rating || 0}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Rating</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200/60"></div>

                    <div className="w-px h-8 bg-slate-200/60"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="font-extrabold text-slate-900 text-base">{vendor.totalProducts || products.length || 0}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Products</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-4 gap-3 mt-7 mb-1">
                    <a
                      href={`tel:${vendor.phone || '+919876543210'}`}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm shadow-rose-100/50 group-hover:scale-105 active:scale-95 transition-all">
                        <FiPhone size={22} strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${vendor.phone || '919876543210'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-100/50 group-hover:scale-105 active:scale-95 transition-all">
                        <FaWhatsapp size={26} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">WhatsApp</span>
                    </a>

                    <button
                      onClick={handleChatClick}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm shadow-indigo-100/50 group-hover:scale-105 active:scale-95 transition-all">
                        <FiMessageCircle size={24} strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">Chat</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${vendor.storeName}, ${vendor.address?.street ? vendor.address.street + ', ' : ''}${vendor.address?.city || ''}, ${vendor.address?.state || ''} ${vendor.address?.zipCode || ''}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm shadow-amber-100/50 group-hover:scale-105 active:scale-95 transition-all">
                        <FiMapPin size={22} strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">Road</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-[60px] md:top-[70px] z-20 bg-slate-50/80 backdrop-blur-lg py-3 px-4 shadow-sm shadow-slate-200/20 border-b border-slate-100/10">
              <div className="flex bg-slate-200/50 rounded-2xl p-1 items-center relative gap-1">
                {['Shop', 'About', 'Photos', ...(vendor.hasReels ? ['Videos'] : []), 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all relative z-10 ${activeTab === tab.toLowerCase()
                      ? 'text-primary-600'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {activeTab === tab.toLowerCase() && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-white rounded-xl shadow-sm ring-1 ring-slate-100"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-20">{tab}</span>
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

                  {loading && displayedItems.length === 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-[1.5rem] border border-slate-100 p-2 space-y-3 shadow-sm animate-pulse">
                          <div className="w-full aspect-square bg-slate-50 rounded-2xl" />
                          <div className="px-1 space-y-2">
                            <div className="h-3 bg-slate-50 rounded w-5/6" />
                            <div className="h-3 bg-slate-50 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : displayedItems.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {displayedItems.map((product) => (
                          <div
                            key={product._id || product.id}
                            ref={productIdFromQuery && String(productIdFromQuery) === String(product._id || product.id) ? productIdRef : null}
                            className={productIdFromQuery && String(productIdFromQuery) === String(product._id || product.id) ? 'ring-2 ring-primary-500 rounded-lg' : ''}>
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
                  {products.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {products.map((product) => (
                        <div key={product._id || product.id} onClick={() => navigate(`/app/product/${product._id || product.id}`)} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                          <img
                            src={product.image || product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiGrid className="text-2xl text-gray-300" />
                      </div>
                      <p className="text-gray-500 text-sm">No photos available yet.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'videos' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 min-h-[300px] mb-20 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-5 px-1">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight">Store Videos</h3>
                    <div className="bg-rose-50 text-rose-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-100 animate-pulse">
                      LIVE REELS
                    </div>
                  </div>
                  {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {products.slice(0, 4).map((product, idx) => (
                        <Link
                          key={idx}
                          to={`/app/reels?vendorId=${vendor._id || vendor.id}`}
                          className="relative aspect-[9/16] bg-slate-100 rounded-[1.5rem] overflow-hidden group border border-slate-200 shadow-sm"
                        >
                          <img
                            src={product.image || product.imageUrl}
                            alt="Reel Thumbnail"
                            className="w-full h-full object-cover brightness-[0.85] group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg"
                            >
                              <FiPlay className="text-white ml-0.5" fill="currentColor" size={20} />
                            </motion.div>
                          </div>
                          <div className="absolute bottom-4 left-3 right-3">
                            <p className="text-white text-[11px] font-black leading-tight line-clamp-2 drop-shadow-md">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                              <p className="text-white/80 text-[9px] font-bold uppercase tracking-wider">Watch Reel</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 mx-1">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                        <FiPlay className="text-3xl text-slate-300 translate-x-0.5" />
                      </div>
                      <h4 className="text-slate-800 font-black text-base">No Videos Highlights</h4>
                      <p className="text-slate-500 text-xs mt-1.5 px-6">The vendor hasn't shared any video reels for his products yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 pb-20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-slate-900">{vendor.rating || 0}</span>
                        <div className="flex items-center text-orange-400 text-xs gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => <FiStar key={s} fill={s <= (vendor.rating || 0) ? "currentColor" : "none"} className={s <= (vendor.rating || 0) ? "" : "text-gray-300"} />)}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-gray-100"></div>
                      <div className="text-sm text-gray-500">
                        <div>Based on</div>
                        <div className="font-bold text-slate-800">{vendor.reviewCount || 0} Reviews</div>
                      </div>
                    </div>
                  </div>

                  {/* Since we don't have a direct endpoint for all vendor reviews yet, 
                        we will display a message or list high-rated products */}
                  <div className="space-y-4">
                    {/* Mock Reviews for UI Demo if real data not available, or message */}
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Customer reviews for this store's products are aggregated.</p>
                      <button onClick={() => setActiveTab('shop')} className="mt-3 text-primary-600 font-bold text-sm hover:underline">
                        Browse Products to see reviews
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Shop Details</h4>
                    <div className="space-y-4 text-sm">
                      <div className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-100">
                          <FiUser size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">Owner</p>
                          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                            {vendor.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-100">
                          <FiMapPin size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">Address</p>
                          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                            {vendor.address?.street ? `${vendor.address.street}, ` : ''}
                            {vendor.address?.city}, {vendor.address?.state} {vendor.address?.zipCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-100">
                          <FiMail size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">Email</p>
                          <p className="text-slate-500 text-xs mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{vendor.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">About Story</h4>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                      <p className="text-xs text-slate-600 leading-6 font-medium">
                        {vendor.storeDescription || 'Welcome to our store! We are dedicated to providing the best quality products and services to our valued customers. Each item in our collection is curated with care.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
                      <FiClock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Member since {new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
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
      <div className="min-h-screen bg-slate-50 w-full overflow-x-hidden">
        <Header />
        <Navbar />
        <main className="w-full overflow-x-hidden" style={{ paddingTop: `${responsivePadding}px` }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumbs />
            </div>

            {/* Vendor Header - High End Premium Look */}
            <div className="relative mb-8 bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100/20 rounded-full -ml-36 -mb-36 blur-3xl"></div>

              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Vendor Logo Container */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl border-[6px] border-white bg-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {vendor.storeLogo ? (
                      <img
                        src={vendor.storeLogo}
                        alt={vendor.storeName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(vendor.storeName) + '&background=random';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <FiShoppingBag size={40} />
                      </div>
                    )}
                  </div>
                  {vendor.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                      <FiCheckCircle size={14} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </div>

                {/* Vendor Info Section */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{vendor.storeName}</h1>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={handleFollow}
                        className={`px-8 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 ${isFollowing
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : 'bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700'
                          }`}
                      >
                        {isFollowing ? 'Following' : '+ Follow'}
                      </button>
                      <button className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-all">
                        <FiShare2 size={20} />
                      </button>
                    </div>
                  </div>

                  {vendor.storeDescription && (
                    <p className="text-slate-500 text-lg mb-6 leading-relaxed max-w-3xl">{vendor.storeDescription}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiStar className="text-orange-400 fill-orange-400" size={18} />
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{vendor.rating || 0}</span>
                      </div>
                      <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest">{vendor.reviewCount || 0} Reviews</span>
                    </div>

                    <div className="w-px h-10 bg-slate-200 hidden md:block"></div>

                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900 tracking-tight mb-1">{followers}</span>
                      <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest">Followers</span>
                    </div>

                    <div className="w-px h-10 bg-slate-200 hidden md:block"></div>

                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900 tracking-tight mb-1">{vendor.totalProducts || products.length || 0}</span>
                      <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest">Products Sold</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap justify-center md:justify-start gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                        <FiMail size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Email ADDRESS</span>
                        <span className="text-sm font-bold text-slate-700">{vendor.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <FiPhone size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-tighter">PHONE Number</span>
                        <span className="text-sm font-bold text-slate-700">{vendor.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FiMapPin size={20} />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-tighter">LOCATION</span>
                        <span className="text-sm font-bold text-slate-700">{vendor.address?.city}, {vendor.address?.state}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and View Options */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl border transition-all font-bold text-sm ${showFilters
                    ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-inner'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-md'
                    }`}
                >
                  <FiFilter size={18} />
                  <span>Filters</span>
                </button>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-6 pr-12 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-bold text-sm cursor-pointer hover:border-slate-300"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <FiList size={20} />
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
            {loading && displayedItems.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-3 space-y-4 shadow-sm animate-pulse">
                    <div className="w-full aspect-square bg-slate-50 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-50 rounded w-5/6" />
                      <div className="h-3 bg-slate-50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedItems.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {displayedItems.map((product) => (
                      <ProductCard key={product._id || product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedItems.map((product, index) => (
                      <ProductListItem key={product._id || product.id} product={product} index={index} />
                    ))}
                  </div>
                )}
                {hasMore && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    {isLoading && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiLoader className="animate-spin text-xl" />
                        <span>Loading more products...</span>
                      </div>
                    )}
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-6 py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
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

