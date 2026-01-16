import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import LazyImage from "../../../components/LazyImage";

const HeroCarousel = ({ banners, loading }) => {
    if (loading) {
        return (
            <div className="px-4 py-4">
                <div className="flex flex-col gap-3">
                    <div className="w-3/4 h-6 bg-gray-100 rounded animate-pulse" />
                    <div className="w-1/2 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="w-full aspect-[4/5] bg-gray-200 animate-pulse rounded-2xl shadow-sm mt-2" />
                </div>
            </div>
        );
    }

    if (!banners || banners.length === 0) return null;

    return (
        <div className="">
            <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView={1.25}
                centeredSlides={true}
                loop={banners.length > 1}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                className="w-full !overflow-visible"
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.id || index} className="!h-auto">
                        <div
                            className="flex flex-col gap-3 group cursor-pointer"
                            onClick={() => {
                                if (banner.link) {
                                    window.location.href = banner.link;
                                }
                            }}
                        >
                            {/* Vertical Banner Image */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] shadow-lg">
                                <LazyImage
                                    src={banner.image}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Subtle gloss effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroCarousel;
