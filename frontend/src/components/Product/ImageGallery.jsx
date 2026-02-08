import { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import LazyImage from '../LazyImage';
import useSwipeGesture from '../../hooks/useSwipeGesture';

const ImageGallery = ({ images, productName = 'Product' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Ensure images is an array
  const imageArray = Array.isArray(images) && images.length > 0 ? images : [images].filter(Boolean);

  if (imageArray.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">No image available</p>
      </div>
    );
  }

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % imageArray.length);
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
  };

  // Open lightbox
  const handleImageClick = () => {
    setIsLightboxOpen(true);
  };

  // Close lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Swipe gestures for image navigation
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 50,
  });

  return (
    <>
      <div className="w-full">
        {/* Main Image */}
        <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100" data-gallery>
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center cursor-zoom-in"
            onClick={handleImageClick}
            {...swipeHandlers}
          >
            <LazyImage
              src={imageArray[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x500?text=Product+Image';
              }}
            />
          </motion.div>

          {/* Navigation Arrows (if multiple images) */}
          {imageArray.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all z-10"
              >
                <FiChevronLeft className="text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all z-10"
              >
                <FiChevronRight className="text-gray-800" />
              </button>
            </>
          )}

          {/* Image Counter Badge */}
          {imageArray.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
              {selectedIndex + 1} / {imageArray.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {imageArray.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1">
            {imageArray.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedIndex === index
                  ? 'border-primary-600 ring-2 ring-primary-100'
                  : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
              >
                <div className="w-full h-full bg-white">
                  <LazyImage
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Thumbnail';
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center backdrop-blur-xl"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50 backdrop-blur-md"
            >
              <FiX className="text-xl" />
            </button>

            {/* Main Image Container */}
            <div
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking image area
            >
              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={imageArray[selectedIndex]}
                alt={`${productName} - Full view`}
                className="max-w-full max-h-screen object-contain select-none"
                draggable={false}
              />

              {/* Navigation in Lightbox */}
              {imageArray.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                    className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <FiChevronLeft className="text-2xl" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <FiChevronRight className="text-2xl" />
                  </button>
                </>
              )}
            </div>

            {/* Image Counter */}
            {imageArray.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium tracking-wide border border-white/10">
                {selectedIndex + 1} / {imageArray.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;

