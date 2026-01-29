import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Signup from './pages/auth/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FeatureFlagProvider, FeatureGate } from './context/FeatureFlagContext';
import { LayoutDashboard } from 'lucide-react';
import { Toaster } from 'sonner';

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
import BrandDashboard from './pages/Brand/BrandDashboard';
import Wallet from './pages/Wallet/Wallet';
import AdminDashboard from './pages/Admin/AdminDashboard';


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
  if (!isAuthenticated || user?.user_type !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

// Layout Component
function Layout({ children }) {
  const { user, isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 text-2xl font-bold text-purple-600">
            <LayoutDashboard className="w-8 h-8" />
            Dexter
          </Link>
          {/* Marketplace Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-purple-600 font-medium">
              Home
            </Link>
            <FeatureGate flag="marketplace_enabled">
              <Link to="/marketplace" className="text-gray-600 hover:text-purple-600 font-medium">
                🎯 Marketplace
              </Link>
            </FeatureGate>
            {user?.user_type === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-purple-600 font-medium">
                🛡️ Staff
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/wallet" className="text-gray-600 hover:text-purple-600 font-medium">
                💳 Wallet
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto p-4 w-full">
        {children}
      </main>
    </div>
  );
}

// Minimal layout for marketplace pages (no nav bar)
function MinimalLayout({ children }) {
  return (
    <div className="min-h-screen">
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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="trends" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/trends" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="trends" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/my-brands" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="brands" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="billing" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="profile" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="admin" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/user/:id" element={
              <ProtectedRoute>
                <Layout><UserDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/brands/new" element={
              <ProtectedRoute>
                <Layout><CreateBrand /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/brands/:id" element={
              <ProtectedRoute>
                <Layout><BrandDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/brands/:id/edit" element={
              <ProtectedRoute>
                <Layout><EditBrand /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/content/:id/edit" element={
              <ProtectedRoute>
                <Layout><EditContent /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/billing/callback" element={
              <ProtectedRoute>
                <Layout><BillingCallback /></Layout>
              </ProtectedRoute>
            } />

            {/* =================================================================== */}
            {/* MARKETPLACE ROUTES */}
            {/* =================================================================== */}

            {/* Marketplace Browse (Public, but login recommended) */}
            <Route path="/marketplace" element={
              <Layout><Marketplace /></Layout>
            } />
            <Route path="/marketplace/influencer/:influencerId" element={
              <Layout><InfluencerProfile /></Layout>
            } />
            <Route path="/marketplace/package/:packageId" element={
              <Layout><PackageDetail /></Layout>
            } />




            {/* Influencer Onboarding */}
            <Route path="/influencer/onboarding" element={
              <ProtectedRoute>
                <Layout><InfluencerOnboarding /></Layout>
              </ProtectedRoute>
            } />

            {/* Influencer Dashboard */}
            <Route path="/influencer/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="influencer" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/influencer/profile" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="influencer" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/influencer/packages" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="influencer" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/influencer/packages/new" element={
              <ProtectedRoute>
                <Layout><CreatePackage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/influencer/packages/:packageId/edit" element={
              <ProtectedRoute>
                <Layout><CreatePackage /></Layout>
              </ProtectedRoute>
            } />

            {/* Wallet - Now part of Dashboard */}
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="wallet" /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/wallet/callback" element={
              <ProtectedRoute>
                <Layout><Dashboard defaultTab="wallet" /></Layout>
              </ProtectedRoute>
            } />

            {/* Campaigns */}
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <MinimalLayout><BrandDashboard /></MinimalLayout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:campaignId" element={
              <ProtectedRoute>
                <Layout><CampaignDetail /></Layout>
              </ProtectedRoute>
            } />

            {/* Brand Dashboard */}
            <Route path="/brand-dashboard" element={
              <ProtectedRoute>
                <MinimalLayout><BrandDashboard /></MinimalLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <Layout><AdminDashboard /></Layout>
              </AdminRoute>
            } />

            {/* Add direct brand routes for public/legacy links */}
            {/* Add direct brand routes for public/legacy links to match user expectation */}
            <Route path="/brand/:id" element={
              <ProtectedRoute>
                <Layout><BrandDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/brand/:id/edit" element={
              <ProtectedRoute>
                <Layout><EditBrand /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/brands/new" element={
              <ProtectedRoute>
                <Layout><CreateBrand /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </FeatureFlagProvider>
    </AuthProvider>
  );
}

export default App;

