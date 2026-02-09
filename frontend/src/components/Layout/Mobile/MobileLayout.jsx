import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import MobileCartBar from './MobileCartBar';
import useMobileHeaderHeight from '../../../hooks/useMobileHeaderHeight';
import { useUIStore } from '../../../store/useStore';

const MobileLayout = ({ children, showBottomNav = true, showCartBar = true, showHeader, style = {} }) => {
  const location = useLocation();
  const headerHeight = useUIStore(state => state.headerHeight);

  const isThemedPage = location.pathname === '/' ||
    location.pathname === '/app' ||
    location.pathname === '/app/' ||
    location.pathname.startsWith('/app/category/');

  const excludeHeaderRoutes = [
    '/app/categories',
    '/app/search',
    '/app/wishlist',
    '/app/favorites',
    '/app/profile',
    '/app/reels',
    '/app/chat',
    '/chat',
    '/app/login',
    '/login',
    '/app/register',
    '/register',
    '/app/verification',
    '/verification',
    '/app/forgot-password',
    '/forgot-password',
    '/app/checkout',
    '/checkout',
    '/app/addresses',
    '/addresses',
    '/app/policies',
  ];

  // Hide header and bottom nav on login, register, and verification pages
  const isAuthPage = location.pathname === '/app/login' ||
    location.pathname === '/app/register' ||
    location.pathname === '/app/verification' ||
    location.pathname === '/app/forgot-password' ||
    location.pathname === '/forgot-password';

  // Always show bottom nav on /app routes, except auth pages and specific exclusions
  const isFullScreenPage = location.pathname === '/app/reels' ||
    location.pathname === '/app/chat' ||
    location.pathname === '/chat';

  const isExcludedFromBottomNav = isAuthPage ||
    location.pathname === '/app/addresses' ||
    location.pathname === '/addresses' ||
    location.pathname === '/app/policies';
  const shouldShowBottomNav = !isExcludedFromBottomNav && showBottomNav;

  const calculatedShouldShowHeader = !excludeHeaderRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/app/product/') &&
    !location.pathname.startsWith('/app/vendor/') &&
    !location.pathname.startsWith('/app/order-confirmation/') &&
    !location.pathname.startsWith('/order-confirmation/') &&
    !location.pathname.startsWith('/app/track-order/') &&
    !location.pathname.startsWith('/track-order/') &&
    !location.pathname.startsWith('/app/orders/') &&
    !location.pathname.startsWith('/orders/');

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
        className={`min-h-screen w-full overflow-x-hidden scrollbar-hide flex flex-col items-center ${isFullScreenPage ? '' : // No padding for reels page (container is fixed)
          shouldShowBottomNav && showCartBar ? 'pb-24 md:pb-8' :
            shouldShowBottomNav ? 'pb-20 md:pb-8' :
              showCartBar ? 'pb-24 md:pb-8' : ''
          }`}
        style={{
          paddingTop: isThemedPage ? '0px' : (shouldShowHeader ? `${headerHeight}px` : '0px'),
          overflowY: isFullScreenPage ? 'hidden' : 'visible',
          WebkitOverflowScrolling: 'touch',
          minHeight: isFullScreenPage ? '100vh' : 'auto',
          backgroundColor: location.pathname === '/app/reels' ? 'black' : 'transparent', // Black background for reels
          transition: 'background 0.3s ease-in-out',
          willChange: 'background',
          ...style, // Merge custom styles
        }}
      >
        <div className={`w-full h-full flex flex-col ${isFullScreenPage ? '' : 'max-w-screen-2xl mx-auto'}`}>
          {children}
        </div>
      </main>
      {showCartBar && <MobileCartBar />}
      {shouldShowBottomNav && <MobileBottomNav />}
    </>
  );
};

export default MobileLayout;
