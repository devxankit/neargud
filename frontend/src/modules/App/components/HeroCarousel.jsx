import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LazyImage from "../../../components/LazyImage";

const HeroCarousel = ({ banners, loading }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (banners.length > 0 && !loading) {
            startTimer();
        }
        return () => stopTimer();
    }, [banners.length, currentIndex, loading]);

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 1.1,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9,
        }),
    };

    if (loading) {
        return (
            <div className="px-4 py-2">
                <div className="w-full h-80 bg-gray-200 animate-pulse rounded-2xl shadow-inner" />
            </div>
        );
    }

    if (banners.length === 0) return null;

    return (
        <div className="px-4 py-2 relative group">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.6 }
                        }}
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => {
                            if (banners[currentIndex].link) {
                                window.location.href = banners[currentIndex].link;
                            }
                        }}
                    >
                        <LazyImage
                            src={banners[currentIndex].image}
                            alt={banners[currentIndex].title || "Hero Banner"}
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Banner Content */}
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-black mb-1 drop-shadow-lg"
                            >
                                {banners[currentIndex].title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-white/80 text-sm font-medium"
                            >
                                {banners[currentIndex].subtitle}
                            </motion.p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            className="focus:outline-none"
                        >
                            <motion.div
                                animate={{
                                    width: index === currentIndex ? 24 : 6,
                                    backgroundColor: index === currentIndex ? "#fff" : "rgba(255,255,255,0.5)",
                                }}
                                className="h-1.5 rounded-full"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;
