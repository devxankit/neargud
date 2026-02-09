import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./utils/animations"; // Initialize GSAP settings early
import RouteLoadingFallback from "./components/RouteLoadingFallback";

// Critical routes - load immediately
import Home from "./pages/Home";
import Login from "./pages/Login";

// Lazy load all other routes
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Search = lazy(() => import("./pages/Search"));
const VendorStore = lazy(() => import("./pages/VendorStore"));
const Register = lazy(() => import("./pages/Register"));
const Verification = lazy(() => import("./pages/Verification"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const Addresses = lazy(() => import("./pages/Addresses"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Offers = lazy(() => import("./pages/Offers"));
const DailyDeals = lazy(() => import("./pages/DailyDeals"));
const FlashSale = lazy(() => import("./pages/FlashSale"));
const CampaignPage = lazy(() => import("./pages/CampaignPage"));
const Category = lazy(() => import("./pages/Category"));
const Chat = lazy(() => import("./pages/Chat"));

// Core components - these need to be loaded
import CartDrawer from "./components/Cart/CartDrawer";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// Admin routes - lazy load the entire admin module
const AdminLogin = lazy(() => import("./pages/admin/Login"));
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute";
const AdminLayout = lazy(() => import("./components/Admin/Layout/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const OrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const ReturnRequests = lazy(() => import("./pages/admin/ReturnRequests"));
const ReturnRequestDetail = lazy(() => import("./pages/admin/ReturnRequestDetail"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Brands = lazy(() => import("./pages/admin/Brands"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const Inventory = lazy(() => import("./pages/admin/Inventory"));
const Campaigns = lazy(() => import("./pages/admin/Campaigns"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Content = lazy(() => import("./pages/admin/Content"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const More = lazy(() => import("./pages/admin/More"));
const PromoCodes = lazy(() => import("./pages/admin/PromoCodes"));
// Orders child pages
const AllOrders = lazy(() => import("./pages/admin/orders/AllOrders"));
const OrderTracking = lazy(() => import("./pages/admin/orders/OrderTracking"));
const OrderNotifications = lazy(() => import("./pages/admin/orders/OrderNotifications"));
const Invoice = lazy(() => import("./pages/admin/orders/Invoice"));
// Products child pages
const ManageProducts = lazy(() => import("./pages/admin/products/ManageProducts"));
const AddProduct = lazy(() => import("./pages/admin/products/AddProduct"));
const BulkUpload = lazy(() => import("./pages/admin/products/BulkUpload"));
const TaxPricing = lazy(() => import("./pages/admin/products/TaxPricing"));
const ProductRatings = lazy(() => import("./pages/admin/products/ProductRatings"));
const ProductFAQs = lazy(() => import("./pages/admin/products/ProductFAQs"));
// Attribute Management child pages
const AttributeSets = lazy(() => import("./pages/admin/attributes/AttributeSets"));
const Attributes = lazy(() => import("./pages/admin/attributes/Attributes"));
const AttributeValues = lazy(() => import("./pages/admin/attributes/AttributeValues"));
// Categories child pages
const ManageCategories = lazy(() => import("./pages/admin/categories/ManageCategories"));
const CategoryOrder = lazy(() => import("./pages/admin/categories/CategoryOrder"));
// Brands child pages
const ManageBrands = lazy(() => import("./pages/admin/brands/ManageBrands"));
// Customers child pages
const ViewCustomers = lazy(() => import("./pages/admin/customers/ViewCustomers"));
const CustomerAddresses = lazy(() => import("./pages/admin/customers/Addresses"));
const Transactions = lazy(() => import("./pages/admin/customers/Transactions"));
const CustomerDetailPage = lazy(() => import("./pages/admin/customers/CustomerDetailPage"));
// Delivery Management child pages
const DeliveryBoys = lazy(() => import("./pages/admin/delivery/DeliveryBoys"));
const CashCollection = lazy(() => import("./pages/admin/delivery/CashCollection"));
// Vendors child pages
const Vendors = lazy(() => import("./pages/admin/Vendors"));
const ManageVendors = lazy(() => import("./pages/admin/vendors/ManageVendors"));
const PendingApprovals = lazy(() => import("./pages/admin/vendors/PendingApprovals"));
const VendorDetail = lazy(() => import("./pages/admin/vendors/VendorDetail"));
const CommissionRates = lazy(() => import("./pages/admin/vendors/CommissionRates"));
const AdminVendorAnalytics = lazy(() => import("./pages/admin/vendors/VendorAnalytics"));
// Locations child pages
const Cities = lazy(() => import("./pages/admin/locations/Cities"));
const Zipcodes = lazy(() => import("./pages/admin/locations/Zipcodes"));
// Offers & Sliders child pages
const HomeSliders = lazy(() => import("./pages/admin/offers/HomeSliders"));
const FestivalOffers = lazy(() => import("./pages/admin/offers/FestivalOffers"));
// Notifications child pages
const PushNotifications = lazy(() => import("./pages/admin/notifications/PushNotifications"));
const CustomMessages = lazy(() => import("./pages/admin/notifications/CustomMessages"));
const SendCustomNotification = lazy(() => import("./pages/admin/notifications/SendCustomNotification"));
// Support Desk child pages
const LiveChat = lazy(() => import("./pages/admin/support/LiveChat"));
const TicketTypes = lazy(() => import("./pages/admin/support/TicketTypes"));
const Tickets = lazy(() => import("./pages/admin/support/Tickets"));
// Reports child pages
const SalesReport = lazy(() => import("./pages/admin/reports/SalesReport"));
const InventoryReport = lazy(() => import("./pages/admin/reports/InventoryReport"));
// Analytics & Finance child pages
const RevenueOverview = lazy(() => import("./pages/admin/finance/RevenueOverview"));
const ProfitLoss = lazy(() => import("./pages/admin/finance/ProfitLoss"));
const OrderTrends = lazy(() => import("./pages/admin/finance/OrderTrends"));
const PaymentBreakdown = lazy(() => import("./pages/admin/finance/PaymentBreakdown"));
const TaxReports = lazy(() => import("./pages/admin/finance/TaxReports"));
const RefundReports = lazy(() => import("./pages/admin/finance/RefundReports"));
const VendorWithdrawals = lazy(() => import("./pages/admin/finance/VendorWithdrawals"));
// Consolidated Settings pages
const PaymentShippingSettings = lazy(() => import("./pages/admin/settings/PaymentShippingSettings"));
const OrdersCustomersSettings = lazy(() => import("./pages/admin/settings/OrdersCustomersSettings"));
const ProductsInventorySettings = lazy(() => import("./pages/admin/settings/ProductsInventorySettings"));
const ContentFeaturesSettings = lazy(() => import("./pages/admin/settings/ContentFeaturesSettings"));
const NotificationsSEOSettings = lazy(() => import("./pages/admin/settings/NotificationsSEOSettings"));
// Policies child pages
const PrivacyPolicy = lazy(() => import("./pages/admin/policies/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/admin/policies/RefundPolicy"));
const TermsConditions = lazy(() => import("./pages/admin/policies/TermsConditions"));
// Firebase child pages
const PushConfig = lazy(() => import("./pages/admin/firebase/PushConfig"));
const Authentication = lazy(() => import("./pages/admin/firebase/Authentication"));

import RouteWrapper from "./components/RouteWrapper";
import ScrollToTop from "./components/ScrollToTop";
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetail"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
// Mobile App Routes - lazy load to reduce initial bundle
const MobileHome = lazy(() => import("./modules/App/pages/Home"));
const MobileProductDetail = lazy(() => import("./modules/App/pages/ProductDetail"));
const MobileCategory = lazy(() => import("./modules/App/pages/Category"));
const MobileCategories = lazy(() => import("./modules/App/pages/categories"));
const MobileCheckout = lazy(() => import("./modules/App/pages/Checkout"));
const MobileSearch = lazy(() => import("./modules/App/pages/Search"));
const MobileLogin = lazy(() => import("./modules/App/pages/Login"));
const MobileRegister = lazy(() => import("./modules/App/pages/Register"));
const MobileVerification = lazy(() => import("./modules/App/pages/Verification"));
const MobileProfile = lazy(() => import("./modules/App/pages/Profile"));
const MobileOrders = lazy(() => import("./modules/App/pages/Orders"));
const MobileOrderDetail = lazy(() => import("./modules/App/pages/OrderDetail"));
const MobileAddresses = lazy(() => import("./modules/App/pages/Addresses"));
const MobileWishlist = lazy(() => import("./modules/App/pages/Wishlist"));
const MobileFavorites = lazy(() => import("./modules/App/pages/Favorites"));
const MobileReels = lazy(() => import("./modules/App/pages/Reels"));
const MobileOffers = lazy(() => import("./modules/App/pages/Offers"));
const MobileDailyDeals = lazy(() => import("./modules/App/pages/DailyDeals"));
const MobileFlashSale = lazy(() => import("./modules/App/pages/FlashSale"));
const MobileTrackOrder = lazy(() => import("./modules/App/pages/TrackOrder"));
const MobileOrderConfirmation = lazy(() => import("./modules/App/pages/OrderConfirmation"));
const MobilePolicies = lazy(() => import("./modules/App/pages/Policies"));
const MobileSavedCards = lazy(() => import("./modules/App/pages/SavedCards"));
const Wallet = lazy(() => import("./modules/App/pages/Wallet"));
const MobileNotifications = lazy(() => import("./modules/App/pages/Notifications"));
import BrandManager from "./components/BrandManager";
import MobileAppLayout from "./components/Layout/Mobile/MobileAppLayout";
// Delivery Routes - lazy load entire delivery module
const DeliveryLogin = lazy(() => import("./pages/delivery/Login"));
const DeliveryRegister = lazy(() => import("./pages/delivery/Register"));
const DeliveryVerification = lazy(() => import("./pages/delivery/Verification"));
const DeliveryForgotPassword = lazy(() => import("./pages/delivery/ForgotPassword"));
import DeliveryProtectedRoute from "./components/Delivery/DeliveryProtectedRoute";
const DeliveryLayout = lazy(() => import("./components/Delivery/Layout/DeliveryLayout"));
const DeliveryDashboard = lazy(() => import("./pages/delivery/Dashboard"));
const DeliveryOrders = lazy(() => import("./pages/delivery/Orders"));
const DeliveryOrderDetail = lazy(() => import("./pages/delivery/OrderDetail"));
const DeliveryProfile = lazy(() => import("./pages/delivery/Profile"));
const DeliveryWallet = lazy(() => import("./pages/delivery/Wallet"));
// Vendor Routes - lazy load entire vendor module
const VendorLogin = lazy(() => import("./modules/vendor/pages/Login"));
const VendorRegister = lazy(() => import("./modules/vendor/pages/Register"));
const VendorVerification = lazy(() => import("./modules/vendor/pages/Verification"));
const VendorForgotPassword = lazy(() => import("./modules/vendor/pages/ForgotPassword"));
import VendorProtectedRoute from "./modules/vendor/components/VendorProtectedRoute";
const VendorLayout = lazy(() => import("./modules/vendor/components/Layout/VendorLayout"));
const VendorDashboard = lazy(() => import("./modules/vendor/pages/Dashboard"));
const VendorProducts = lazy(() => import("./modules/vendor/pages/Products"));
const VendorManageProducts = lazy(() => import("./modules/vendor/pages/products/ManageProducts"));
const VendorAddProduct = lazy(() => import("./modules/vendor/pages/products/AddProduct"));
const VendorBulkUpload = lazy(() => import("./modules/vendor/pages/products/BulkUpload"));
const VendorProductForm = lazy(() => import("./modules/vendor/pages/products/ProductForm"));
const VendorOrders = lazy(() => import("./modules/vendor/pages/Orders"));
const VendorAllOrders = lazy(() => import("./modules/vendor/pages/orders/AllOrders"));
const VendorOrderTracking = lazy(() => import("./modules/vendor/pages/orders/OrderTracking"));
const VendorOrderDetail = lazy(() => import("./modules/vendor/pages/orders/OrderDetail"));
const VendorAnalytics = lazy(() => import("./modules/vendor/pages/Analytics"));
const VendorEarnings = lazy(() => import("./modules/vendor/pages/Earnings"));
const VendorSettings = lazy(() => import("./modules/vendor/pages/Settings"));




const VendorStockManagement = lazy(() => import("./modules/vendor/pages/StockManagement"));
const VendorWalletHistory = lazy(() => import("./modules/vendor/pages/WalletHistory"));
const VendorPickupLocations = lazy(() => import("./modules/vendor/pages/PickupLocations"));
const VendorChat = lazy(() => import("./modules/vendor/pages/Chat"));
const VendorReturnRequests = lazy(() => import("./modules/vendor/pages/ReturnRequests"));
const VendorReturnRequestDetail = lazy(() => import("./modules/vendor/pages/returns/ReturnRequestDetail"));
const VendorProductReviews = lazy(() => import("./modules/vendor/pages/ProductReviews"));
const VendorPromotions = lazy(() => import("./modules/vendor/pages/Promotions"));
const VendorNotifications = lazy(() => import("./modules/vendor/pages/Notifications"));
const VendorProductFAQs = lazy(() => import("./modules/vendor/pages/products/ProductFAQs"));
const VendorTaxPricing = lazy(() => import("./modules/vendor/pages/TaxPricing"));
const VendorShippingManagement = lazy(() => import("./modules/vendor/pages/ShippingManagement"));
const VendorCustomers = lazy(() => import("./modules/vendor/pages/Customers"));
const VendorCustomerDetail = lazy(() => import("./modules/vendor/pages/CustomerDetail"));
const VendorSupportTickets = lazy(() => import("./modules/vendor/pages/SupportTickets"));
const VendorProductAttributes = lazy(() => import("./modules/vendor/pages/ProductAttributes"));
const VendorInventoryReports = lazy(() => import("./modules/vendor/pages/InventoryReports"));
const VendorPerformanceMetrics = lazy(() => import("./modules/vendor/pages/PerformanceMetrics"));
const VendorDocuments = lazy(() => import("./modules/vendor/pages/Documents"));
const VendorReels = lazy(() => import("./modules/vendor/pages/Reels"));
const VendorAllReels = lazy(() => import("./modules/vendor/pages/reels/AllReels"));
const VendorAddReel = lazy(() => import("./modules/vendor/pages/reels/AddReel"));
const VendorEditReel = lazy(() => import("./modules/vendor/pages/reels/EditReel"));
const VendorSocial = lazy(() => import("./modules/vendor/pages/Social"));

// Inner component that has access to useLocation
import {
  initializePushNotifications,
  setupForegroundNotificationHandler,
} from "./services/pushNotificationService";
import { useNotificationListeners } from "./hooks/useNotificationListeners";

const AppRoutes = () => {
  // Use notification listeners for real-time socket updates
  useNotificationListeners();

  useEffect(() => {
    // Initialize push notifications
    initializePushNotifications();

    // Setup foreground handler
    setupForegroundNotificationHandler((payload) => {
      // You can use toast here if available globally, or just rely on the system notification
      console.log("Received foreground notification:", payload);
    });
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RouteWrapper>
            <MobileHome />
          </RouteWrapper>
        }
      />
      <Route
        path="/product/:id"
        element={
          <RouteWrapper>
            <MobileProductDetail />
          </RouteWrapper>
        }
      />
      <Route
        path="/category/:id"
        element={
          <RouteWrapper>
            <MobileCategory />
          </RouteWrapper>
        }
      />
      <Route
        path="/vendor/:id"
        element={
          <RouteWrapper>
            <VendorStore />
          </RouteWrapper>
        }
      />
      <Route
        path="/chat"
        element={
          <RouteWrapper>
            <Chat />
          </RouteWrapper>
        }
      />
      <Route
        path="/checkout"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileCheckout />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/search"
        element={
          <RouteWrapper>
            <MobileSearch />
          </RouteWrapper>
        }
      />
      <Route
        path="/login"
        element={
          <RouteWrapper>
            <MobileLogin />
          </RouteWrapper>
        }
      />
      <Route
        path="/register"
        element={
          <RouteWrapper>
            <MobileRegister />
          </RouteWrapper>
        }
      />
      <Route
        path="/verification"
        element={
          <RouteWrapper>
            <MobileVerification />
          </RouteWrapper>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RouteWrapper>
            <ForgotPassword />
          </RouteWrapper>
        }
      />
      <Route
        path="/wishlist"
        element={
          <RouteWrapper>
            <MobileWishlist />
          </RouteWrapper>
        }
      />
      <Route
        path="/offers"
        element={
          <RouteWrapper>
            <MobileOffers />
          </RouteWrapper>
        }
      />
      <Route
        path="/daily-deals"
        element={
          <RouteWrapper>
            <MobileDailyDeals />
          </RouteWrapper>
        }
      />
      <Route
        path="/flash-sale"
        element={
          <RouteWrapper>
            <MobileFlashSale />
          </RouteWrapper>
        }
      />
      <Route
        path="/sale/:slug"
        element={
          <RouteWrapper>
            <CampaignPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/campaign/:id"
        element={
          <RouteWrapper>
            <CampaignPage />
          </RouteWrapper>
        }
      />
      <Route
        path="/order-confirmation/:orderId"
        element={
          <RouteWrapper>
            <MobileOrderConfirmation />
          </RouteWrapper>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <RouteWrapper>
            <MobileOrderDetail />
          </RouteWrapper>
        }
      />
      <Route
        path="/track-order/:orderId"
        element={
          <RouteWrapper>
            <MobileTrackOrder />
          </RouteWrapper>
        }
      />
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
      <Route
        path="/app/wallet"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          </RouteWrapper>
        }
      />
      <Route
        path="/app/notifications"
        element={
          <RouteWrapper>
            <ProtectedRoute>
              <MobileNotifications />
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
        }>
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
        <Route
          path="categories/manage-categories"
          element={<ManageCategories />}
        />
        <Route path="categories/category-order" element={<CategoryOrder />} />
        <Route path="brands" element={<Brands />} />
        <Route path="brands/manage-brands" element={<ManageBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="orders/:id/invoice" element={<Invoice />} />
        <Route path="orders/all-orders" element={<AllOrders />} />
        <Route path="orders/order-tracking" element={<OrderTracking />} />
        <Route
          path="orders/order-notifications"
          element={<OrderNotifications />}
        />
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
        <Route
          path="attributes/attribute-values"
          element={<AttributeValues />}
        />
        <Route path="stock" element={<Inventory />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="delivery" element={<DeliveryBoys />} />
        <Route path="delivery/delivery-boys" element={<DeliveryBoys />} />
        <Route path="delivery/cash-collection" element={<CashCollection />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/manage-vendors" element={<ManageVendors />} />
        <Route
          path="vendors/pending-approvals"
          element={<PendingApprovals />}
        />
        <Route path="vendors/commission-rates" element={<CommissionRates />} />
        <Route
          path="vendors/vendor-analytics"
          element={<AdminVendorAnalytics />}
        />
        <Route path="vendors/:id" element={<VendorDetail />} />

        {/* Location Routes */}
        <Route
          path="locations"
          element={<Navigate to="/admin/locations/cities" replace />}
        />
        <Route path="locations/cities" element={<Cities />} />
        <Route path="locations/zipcodes" element={<Zipcodes />} />
        <Route path="offers" element={<HomeSliders />} />
        <Route path="offers/home-sliders" element={<HomeSliders />} />
        <Route path="offers/festival-offers" element={<FestivalOffers />} />
        <Route path="promocodes" element={<PromoCodes />} />
        <Route path="notifications" element={<PushNotifications />} />
        <Route
          path="notifications/push-notifications"
          element={<PushNotifications />}
        />
        <Route
          path="notifications/custom-messages"
          element={<CustomMessages />}
        />
        <Route
          path="notifications/send-custom"
          element={<SendCustomNotification />}
        />
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
        <Route
          path="finance/payment-breakdown"
          element={<PaymentBreakdown />}
        />
        <Route path="finance/tax-reports" element={<TaxReports />} />
        <Route path="finance/refund-reports" element={<RefundReports />} />
        <Route
          path="finance/vendor-withdrawals"
          element={<VendorWithdrawals />}
        />
        <Route path="analytics" element={<Analytics />} />
        <Route
          path="settings"
          element={<Navigate to="/admin/settings/store" replace />}
        />
        <Route path="settings/store" element={<Settings />} />
        <Route path="settings/contact" element={<Settings />} />
        <Route path="settings/delivery" element={<Settings />} />
        <Route path="settings/tax" element={<Settings />} />
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
      {/* <Route path="/delivery/register" element={<DeliveryRegister />} /> */}
      <Route path="/delivery/verify" element={<DeliveryVerification />} />
      <Route
        path="/delivery/forgot-password"
        element={<DeliveryForgotPassword />}
      />
      <Route
        path="/delivery"
        element={
          <DeliveryProtectedRoute>
            <DeliveryLayout />
          </DeliveryProtectedRoute>
        }>
        <Route index element={<Navigate to="/delivery/dashboard" replace />} />
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="orders" element={<DeliveryOrders />} />
        <Route path="orders/:id" element={<DeliveryOrderDetail />} />
        <Route path="wallet" element={<DeliveryWallet />} />
        <Route path="profile" element={<DeliveryProfile />} />
      </Route>
      {/* Vendor Routes */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/vendor/verification" element={<VendorVerification />} />
      <Route
        path="/vendor/forgot-password"
        element={<VendorForgotPassword />}
      />
      <Route
        path="/vendor"
        element={
          <VendorProtectedRoute>
            <VendorLayout />
          </VendorProtectedRoute>
        }>
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route
          path="products/manage-products"
          element={<VendorManageProducts />}
        />
        <Route path="products/add-product" element={<VendorAddProduct />} />
        <Route path="products/bulk-upload" element={<VendorBulkUpload />} />
        <Route path="products/product-faqs" element={<VendorProductFAQs />} />
        <Route path="products/tax-pricing" element={<VendorTaxPricing />} />
        <Route
          path="products/product-attributes"
          element={<VendorProductAttributes />}
        />
        <Route path="products/:id" element={<VendorProductForm />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="orders/all-orders" element={<VendorAllOrders />} />
        <Route path="orders/order-tracking" element={<VendorOrderTracking />} />
        <Route path="orders/:id" element={<VendorOrderDetail />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="earnings" element={<VendorEarnings />} />
        <Route path="earnings/overview" element={<VendorEarnings />} />
        <Route
          path="earnings/commission-history"
          element={<VendorEarnings />}
        />
        <Route
          path="earnings/settlement-history"
          element={<VendorEarnings />}
        />
        <Route path="earnings/withdrawals" element={<VendorEarnings />} />
        <Route path="stock-management" element={<VendorStockManagement />} />
        <Route path="wallet-history" element={<VendorWalletHistory />} />
        <Route path="pickup-locations" element={<VendorPickupLocations />} />
        <Route path="chat" element={<VendorChat />} />
        <Route path="return-requests" element={<VendorReturnRequests />} />
        <Route
          path="return-requests/:id"
          element={<VendorReturnRequestDetail />}
        />
        <Route path="product-reviews" element={<VendorProductReviews />} />
        <Route path="promocode" element={<VendorPromotions />} />
        <Route path="reels" element={<VendorReels />} />
        <Route path="reels/all-reels" element={<VendorAllReels />} />
        <Route path="reels/add-reel" element={<VendorAddReel />} />
        <Route path="reels/edit-reel/:id" element={<VendorEditReel />} />
        <Route path="notifications" element={<VendorNotifications />} />
        <Route
          path="shipping-management"
          element={<VendorShippingManagement />}
        />
        <Route path="customers" element={<VendorCustomers />} />
        <Route path="customers/:id" element={<VendorCustomerDetail />} />
        <Route path="support-tickets" element={<VendorSupportTickets />} />
        <Route path="support-tickets/:id" element={<VendorSupportTickets />} />
        <Route path="inventory-reports" element={<VendorInventoryReports />} />
        <Route
          path="performance-metrics"
          element={<VendorPerformanceMetrics />}
        />
        <Route path="documents" element={<VendorDocuments />} />
        <Route path="settings" element={<VendorSettings />} />
        <Route path="settings/store-identity" element={<VendorSettings />} />
        <Route path="settings/contact-info" element={<VendorSettings />} />
        <Route path="settings/social-media" element={<VendorSettings />} />
        <Route path="settings/store" element={<VendorSettings />} />
        <Route path="settings/payment" element={<VendorSettings />} />
        <Route path="settings/payment-settings" element={<VendorSettings />} />
        <Route path="settings/shipping" element={<VendorSettings />} />
        <Route path="settings/shipping-settings" element={<VendorSettings />} />
        <Route path="settings/shipping-delivery" element={<VendorSettings />} />
        <Route path="profile" element={<VendorSettings />} />
        <Route path="social" element={<VendorSocial />} />
      </Route>
      {/* Mobile App Routes */}
      <Route
        path="/app"
        element={<MobileAppLayout />}>
        <Route index element={<MobileHome />} />
        <Route path="product/:id" element={<MobileProductDetail />} />
        <Route path="category/:id" element={<MobileCategory />} />
        <Route path="chat" element={<Chat />} />
        <Route path="categories" element={<MobileCategories />} />
        <Route path="vendor/:id" element={<VendorStore />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <MobileCheckout />
            </ProtectedRoute>
          }
        />
        <Route path="search" element={<MobileSearch />} />
        <Route path="reels" element={<MobileReels />} />
        <Route path="login" element={<MobileLogin />} />
        <Route path="register" element={<MobileRegister />} />
        <Route path="verification" element={<MobileVerification />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="wishlist" element={<MobileWishlist />} />
        <Route path="favorites" element={<MobileFavorites />} />
        <Route path="offers" element={<MobileOffers />} />
        <Route path="daily-deals" element={<MobileDailyDeals />} />
        <Route path="flash-sale" element={<MobileFlashSale />} />
        <Route path="order-confirmation/:orderId" element={<MobileOrderConfirmation />} />
        <Route path="orders/:orderId" element={<MobileOrderDetail />} />
        <Route path="track-order/:orderId" element={<MobileTrackOrder />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <MobileProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <MobileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="addresses"
          element={
            <ProtectedRoute>
              <MobileAddresses />
            </ProtectedRoute>
          }
        />
        <Route path="cards" element={<MobileSavedCards />} />
        <Route path="help" element={<Chat />} />
        <Route path="policies" element={<MobilePolicies />} />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <MobileNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

import { useAdminAuthStore } from "./store/adminAuthStore";
import { useVendorAuthStore } from "./modules/vendor/store/vendorAuthStore";
import { useDeliveryAuthStore } from "./store/deliveryAuthStore";
import { useAuthStore } from "./store/authStore";
import { useLocationStore } from "./store/locationStore";
import { useAddressStore } from "./store/addressStore";
import {
  requestNotificationPermission,
  onMessageListener,
} from "./utils/notification";

function App() {
  const { initialize: initializeAdminAuth } = useAdminAuthStore();
  const { initialize: initializeVendorAuth } = useVendorAuthStore();
  const { initialize: initializeDeliveryAuth } = useDeliveryAuthStore();
  const {
    initialize: initializeLocation,
    currentCity,
    selectCity,
  } = useLocationStore();

  useEffect(() => {
    initializeAdminAuth();
    initializeVendorAuth();
    initializeDeliveryAuth();
    initializeLocation();
  }, [
    initializeAdminAuth,
    initializeVendorAuth,
    initializeDeliveryAuth,
    initializeLocation,
  ]);

  // Default-select user's city from their default address if no city is selected

  // Notification initialization
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Avoid calling notification registration on login/auth pages
    const isAuthPage = [
      "/login",
      "/vendor/login",
      "/admin/login",
      "/delivery/login",
      "/register",
      "/vendor/register",
      "/verification",
    ].some((path) => window.location.pathname.includes(path));

    if (isAuthenticated && !isAuthPage) {
      requestNotificationPermission().catch((err) =>
        console.error("Notification permission error", err),
      );
      onMessageListener();
    }
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}>
          <ScrollToTop />
          <BrandManager />
          <Suspense fallback={<RouteLoadingFallback />}>
            <AppRoutes />
          </Suspense>
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
