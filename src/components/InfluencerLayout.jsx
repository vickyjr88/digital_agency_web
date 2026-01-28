import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    User,
    Package,
    Briefcase,
    CreditCard,
    LogOut,
    Menu,
    X,
    Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function InfluencerLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    const menuItems = [
        { path: '/influencer/dashboard', icon: LayoutGrid, label: 'Dashboard' },
        { path: '/marketplace', icon: Globe, label: 'Marketplace' },
        { path: '/wallet', icon: CreditCard, label: 'Wallet' },
        { path: '/influencer/onboarding', icon: User, label: 'Profile Setup' },
    ];

    const SidebarContent = ({ isMobile = false }) => (
        <>
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            D
                        </div>
                        <span className="text-xl font-bold text-gray-900">Dexter</span>
                    </div>
                    {isMobile && (
                        <button onClick={closeMobileSidebar} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={24} />
                        </button>
                    )}
                </div>
            </div>

            <nav className="p-4 space-y-1 flex-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobile && closeMobileSidebar()}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                    ? 'bg-purple-50 text-purple-600'
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
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                    <span className="text-xl font-bold text-gray-900">Dexter</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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

            <main className="md:ml-64 pt-16 md:pt-0 p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </div>
    )
}
