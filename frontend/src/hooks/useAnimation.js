import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsapAnimations } from '../utils/animations';

// Register ScrollTrigger if not already registered
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGSAPAnimation = (animationType, delay = 0, dependencies = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current || !gsapAnimations[animationType]) return;

    const ctx = gsap.context(() => {
      gsapAnimations[animationType](elementRef.current, delay);
    });

    return () => {
      try {
        ctx.revert();
      } catch (e) {
        // Safe catch for GSAP removeChild issues
      }
    };
  }, dependencies);

  return elementRef;
};

/**
 * Custom hook for scroll-triggered animations
 * @param {object} options - Animation options
 */
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsapAnimations.scrollReveal(elementRef.current, options);
    });

    return () => {
      try {
        ctx.revert();
      } catch (e) {
        // Safe catch for GSAP removeChild issues during cleanup
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return elementRef;
};

