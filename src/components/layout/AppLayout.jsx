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
  ];

  // Check if current route is a public route
  const isPublicRoute = publicRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Define menu items based on user type
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
      { path: '/marketplace', icon: Globe, label: 'Marketplace' },
      { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    ];

    // Influencer items
    const influencerItems = [
      { path: '/influencer/dashboard', icon: TrendingUp, label: 'My Stats' },
      { path: '/influencer/onboarding', icon: User, label: 'Profile Setup' },
      { path: '/affiliate/marketplace', icon: Store, label: 'Products to Promote' },
      { path: '/affiliate/my-orders', icon: Package, label: 'My Orders' },
    ];

    // Brand items
    const brandItems = [
      { path: '/affiliate/products', icon: Package, label: 'My Products' },
      { path: '/affiliate/orders', icon: FileText, label: 'Orders' },
      { path: '/affiliate/analytics', icon: TrendingUp, label: 'Analytics' },
      { path: '/campaigns/open', icon: Megaphone, label: 'Campaigns' },
    ];

    // Admin items
    const adminItems = [
      { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
      { path: '/admin/users', icon: Users, label: 'Users' },
    ];

    const commonItems = [
      { path: '/wallet', icon: CreditCard, label: 'Wallet' },
    ];

    let items = [...baseItems];

    if (user?.user_type === 'influencer') {
      items.push(...influencerItems);
    }

    if (user?.user_type === 'brand' || user?.role === 'brand') {
      items.push(...brandItems);
    }

    if (user?.user_type === 'admin' || user?.role === 'admin') {
      items.push(...adminItems);
    }

    items.push(...commonItems);

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
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && closeMobileSidebar()}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
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
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
            {user?.full_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
        <main className="md:ml-64 pt-16 md:pt-0">
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
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
