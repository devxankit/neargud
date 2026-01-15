import { useState, useEffect } from "react";
import { FiStar, FiArrowLeft, FiGrid, FiList, FiVideo, FiShoppingBag, FiPlay, FiTrash2, FiHeart } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import SwipeableWishlistItem from "../components/SwipeableWishlistItem";
import WishlistGridItem from "../components/WishlistGridItem";
import { useWishlistStore } from "../../../store/wishlistStore";
import { useCartStore } from "../../../store/useStore";
import toast from "react-hot-toast";
import PageTransition from "../../../components/PageTransition";
import ProtectedRoute from "../../../components/Auth/ProtectedRoute";
import api from "../../../utils/api";
import LazyImage from "../../../components/LazyImage";

const MobileFavorites = () => {
  const navigate = useNavigate();
  const { items: products, removeItem: removeProduct, fetchWishlist, isLoading: loadingProducts } = useWishlistStore();
  const { addItem } = useCartStore();
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'videos'
  const [viewMode, setViewMode] = useState("grid"); // 'list' or 'grid'

  // State for API-fetched liked reels
  const [likedReels, setLikedReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (activeTab === "videos") {
      fetchLikedReels();
    }
  }, [activeTab]);

  const fetchLikedReels = async () => {
    setLoadingReels(true);
    try {
      const response = await api.get('/user/reels/favorites');
      if (response && response.success) {
        setLikedReels(response.data?.reels || []);
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setLoadingReels(false);
    }
  };

  const handleMoveToCart = (item) => {
    addItem({
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      quantity: 1,
    });
    removeProduct(item._id || item.id);
    toast.success("Moved to cart!");
  };

  const handleRemoveProduct = async (id) => {
    try {
      await removeProduct(id);
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error("Failed to remove product");
    }
  };

  const handleRemoveVideo = async (id) => {
    // Optimistic update
    const previousReels = [...likedReels];
    setLikedReels(prev => prev.filter(v => (v._id || v.id) !== id));

    try {
      await api.post(`/user/reels/${id}/like`); // This toggles like (so unlikes it)
      toast.success("Video removed from favorites");
    } catch (error) {
      console.error("Failed to remove video", error);
      toast.error("Failed to remove");
      setLikedReels(previousReels); // Revert
    }
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true}>
          <div className="w-full pb-24 min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="px-4 pt-6 pb-2 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 flex-shrink-0">
                  <FiArrowLeft className="text-xl text-slate-700" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    My Favorites
                  </h1>
                </div>
                {activeTab === "products" && products.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list"
                          ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5"
                          : "text-slate-400"
                          }`}>
                        <FiList className="text-lg" />
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                          ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5"
                          : "text-slate-400"
                          }`}>
                        <FiGrid className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mx-1">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === "products"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5 translate-y-[0px]"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <FiShoppingBag className={activeTab === "products" ? "text-primary-600" : ""} />
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`flex-1 py-2.5 text-xs font-black tracking-widest uppercase transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === "videos"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5 translate-y-[0px]"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <FiVideo className={activeTab === "videos" ? "text-primary-600" : ""} />
                  Videos ({loadingReels ? '...' : likedReels.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
              <AnimatePresence mode="wait">
                {activeTab === "products" ? (
                  <motion.div
                    key="products"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    {products.length === 0 ? (
                      <EmptyState
                        icon={FiStar}
                        title="No favorite products"
                        description="Items you like while shopping will appear here"
                      />
                    ) : (
                      <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                        {products.map((item, index) => (
                          viewMode === "grid" ? (
                            <WishlistGridItem
                              key={item.id}
                              item={item}
                              index={index}
                              onMoveToCart={handleMoveToCart}
                              onRemove={handleRemoveProduct}
                            />
                          ) : (
                            <SwipeableWishlistItem
                              key={item.id}
                              item={item}
                              index={index}
                              onMoveToCart={handleMoveToCart}
                              onRemove={handleRemoveProduct}
                            />
                          )
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="videos"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {loadingReels ? (
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="aspect-[9/16] bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : likedReels.length === 0 ? (
                      <EmptyState
                        icon={FiVideo}
                        title="No favorite videos"
                        description="Reels you like will be saved here"
                        linkTo="/app/reels"
                        linkText="Watch Reels"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {likedReels.map((video) => (
                          <VideoFavoriteCard
                            key={video._id || video.id}
                            video={video}
                            onRemove={() => handleRemoveVideo(video._id || video.id)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    </ProtectedRoute>
  );
};

const VideoFavoriteCard = ({ video, onRemove }) => {
  const navigate = useNavigate();
  // Ensure we have an ID for navigation
  const id = video._id || video.id;

  return (
    <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden bg-slate-100 group shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary-100">
      <LazyImage
        src={video.thumbnail || video.videoUrl || ""}
        alt={video.description || "Reel"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.style.backgroundColor = '#0f172a';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 group-hover:via-black/10 transition-all duration-300" />

      {/* Play Button Overlay */}
      <button
        onClick={() => navigate(`/app/reels?reel=${id}`)}
        className="absolute inset-0 flex items-center justify-center text-white z-10"
      >
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 shadow-lg">
          <FiPlay className="fill-current text-white text-xl ml-0.5" />
        </div>
      </button>

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none">
        <p className="text-white text-xs font-black line-clamp-2 leading-tight drop-shadow-md uppercase tracking-tight">{video.description || 'Watch now'}</p>
        <p className="text-[10px] text-white/70 line-clamp-1 mt-1 font-bold">@{video.vendorName || video.vendorId?.storeName || 'Vendor'}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-rose-500 hover:text-white transition-all duration-300 z-20 shadow-lg border border-white/20 active:scale-90"
      >
        <FiHeart className="fill-current text-sm" />
      </button>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description, linkTo = "/app", linkText = "Explore More" }) => (
  <div className="text-center py-20 px-8 flex flex-col items-center">
    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-slate-50">
      <Icon className="text-5xl text-primary-500" />
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-400 mb-8 max-w-[240px] leading-relaxed font-medium">{description}</p>
    <Link
      to={linkTo}
      className="gradient-green text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-200 active:scale-95 transition-all"
    >
      {linkText}
    </Link>
  </div>
);

export default MobileFavorites;

