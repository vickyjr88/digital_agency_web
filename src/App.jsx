import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/auth/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { PostHogProvider } from './context/PostHogContext';
import { Toaster } from 'sonner';
import AppLayout from './components/layout/AppLayout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import CreateBrand from './pages/dashboard/CreateBrand';
import BrandDetails from './pages/dashboard/BrandDetails';
import EditBrand from './pages/dashboard/EditBrand';

import EditContent from './pages/dashboard/EditContent';
import BillingCallback from './pages/dashboard/BillingCallback';
import Login from './pages/auth/Login';
import LandingPage from './pages/home/LandingPage';
import UserDetails from './features/admin/UserDetails';

// Marketplace Pages
import Marketplace from './pages/Marketplace/Marketplace';
import InfluencerOnboarding from './pages/Influencer/InfluencerOnboarding';
import InfluencerDashboard from './pages/Influencer/InfluencerDashboard';
import InfluencerProfile from './pages/Influencer/InfluencerProfile';
import CreatePackage from './pages/Influencer/CreatePackage';
import PackageDetail from './pages/Package/PackageDetail';
import CampaignDetail from './pages/Campaign/CampaignDetail';
import CampaignDetailRouter from './pages/Campaign/CampaignDetailRouter';
import BrandDashboard from './pages/Brand/BrandDashboard';
import Wallet from './pages/Wallet/Wallet';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Open Campaigns (Bidding System)
import CreateCampaign from './pages/OpenCampaigns/CreateCampaign';
import OpenCampaignsList from './pages/OpenCampaigns/OpenCampaignsList';
import OpenCampaignDetail from './pages/OpenCampaigns/OpenCampaignDetail';
import ContentGenerator from './pages/OpenCampaigns/ContentGenerator';
import EditGeneratedContent from './pages/Campaign/EditGeneratedContent';

// Proof of Work
import SubmitProof from './pages/ProofOfWork/SubmitProof';
import MySubmissions from './pages/ProofOfWork/MySubmissions';
import ReviewProof from './pages/ProofOfWork/ReviewProof';

// Wallet & Payments
import PaymentMethods from './pages/Wallet/PaymentMethods';

// Admin
import AdminWithdrawals from './pages/Admin/AdminWithdrawals';

// Bids
import MyBids from './pages/Bids/MyBids';
import CampaignInvites from './pages/Bids/CampaignInvites';

// Admin Pages
import AdminCampaigns from './pages/Admin/AdminCampaigns';
import AdminBids from './pages/Admin/AdminBids';
import AdminDisputes from './pages/Admin/AdminDisputes';

// Affiliate Commerce Pages
import BrandProfileSetup from './pages/AffiliateCommerce/BrandProfile/BrandProfileSetup';
import ProductsList from './pages/AffiliateCommerce/Products/ProductsList';
import CreateProduct from './pages/AffiliateCommerce/Products/CreateProduct';
import EditProduct from './pages/AffiliateCommerce/Products/EditProduct';
import ProductMarketplace from './pages/AffiliateCommerce/Products/ProductMarketplace';
import BrandOrders from './pages/AffiliateCommerce/Orders/BrandOrders';
import InfluencerOrders from './pages/AffiliateCommerce/Orders/InfluencerOrders';
import PlaceOrder from './pages/AffiliateCommerce/Orders/PlaceOrder';
import PaymentVerify from './pages/AffiliateCommerce/Orders/PaymentVerify';
import DigitalLibrary from './pages/AffiliateCommerce/Orders/DigitalLibrary';
import BrandAffiliateDashboard from './pages/AffiliateCommerce/Analytics/BrandDashboard';
import InfluencerAffiliateDashboard from './pages/AffiliateCommerce/Analytics/InfluencerDashboard';
import PublicShop from './pages/AffiliateCommerce/Shop/PublicShop';
import MyLinks from './pages/AffiliateCommerce/MyLinks/MyLinks';

// Public Pages
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Security from './pages/public/Security';
import API from './pages/public/API';
import Integrations from './pages/public/Integrations';
import Careers from './pages/public/Careers';

// Tumanasi Delivery Service
import TumansiLanding from './pages/Tumanasi/TumansiLanding';
import BookingWizard from './pages/Tumanasi/BookingWizard';
import TrackDelivery from './pages/Tumanasi/TrackDelivery';
import RiderRegister from './pages/Tumanasi/RiderRegister';
import RiderDashboard from './pages/Tumanasi/RiderDashboard';
import TumansiAdmin from './pages/Tumanasi/TumansiAdmin';
import TumansiPricing from './pages/Tumanasi/TumansiPricing';


// Protected Route Component (Simplified for now)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="initial-loader">
      <div className="spinner"></div>
      <p>Verifying Access...</p>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="initial-loader">
      <div className="spinner"></div>
      <p>Verifying Admin...</p>
    </div>
  );
  if (!isAuthenticated || (user?.role?.toLowerCase() !== 'admin' && user?.user_type?.toLowerCase() !== 'admin')) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

// Wrapper component for pages that need padding/max-width
function PageContainer({ children }) {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      {children}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FeatureFlagProvider>
        <Toaster richColors position="top-right" />
        <Router>
          <PostHogProvider>
            <Routes>
              {/* Auth routes - no layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* All other routes wrapped in AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />

                {/* Public Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/security" element={<Security />} />
                <Route path="/api" element={<API />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="trends" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/trends" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="trends" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/my-brands" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="brands" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/billing" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="billing" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="profile" /></PageContainer>
                  </ProtectedRoute>
                } />
                {/* Admin Dashboard */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin User Details with Sidebar */}
                <Route path="/admin/user/:id" element={
                  <AdminRoute>
                    <PageContainer>
                      <AdminDashboard defaultTab="users">
                        <UserDetails />
                      </AdminDashboard>
                    </PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Campaigns Management */}
                <Route path="/admin/campaigns" element={
                  <AdminRoute>
                    <PageContainer>
                      <AdminDashboard defaultTab="campaigns">
                        <AdminCampaigns />
                      </AdminDashboard>
                    </PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Users */}
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="users" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Brands */}
                <Route path="/admin/brands" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="brands" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Content */}
                <Route path="/admin/content" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="content" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Analytics */}
                <Route path="/admin/analytics" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="analytics" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Failures */}
                <Route path="/admin/failures" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="failures" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Subscriptions */}
                <Route path="/admin/subscriptions" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="subscriptions" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Wallet Transactions */}
                <Route path="/admin/wallet-transactions" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="wallet_transactions" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Influencers */}
                <Route path="/admin/influencers" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="influencers" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Packages */}
                <Route path="/admin/packages" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard defaultTab="packages" /></PageContainer>
                  </AdminRoute>
                } />
                {/* Admin Bids */}
                <Route path="/admin/bids" element={
                  <AdminRoute>
                    <PageContainer>
                      <AdminDashboard defaultTab="bids">
                        <AdminBids />
                      </AdminDashboard>
                    </PageContainer>
                  </AdminRoute>
                } />

                {/* Admin Disputes */}
                <Route path="/admin/disputes" element={
                  <AdminRoute>
                    <PageContainer>
                      <AdminDashboard defaultTab="disputes">
                        <AdminDisputes />
                      </AdminDashboard>
                    </PageContainer>
                  </AdminRoute>
                } />

                {/* Admin Commerce (Orders & Products) */}
                <Route path="/admin/commerce" element={
                  <AdminRoute>
                    <PageContainer>
                      <AdminDashboard defaultTab="commerce" />
                    </PageContainer>
                  </AdminRoute>
                } />

                {/* Brand Pages wrapped in Dashboard for Sidebar */}
                <Route path="/dashboard/brands/new" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="brands">
                        <CreateBrand />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/brands/:id" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="brands">
                        <BrandDetails />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/brands/:id/edit" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="brands">
                        <EditBrand />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/content/:id/edit" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="brands">
                        <EditContent />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/billing/callback" element={
                  <ProtectedRoute>
                    <PageContainer><BillingCallback /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* =================================================================== */}
                {/* MARKETPLACE ROUTES */}
                {/* =================================================================== */}

                {/* Marketplace Browse (Public, but login recommended) */}
                <Route path="/marketplace" element={
                  <PageContainer><Marketplace /></PageContainer>
                } />
                <Route path="/marketplace/influencer/:influencerId" element={
                  <PageContainer><InfluencerProfile /></PageContainer>
                } />
                <Route path="/marketplace/package/:packageId" element={
                  <PageContainer><PackageDetail /></PageContainer>
                } />




                {/* =================================================================== */}
                {/* AFFILIATE COMMERCE ROUTES */}
                {/* =================================================================== */}

                {/* Brand Affiliate Commerce */}
                <Route path="/affiliate/brand-profile" element={
                  <ProtectedRoute>
                    <PageContainer><BrandProfileSetup /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/products" element={
                  <ProtectedRoute>
                    <PageContainer><ProductsList /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/products/create" element={
                  <ProtectedRoute>
                    <PageContainer><CreateProduct /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/products/edit/:id" element={
                  <ProtectedRoute>
                    <PageContainer><EditProduct /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/orders" element={
                  <ProtectedRoute>
                    <PageContainer><BrandOrders /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/analytics" element={
                  <ProtectedRoute>
                    <PageContainer><BrandAffiliateDashboard /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Influencer Affiliate Commerce */}
                <Route path="/affiliate/marketplace" element={
                  <ProtectedRoute>
                    <PageContainer><ProductMarketplace /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/my-orders" element={
                  <ProtectedRoute>
                    <PageContainer><InfluencerOrders /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/my-dashboard" element={
                  <ProtectedRoute>
                    <PageContainer><InfluencerAffiliateDashboard /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate/my-links" element={
                  <ProtectedRoute>
                    <PageContainer><MyLinks /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Public Affiliate Commerce (Shop & Customer Order Page) */}
                <Route path="/shop" element={
                  <PublicShop />
                } />
                <Route path="/shop/p/:slug" element={
                  <PlaceOrder />
                } />
                <Route path="/shop/payment/verify" element={
                  <PaymentVerify />
                } />

                {/* Digital Library (Customer Downloads) */}
                <Route path="/shop/digital-library" element={
                  <DigitalLibrary />
                } />

                {/* ================================================================ */}
                {/* TUMANASI DELIVERY SERVICE ROUTES                                  */}
                {/* ================================================================ */}

                {/* Public Tumanasi pages (no auth required) */}
                <Route path="/tumanasi" element={<TumansiLanding />} />
                <Route path="/tumanasi/pricing" element={<TumansiPricing />} />
                <Route path="/tumanasi/book" element={<BookingWizard />} />
                <Route path="/tumanasi/track" element={<TrackDelivery />} />
                <Route path="/tumanasi/track/:trackingNumber" element={<TrackDelivery />} />

                {/* Rider pages */}
                <Route path="/tumanasi/rider/register" element={<ProtectedRoute><RiderRegister /></ProtectedRoute>} />
                <Route path="/tumanasi/rider/dashboard" element={
                  <ProtectedRoute><RiderDashboard /></ProtectedRoute>
                } />

                {/* Admin Tumanasi */}
                <Route path="/admin/tumanasi" element={
                  <AdminRoute><TumansiAdmin /></AdminRoute>
                } />

                {/* Public Influencer Profile by ID (short URL) */}
                {/* This MUST come before specific /influencer/* routes,
                  but React Router v6 correctly prefers static segments first */}

                {/* Influencer Onboarding */}
                <Route path="/influencer/onboarding" element={
                  <ProtectedRoute>
                    <PageContainer><InfluencerOnboarding /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Influencer Dashboard */}
                <Route path="/influencer/dashboard" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="influencer" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/influencer/profile" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="influencer" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/influencer/packages" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="influencer" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/influencer/packages/new" element={
                  <ProtectedRoute>
                    <PageContainer><CreatePackage /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/influencer/packages/:packageId/edit" element={
                  <ProtectedRoute>
                    <PageContainer><CreatePackage /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Public influencer profile — dynamic, keep after all static /influencer/* paths */}
                <Route path="/influencer/:influencerId" element={
                  <PageContainer><InfluencerProfile /></PageContainer>
                } />

                {/* Wallet - Now part of Dashboard */}
                <Route path="/wallet" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="wallet" /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/wallet/callback" element={
                  <ProtectedRoute>
                    <PageContainer><Dashboard defaultTab="wallet" /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Campaigns */}
                <Route path="/campaigns" element={
                  <ProtectedRoute>
                    <BrandDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/campaigns/:campaignId" element={
                  <PageContainer><CampaignDetailRouter /></PageContainer>
                } />

                {/* Open Campaign Creation */}
                <Route path="/campaigns/create" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="campaigns">
                        <CreateCampaign />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />

                {/* Direct Links for Sidebar */}
                <Route path="/my-campaigns" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="campaigns">
                        <BrandDashboard />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/campaign-invites" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="campaigns">
                        <CampaignInvites />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/my-bids" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="campaigns">
                        <MyBids />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />

                <Route path="/campaigns/open" element={
                  <ProtectedRoute>
                    <PageContainer><OpenCampaignsList /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/campaigns/open/:campaignId" element={
                  <PageContainer><OpenCampaignDetail /></PageContainer>
                } />
                <Route path="/content/generate" element={
                  <ProtectedRoute>
                    <PageContainer><ContentGenerator /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/campaign-content/:contentId/edit" element={
                  <ProtectedRoute>
                    <PageContainer><EditGeneratedContent /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Proof of Work */}
                <Route path="/proof-of-work/submit" element={
                  <ProtectedRoute>
                    <PageContainer><SubmitProof /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/proof-of-work/my-submissions" element={
                  <ProtectedRoute>
                    <PageContainer><MySubmissions /></PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/proof-of-work/review" element={
                  <ProtectedRoute>
                    <PageContainer><ReviewProof /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Payment Methods */}
                <Route path="/payment-methods" element={
                  <ProtectedRoute>
                    <PageContainer><PaymentMethods /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Brand Dashboard */}
                <Route path="/brand-dashboard" element={
                  <ProtectedRoute>
                    <BrandDashboard />
                  </ProtectedRoute>
                } />

                {/* Admin Withdrawals */}
                <Route path="/admin/withdrawals" element={
                  <ProtectedRoute>
                    <PageContainer><AdminWithdrawals /></PageContainer>
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <PageContainer><AdminDashboard /></PageContainer>
                  </AdminRoute>
                } />

                {/* Add direct brand routes for public/legacy links */}
                <Route path="/brand/:id" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="brands">
                        <BrandDetails />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/brand/:id/edit" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="brands">
                        <EditBrand />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
                <Route path="/brands/new" element={
                  <ProtectedRoute>
                    <PageContainer>
                      <Dashboard defaultTab="brands">
                        <CreateBrand />
                      </Dashboard>
                    </PageContainer>
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </PostHogProvider>
        </Router>
      </FeatureFlagProvider>
    </AuthProvider>
  );
}

export default App;

