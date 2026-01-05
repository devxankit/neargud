import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiSend, FiArrowLeft, FiGift, FiShoppingBag, FiMoreVertical, FiVideo, FiVolume2, FiVolumeX, FiX } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveReels } from "../../../utils/reelHelpers";
import { getProductById } from "../../../data/products";
import { useFavoritesStore } from "../../../store/favoritesStore";
import toast from "react-hot-toast";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import useMobileHeaderHeight from "../../../hooks/useMobileHeaderHeight";

const MOCK_COMMENTS = [
  { id: 1, user: "Sarah J.", text: "Love this! 😍", avatar: "https://ui-avatars.com/api/?name=Sarah+J&background=random" },
  { id: 2, user: "Mike T.", text: "Is this available in black?", avatar: "https://ui-avatars.com/api/?name=Mike+T&background=random" },
  { id: 3, user: "Priya K.", text: "Bought this last week, totally worth it.", avatar: "https://ui-avatars.com/api/?name=Priya+K&background=random" },
];

const MobileReels = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const { addVideo, removeVideo, isInVideos } = useFavoritesStore();

  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [followedVendors, setFollowedVendors] = useState([]);

  // Comment State
  const [showComments, setShowComments] = useState(false);
  const [activeReelComments, setActiveReelComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeReelId, setActiveReelId] = useState(null);

  const handleFollow = (vendorId) => {
    if (!vendorId) return;

    if (followedVendors.includes(vendorId)) {
      setFollowedVendors(prev => prev.filter(id => id !== vendorId));
    } else {
      setFollowedVendors(prev => [...prev, vendorId]);
    }
  };



  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);
  const muteIconTimeout = useRef(null);
  const heartAnimTimeout = useRef(null);
  const lastTapRef = useRef(0);
  const clickTimer = useRef(null);
  const headerHeight = useMobileHeaderHeight();

  // Load reels data
  useEffect(() => {
    const type = searchParams.get("type");
    let loadedReels = [];

    if (type === "promotional") {
      const promoReels = localStorage.getItem("promotional_reels");
      if (promoReels) {
        loadedReels = JSON.parse(promoReels);
      }
    } else {
      loadedReels = getActiveReels();
    }

    // Update with actual product prices
    loadedReels = loadedReels.map(reel => {
      const product = getProductById(reel.productId);
      return {
        ...reel,
        productPrice: product ? product.price : (reel.productPrice || reel.price)
      };
    });

    // Fallback if no reels found
    if (loadedReels.length === 0 && type !== "promotional") {
      // Mock data is now handled in getActiveReels() via reelHelpers, but just in case:
      if (loadedReels.length === 0) {
        // This block might not be reached if reelHelpers provides defaults
        console.log("No reels found");
      }
    }

    // Check for specific reel query param
    const reelId = searchParams.get("reel");
    if (reelId) {
      const foundIndex = loadedReels.findIndex(r => r.id === parseInt(reelId));
      if (foundIndex !== -1) {
        setCurrentIndex(foundIndex);
      }
      // If we found a specific reel, maybe we want to put it first? 
      // Current implementation scrolls to it? No, setCurrentIndex sets logical index.
      // But we need to scroll to it once rendered.
    }

    setReels(loadedReels);
  }, [searchParams]);

  // Handle Play/Pause on visibility change
  useEffect(() => {
    if (videoRefs.current.length === 0) return;

    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.currentTime = 0;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.log("Autoplay prevented", e);
              // Fallback to muted autoplay if audio is blocked
              video.muted = true;
              video.play().then(() => {
                setIsMuted(true);
              }).catch(err => console.log("Muted autoplay also failed", err));
            });
          }
        } else {
          video.pause();
        }
      }
    });

    // Scroll to current index on initial load or change (if needed)
    // Actually snap scrolling handles position, we update index on scroll.
    // If we set currentIndex programmatically, we should scroll there.
    if (containerRef.current) {
      const targetScroll = currentIndex * containerRef.current.clientHeight;
      if (Math.abs(containerRef.current.scrollTop - targetScroll) > 10) {
        containerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }

  }, [currentIndex, reels]);

  const handleScroll = (e) => {
    const container = e.target;
    // Debounce check could improve perf, but direct match is fine for snap
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (currentIndex !== index) {
      setCurrentIndex(index);
    }
  };

  const toggleLike = (reel) => {
    if (isInVideos(reel.id)) {
      removeVideo(reel.id);
      toast.success("Removed from favorites");
    } else {
      addVideo({
        id: reel.id,
        videoUrl: reel.videoUrl,
        thumbnail: reel.thumbnail,
        vendorName: reel.vendorName || reel.uploadedBy || "Store",
        title: reel.productName || reel.title,
      });
      triggerHeartAnimation();
      toast.success("Added to favorites");
    }
  };

  const triggerHeartAnimation = () => {
    setShowHeartAnim(true);
    if (heartAnimTimeout.current) clearTimeout(heartAnimTimeout.current);
    heartAnimTimeout.current = setTimeout(() => setShowHeartAnim(false), 800);
  };

  const handleVideoClick = (e, reel) => {
    if (!isLongPress.current) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double Tap -> Like
        if (clickTimer.current) {
          clearTimeout(clickTimer.current);
          clickTimer.current = null;
        }

        if (!isInVideos(reel.id)) {
          addVideo({
            id: reel.id,
            videoUrl: reel.videoUrl,
            thumbnail: reel.thumbnail,
            vendorName: reel.vendorName || reel.uploadedBy || "Store",
            title: reel.productName || reel.title,
          });
          toast.success("Added to favorites");
        }
        // Always show animation on double tap (like confirmation)
        triggerHeartAnimation();
      } else {
        // Single Tap -> Mute Toggle (Delayed)
        clickTimer.current = setTimeout(() => {
          setIsMuted(prev => !prev);
          setShowMuteIcon(true);
          if (muteIconTimeout.current) clearTimeout(muteIconTimeout.current);
          muteIconTimeout.current = setTimeout(() => setShowMuteIcon(false), 800);
          clickTimer.current = null;
        }, DOUBLE_TAP_DELAY);
      }
      lastTapRef.current = now;
    }
  };

  const handleShare = (reel) => {
    if (navigator.share) {
      navigator.share({
        title: reel.productName || reel.title,
        text: reel.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCommentClick = (reelId) => {
    setActiveReelId(reelId);
    setActiveReelComments(MOCK_COMMENTS);
    setShowComments(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      user: "You",
      text: newComment,
      avatar: "https://ui-avatars.com/api/?name=You&background=random"
    };

    setActiveReelComments(prev => [newCommentObj, ...prev]);
    setNewComment("");
  };

  if (reels.length === 0) {
    return (
      <MobileLayout showBottomNav={true} showCartBar={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiVideo className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Reels Available</h3>
          <p className="text-gray-500 mt-2">Check back later for exciting video content!</p>
          <button
            onClick={() => navigate('/app')}
            className="mt-6 px-6 py-2 bg-black text-white rounded-full font-medium"
          >
            Back to Home
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => navigate(-1)} className="text-white p-2">
          <FiArrowLeft className="text-2xl" />
        </button>
        <span className="text-white font-bold tracking-wide">Reels</span>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Vertical Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="h-full w-full snap-start snap-always relative bg-gray-900 flex items-center justify-center">
            {/* Video Player */}
            <video
              ref={el => videoRefs.current[index] = el}
              src={reel.videoUrl}
              className="h-full w-full object-cover"
              loop
              muted={isMuted}
              playsInline
              onMouseDown={(e) => {
                const video = e.target;
                isLongPress.current = false;
                pressTimer.current = setTimeout(() => {
                  isLongPress.current = true;
                  video.pause();
                }, 200);
              }}
              onMouseUp={(e) => {
                const video = e.target;
                if (pressTimer.current) clearTimeout(pressTimer.current);
                if (isLongPress.current) {
                  video.play();
                }
                setTimeout(() => { isLongPress.current = false; }, 100);
              }}
              onMouseLeave={(e) => {
                const video = e.target;
                if (pressTimer.current) clearTimeout(pressTimer.current);
                if (isLongPress.current) {
                  video.play();
                }
                setTimeout(() => { isLongPress.current = false; }, 100);
              }}
              onTouchStart={(e) => {
                const video = e.target;
                isLongPress.current = false;
                pressTimer.current = setTimeout(() => {
                  isLongPress.current = true;
                  video.pause();
                }, 200);
              }}
              onTouchEnd={(e) => {
                const video = e.target;
                if (pressTimer.current) clearTimeout(pressTimer.current);
                if (isLongPress.current) {
                  video.play();
                }
                setTimeout(() => { isLongPress.current = false; }, 100);
              }}
              onClick={(e) => handleVideoClick(e, reel)}
            />

            {/* Mute Indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <AnimatePresence>
                {showMuteIcon && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="bg-black/50 p-4 rounded-full backdrop-blur-sm relative z-20"
                  >
                    {isMuted ? (
                      <FiVolumeX className="text-white text-3xl" />
                    ) : (
                      <FiVolume2 className="text-white text-3xl" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Like Heart Animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <AnimatePresence>
                {showHeartAnim && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: 1, scale: 1.5, y: -20 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaHeart className="text-red-500 text-6xl drop-shadow-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions Bar - Moved to Middle Right */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-6 z-20">
              <button onClick={() => toggleLike(reel)} className="flex flex-col items-center gap-1 group">
                <div className="group-active:scale-90 transition-transform drop-shadow-lg">
                  {isInVideos(reel.id) ? (
                    <FaHeart className="text-4xl text-red-500" />
                  ) : (
                    <FiHeart className="text-4xl text-white" />
                  )}
                </div>
                <span className="text-white text-xs font-medium">{isInVideos(reel.id) ? (reel.likes + 1) : reel.likes}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommentClick(reel.id);
                }}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="drop-shadow-lg">
                  <FiMessageCircle className="text-4xl text-white" />
                </div>
                <span className="text-white text-xs font-medium">{reel.comments}</span>
              </button>

              <button onClick={() => handleShare(reel)} className="flex flex-col items-center gap-1 group">
                <div className="drop-shadow-lg">
                  <FiSend className="text-4xl text-white transform -rotate-[90deg] -translate-y-1" />
                </div>
                <span className="text-white text-xs font-medium">Share</span>
              </button>

              {/* Mega Reward Promo Button */}
              {reel.isPromotional && (
                <button className="flex flex-col items-center gap-1 animate-pulse">
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
                    <FiGift className="text-2xl text-white" />
                  </div>
                  <span className="text-white text-[10px] font-bold">Win Big</span>
                </button>
              )}
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
              <div className="flex items-end justify-between pointer-events-auto">
                <div className="flex-1 mr-16">
                  {/* User/Vendor Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Link
                      to={`/app/vendor/${reel.vendorId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 border border-white overflow-hidden shadow-sm">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reel.vendorName || "Vendor")}&background=random&color=fff`}
                          alt="Vendor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-white font-bold text-sm drop-shadow-md">{reel.vendorName || reel.uploadedBy || "Store"}</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(reel.vendorId);
                      }}
                      className={`text-xs border px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm transition-all duration-200 ${followedVendors.includes(reel.vendorId)
                        ? "bg-transparent text-white border-white font-medium"
                        : "border-white/50 text-white hover:bg-white/20"
                        }`}
                    >
                      {followedVendors.includes(reel.vendorId) ? "Following" : "Follow"}
                    </button>
                  </div>

                  {/* Description */}
                  <h3 className="text-white text-base font-medium mb-1 line-clamp-1">{reel.productName || reel.title}</h3>
                  <p className="text-white/80 text-sm line-clamp-2 mb-2">{reel.description}</p>

                  {/* Product Link Tag */}
                  {(reel.productPrice || reel.price) && (
                    <Link to={`/app/product/${reel.productId || reel.id}`} className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg mb-2 active:scale-95 transition-transform cursor-pointer">
                      <FiShoppingBag className="text-yellow-400 text-xs" />
                      <span className="text-white text-xs font-bold">Shop Now • ₹{reel.productPrice || reel.price}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


      <AnimatePresence>
        {showComments && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/50 z-40"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl z-50 h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                <h3 className="font-bold text-gray-800 dark:text-white">Comments</h3>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <FiX className="text-xl text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeReelComments.length === 0 ? (
                  <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                    No comments yet. Be the first!
                  </div>
                ) : (
                  activeReelComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img src={comment.avatar} alt={comment.user} className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{comment.user}</span>
                          <span className="text-xs text-gray-400">Just now</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t dark:border-gray-800 flex gap-2 items-center bg-gray-50 dark:bg-gray-900">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white text-sm"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="p-2 bg-black text-white dark:bg-white dark:text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="text-lg" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Nav Overlay handled by layout or parent */}
    </div>
  );
};

export default MobileReels;
