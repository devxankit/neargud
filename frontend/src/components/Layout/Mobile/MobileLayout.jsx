import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import MobileCartBar from './MobileCartBar';
import CartDrawer from '../../Cart/CartDrawer';
import useMobileHeaderHeight from '../../../hooks/useMobileHeaderHeight';

const MobileLayout = ({ children, showBottomNav = true, showCartBar = true, showHeader }) => {
  const location = useLocation();
  const headerHeight = useMobileHeaderHeight();
  const excludeHeaderRoutes = [
    '/app/categories',
    '/app/search',
    '/app/wishlist',
    '/app/favorites',
    '/app/profile',
    '/app/reels',
    '/app/chat',
    '/app/login',
    '/app/register',
    '/app/verification',
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
          paddingTop: shouldShowHeader ? `${headerHeight}px` : '0px',
          overflowY: isFullScreenPage ? 'hidden' : 'auto',
          WebkitOverflowScrolling: 'touch',
          height: isFullScreenPage ? '100vh' : 'auto',
          backgroundColor: location.pathname === '/app/reels' ? 'black' : 'transparent', // Black background for reels
        }}
      >
        {children}
      </main>
      {showCartBar && <MobileCartBar />}
      {shouldShowBottomNav && <MobileBottomNav />}
      <CartDrawer />
    </>
  );
};

export default MobileLayout;

