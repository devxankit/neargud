import { useState, useEffect, useRef } from "react";
import { fetchActiveBanners } from "../../services/publicApi";
import { useLocationStore } from "../../store/locationStore";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef(null);

  // Get selected city from location store
  const { currentCity, initialize: initializeLocation } = useLocationStore();

  // Initialize location store
  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  // Default slides if no banners from API
  const defaultSlides = [
    { image: "/images/hero/slide1.png" },
    { image: "/images/hero/slide2.png" },
    { image: "/images/hero/slide3.png" },
    { image: "/images/hero/slide4.png" },
  ];

  // Fetch banners based on user's selected city
  useEffect(() => {
    const loadBanners = async () => {
      setIsLoading(true);
      try {
        // Use the city name from the selected city in location store
        const cityName = currentCity?.name || '';
        const response = await fetchActiveBanners({ city: cityName });

        if (response?.success && response?.data?.banners?.length > 0) {
          const banners = response.data.banners.map((banner) => ({
            image: banner.image,
            title: banner.title,
            link: banner.link,
          }));
          setSlides(banners);
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        setSlides(defaultSlides);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, [currentCity?.name]);

  // Auto-slide functionality
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Reset slide index when slides change
  useEffect(() => {
    setCurrentSlide(0);
  }, [slides]);

  if (isLoading) {
    return (
      <>
        {/* Desktop Loading Skeleton */}
        <div className="hidden md:block mb-0">
          <div className="relative w-full h-[140px] overflow-hidden rounded-xl bg-gray-200 animate-pulse" />
        </div>
        {/* Mobile Loading Skeleton */}
        <div className="md:hidden overflow-x-hidden w-full">
          <div className="relative w-full h-[150px] overflow-hidden rounded-2xl mx-2 mb-4 bg-gray-200 animate-pulse" />
        </div>
      </>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop Layout - Ultra-compact version without white wrapper */}
      <div className="hidden md:block mb-0">
        <div className="relative w-full h-[140px] overflow-hidden rounded-xl hero-container">
          {/* Slider Container with CSS transitions */}
          <div
            ref={sliderRef}
            className="flex h-full hero-slider"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${currentSlide * (100 / slides.length)}%)`,
              transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="flex-shrink-0"
                style={{ width: `${100 / slides.length}%` }}
              >
                {slide.link ? (
                  <a href={slide.link} className="block w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title || `Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                      onError={(e) => {
                        console.error(`Failed to load image: ${slide.image}`);
                        e.target.src = `https://via.placeholder.com/1200x180?text=Slide+${index + 1}`;
                      }}
                    />
                  </a>
                ) : (
                  <img
                    src={slide.image}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      console.error(`Failed to load image: ${slide.image}`);
                      e.target.src = `https://via.placeholder.com/1200x180?text=Slide+${index + 1}`;
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Gradient overlay for smooth transition */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" />

          {/* Carousel Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "bg-white w-8 shadow-md"
                    : "bg-white/50 w-1.5 hover:bg-white/70"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Ultra-compact */}
      <div className="md:hidden overflow-x-hidden w-full">
        <div className="relative w-full h-[150px] overflow-hidden rounded-2xl mx-2 mb-4 shadow-lg">
          {/* Slider Container with CSS transitions */}
          <div
            className="flex h-full"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${currentSlide * (100 / slides.length)}%)`,
              transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="flex-shrink-0"
                style={{ width: `${100 / slides.length}%` }}
              >
                {slide.link ? (
                  <a href={slide.link} className="block w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title || `Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                      onError={(e) => {
                        console.error(`Failed to load image: ${slide.image}`);
                        e.target.src = `https://via.placeholder.com/800x240?text=Slide+${index + 1}`;
                      }}
                    />
                  </a>
                ) : (
                  <img
                    src={slide.image}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      console.error(`Failed to load image: ${slide.image}`);
                      e.target.src = `https://via.placeholder.com/800x240?text=Slide+${index + 1}`;
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "bg-white w-8 shadow-lg"
                    : "bg-white/50 w-2 hover:bg-white/70"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HeroBanner;
