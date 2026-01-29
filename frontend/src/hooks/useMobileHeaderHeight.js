import { useState, useEffect } from 'react';

/**
 * Hook to calculate the height of the mobile header
 * This is useful for adding padding-top to mobile page content
 * Uses ResizeObserver for real-time height updates during animations
 */
const useMobileHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(64); // Default to 64px

  useEffect(() => {
    const header = document.querySelector('header[class*="fixed"]');
    if (!header) return;

    // Use ResizeObserver for smooth tracking of height changes (animations/folding)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === header) {
          setHeaderHeight(entry.target.offsetHeight);
        }
      }
    });

    resizeObserver.observe(header);

    // Initial calculation
    setHeaderHeight(header.offsetHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return headerHeight;
};

export default useMobileHeaderHeight;
