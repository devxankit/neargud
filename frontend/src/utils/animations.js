// src/utils/animations.js
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger optimizations
  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    ignoreMobileResize: true,
    limitCallbacks: true,
  });

  // Handle ScrollTrigger refresh issues (safe wrapper)
  const originalRefresh = ScrollTrigger.refresh;
  ScrollTrigger.refresh = function () {
    try {
      return originalRefresh.apply(this, arguments);
    } catch (e) {
      if (e.name === 'NotFoundError' || e.message?.includes('removeChild')) {
        // Suppress non-fatal DOM error during concurrent React unmounting
        return;
      }
      throw e;
    }
  };

  // Add a global error listener to suppress GSAP's removeChild error
  // This is a last-resort safety to prevent the app from crashing due to non-fatal DOM sync issues
  const suppressGsapError = (error) => {
    const message = typeof error === 'string' ? error : error?.message || '';
    const stack = error?.stack || '';
    if (message.includes('removeChild') || message.includes('NotFoundError')) {
      if (stack.includes('gsap') || message.includes('gsap')) {
        return true;
      }
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    if (suppressGsapError(event.error || event.message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (suppressGsapError(event.reason)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // Prevent scroll restoration issues
  if (window.history.scrollRestoration) {
    window.history.scrollRestoration = "manual";
  }

  // Optimize React reconciliation speed
  gsap.ticker.lagSmoothing(500, 33);
}

// -------------------
// Basic animation configs for Framer Motion / reference
// -------------------
export const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
export const slideInLeft = { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6 } };
export const slideInRight = { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6 } };
export const scaleIn = { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 } };
export const staggerContainer = { initial: {}, animate: { transition: { staggerChildren: 0.1 } } };

// -------------------
// React hook for GSAP animations
// -------------------
export const useGsapAnimations = (animations = []) => {
  useEffect(() => {
    if (!animations.length) return;

    // gsap.context ensures cleanup on unmount
    const ctx = gsap.context(() => {
      animations.forEach(({ type, element, delay = 0, options = {} }) => {
        if (!element) return;

        switch (type) {
          case "fadeInUp":
            gsap.fromTo(
              element,
              { opacity: 0, y: 30, force3D: true },
              { opacity: 1, y: 0, duration: 0.8, delay, ease: "power3.out", force3D: true }
            );
            break;

          case "fadeIn":
            gsap.fromTo(
              element,
              { opacity: 0, force3D: true },
              { opacity: 1, duration: 0.6, delay, ease: "power2.out", force3D: true }
            );
            break;

          case "slideInLeft":
            gsap.fromTo(
              element,
              { opacity: 0, x: -50, force3D: true },
              { opacity: 1, x: 0, duration: 0.8, delay, ease: "power3.out", force3D: true }
            );
            break;

          case "slideInRight":
            gsap.fromTo(
              element,
              { opacity: 0, x: 50, force3D: true },
              { opacity: 1, x: 0, duration: 0.8, delay, ease: "power3.out", force3D: true }
            );
            break;

          case "scaleIn":
            gsap.fromTo(
              element,
              { opacity: 0, scale: 0.8, force3D: true },
              { opacity: 1, scale: 1, duration: 0.6, delay, ease: "back.out(1.7)", force3D: true }
            );
            break;

          case "scrollReveal":
            gsap.fromTo(
              element,
              {
                opacity: options.opacity ?? 0,
                y: options.y ?? 50,
                scale: options.scale ?? 1,
                force3D: true,
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: options.duration ?? 0.8,
                ease: options.ease ?? "power3.out",
                force3D: true,
                scrollTrigger: {
                  trigger: element,
                  start: options.start ?? "top 80%",
                  toggleActions: "play none none reverse",
                  markers: options.markers ?? false,
                },
              }
            );
            break;

          default:
            console.warn(`Unknown GSAP animation type: ${type}`);
        }
      });
    });

    return () => ctx.revert(); // Clean up on unmount
  }, [animations]);
};

// -------------------
// Optional backward-compatible gsapAnimations object
// -------------------
export const gsapAnimations = {
  fadeInUp: (element, delay = 0) =>
    gsap.fromTo(
      element,
      { opacity: 0, y: 30, force3D: true },
      { opacity: 1, y: 0, duration: 0.8, delay, ease: "power3.out", force3D: true }
    ),
  fadeIn: (element, delay = 0) =>
    gsap.fromTo(
      element,
      { opacity: 0, force3D: true },
      { opacity: 1, duration: 0.6, delay, ease: "power2.out", force3D: true }
    ),
  slideInLeft: (element, delay = 0) =>
    gsap.fromTo(
      element,
      { opacity: 0, x: -50, force3D: true },
      { opacity: 1, x: 0, duration: 0.8, delay, ease: "power3.out", force3D: true }
    ),
  slideInRight: (element, delay = 0) =>
    gsap.fromTo(
      element,
      { opacity: 0, x: 50, force3D: true },
      { opacity: 1, x: 0, duration: 0.8, delay, ease: "power3.out", force3D: true }
    ),
  scaleIn: (element, delay = 0) =>
    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.8, force3D: true },
      { opacity: 1, scale: 1, duration: 0.6, delay, ease: "back.out(1.7)", force3D: true }
    ),
};
