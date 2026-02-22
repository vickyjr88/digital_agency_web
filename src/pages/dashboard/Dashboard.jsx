import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Briefcase } from 'lucide-react';
import AdminUsers from '../../features/admin/AdminUsers';
import TrendsDashboard from '../../features/trends/TrendsDashboard';
import ProfileSettings from '../../features/profile/ProfileSettings';
import SubscriptionManager from '../../features/billing/SubscriptionManager';
import Wallet from '../Wallet/Wallet';
import InfluencerDashboard from '../Influencer/InfluencerDashboard';
import NextActionWidget from '../../components/NextActionWidget';
import MarketplaceActionWidget from '../../components/MarketplaceActionWidget';

export default function Dashboard({ defaultTab = 'trends', onLogout, children }) {
	const [user, setUser] = useState(null);
	const [brands, setBrands] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(defaultTab);
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
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto">
			{children ? (
				children
			) : (
				<>
					{activeTab === 'trends' && (
						<div>
							{user && <NextActionWidget user={user} brands={brands} />}
							{user && <MarketplaceActionWidget user={user} brands={brands} />}
							<TrendsDashboard brands={brands} user={user} />
						</div>
					)}

					{activeTab === 'brands' && (
						<div>
							<header className="flex justify-between items-center mb-8">
								<div>
									<h1 className="text-2xl font-bold text-gray-900">My Brands</h1>
									<p className="text-gray-500 mt-1">Manage your brands and content generation</p>
								</div>
								<button
									onClick={() => navigate('/brands/new')}
									className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
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
											className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
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
														<div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
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

					{activeTab === 'admin' && user?.role?.toLowerCase() === 'admin' && (
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
						<div>
							<InfluencerDashboard />
						</div>
					)}
				</>
			)}
		</div>
	);
}
