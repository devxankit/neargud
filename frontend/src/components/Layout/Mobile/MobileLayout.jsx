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
    location.pathname === '' ||
    location.pathname === '/app' ||
    location.pathname === '/app/' ||
    location.pathname.startsWith('/category/') ||
    location.pathname.startsWith('/app/category/');

  const excludeHeaderRoutes = [
    '/categories',
    '/search',
    '/wishlist',
    '/favorites',
    '/profile',
    '/reels',
    '/chat',
    '/chat',
    '/login',
    '/login',
    '/register',
    '/register',
    '/verification',
    '/verification',
    '/forgot-password',
    '/forgot-password',
    '/checkout',
    '/checkout',
    '/addresses',
    '/addresses',
    '/policies',
    '/contact',
    '/orders',
    '/orders',
  ];

  / Hide header and bottom nav on login, register, and verification pages
  const isAuthPage = location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/verification' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/forgot-password';

  / Always show bottom nav on / routes, except auth pages and specific exclusions
  const isFullScreenPage = location.pathname === '/reels' ||
    location.pathname === '/chat' ||
    location.pathname === '/chat';

  const isExcludedFromBottomNav = isAuthPage ||
    location.pathname === '/addresses' ||
    location.pathname === '/addresses' ||
    location.pathname === '/policies' ||
    location.pathname === '/contact' ||
    location.pathname === '/checkout' ||
    location.pathname === '/checkout';

  const shouldShowBottomNav = !isExcludedFromBottomNav && showBottomNav;
  const shouldShowCartBar = showCartBar && !['/checkout', '/checkout'].includes(location.pathname);

  const calculatedShouldShowHeader = !excludeHeaderRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/product/') &&
    !location.pathname.startsWith('/vendor/') &&
    !location.pathname.startsWith('/order-confirmation/') &&
    !location.pathname.startsWith('/order-confirmation/') &&
    !location.pathname.startsWith('/track-order/') &&
    !location.pathname.startsWith('/track-order/') &&
    !location.pathname.startsWith('/orders/') &&
    !location.pathname.startsWith('/orders/');

  const shouldShowHeader = showHeader !== undefined ? showHeader : calculatedShouldShowHeader;

  / Ensure body scroll is restored when component mounts
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
        className={`min-h-screen w-full overflow-x-hidden scrollbar-hide flex flex-col items-center ${isFullScreenPage ? '' : / No padding for reels page (container is fixed)
          shouldShowBottomNav && shouldShowCartBar ? 'pb-24 md:pb-8' :
            shouldShowBottomNav ? 'pb-20 md:pb-8' :
              shouldShowCartBar ? 'pb-24 md:pb-8' : ''
          }`}
        style={{
          paddingTop: isThemedPage ? '0px' : (shouldShowHeader ? `${headerHeight}px` : '0px'),
          overflowY: isFullScreenPage ? 'hidden' : 'visible',
          WebkitOverflowScrolling: 'touch',
          minHeight: isFullScreenPage ? '100vh' : 'auto',
          backgroundColor: location.pathname === '/reels' ? 'black' : 'transparent', / Black background for reels
          transition: 'background 0.3s ease-in-out',
          willChange: 'background',
          ...style, / Merge custom styles
        }}
      >
        <div className={`w-full h-full flex flex-col ${isFullScreenPage ? '' : 'max-w-screen-2xl mx-auto'}`}>
          {children}
        </div>
      </main>
      {shouldShowCartBar && <MobileCartBar />}
      {shouldShowBottomNav && <MobileBottomNav />}
    </>
  );
};

export default MobileLayout;
