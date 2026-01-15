import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import LazyImage from "../../../components/LazyImage";

const TrendingReelsSection = ({ reels, loading }) => {
    if (loading) {
        return (
            <div className="py-6 bg-black">
                <div className="px-4 mb-4">
                    <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-shrink-0 w-32 h-56 bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!reels || reels.length === 0) return null;

    return (
        <div className="py-8 bg-black">
            <div className="flex items-center justify-between px-4 mb-4">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        Trending Reels <FiPlay className="fill-red-500 text-red-500" />
                    </h2>
                    <p className="text-xs text-gray-400">Watch the latest trends</p>
                </div>
                <Link
                    to="/app/reels"
                    className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                    View All
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
                {reels.map((reel) => (
                    <Link
                        key={reel._id || reel.id}
                        to={`/app/reels?reel=${reel._id || reel.id}`}
                        className="relative flex-shrink-0 w-32 h-56 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 group"
                    >
                        <div className="w-full h-full bg-gray-900">
                            {/* Use LazyImage or video element if thumbnail is not available */}
                            <LazyImage
                                src={reel.thumbnail || (reel.videoUrl ? reel.videoUrl.replace('.avi', '.jpg') : '')}
                                alt={reel.description || "Reel"}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
                                onError={(e) => {
                                    // Fallback to placeholder if image fails
                                    e.target.style.display = 'none';
                                    e.target.parentElement.style.backgroundColor = '#333';
                                }}
                            />
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <FiPlay className="text-white ml-0.5 text-lg fill-white" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/50 to-transparent">
                            <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                                {reel.description || 'Watch now'}
                            </p>
                            {reel.vendorId && (
                                <p className="text-[9px] text-gray-400 mt-1 truncate">
                                    @{reel.vendorId.storeName || 'Vendor'}
                                </p>
                            )}
                        </div>

                        {/* Play icon always visible on mobile */}
                        <div className="absolute top-2 right-2 md:hidden">
                            <FiPlay className="text-white text-xs fill-white drop-shadow-md" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TrendingReelsSection;
