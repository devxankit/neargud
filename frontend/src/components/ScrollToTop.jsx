import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls to top on route change
 * Works for both desktop and mobile views
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Prevent browser from managing scroll restoration automatically
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      // 1. Window scroll
      window.scrollTo(0, 0);

      // 2. Elements that might have their own scroll
      const elementsToReset = [
        document.documentElement,
        document.body,
        ...document.querySelectorAll('main, [data-scroll-container], .overflow-y-auto')
      ];

      elementsToReset.forEach(el => {
        if (el && el.scrollTop !== 0) el.scrollTop = 0;
      });
    };

    // Immediate
    resetScroll();

    // Repeated attempts to catch late rendering or browser overrides
    const timers = [10, 50, 100, 200].map(delay => setTimeout(resetScroll, delay));

    return () => timers.forEach(t => clearTimeout(t));
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;

