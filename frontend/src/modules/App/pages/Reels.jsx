import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiSend, FiArrowLeft, FiGift, FiShoppingBag, FiMoreVertical, FiVideo, FiVolume2, FiVolumeX, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoritesStore } from "../../../store/favoritesStore";
import { useAuthStore } from "../../../store/authStore";
import socketService from "../../../utils/socket";
import toast from "react-hot-toast";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import api from "../../../utils/api";

const getOptimizedVideoUrl = (url) => {
  if (!url) return '';
  if (url.includes('cloudinary.com')) {
    let newUrl = url.replace('http:', 'https:');
    // Replace .avi, .mkv, .mov with .mp4 for browser compatibility
    // Or use f_auto,q_auto if using upload/ folder properly
    // Simple extension replace works for cloudinary resources if format is available
    // But usually we should use transformation.
    // For now assuming extension switch works or transformation:
    return newUrl.replace(/\.(avi|mkv|mov)$/i, '.mp4');
  }
  return url;
};

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
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const { user, token } = useAuthStore();
  const { addVideo, removeVideo, isInVideos } = useFavoritesStore();

  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [followedVendors, setFollowedVendors] = useState([]);
  const [likedReels, setLikedReels] = useState([]); // Array of IDs

  // Comment State
  const [showComments, setShowComments] = useState(false);
  const [activeReelComments, setActiveReelComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeReelId, setActiveReelId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const pressTimer = useRef(null);
  const isLongPress = useRef(false);
  const muteIconTimeout = useRef(null);
  const heartAnimTimeout = useRef(null);
  const lastTapRef = useRef(0);
  const clickTimer = useRef(null);

  const handleFollow = (vendorId) => {
    if (!vendorId) return;
    if (followedVendors.includes(vendorId)) {
      setFollowedVendors(prev => prev.filter(id => id !== vendorId));
    } else {
      setFollowedVendors(prev => [...prev, vendorId]);
    }
  };

  // Fetch Reels & Liked Status
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const reelId = searchParams.get("reel");
        let fetchedReels = [];

        // 1. Fetch Feed
        const feedResponse = await api.get('/user/reels?limit=20');
        if (feedResponse.success && Array.isArray(feedResponse.data?.reels)) {
          fetchedReels = feedResponse.data.reels;
        }

        // 2. If specific reel requested, ensure it's in the list
        if (reelId) {
          const index = fetchedReels.findIndex(r => (r._id || r.id) === reelId);
          if (index !== -1) {
            setCurrentIndex(index);
          } else {
            try {
              const singleReelResponse = await api.get(`/user/reels/${reelId}`);
              if (singleReelResponse.success && singleReelResponse.data?.reel) {
                fetchedReels = [singleReelResponse.data.reel, ...fetchedReels];
                setCurrentIndex(0);
              }
            } catch (err) {
              console.error("Error fetching specific reel:", err);
            }
          }
        }

        // Normalize IDs
        const normalized = fetchedReels.map(r => ({ ...r, id: r._id || r.id }));
        setReels(normalized);

        // 3. Fetch Liked Status if logged in
        if (token && normalized.length > 0) {
          const reelIds = normalized.map(r => r.id).join(',');
          const likedResponse = await api.get(`/user/reels/liked?reelIds=${reelIds}`);
          if (likedResponse.success) {
            setLikedReels(likedResponse.data.likedReelIds || []);
          }
        }

      } catch (error) {
        console.error("Error loading reels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, token]);

  // Socket setup
  useEffect(() => {
    if (!token) return;

    socketService.connect(token);
    const socket = socketService.getSocket();

    if (socket) {
      socket.on('reel_like_update', (data) => {
        setReels(prev => prev.map(r =>
          r.id === data.reelId ? { ...r, likes: data.likes } : r
        ));

        if (data.userId === (user?.id || user?._id)) {
          setLikedReels(prev =>
            data.isLiked ? [...prev, data.reelId] : prev.filter(id => id !== data.reelId)
          );
        }
      });

      socket.on('new_reel_comment', (data) => {
        if (activeReelId === data.reelId) {
          setActiveReelComments(prev => [data.comment, ...prev]);
        }
        setReels(prev => prev.map(r =>
          r.id === data.reelId ? { ...r, comments: (r.comments || 0) + 1 } : r
        ));
      });

      socket.on('reel_comment_updated', (data) => {
        if (activeReelId === data.reelId) {
          setActiveReelComments(prev => prev.map(c =>
            (c.id === data.comment.id || c._id === data.comment.id) ? data.comment : c
          ));
        }
      });

      socket.on('reel_comment_deleted', (data) => {
        if (activeReelId === data.reelId) {
          setActiveReelComments(prev => prev.filter(c =>
            (c.id !== data.commentId && c._id !== data.commentId)
          ));
        }
        setReels(prev => prev.map(r =>
          r.id === data.reelId ? { ...r, comments: Math.max(0, (r.comments || 0) - 1) } : r
        ));
      });
    }

    return () => {
      if (socket) {
        socket.off('reel_like_update');
        socket.off('new_reel_comment');
        socket.off('reel_comment_updated');
        socket.off('reel_comment_deleted');
      }
    };
  }, [token, activeReelId, user]);

  // Join/Leave reel rooms as we scroll
  useEffect(() => {
    const currentReel = reels[currentIndex];
    if (currentReel?.id) {
      socketService.joinReelRoom(currentReel.id);
      return () => socketService.leaveReelRoom(currentReel.id);
    }
  }, [currentIndex, reels]);

  // Handle Play/Pause on visibility change
  useEffect(() => {
    if (reels.length === 0) return;

    // Slight delay to ensure refs are attached
    const timer = setTimeout(() => {
      if (!videoRefs.current[currentIndex]) return;

      videoRefs.current.forEach((video, index) => {
        if (video) {
          if (index === currentIndex) {
            video.currentTime = 0;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => {
                // Auto-play policy
                video.muted = true;
                setIsMuted(true);
                video.play().catch(() => { });
              });
            }
          } else {
            video.pause();
          }
        }
      });
    }, 100);

    // Scroll to current index
    if (containerRef.current) {
      const targetScroll = currentIndex * containerRef.current.clientHeight;
      if (Math.abs(containerRef.current.scrollTop - targetScroll) > 50) {
        containerRef.current.scrollTo({ top: targetScroll, behavior: 'auto' }); // Use auto for instant jump on load
      }
    }

    return () => clearTimeout(timer);
  }, [currentIndex, reels.length]); // Depend on length to trigger after fetch

  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (currentIndex !== index) {
      setCurrentIndex(index);
    }
  };

  const toggleLike = (reel) => {
    if (!token) {
      toast.error("Please login to like");
      return;
    }
    if (showComments) setShowComments(false);
    const reelId = reel.id || reel._id;
    socketService.likeReel(reelId);
    triggerHeartAnimation();
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
        if (!likedReels.includes(reel.id)) {
          toggleLike(reel);
        }
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
    const url = `${window.location.origin}/app/reels?reel=${reel.id}`;
    if (navigator.share) {
      navigator.share({
        title: reel.productName || "Check out this reel",
        text: reel.description,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCommentClick = async (reelId) => {
    if (showComments && activeReelId === reelId) {
      setShowComments(false);
      return;
    }
    setActiveReelId(reelId);
    setShowComments(true);
    setLoadingComments(true);
    try {
      const response = await api.get(`/user/reels/${reelId}/comments`);
      if (response.success) {
        setActiveReelComments(response.data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !activeReelId) return;
    if (!token) {
      toast.error("Please login to comment");
      return;
    }

    socketService.sendReelComment(activeReelId, newComment, (response) => {
      if (response.success) {
        setNewComment("");
      } else {
        toast.error(response.error || "Failed to add comment");
      }
    });
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id || comment._id);
    setEditingText(comment.text);
  };

  const handleUpdateComment = () => {
    if (!editingText.trim() || !editingCommentId || !activeReelId) return;

    socketService.editReelComment(activeReelId, editingCommentId, editingText, (response) => {
      if (response.success) {
        setEditingCommentId(null);
        setEditingText("");
        toast.success("Comment updated");
      } else {
        toast.error(response.error || "Failed to update comment");
      }
    });
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    if (!activeReelId) return;

    socketService.deleteReelComment(activeReelId, commentId, (response) => {
      if (response.success) {
        toast.success("Comment deleted");
      } else {
        toast.error(response.error || "Failed to delete comment");
      }
    });
  };

  if (loading) {
    return (
      <MobileLayout showBottomNav={true} showCartBar={false}>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/30 border-t-white"></div>
        </div>
      </MobileLayout>
    );
  }

  if (reels.length === 0) {
    return (
      <MobileLayout showBottomNav={true} showCartBar={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <FiVideo className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No Reels Available</h3>
          <p className="text-gray-500 mt-2 max-w-[250px]">Check back later for exciting video content from our vendors!</p>
          <button
            onClick={() => navigate('/app')}
            className="mt-8 px-8 py-3 bg-black text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
          >
            Explore Home
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden select-none">
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-6 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <button onClick={() => navigate(-1)} className="text-white p-2 pointer-events-auto bg-white/10 backdrop-blur-md rounded-full active:scale-90 transition-transform">
          <FiArrowLeft className="text-2xl" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-white font-black tracking-widest text-lg uppercase shadow-sm">Reels</span>
          <div className="h-1 w-8 bg-white/30 rounded-full mt-1"></div>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Vertical Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none"
      >
        {reels.map((reel, index) => (
          <div key={reel._id || reel.id} className="h-full w-full snap-start snap-always relative bg-black flex items-center justify-center overflow-hidden">
            {/* Video Player */}
            <video
              ref={el => videoRefs.current[index] = el}
              src={getOptimizedVideoUrl(reel.videoUrl)}
              className="h-full w-full object-cover sm:object-contain"
              loop
              muted={index !== currentIndex || isMuted}
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
                if (isLongPress.current && video.paused) video.play();
                isLongPress.current = false;
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
              <AnimatePresence>
                {showMuteIcon && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="bg-black/40 p-5 rounded-full backdrop-blur-md border border-white/10"
                  >
                    {isMuted ? (
                      <FiVolumeX className="text-white text-4xl" />
                    ) : (
                      <FiVolume2 className="text-white text-4xl" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Like Heart Animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
              <AnimatePresence>
                {showHeartAnim && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: 1, scale: 1.8, y: -20 }}
                    exit={{ opacity: 0, scale: 0.8, y: -60 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <FaHeart className="text-red-500 text-7xl drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions Bar */}
            <div className={`absolute right-3 bottom-36 flex flex-col items-center gap-5 z-[60] transition-opacity duration-300 ${showComments ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(reel); }}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
              >
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 shadow-lg group">
                  {likedReels.includes(reel.id) ? (
                    <FaHeart className="text-3xl text-red-500 transition-colors" />
                  ) : (
                    <FiHeart className="text-3xl text-white group-hover:text-red-400" />
                  )}
                </div>
                <span className="text-white text-sm font-bold drop-shadow-md">{reel.likes || 0}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommentClick(reel.id);
                }}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
              >
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 shadow-lg">
                  <FiMessageCircle className="text-3xl text-white" />
                </div>
                <span className="text-white text-sm font-bold drop-shadow-md">{reel.comments || 0}</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleShare(reel); }}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
              >
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 shadow-lg">
                  <FiSend className="text-3xl text-white transform -rotate-[30deg] -translate-y-0.5" />
                </div>
                <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
              </button>
            </div>

            {/* Overlay Info */}
            <div className={`absolute bottom-0 left-0 right-0 p-5 pb-24 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${showComments ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-end justify-between pointer-events-auto">
                <div className="flex-1 mr-12 group">
                  {/* User/Vendor Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Link
                      to={`/app/vendor/${reel.vendorId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 hover:opacity-90 active:scale-95 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 overflow-hidden shadow-xl ring-2 ring-black/20">
                        <img
                          src={reel.vendorLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.vendorName || "Vendor")}&background=random&color=fff`}
                          alt="Vendor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-white font-black text-base drop-shadow-xl tracking-tight">{reel.vendorName || "Store"}</span>
                    </Link>
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(reel.vendorId);
                      }}
                      className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all shadow-md active:scale-95 ${followedVendors.includes(reel.vendorId)
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-white text-black border-transparent"
                        }`}
                    >
                      {followedVendors.includes(reel.vendorId) ? "Following" : "Follow"}
                    </button> */}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 max-w-[85%]">
                    <h3 className="text-white text-lg font-black leading-tight drop-shadow-md">{reel.productName || "Product Highlight"}</h3>
                    <p className="text-white/90 text-sm line-clamp-2 leading-relaxed font-medium drop-shadow-sm">{reel.description || reel.title || "Experience quality products in action. Buy now and get exclusive offers!"}</p>
                  </div>

                  {/* Product Link Tag */}
                  {(reel.productId) && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-5"
                    >
                      <Link to={`/app/product/${reel.productId}`} className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-3 rounded-2xl shadow-[0_10px_20px_-5px_rgba(245,158,11,0.5)] active:scale-95 transition-all cursor-pointer border border-white/20">
                        <FiShoppingBag className="text-black text-lg" />
                        <div className="flex flex-col text-left">
                          <span className="text-black text-[10px] font-black uppercase tracking-wider leading-none">Best Price</span>
                          {reel.productPrice > 0 && <span className="text-black text-base font-black leading-tight">₹{reel.productPrice}</span>}
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 px-4"
            />
            <motion.div
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.3}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowComments(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[32px] z-50 h-[75vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle Area */}
              <div
                className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
                <div className="w-full flex items-center justify-between px-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    Comments <span className="text-gray-400 text-sm font-bold">({activeReelComments.length})</span>
                  </h3>
                  <button onClick={() => setShowComments(false)} className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-90">
                    <FiX className="text-xl text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {loadingComments ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                    <span className="text-sm font-bold text-gray-400">Loading comments...</span>
                  </div>
                ) : activeReelComments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <FiMessageCircle className="text-6xl text-gray-400 mb-4" />
                    <p className="text-base font-bold text-gray-500">No comments yet</p>
                    <p className="text-sm">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  activeReelComments.map((comment) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={comment.id || comment._id}
                      className="flex gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white dark:ring-gray-800">
                        {comment.userName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[14px] text-gray-900 dark:text-gray-100">{comment.userName}</span>
                            <span className="text-[11px] font-bold text-gray-400">{comment.timeAgo}</span>
                          </div>

                          {(comment.userId === (user?.id || user?._id)) && (
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditComment(comment)}
                                className="text-gray-400 hover:text-primary-600 transition-colors"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id || comment._id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingCommentId === (comment.id || comment._id) ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full p-3 rounded-xl border border-primary-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleUpdateComment}
                                className="px-3 py-1 text-xs font-bold bg-primary-600 text-white rounded-lg"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[14px] leading-relaxed text-gray-600 dark:text-gray-300 font-medium">{comment.text}</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-6 border-t dark:border-gray-800 bg-white dark:bg-gray-900 pb-safe">
                <div className="relative flex items-center gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Share your thoughts..."
                    className="flex-1 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-medium pr-14 shadow-inner"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="absolute right-2 p-3 bg-primary-600 text-white rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:bg-primary-700 active:scale-95 shadow-lg flex items-center justify-center"
                  >
                    <FiSend className="text-xl" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileReels;
