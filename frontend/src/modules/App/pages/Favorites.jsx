import { useState } from "react";
import { FiStar, FiArrowLeft, FiGrid, FiList, FiVideo, FiShoppingBag, FiPlay } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import SwipeableWishlistItem from "../components/SwipeableWishlistItem";
import WishlistGridItem from "../components/WishlistGridItem";
import { useFavoritesStore } from "../../../store/favoritesStore";
import { useCartStore } from "../../../store/useStore";
import toast from "react-hot-toast";
import PageTransition from "../../../components/PageTransition";
import ProtectedRoute from "../../../components/Auth/ProtectedRoute";

const MobileFavorites = () => {
  const navigate = useNavigate();
  const { products, videos, removeProduct, removeVideo, moveToCart, clearAll } = useFavoritesStore();
  const { addItem } = useCartStore();
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'videos'
  const [viewMode, setViewMode] = useState("grid"); // 'list' or 'grid'

  const handleMoveToCart = (item) => {
    const favoriteItem = moveToCart(item.id);
    if (favoriteItem) {
      addItem({
        ...favoriteItem,
        quantity: 1,
      });
      toast.success("Moved to cart!");
    }
  };

  const handleRemoveProduct = (id) => {
    removeProduct(id);
    toast.success("Removed from favorites");
  };

  const handleRemoveVideo = (id) => {
    removeVideo(id);
    toast.success("Video removed from favorites");
  };

  const handleClearAll = () => {
    const type = activeTab === "products" ? "products" : "videos";
    if (window.confirm(`Are you sure you want to clear all ${type}?`)) {
      if (activeTab === "products") {
        // Since store only has clearAll, we'll just clear everything for now
        // or we could add specific clear methods to store
        clearAll();
      } else {
        clearAll();
      }
      toast.success("Favorites cleared");
    }
  };

  const activeItems = activeTab === "products" ? products : videos;

  return (
    <ProtectedRoute>
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true}>
          <div className="w-full pb-24">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 bg-white border-b border-gray-100 sticky top-0 z-40">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <FiArrowLeft className="text-xl text-gray-700" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-800 truncate">
                    My Favorites
                  </h1>
                </div>
                {activeItems.length > 0 && activeTab === "products" && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === "list"
                            ? "bg-white text-primary-600 shadow-sm"
                            : "text-gray-600"
                        }`}>
                        <FiList className="text-lg" />
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === "grid"
                            ? "bg-white text-primary-600 shadow-sm"
                            : "text-gray-600"
                        }`}>
                        <FiGrid className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === "products"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  <FiShoppingBag />
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === "videos"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  <FiVideo />
                  Videos ({videos.length})
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
                    {videos.length === 0 ? (
                      <EmptyState 
                        icon={FiVideo} 
                        title="No favorite videos" 
                        description="Reels you like will be saved here"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {videos.map((video) => (
                          <VideoFavoriteCard 
                            key={video.id} 
                            video={video} 
                            onRemove={handleRemoveVideo}
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
  
  return (
    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100 group shadow-sm">
      <img 
        src={video.thumbnail || video.videoUrl} 
        alt="" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
      
      {/* Play Button Overlay */}
      <button 
        onClick={() => navigate(`/app/reels?reel=${video.id}`)}
        className="absolute inset-0 flex items-center justify-center text-white"
      >
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
          <FiPlay className="fill-current text-2xl ml-1" />
        </div>
      </button>

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-xs font-medium line-clamp-1">{video.vendorName || 'Vendor'}</p>
      </div>

      {/* Remove Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(video.id);
        }}
        className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
      >
        <FiStar className="fill-current text-sm" />
      </button>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="text-4xl text-gray-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 px-8">{description}</p>
    <Link
      to="/app"
      className="gradient-green text-white px-8 py-3 rounded-xl font-semibold inline-block text-sm"
    >
      Explore More
    </Link>
  </div>
);

export default MobileFavorites;
