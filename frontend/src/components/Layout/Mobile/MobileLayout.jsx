import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import MobileCartBar from './MobileCartBar';
import useMobileHeaderHeight from '../../../hooks/useMobileHeaderHeight';

const MobileLayout = ({ children, showBottomNav = true, showCartBar = true, showHeader, style = {} }) => {
  const location = useLocation();

  // Use a stable header height for padding to avoid "pulling" during scroll folding
  const rawHeaderHeight = useMobileHeaderHeight();
  const [stableHeaderHeight, setStableHeaderHeight] = useState(rawHeaderHeight);

  // Synchronise stable header height with measured height and route context
  useEffect(() => {
    const isHomePage = location.pathname === '/' || location.pathname === '/app' || location.pathname === '/app/';
    const isAtTop = window.scrollY < 20;

    // Minimum padding required to show the home page content (logo + search + categories + space)
    const minPadding = isHomePage ? 195 : 64;

    // We update the stable height if:
    // 1. The new measured height is larger than our current stable height
    // 2. We are at the top of the page (where jumps are acceptable to sync exactly)
    // 3. It's the initial measurement (64 is default)
    if (rawHeaderHeight > stableHeaderHeight || isAtTop || stableHeaderHeight <= 64) {
      setStableHeaderHeight(Math.max(rawHeaderHeight, minPadding));
    }
  }, [rawHeaderHeight, location.pathname]);

  const excludeHeaderRoutes = [
    '/app/categories',
    '/app/search',
    '/app/wishlist',
    '/app/favorites',
    '/app/profile',
    '/app/reels',
    '/app/chat',
    '/app/login',
    '/login',
    '/app/register',
    '/register',
    '/app/verification',
    '/verification',
    '/app/checkout',
    '/checkout',
  ];

  // Hide header and bottom nav on login, register, and verification pages
  const isAuthPage = location.pathname === '/app/login' ||
    location.pathname === '/app/register' ||
    location.pathname === '/app/verification';

  // Always show bottom nav on /app routes, except auth pages
  const isFullScreenPage = location.pathname === '/app/reels' || location.pathname === '/app/chat';
  const shouldShowBottomNav = !isAuthPage && showBottomNav;

  const calculatedShouldShowHeader = !excludeHeaderRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/app/product/') &&
    !location.pathname.startsWith('/app/vendor/') &&
    !location.pathname.startsWith('/app/order-confirmation/') &&
    !location.pathname.startsWith('/order-confirmation/') &&
    !location.pathname.startsWith('/app/track-order/') &&
    !location.pathname.startsWith('/track-order/');

  const shouldShowHeader = showHeader !== undefined ? showHeader : calculatedShouldShowHeader;

  // Ensure body scroll is restored when component mounts
  useEffect(() => {
    document.body.style.overflowY = '';
    return () => {
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <>
      {shouldShowHeader && <MobileHeader />}
      <main
        className={`min-h-screen w-full overflow-x-hidden scrollbar-hide ${isFullScreenPage ? '' : // No padding for reels page (container is fixed)
          shouldShowBottomNav && showCartBar ? 'pb-24' :
            shouldShowBottomNav ? 'pb-20' :
              showCartBar ? 'pb-24' : ''
          }`}
        style={{
          paddingTop: shouldShowHeader ? `${stableHeaderHeight}px` : '10px',
          overflowY: isFullScreenPage ? 'hidden' : 'visible',
          WebkitOverflowScrolling: 'touch',
          minHeight: isFullScreenPage ? '100vh' : 'auto',
          backgroundColor: location.pathname === '/app/reels' ? 'black' : 'transparent', // Black background for reels
          transition: 'background 0.3s ease-in-out',
          willChange: 'background',
          ...style, // Merge custom styles
        }}
      >
        {children}
      </main>
      {showCartBar && <MobileCartBar />}
      {shouldShowBottomNav && <MobileBottomNav />}
    </>
  );
};

export default MobileLayout;

