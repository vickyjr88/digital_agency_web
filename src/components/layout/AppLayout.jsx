import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  LayoutGrid,
  User,
  Package,
  Briefcase,
  CreditCard,
  LogOut,
  Menu,
  X,
  Globe,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  Shield,
  Megaphone,
  FileText,
  Wallet as WalletIcon,
  Plus,
  Target,
  Mail,
  BarChart2,
  Star,
  Camera,
  ClipboardCheck,
  Settings,
  Link2,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  // Define public routes that should never show sidebar (even when authenticated)
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/security',
    '/api',
    '/integrations',
    '/careers',
    '/shop',
    '/shop/p',
    '/shop/payment/verify',
    '/shop/digital-library',
    '/tumanasi',
    '/tumanasi/book',
    '/tumanasi/track',
    '/tumanasi/pricing',
    '/tumanasi/rider/register',
  ];

  // Check if current route is a public route
  const isPublicRoute = publicRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Check if current route is an admin route (admin has its own layout)
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Define menu items based on user type
  const getMenuItems = () => {
    const items = [
      // Main sections
      { path: '/trends', icon: TrendingUp, label: 'Trends' },
      { path: '/my-brands', icon: LayoutGrid, label: 'My Brands' },
      { path: '/billing', icon: CreditCard, label: 'Subscription' },
      { path: '/profile', icon: Settings, label: 'Profile' },

      // Campaigns section
      { type: 'divider', label: 'Campaigns' },
      { path: '/campaigns/create', icon: Plus, label: 'Start Campaign' },
      { path: '/campaigns/open', icon: Globe, label: 'Browse Campaigns' },
      { path: '/my-campaigns', icon: Target, label: 'My Campaigns' },
      { path: '/campaign-invites', icon: Mail, label: 'Invites' },
      { path: '/my-bids', icon: FileText, label: 'My Bids' },

      // Financials section
      { type: 'divider', label: 'Financials' },
      { path: '/wallet', icon: WalletIcon, label: 'My Wallet' },

      // Affiliate Commerce section
      { type: 'divider', label: 'Affiliate Commerce' },
      { path: '/affiliate/marketplace', icon: ShoppingBag, label: 'Browse Products' },
      { path: '/affiliate/products', icon: Package, label: 'My Products' },
      { path: '/affiliate/orders', icon: ClipboardCheck, label: 'Orders' },
      { path: '/affiliate/analytics', icon: BarChart2, label: 'Affiliate Stats' },

      // Tumanasi Delivery
      { type: 'divider', label: 'Tumanasi Delivery' },
      { path: '/tumanasi', icon: Truck, label: 'Book a Delivery' },
      { path: '/tumanasi/track', icon: Truck, label: 'Track Parcel' },
    ];

    // Add Influencer Tools section for influencers
    if (user?.user_type?.toLowerCase() === 'influencer') {
      items.push(
        { type: 'divider', label: 'Influencer Tools' },
        { path: '/influencer/dashboard', icon: Star, label: 'My Services' },
        { path: '/affiliate/my-links', icon: Link2, label: 'My Affiliate Links' },
        { path: '/affiliate/my-orders', icon: ShoppingBag, label: 'My Earnings' },
        { path: '/payment-methods', icon: CreditCard, label: 'Payout Settings' },
        { path: '/proof-of-work/submit', icon: Camera, label: 'Submit Proof' },
        { path: '/proof-of-work/my-submissions', icon: ClipboardCheck, label: 'My Submissions' }
      );
    }

    // Add Admin section for admins
    if (user?.user_type?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin') {
      items.push(
        { type: 'divider', label: 'Admin' },
        { path: '/admin', icon: Shield, label: 'Admin Panel' },
        { path: '/admin/tumanasi', icon: Truck, label: 'Tumanasi Admin' }
      );
    }

    return items;
  };

  const menuItems = isAuthenticated ? getMenuItems() : [];

  // Sidebar content for authenticated users
  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="text-xl font-bold text-gray-900">Dexter</span>
          </Link>
          {isMobile && (
            <button
              onClick={closeMobileSidebar}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={`divider-${index}`} className="pt-4 pb-2 px-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && closeMobileSidebar()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {user?.user_type && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${user.user_type.toLowerCase() === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : user.user_type.toLowerCase() === 'influencer'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
                }`}>
                {user.user_type}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  // Admin layout - no navbar, no footer, just content
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    );
  }

  // Authenticated layout with sidebar (but not on public routes)
  if (isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              D
            </div>
            <span className="text-xl font-bold text-gray-900">Dexter</span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-10 hidden md:flex flex-col">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={closeMobileSidebar}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col md:hidden"
              >
                <SidebarContent isMobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="md:ml-64 pt-16 md:pt-8 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="md:ml-64 bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Dexter. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Public layout with navbar and footer
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />
      <main className="flex-1 pt-0">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
