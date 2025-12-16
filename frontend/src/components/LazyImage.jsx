import { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, className, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
      observer.disconnect();
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(false);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className || ''}`} ref={imgRef}>
      {/* Placeholder/Blur effect */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
      )}

      {/* Actual Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className || ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xs">Failed to load</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;

