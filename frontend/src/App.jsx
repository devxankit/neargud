import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "/src/context/ThemeContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Search from "./pages/Search";
import VendorStore from "./pages/VendorStore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verification from "./pages/Verification";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Wishlist from "./pages/Wishlist";
import Offers from "./pages/Offers";
import DailyDeals from "./pages/DailyDeals";
import FlashSale from "./pages/FlashSale";
import CampaignPage from "./pages/CampaignPage";
import Category from "./pages/Category";
import Chat from "./pages/Chat";
import CartDrawer from "./components/Cart/CartDrawer";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import AdminLogin from "./pages/admin/Login";
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute";
import AdminLayout from "./components/Admin/Layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import AdminOrders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import ReturnRequests from "./pages/admin/ReturnRequests";
import ReturnRequestDetail from "./pages/admin/ReturnRequestDetail";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import Customers from "./pages/admin/Customers";
import Inventory from "./pages/admin/Inventory";
import Campaigns from "./pages/admin/Campaigns";
import Banners from "./pages/admin/Banners";
import Reviews from "./pages/admin/Reviews";
import Analytics from "./pages/admin/Analytics";
import Content from "./pages/admin/Content";
import Settings from "./pages/admin/Settings";
import More from "./pages/admin/More";
import PromoCodes from "./pages/admin/PromoCodes";
// Orders child pages
import AllOrders from "./pages/admin/orders/AllOrders";
import OrderTracking from "./pages/admin/orders/OrderTracking";
import OrderNotifications from "./pages/admin/orders/OrderNotifications";
import Invoice from "./pages/admin/orders/Invoice";
// Products child pages
import ManageProducts from "./pages/admin/products/ManageProducts";
import AddProduct from "./pages/admin/products/AddProduct";
import BulkUpload from "./pages/admin/products/BulkUpload";
import TaxPricing from "./pages/admin/products/TaxPricing";
import ProductRatings from "./pages/admin/products/ProductRatings";
import ProductFAQs from "./pages/admin/products/ProductFAQs";
// Attribute Management child pages
import AttributeSets from "./pages/admin/attributes/AttributeSets";
import Attributes from "./pages/admin/attributes/Attributes";
import AttributeValues from "./pages/admin/attributes/AttributeValues";
// Categories child pages
import ManageCategories from "./pages/admin/categories/ManageCategories";
import CategoryOrder from "./pages/admin/categories/CategoryOrder";
// Brands child pages
import ManageBrands from "./pages/admin/brands/ManageBrands";
// Customers child pages
import ViewCustomers from "./pages/admin/customers/ViewCustomers";
import CustomerAddresses from "./pages/admin/customers/Addresses";
import Transactions from "./pages/admin/customers/Transactions";
import CustomerDetailPage from "./pages/admin/customers/CustomerDetailPage";
// Delivery Management child pages
import DeliveryBoys from "./pages/admin/delivery/DeliveryBoys";
import CashCollection from "./pages/admin/delivery/CashCollection";
// Vendors child pages
import Vendors from "./pages/admin/Vendors";
import ManageVendors from "./pages/admin/vendors/ManageVendors";
import PendingApprovals from "./pages/admin/vendors/PendingApprovals";
import VendorDetail from "./pages/admin/vendors/VendorDetail";
import CommissionRates from "./pages/admin/vendors/CommissionRates";
import AdminVendorAnalytics from "./pages/admin/vendors/VendorAnalytics";
// Locations child pages
import Cities from "./pages/admin/locations/Cities";
import Zipcodes from "./pages/admin/locations/Zipcodes";
// Offers & Sliders child pages
import HomeSliders from "./pages/admin/offers/HomeSliders";
import FestivalOffers from "./pages/admin/offers/FestivalOffers";
// Notifications child pages
import PushNotifications from "./pages/admin/notifications/PushNotifications";
import CustomMessages from "./pages/admin/notifications/CustomMessages";
// Support Desk child pages
import LiveChat from "./pages/admin/support/LiveChat";
import TicketTypes from "./pages/admin/support/TicketTypes";
import Tickets from "./pages/admin/support/Tickets";
// Reports child pages
import SalesReport from "./pages/admin/reports/SalesReport";
import InventoryReport from "./pages/admin/reports/InventoryReport";
// Analytics & Finance child pages
import RevenueOverview from "./pages/admin/finance/RevenueOverview";
import ProfitLoss from "./pages/admin/finance/ProfitLoss";
import OrderTrends from "./pages/admin/finance/OrderTrends";
import PaymentBreakdown from "./pages/admin/finance/PaymentBreakdown";
import TaxReports from "./pages/admin/finance/TaxReports";
import RefundReports from "./pages/admin/finance/RefundReports";
// Consolidated Settings pages
import GeneralSettings from "./pages/admin/settings/GeneralSettings";
import PaymentShippingSettings from "./pages/admin/settings/PaymentShippingSettings";
import OrdersCustomersSettings from "./pages/admin/settings/OrdersCustomersSettings";
import ProductsInventorySettings from "./pages/admin/settings/ProductsInventorySettings";
import ContentFeaturesSettings from "./pages/admin/settings/ContentFeaturesSettings";
import NotificationsSEOSettings from "./pages/admin/settings/NotificationsSEOSettings";
// Policies child pages
import PrivacyPolicy from "./pages/admin/policies/PrivacyPolicy";
import RefundPolicy from "./pages/admin/policies/RefundPolicy";
import TermsConditions from "./pages/admin/policies/TermsConditions";
// Firebase child pages
import PushConfig from "./pages/admin/firebase/PushConfig";
import Authentication from "./pages/admin/firebase/Authentication";
import RouteWrapper from "./components/RouteWrapper";
import ScrollToTop from "./components/ScrollToTop";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetailPage from "./pages/OrderDetail";
import TrackOrder from "./pages/TrackOrder";
// Mobile App Routes
import MobileHome from "./modules/App/pages/Home";
import MobileProductDetail from "./modules/App/pages/ProductDetail";
import MobileCategory from "./modules/App/pages/Category";
import MobileCategories from "./modules/App/pages/categories";
import MobileCheckout from "./modules/App/pages/Checkout";
import MobileSearch from "./modules/App/pages/Search";
import MobileLogin from "./modules/App/pages/Login";
import MobileRegister from "./modules/App/pages/Register";
import MobileVerification from "./modules/App/pages/Verification";
import MobileProfile from "./modules/App/pages/Profile";
import MobileOrders from "./modules/App/pages/Orders";
import MobileOrderDetail from "./modules/App/pages/OrderDetail";
import MobileAddresses from "./modules/App/pages/Addresses";
import MobileWishlist from "./modules/App/pages/Wishlist";
import MobileReels from "./modules/App/pages/Reels";
import MobileOffers from "./modules/App/pages/Offers";
import MobileDailyDeals from "./modules/App/pages/DailyDeals";
import MobileFlashSale from "./modules/App/pages/FlashSale";
import MobileTrackOrder from "./modules/App/pages/TrackOrder";
import MobileOrderConfirmation from "./modules/App/pages/OrderConfirmation";
// Delivery Routes
import DeliveryLogin from "./pages/delivery/Login";
import DeliveryProtectedRoute from "./components/Delivery/DeliveryProtectedRoute";
import DeliveryLayout from "./components/Delivery/Layout/DeliveryLayout";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import DeliveryOrders from "./pages/delivery/Orders";
import DeliveryOrderDetail from "./pages/delivery/OrderDetail";
import DeliveryProfile from "./pages/delivery/Profile";
// Vendor Routes
import VendorLogin from "./modules/vendor/pages/Login";
import VendorRegister from "./modules/vendor/pages/Register";
import VendorVerification from "./modules/vendor/pages/Verification";
import VendorProtectedRoute from "./modules/vendor/components/VendorProtectedRoute";
import VendorLayout from "./modules/vendor/components/Layout/VendorLayout";
import VendorDashboard from "./modules/vendor/pages/Dashboard";
import VendorProducts from "./modules/vendor/pages/Products";
import VendorManageProducts from "./modules/vendor/pages/products/ManageProducts";
import VendorAddProduct from "./modules/vendor/pages/products/AddProduct";
import VendorBulkUpload from "./modules/vendor/pages/products/BulkUpload";
import VendorProductForm from "./modules/vendor/pages/products/ProductForm";
import VendorOrders from "./modules/vendor/pages/Orders";
import VendorAllOrders from "./modules/vendor/pages/orders/AllOrders";
import VendorOrderTracking from "./modules/vendor/pages/orders/OrderTracking";
import VendorOrderDetail from "./modules/vendor/pages/orders/OrderDetail";
import VendorAnalytics from "./modules/vendor/pages/Analytics";
import VendorEarnings from "./modules/vendor/pages/Earnings";
import VendorSettings from "./modules/vendor/pages/Settings";
import VendorStockManagement from "./modules/vendor/pages/StockManagement";
import VendorWalletHistory from "./modules/vendor/pages/WalletHistory";
import VendorPickupLocations from "./modules/vendor/pages/PickupLocations";
import VendorChat from "./modules/vendor/pages/Chat";
import VendorReturnRequests from "./modules/vendor/pages/ReturnRequests";
import VendorReturnRequestDetail from "./modules/vendor/pages/returns/ReturnRequestDetail";
import VendorProductReviews from "./modules/vendor/pages/ProductReviews";
import VendorPromotions from "./modules/vendor/pages/Promotions";
import VendorNotifications from "./modules/vendor/pages/Notifications";
import VendorProductFAQs from "./modules/vendor/pages/ProductFAQs";
import VendorTaxPricing from "./modules/vendor/pages/TaxPricing";
import VendorShippingManagement from "./modules/vendor/pages/ShippingManagement";
import VendorCustomers from "./modules/vendor/pages/Customers";
import VendorSupportTickets from "./modules/vendor/pages/SupportTickets";
import VendorProductAttributes from "./modules/vendor/pages/ProductAttributes";
import VendorInventoryReports from "./modules/vendor/pages/InventoryReports";
import VendorPerformanceMetrics from "./modules/vendor/pages/PerformanceMetrics";
import VendorDocuments from "./modules/vendor/pages/Documents";
import VendorReels from "./modules/vendor/pages/Reels";
import VendorAllReels from "./modules/vendor/pages/reels/AllReels";
import VendorAddReel from "./modules/vendor/pages/reels/AddReel";
import VendorEditReel from "./modules/vendor/pages/reels/EditReel";
import VendorSocial from "./modules/vendor/pages/Social";

// Inner component that has access to useLocation
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RouteWrapper><MobileHome /></RouteWrapper>} />
      <Route path="/product/:id" element={<RouteWrapper><MobileProductDetail /></RouteWrapper>} />
      <Route path="/category/:id" element={<RouteWrapper><MobileCategory /></RouteWrapper>} />
      <Route path="/vendor/:id" element={<RouteWrapper><VendorStore /></RouteWrapper>} />
      <Route path="/chat" element={<RouteWrapper><Chat /></RouteWrapper>} />
      <Route path="/checkout" element={<RouteWrapper><MobileCheckout /></RouteWrapper>} />
      <Route path="/search" element={<RouteWrapper><MobileSearch /></RouteWrapper>} />
      <Route path="/login" element={<RouteWrapper><MobileLogin /></RouteWrapper>} />
      <Route path="/register" element={<RouteWrapper><MobileRegister /></RouteWrapper>} />
      <Route path="/verification" element={<RouteWrapper><MobileVerification /></RouteWrapper>} />
      <Route path="/wishlist" element={<RouteWrapper><MobileWishlist /></RouteWrapper>} />
      <Route path="/offers" element={<RouteWrapper><MobileOffers /></RouteWrapper>} />
      <Route path="/daily-deals" element={<RouteWrapper><MobileDailyDeals /></RouteWrapper>} />
      <Route path="/flash-sale" element={<RouteWrapper><MobileFlashSale /></RouteWrapper>} />
      <Route path="/sale/:slug" element={<RouteWrapper><CampaignPage /></RouteWrapper>} />
      <Route path="/campaign/:id" element={<RouteWrapper><CampaignPage /></RouteWrapper>} />
      <Route path="/order-confirmation/:orderId" element={<RouteWrapper><MobileOrderConfirmation /></RouteWrapper>} />
      <Route path="/orders/:orderId" element={<RouteWrapper><MobileOrderDetail /></RouteWrapper>} />
      <Route path="/track-order/:orderId" element={<RouteWrapper><MobileTrackOrder /></RouteWrapper>} />
      <Route
        path="/profile"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileProfile />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/orders"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileOrders />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/addresses"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileAddresses />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="products/manage-products" element={<ManageProducts />} />
        <Route path="products/add-product" element={<AddProduct />} />
        <Route path="products/bulk-upload" element={<BulkUpload />} />
        <Route path="products/tax-pricing" element={<TaxPricing />} />
        <Route path="products/product-ratings" element={<ProductRatings />} />
        <Route path="products/product-faqs" element={<ProductFAQs />} />
        <Route path="more" element={<More />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/manage-categories" element={<ManageCategories />} />
        <Route path="categories/category-order" element={<CategoryOrder />} />
        <Route path="brands" element={<Brands />} />
        <Route path="brands/manage-brands" element={<ManageBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="orders/:id/invoice" element={<Invoice />} />
        <Route path="orders/all-orders" element={<AllOrders />} />
        <Route path="orders/order-tracking" element={<OrderTracking />} />
        <Route path="orders/order-notifications" element={<OrderNotifications />} />
        <Route path="return-requests" element={<ReturnRequests />} />
        <Route path="return-requests/:id" element={<ReturnRequestDetail />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/view-customers" element={<ViewCustomers />} />
        <Route path="customers/addresses" element={<CustomerAddresses />} />
        <Route path="customers/transactions" element={<Transactions />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="attributes" element={<AttributeSets />} />
        <Route path="attributes/attribute-sets" element={<AttributeSets />} />
        <Route path="attributes/attributes" element={<Attributes />} />
        <Route path="attributes/attribute-values" element={<AttributeValues />} />
        <Route path="stock" element={<Inventory />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="delivery" element={<DeliveryBoys />} />
        <Route path="delivery/delivery-boys" element={<DeliveryBoys />} />
        <Route path="delivery/cash-collection" element={<CashCollection />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/manage-vendors" element={<ManageVendors />} />
        <Route path="vendors/pending-approvals" element={<PendingApprovals />} />
        <Route path="vendors/commission-rates" element={<CommissionRates />} />
        <Route path="vendors/vendor-analytics" element={<AdminVendorAnalytics />} />
        <Route path="vendors/:id" element={<VendorDetail />} />
        <Route path="locations" element={<Cities />} />
        <Route path="locations/cities" element={<Cities />} />
        <Route path="locations/zipcodes" element={<Zipcodes />} />
        <Route path="offers" element={<HomeSliders />} />
        <Route path="offers/home-sliders" element={<HomeSliders />} />
        <Route path="offers/festival-offers" element={<FestivalOffers />} />
        <Route path="promocodes" element={<PromoCodes />} />
        <Route path="notifications" element={<PushNotifications />} />
        <Route path="notifications/push-notifications" element={<PushNotifications />} />
        <Route path="notifications/custom-messages" element={<CustomMessages />} />
        <Route path="support" element={<Tickets />} />
        <Route path="support/live-chat" element={<LiveChat />} />
        <Route path="support/ticket-types" element={<TicketTypes />} />
        <Route path="support/tickets" element={<Tickets />} />
        <Route path="reports" element={<SalesReport />} />
        <Route path="reports/sales-report" element={<SalesReport />} />
        <Route path="reports/inventory-report" element={<InventoryReport />} />
        <Route path="finance" element={<RevenueOverview />} />
        <Route path="finance/revenue-overview" element={<RevenueOverview />} />
        <Route path="finance/profit-loss" element={<ProfitLoss />} />
        <Route path="finance/order-trends" element={<OrderTrends />} />
        <Route path="finance/payment-breakdown" element={<PaymentBreakdown />} />
        <Route path="finance/tax-reports" element={<TaxReports />} />
        <Route path="finance/refund-reports" element={<RefundReports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Navigate to="/admin/settings/general" replace />} />
        <Route path="settings/general" element={<Settings />} />
        <Route path="settings/payment-shipping" element={<Settings />} />
        <Route path="settings/orders-customers" element={<Settings />} />
        <Route path="settings/products-inventory" element={<Settings />} />
        <Route path="settings/content-features" element={<Settings />} />
        <Route path="settings/notifications-seo" element={<Settings />} />
        <Route path="policies" element={<PrivacyPolicy />} />
        <Route path="policies/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="policies/refund-policy" element={<RefundPolicy />} />
        <Route path="policies/terms-conditions" element={<TermsConditions />} />
        <Route path="firebase" element={<PushConfig />} />
        <Route path="firebase/push-config" element={<PushConfig />} />
        <Route path="firebase/authentication" element={<Authentication />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="banners" element={<Banners />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="content" element={<Content />} />
      </Route>
      {/* Delivery Routes */}
      <Route path="/delivery/login" element={<DeliveryLogin />} />
      <Route
        path="/delivery"
        element={
          <DeliveryProtectedRoute>
            <DeliveryLayout />
          </DeliveryProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/delivery/dashboard" replace />} />
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="orders" element={<DeliveryOrders />} />
        <Route path="orders/:id" element={<DeliveryOrderDetail />} />
        <Route path="profile" element={<DeliveryProfile />} />
      </Route>
      {/* Vendor Routes */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/vendor/verification" element={<VendorVerification />} />
      <Route
        path="/vendor"
        element={
          <VendorProtectedRoute>
            <VendorLayout />
          </VendorProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="products/manage-products" element={<VendorManageProducts />} />
        <Route path="products/add-product" element={<VendorAddProduct />} />
        <Route path="products/bulk-upload" element={<VendorBulkUpload />} />
        <Route path="products/product-faqs" element={<VendorProductFAQs />} />
        <Route path="products/tax-pricing" element={<VendorTaxPricing />} />
        <Route path="products/product-attributes" element={<VendorProductAttributes />} />
        <Route path="products/:id" element={<VendorProductForm />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="orders/all-orders" element={<VendorAllOrders />} />
        <Route path="orders/order-tracking" element={<VendorOrderTracking />} />
        <Route path="orders/:id" element={<VendorOrderDetail />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="earnings" element={<VendorEarnings />} />
        <Route path="earnings/overview" element={<VendorEarnings />} />
        <Route path="earnings/commission-history" element={<VendorEarnings />} />
        <Route path="earnings/settlement-history" element={<VendorEarnings />} />
        <Route path="stock-management" element={<VendorStockManagement />} />
        <Route path="wallet-history" element={<VendorWalletHistory />} />
        <Route path="pickup-locations" element={<VendorPickupLocations />} />
        <Route path="chat" element={<VendorChat />} />
        <Route path="return-requests" element={<VendorReturnRequests />} />
        <Route path="return-requests/:id" element={<VendorReturnRequestDetail />} />
        <Route path="product-reviews" element={<VendorProductReviews />} />
        <Route path="promotions" element={<VendorPromotions />} />
        <Route path="reels" element={<VendorReels />} />
        <Route path="reels/all-reels" element={<VendorAllReels />} />
        <Route path="reels/add-reel" element={<VendorAddReel />} />
        <Route path="reels/edit-reel/:id" element={<VendorEditReel />} />
        <Route path="notifications" element={<VendorNotifications />} />
        <Route path="shipping-management" element={<VendorShippingManagement />} />
        <Route path="customers" element={<VendorCustomers />} />
        <Route path="support-tickets" element={<VendorSupportTickets />} />
        <Route path="support-tickets/:id" element={<VendorSupportTickets />} />
        <Route path="inventory-reports" element={<VendorInventoryReports />} />
        <Route path="performance-metrics" element={<VendorPerformanceMetrics />} />
        <Route path="documents" element={<VendorDocuments />} />
        <Route path="settings" element={<VendorSettings />} />
        <Route path="settings/store" element={<VendorSettings />} />
        <Route path="settings/payment" element={<VendorSettings />} />
        <Route path="settings/payment-settings" element={<VendorSettings />} />
        <Route path="settings/shipping" element={<VendorSettings />} />
        <Route path="settings/shipping-settings" element={<VendorSettings />} />
        <Route path="profile" element={<VendorSettings />} />
        <Route path="social" element={<VendorSocial />} />
      </Route>
      {/* Mobile App Routes */}
      <Route path="/app" element={<RouteWrapper><MobileHome /></RouteWrapper>} />
      <Route path="/app/product/:id" element={<RouteWrapper><MobileProductDetail /></RouteWrapper>} />
      <Route path="/app/category/:id" element={<RouteWrapper><MobileCategory /></RouteWrapper>} />
      <Route path="/app/chat" element={<RouteWrapper><Chat /></RouteWrapper>} />
      <Route path="/app/categories" element={<RouteWrapper><MobileCategories /></RouteWrapper>} />
      <Route path="/app/vendor/:id" element={<RouteWrapper><VendorStore /></RouteWrapper>} />
      <Route path="/app/checkout" element={<RouteWrapper><MobileCheckout /></RouteWrapper>} />
      <Route path="/app/search" element={<RouteWrapper><MobileSearch /></RouteWrapper>} />
      <Route path="/app/reels" element={<RouteWrapper><MobileReels /></RouteWrapper>} />
      <Route path="/app/login" element={<RouteWrapper><MobileLogin /></RouteWrapper>} />
      <Route path="/app/register" element={<RouteWrapper><MobileRegister /></RouteWrapper>} />
      <Route path="/app/verification" element={<RouteWrapper><MobileVerification /></RouteWrapper>} />
      <Route path="/app/wishlist" element={<RouteWrapper><MobileWishlist /></RouteWrapper>} />
      <Route path="/app/offers" element={<RouteWrapper><MobileOffers /></RouteWrapper>} />
      <Route path="/app/daily-deals" element={<RouteWrapper><MobileDailyDeals /></RouteWrapper>} />
      <Route path="/app/flash-sale" element={<RouteWrapper><MobileFlashSale /></RouteWrapper>} />
      <Route path="/app/order-confirmation/:orderId" element={<RouteWrapper><MobileOrderConfirmation /></RouteWrapper>} />
      <Route path="/app/orders/:orderId" element={<RouteWrapper><MobileOrderDetail /></RouteWrapper>} />
      <Route path="/app/track-order/:orderId" element={<RouteWrapper><MobileTrackOrder /></RouteWrapper>} />
      <Route
        path="/app/profile"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileProfile />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/app/orders"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileOrders />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/app/addresses"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileAddresses />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <AppRoutes />
          <CartDrawer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#212121",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#388E3C",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#FF6161",
                  secondary: "#fff",
                },
              },
            }}
          />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
