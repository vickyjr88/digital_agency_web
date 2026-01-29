import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { influencerApi, packageApi, campaignApi, walletApi } from '../../services/marketplaceApi';
import './AdminDashboard.css';
import { toast } from 'sonner';
import { Users, Building2, FileText, AlertTriangle, UserCheck, Package, Target, Menu, X, LayoutDashboard, LogOut, TrendingUp, Shield, Clock, Briefcase, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminWithdrawals from './AdminWithdrawals';
import AdminSubscriptionTransactions from './AdminSubscriptionTransactions';
import AdminWalletTransactions from './AdminWalletTransactions';

export default function AdminDashboard({ defaultTab = 'overview', children }) {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [data, setData] = useState({
        users: [],
        brands: [],
        content: [],
        failures: [],
        influencers: [],
        packages: [],
        campaigns: [],
        analytics: null,
        stats: null,
        latest: null
    });
    const [showFundModal, setShowFundModal] = useState(false);
    const [fundingUser, setFundingUser] = useState(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!children) {
            setActiveTab(defaultTab);
        }
    }, [defaultTab, children]);

    useEffect(() => {
        if (!children) {
            // Only fetch data if the tab requires data loading at this level
            if (activeTab === 'subscriptions' || activeTab === 'wallet_transactions') return;
            fetchAdminData();
        }
    }, [activeTab, children]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const res = await api.getAdminUsers();
                setData(d => ({ ...d, users: res }));
            } else if (activeTab === 'brands') {
                const res = await api.getAdminBrands();
                setData(d => ({ ...d, brands: res }));
            } else if (activeTab === 'content') {
                const res = await api.getAdminContent();
                setData(d => ({ ...d, content: res }));
            } else if (activeTab === 'failures') {
                const res = await api.getGeneratorFailures();
                setData(d => ({ ...d, failures: res }));
            } else if (activeTab === 'influencers') {
                const allRes = await influencerApi.getAllAdmin().catch(() => ({ influencers: [] }));
                setData(d => ({ ...d, influencers: allRes.influencers || [] }));
            } else if (activeTab === 'packages') {
                const allRes = await packageApi.getAllAdmin().catch(() => ({ packages: [] }));
                setData(d => ({ ...d, packages: allRes.packages || [] }));
            } else if (activeTab === 'campaigns') {
                const allRes = await campaignApi.getAllAdmin().catch(() => ({ campaigns: [] }));
                setData(d => ({ ...d, campaigns: allRes.campaigns || [] }));
            } else if (activeTab === 'analytics') {
                const [dashboard, revenue, users] = await Promise.all([
                    api.getAnalyticsDashboard(),
                    api.getRevenueChart(),
                    api.getUserGrowthChart()
                ]);
                setData(d => ({ ...d, analytics: { ...dashboard, revenueChart: revenue, userChart: users } }));
            } else if (activeTab === 'overview') {
                const [stats, latest] = await Promise.all([
                    api.getAdminStats(),
                    api.request('/admin/latest')
                ]);
                setData(d => ({ ...d, stats, latest }));
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyInfluencer = async (influencerId, action) => {
        try {
            await influencerApi.verify(influencerId, action);
            fetchAdminData();
            toast.success(`Influencer ${action}ed`);
        } catch (error) {
            console.error('Error verifying influencer:', error);
            toast.error('Failed to update influencer status');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format((price || 0) / 100);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    const SidebarContent = ({ isMobile = false }) => (
        <>
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-xl font-bold text-gray-900">Admin</span>
                    </Link>
                    {isMobile && (
                        <button
                            onClick={closeMobileSidebar}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                <Link to="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                    <LayoutDashboard size={20} />
                    Back to App
                </Link>

                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Core Platform</span>
                </div>

                <button onClick={() => { setActiveTab('overview'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Shield size={20} /> Overview
                </button>
                <button onClick={() => { setActiveTab('users'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Users size={20} /> Users
                </button>
                <button onClick={() => { setActiveTab('brands'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'brands' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Building2 size={20} /> Brands
                </button>
                <button onClick={() => { setActiveTab('content'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'content' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <FileText size={20} /> Content
                </button>
                <button onClick={() => { setActiveTab('analytics'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <TrendingUp size={20} /> Analytics
                </button>
                <button onClick={() => { setActiveTab('failures'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'failures' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <AlertTriangle size={20} /> Failures/Logs
                </button>

                <div className="px-4 py-2 border-b border-gray-100 mb-2 mt-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Financials</span>
                </div>
                <button onClick={() => { setActiveTab('subscriptions'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'subscriptions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Clock size={20} /> Subscription Txs
                </button>
                <button onClick={() => { setActiveTab('wallet_transactions'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'wallet_transactions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Briefcase size={20} /> Wallet Txs
                </button>
                <button onClick={() => { setActiveTab('withdrawals'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'withdrawals' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <ArrowUpRight size={20} /> Withdrawals
                </button>

                <div className="px-4 py-2 border-b border-gray-100 mb-2 mt-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Marketplace</span>
                </div>

                <button onClick={() => { setActiveTab('influencers'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'influencers' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <UserCheck size={20} /> Influencers
                </button>
                <button onClick={() => { setActiveTab('packages'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'packages' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Package size={20} /> Packages
                </button>
                <button onClick={() => { setActiveTab('campaigns'); if (isMobile) closeMobileSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'campaigns' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Target size={20} /> Campaigns
                </button>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <Link to="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors mb-2">
                    <LayoutDashboard size={20} />
                    User Dashboard
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex text-left">
            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-30 hidden md:flex flex-col h-screen">
                <SidebarContent />
            </aside>

            <div className="flex-1 flex flex-col md:pl-64 min-h-screen transition-all duration-300">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="text-xl font-bold text-gray-900">Admin</span>
                    </div>
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {mobileSidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-50 md:hidden"
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

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    {children ? (
                        children
                    ) : (
                        loading ? (
                            <div className="loading-state py-20 flex flex-col items-center justify-center h-[50vh]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading data...</p>
                            </div>
                        ) : (
                            <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold capitalize text-gray-900">{activeTab} Management</h2>
                                    <button onClick={fetchAdminData} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors" title="Reload Data">
                                        <span className="text-xl">↻</span>
                                    </button>
                                </div>
                                <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${['analytics', 'overview'].includes(activeTab) ? '' : 'overflow-hidden'}`}>
                                    {activeTab === 'overview' && <OverviewDashboard stats={data.stats} latest={data.latest} navigate={navigate} />}
                                    {activeTab === 'users' && <UserManagement users={data.users} onFund={(user) => { setFundingUser(user); setShowFundModal(true); }} />}
                                    {activeTab === 'brands' && <BrandManagement brands={data.brands} />}
                                    {activeTab === 'content' && <ContentManagement content={data.content} />}
                                    {activeTab === 'failures' && <FailureManagement failures={data.failures} />}
                                    {activeTab === 'influencers' && <InfluencerManagement influencers={data.influencers} onVerify={handleVerifyInfluencer} />}
                                    {activeTab === 'packages' && <PackageManagement packages={data.packages} formatPrice={formatPrice} />}
                                    {activeTab === 'campaigns' && <CampaignManagement campaigns={data.campaigns} formatPrice={formatPrice} />}
                                    {activeTab === 'analytics' && data.analytics && <AnalyticsDashboard data={data.analytics} formatPrice={formatPrice} />}
                                    {activeTab === 'subscriptions' && <AdminSubscriptionTransactions />}
                                    {activeTab === 'wallet_transactions' && <AdminWalletTransactions />}
                                    {activeTab === 'withdrawals' && <AdminWithdrawals />}
                                </div>
                            </div>
                        )
                    )}
                </main>
            </div>

            {/* Manual Fund Modal */}
            <AnimatePresence>
                {showFundModal && (
                    <ManualFundModal
                        user={fundingUser}
                        onClose={() => { setShowFundModal(false); setFundingUser(null); }}
                        onSuccess={() => { setShowFundModal(false); setFundingUser(null); fetchAdminData(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Sub-components ---

// --- Sub-components ---

function UserManagement({ users, onFund }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{user.name || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">{user.role}</span></td>
                            <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">{user.subscription_tier}</span></td>
                            <td className="p-4 text-sm text-gray-600 capitalize">{user.subscription_status}</td>
                            <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="p-4 flex gap-2">
                                <Link to={`/admin/user/${user.id}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-800 hover:underline">Manage</Link>
                                <button
                                    onClick={() => onFund(user)}
                                    className="text-green-600 text-sm font-medium hover:text-green-800 hover:underline"
                                >
                                    Fund
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No users found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function BrandManagement({ brands }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand Name</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {brands.map(brand => (
                        <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{brand.name}</td>
                            <td className="p-4">
                                <Link to={`/admin/user/${brand.owner?.id}`} className="text-indigo-600 hover:underline text-sm">
                                    {brand.owner?.email}
                                </Link>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{brand.industry || 'N/A'}</td>
                            <td className="p-4 text-sm text-gray-500">{new Date(brand.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {brands.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No brands found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function ContentManagement({ content }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content ID</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref Trend</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generated</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {content.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-xs text-gray-500">{c.id.substring(0, 8)}...</td>
                            <td className="p-4">
                                <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{c.trend}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${c.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-500">{new Date(c.generated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                    {content.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No content found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function FailureManagement({ failures }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Error</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {failures.map(fail => (
                        <tr key={fail.id} className="hover:bg-red-50/30 transition-colors">
                            <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(fail.timestamp).toLocaleString()}</td>
                            <td className="p-4">
                                <div className="text-xs text-gray-500 mb-1">Brand: <span className="font-mono">{fail.brand_id?.substring(0, 8)}</span></div>
                                <div className="font-medium text-gray-900">{fail.trend}</div>
                            </td>
                            <td className="p-4 text-red-600 text-sm font-mono whitespace-pre-wrap max-w-md">{fail.error_message}</td>
                        </tr>
                    ))}
                    {failures.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-green-600 font-medium bg-green-50/30">✅ No failures recorded</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function InfluencerManagement({ influencers, onVerify }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Niche</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {influencers.map(inf => (
                        <tr key={inf.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <Link to={`/marketplace/influencer/${inf.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {inf.profile_picture_url ? <img src={inf.profile_picture_url} className="w-full h-full object-cover" /> : <span className="text-gray-500 font-bold">{inf.display_name?.[0]}</span>}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{inf.display_name}</div>
                                        <div className="text-xs text-gray-500">@{inf.handle || inf.username}</div>
                                    </div>
                                </Link>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{inf.niche}</td>
                            <td className="p-4 text-sm text-gray-900 font-medium">{new Intl.NumberFormat().format(inf.follower_count || 0)}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs capitalize font-medium ${inf.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {inf.verificationStatus}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    {inf.verificationStatus === 'pending' && (
                                        <>
                                            <button className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors" onClick={() => onVerify(inf.id, 'approve')}>Approve</button>
                                            <button className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors" onClick={() => onVerify(inf.id, 'reject')}>Reject</button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {influencers.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No influencers found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function PackageManagement({ packages, formatPrice }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {packages.map(pkg => (
                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{pkg.name}</td>
                            <td className="p-4 text-sm text-gray-600">{pkg.influencer?.display_name || 'N/A'}</td>
                            <td className="p-4 font-mono text-sm text-gray-900">{formatPrice(pkg.price)}</td>
                            <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize text-gray-600">{pkg.status}</span></td>
                            <td className="p-4 text-sm text-gray-600">{pkg.times_purchased}</td>
                        </tr>
                    ))}
                    {packages.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No packages found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function CampaignManagement({ campaigns, formatPrice }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign ID</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {campaigns.map(cp => (
                        <tr key={cp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-xs font-mono text-gray-500">{cp.id.substring(0, 8)}</td>
                            <td className="p-4 text-sm font-medium text-gray-900">{cp.brand?.name}</td>
                            <td className="p-4 text-sm text-gray-600">{cp.influencer?.display_name}</td>
                            <td className="p-4 font-mono text-sm text-gray-900">{formatPrice(cp.package?.price)}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium uppercase text-gray-600">{cp.status}</span>
                            </td>
                        </tr>
                    ))}
                    {campaigns.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No campaigns found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function OverviewDashboard({ stats, latest, navigate }) {
    if (!stats) return <div className="p-8 text-center text-gray-500">Loading overview...</div>;

    return (
        <div className="p-6 space-y-8">
            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard icon={Shield} title="Total Revenue" value={stats?.total_revenue} color="bg-green-50 text-green-600" />
                <StatsCard icon={Shield} title="Active Subscriptions" value={stats?.active_subscriptions} color="bg-indigo-50 text-indigo-600" />
                <StatsCard icon={Clock} title="Pending Transactions" value={stats?.pending_transactions} color="bg-yellow-50 text-yellow-600" />
            </div>

            {/* Usage Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={Users} title="Total Users" value={stats?.users} color="bg-blue-50 text-blue-600" />
                <StatsCard icon={Briefcase} title="Total Brands" value={stats?.brands} color="bg-purple-50 text-purple-600" />
                <StatsCard icon={TrendingUp} title="Total Trends" value={stats?.trends} color="bg-teal-50 text-teal-600" />
                <StatsCard icon={FileText} title="Content Generated" value={stats?.content_generated} color="bg-orange-50 text-orange-600" />
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        Recent Transactions
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats?.recent_transactions?.map(tx => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{tx.user_email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{tx.currency} {tx.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-100 text-green-700' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.recent_transactions || stats?.recent_transactions.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 italic">No recent transactions</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Latest Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LatestSection title="Latest Users" icon={Users} items={latest?.users} renderItem={user => (
                    <div key={user.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors" onClick={() => navigate(`/admin/user/${user.id}`)}>
                        <div>
                            <p className="font-medium text-sm text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                )} />

                <LatestSection title="Latest Brands" icon={Briefcase} items={latest?.brands} renderItem={brand => (
                    <div key={brand.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors" onClick={() => navigate(`/brand/${brand.id}`)}>
                        <div>
                            <p className="font-medium text-sm text-gray-900">{brand.name}</p>
                            <p className="text-xs text-gray-500">{brand.industry}</p>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(brand.created_at).toLocaleDateString()}</span>
                    </div>
                )} />

                <LatestSection title="Latest Trends" icon={TrendingUp} items={latest?.trends} renderItem={trend => (
                    <div key={trend.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="font-medium text-sm text-gray-900 truncate">{trend.topic}</p>
                            <p className="text-xs text-gray-500">{trend.source}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(trend.timestamp).toLocaleTimeString()}</span>
                    </div>
                )} />

                <LatestSection title="Latest Content" icon={FileText} items={latest?.content} renderItem={content => (
                    <div key={content.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors" onClick={() => navigate(`/dashboard/content/${content.id}/edit`, { state: { item: content } })}>
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="font-medium text-sm text-gray-900 truncate">{content.trend}</p>
                            <p className="text-xs text-gray-500 capitalize">{content.status}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(content.generated_at).toLocaleTimeString()}</span>
                    </div>
                )} />
            </div>
        </div>
    );
}

function StatsCard({ icon: Icon, title, value, color }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value ?? '-'}</p>
            </div>
        </div>
    );
}

function LatestSection({ title, icon: Icon, items, renderItem }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Icon size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>
            <div className="px-6 py-2">
                {items?.length > 0 ? items.map(renderItem) : <p className="py-4 text-sm text-gray-500 text-center">No activity yet</p>}
            </div>
        </div>
    );
}

function AnalyticsDashboard({ data, formatPrice }) {
    if (!data) return null;

    return (
        <div className="p-6 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
                    <div className="opacity-80 text-sm font-medium mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold">{formatPrice(data.revenue.total)}</div>
                    <div className="text-xs opacity-70 mt-2">
                        {formatPrice(data.revenue.this_month)} this month
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-1">Users</div>
                    <div className="text-3xl font-bold text-gray-900">{data.users.total}</div>
                    <div className="text-xs text-green-600 font-medium mt-2">
                        +{data.users.new_today} today
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-1">Content Generated</div>
                    <div className="text-3xl font-bold text-gray-900">{data.content.total}</div>
                    <div className="text-xs text-indigo-600 font-medium mt-2">
                        +{data.content.generated_today} today
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-medium mb-1">Marketplace</div>
                    <div className="flex gap-4 mt-2">
                        <div>
                            <div className="text-xl font-bold text-gray-900">{data.marketplace.influencers}</div>
                            <div className="text-xs text-gray-400">Influencers</div>
                        </div>
                        <div className="w-px bg-gray-200"></div>
                        <div>
                            <div className="text-xl font-bold text-gray-900">{data.marketplace.campaigns}</div>
                            <div className="text-xs text-gray-400">Campaigns</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (30 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueChart}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickFormatter={(val) => `KSh ${val / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value) => formatPrice(value)}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#4F46E5"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">User Growth (30 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.userChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                />
                                <Tooltip
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ManualFundModal({ user, onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await walletApi.manualFund(user.id, parseInt(amount), description);
            toast.success(`Successfully funded ${user.email}`);
            onSuccess();
        } catch (error) {
            console.error('Manual funding error:', error);
            toast.error(error.message || 'Failed to fund wallet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50">
                    <h3 className="text-xl font-bold text-green-900">Manual Wallet Funding</h3>
                    <button onClick={onClose} className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-900">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <strong>Target User:</strong> {user.name || 'N/A'}<br />
                            <strong>Email:</strong> {user.email}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Amount (KES)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                placeholder="e.g. 1000"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Reason / Reference</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[100px]"
                            placeholder="e.g. Bank transfer ref: #12345"
                            required
                        />
                        <p className="text-xs text-gray-400 italic">This will be shown to the user in their notifications.</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}
                        >
                            {loading ? 'Processing...' : 'Confirm Funding'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
