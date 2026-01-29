import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, LogOut, Briefcase, Shield, TrendingUp, Menu, X, Settings, CreditCard, BarChart2, Star } from 'lucide-react';
import AdminUsers from '../../features/admin/AdminUsers';
import TrendsDashboard from '../../features/trends/TrendsDashboard';
import ProfileSettings from '../../features/profile/ProfileSettings';
import SubscriptionManager from '../../features/billing/SubscriptionManager';
import Wallet from '../Wallet/Wallet';
import InfluencerDashboard from '../Influencer/InfluencerDashboard';

export default function Dashboard({ defaultTab = 'trends', onLogout, children }) {
	const [user, setUser] = useState(null);
	const [brands, setBrands] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(defaultTab);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		setActiveTab(defaultTab);
	}, [defaultTab]);

	useEffect(() => {
		fetchUserData();
	}, []);

	const fetchUserData = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				if (onLogout) onLogout();
				navigate('/login');
				return;
			}

			const userData = await api.getProfile();
			setUser(userData);

			const brandsData = await api.request('/brands');
			setBrands(brandsData);
		} catch (error) {
			console.error('Error:', error);
			localStorage.removeItem('token');
			if (onLogout) onLogout();
			navigate('/login');
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		if (onLogout) onLogout();
		navigate('/login');
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	const closeMobileSidebar = () => setMobileSidebarOpen(false);

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
						<button
							onClick={closeMobileSidebar}
							className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
							aria-label="Close menu"
						>
							<X size={24} />
						</button>
					)}
				</div>
			</div>

			<nav className="p-4 space-y-1 flex-1">
				<button
					onClick={() => {
						navigate('/trends');
						if (isMobile) closeMobileSidebar();
					}}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'trends' || activeTab === 'dashboard' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
						}`}
				>
					<TrendingUp size={20} />
					Trends
				</button>

				<button
					onClick={() => {
						navigate('/my-brands');
						if (isMobile) closeMobileSidebar();
					}}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'brands' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
						}`}
				>
					<LayoutGrid size={20} />
					My Brands
				</button>

				<button
					onClick={() => {
						navigate('/billing');
						if (isMobile) closeMobileSidebar();
					}}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
						}`}
				>
					<CreditCard size={20} />
					Subscription
				</button>

				<button
					onClick={() => {
						navigate('/profile');
						if (isMobile) closeMobileSidebar();
					}}
					className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
						}`}
				>
					<Settings size={20} />
					Profile
				</button>

				{user?.user_type === 'influencer' && (
					<>
						<div className="pt-4 pb-2 px-4">
							<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Influencer Tools</span>
						</div>
						<button
							onClick={() => {
								navigate('/influencer/dashboard');
								if (isMobile) closeMobileSidebar();
							}}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'influencer' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
								}`}
						>
							<Star size={20} />
							My Services
						</button>
					</>
				)}

				{user?.role === 'admin' && (
					<button
						onClick={() => {
							navigate('/admin');
							if (isMobile) closeMobileSidebar();
						}}
						className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'admin' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
							}`}
					>
						<Shield size={20} />
						Admin Panel
					</button>
				)}
			</nav>

			<div className="p-4 border-t border-gray-100">
				{user?.usage && (
					<div className="px-4 mb-6">
						<div className="flex justify-between items-end mb-2">
							<span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monthly Usage</span>
							<span className="text-xs font-bold text-purple-600">{user.usage.current} / {user.usage.limit}</span>
						</div>
						<div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
							<div
								className={`h-full transition-all duration-1000 ${user.usage.current / user.usage.limit > 0.9 ? 'bg-red-500' : 'bg-purple-600'
									}`}
								style={{ width: `${Math.min(100, (user.usage.current / user.usage.limit) * 100)}%` }}
							/>
						</div>
						{user.usage.current / user.usage.limit > 0.8 && (
							<p className="text-[10px] text-orange-600 mt-2 font-medium">Almost at your limit! Upgrade soon.</p>
						)}
					</div>
				)}
				<div className="flex items-center gap-3 px-4 py-3 mb-2">
					<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
						{user?.name?.[0]}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
						<p className="text-xs text-gray-500 truncate">{user?.email}</p>
					</div>
				</div>
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
		<div className="min-h-screen bg-gray-50 font-sans">
			{/* Mobile Header */}
			<div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
						D
					</div>
					<span className="text-xl font-bold text-gray-900">Dexter</span>
				</div>
				<button
					onClick={() => setMobileSidebarOpen(true)}
					className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
					aria-label="Open menu"
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
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/50 z-40 md:hidden"
							onClick={closeMobileSidebar}
						/>
						{/* Sidebar */}
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
				{children ? (
					children
				) : (
					<>
						{activeTab === 'trends' && (
							<div className="max-w-6xl mx-auto">
								<TrendsDashboard brands={brands} user={user} />
							</div>
						)}

						{activeTab === 'brands' && (
							<div className="max-w-6xl mx-auto">
								<header className="flex justify-between items-center mb-8">
									<div>
										<h1 className="text-2xl font-bold text-gray-900">My Brands</h1>
										<p className="text-gray-500 mt-1">Manage your brands and content generation</p>
									</div>
									<button
										onClick={() => navigate('/brands/new')}
										className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
									>
										<Plus size={18} />
										New Brand
									</button>
								</header>

								{brands.length === 0 ? (
									<div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
										<div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
											<Briefcase size={32} />
										</div>
										<h3 className="text-lg font-bold text-gray-900 mb-2">No brands yet</h3>
										<p className="text-gray-500 mb-6 max-w-sm mx-auto">
											Create your first brand to start generating AI-powered content for your social media.
										</p>
										<button
											onClick={() => navigate('/brands/new')}
											className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-lg shadow-purple-200"
										>
											Create Your First Brand
										</button>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{brands.map((brand, index) => (
											<motion.div
												key={brand.id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05 }}
												className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group cursor-pointer"
												onClick={() => navigate(`/brand/${brand.id}`)}
											>
												<div className="p-6">
													<div className="flex justify-between items-start mb-4">
														<div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
															{brand.name[0]}
														</div>
														<span
															className={`px-2.5 py-1 rounded-full text-xs font-medium ${brand.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
																}`}
														>
															{brand.is_active ? 'Active' : 'Inactive'}
														</span>
													</div>
													<h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
														{brand.name}
													</h3>
													<p className="text-sm text-gray-500 line-clamp-2 mb-4">{brand.description}</p>
													<div className="flex flex-wrap gap-2">
														{brand.hashtags?.slice(0, 3).map((tag) => (
															<span key={tag} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
																{tag}
															</span>
														))}
														{brand.hashtags?.length > 3 && (
															<span className="text-xs text-gray-400 px-1 py-1">+{brand.hashtags.length - 3}</span>
														)}
													</div>
												</div>
												<div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
													<span className="text-xs text-gray-500 font-medium">{brand.industry || 'General'}</span>
													<span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
														View Dashboard →
													</span>
												</div>
											</motion.div>
										))}
									</div>
								)}
							</div>
						)}

						{activeTab === 'admin' && user?.role === 'admin' && (
							<div className="space-y-8">
								<AdminUsers />
							</div>
						)}

						{activeTab === 'profile' && (
							<div className="max-w-4xl mx-auto">
								<ProfileSettings user={user} setUser={setUser} />
							</div>
						)}

						{activeTab === 'billing' && (
							<div className="max-w-6xl mx-auto">
								<SubscriptionManager user={user} />
							</div>
						)}

						{activeTab === 'wallet' && (
							<div className="max-w-6xl mx-auto">
								<Wallet user={user} />
							</div>
						)}

						{activeTab === 'influencer' && (
							<div className="max-w-6xl mx-auto">
								<InfluencerDashboard />
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}
