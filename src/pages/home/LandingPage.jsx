import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
	TrendingUp,
	Zap,
	CheckCircle,
	ArrowRight,
	Twitter,
	Facebook,
	Instagram,
	Video,
	Users,
	BarChart3,
	Clock,
	Shield,
	CreditCard
} from 'lucide-react';

export default function LandingPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, user } = useAuth();
	const [email, setEmail] = useState('');
	const [loadingPlan, setLoadingPlan] = useState(null);

	useEffect(() => {
		if (!location.hash) return;
		const id = location.hash.replace('#', '');
		const target = document.getElementById(id);
		if (target) {
			target.scrollIntoView({ behavior: 'smooth' });
		}
	}, [location]);

	const [trends, setTrends] = useState([]);

	useEffect(() => {
		const fetchTrends = async () => {
			try {
				const data = await api.getTrends(3);
				setTrends(data);
			} catch (error) {
				console.error("Failed to fetch trends:", error);
				// Fallback or leave empty to show nothing
			}
		};
		fetchTrends();
	}, []);

	const handleGetStarted = () => {
		navigate('/signup');
	};

	const handlePlanSelect = async (planId) => {
		if (planId === 'free') {
			navigate('/signup');
			return;
		}

		if (!isAuthenticated) {
			navigate(`/signup?plan=${planId}`);
			return;
		}

		try {
			setLoadingPlan(planId);
			const callbackUrl = `${window.location.origin}/dashboard/billing/callback`;
			const response = await api.subscribeToPlan(planId, callbackUrl);

			if (response && response.data && response.data.authorization_url) {
				window.location.href = response.data.authorization_url;
			} else {
				console.error("Invalid response from payment provider");
			}
		} catch (error) {
			console.error("Payment initialization failed:", error);
			alert("Failed to initialize payment. Please try again.");
		} finally {
			setLoadingPlan(null);
		}
	};

	return (
		<div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center"
				>
					<div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
						<Zap size={16} />
						AI-Powered Content Marketing
					</div>

					<h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
						Never Miss a Trend.<br />
						<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
							Never Run Out of Content.
						</span>
					</h1>

					<p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
						Dexter automatically detects trending topics and generates engaging social media content for Twitter, Facebook,
						Instagram, and TikTok—all in your brand's unique voice.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
						<button
							onClick={handleGetStarted}
							className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all text-lg font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl"
						>
							Start Free Trial <ArrowRight size={20} />
						</button>
						<button className="flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all text-lg font-medium border border-gray-200">
							Watch Demo <Video size={20} />
						</button>
					</div>

					<div className="flex items-center justify-center gap-8 text-sm text-gray-500">
						<div className="flex items-center gap-2">
							<CheckCircle size={16} className="text-green-500" />
							No credit card required
						</div>
						<div className="flex items-center gap-2">
							<CheckCircle size={16} className="text-green-500" />
							14-day free trial
						</div>
						<div className="flex items-center gap-2">
							<CheckCircle size={16} className="text-green-500" />
							Cancel anytime
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="mt-20 relative"
				>
					<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
						<div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 flex items-center gap-2">
							<div className="flex gap-1.5">
								<div className="w-3 h-3 rounded-full bg-red-400"></div>
								<div className="w-3 h-3 rounded-full bg-yellow-400"></div>
								<div className="w-3 h-3 rounded-full bg-green-400"></div>
							</div>
							<span className="text-white text-sm ml-4">Dexter Dashboard</span>
						</div>
						<div className="p-8 bg-gray-50">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{trends.length > 0 ? (
									trends.map((trend, i) => (
										<div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
											<div className="flex items-center gap-2 mb-4">
												<div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
													<TrendingUp size={16} className="text-indigo-600" />
												</div>
												<span className="text-xs font-semibold text-indigo-600">TRENDING NOW</span>
											</div>
											<h3 className="font-bold text-gray-900 mb-2 truncate" title={trend.topic || trend.query}>
												{trend.topic || trend.query || `Trend #${i + 1}`}
											</h3>
											<p className="text-sm text-gray-600 mb-4 line-clamp-2">
												{trend.volume ? `${trend.volume} searches` : 'High engagement predicted'}
											</p>
											<div className="flex gap-2">
												<div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
													<Twitter size={14} className="text-blue-600" />
												</div>
												<div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
													<Facebook size={14} className="text-blue-600" />
												</div>
												<div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center">
													<Instagram size={14} className="text-pink-600" />
												</div>
											</div>
										</div>
									))
								) : (
									/* Skeleton Loading State */
									[1, 2, 3].map((i) => (
										<div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
											<div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
											<div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
											<div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
											<div className="flex gap-2">
												<div className="w-6 h-6 bg-gray-200 rounded"></div>
												<div className="w-6 h-6 bg-gray-200 rounded"></div>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</motion.div>
			</section>

			<section id="features" className="bg-white py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Everything You Need to Dominate Social Media
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Powerful features designed to save you time and boost engagement
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								icon: <TrendingUp className="text-indigo-600" size={28} />,
								title: 'AI Trend Detection',
								description: 'Automatically identifies trending topics relevant to your industry and location'
							},
							{
								icon: <Zap className="text-purple-600" size={28} />,
								title: 'Multi-Platform Content',
								description: 'Generate content for Twitter, Facebook, Instagram Reels, and TikTok from one trend'
							},
							{
								icon: <Users className="text-blue-600" size={28} />,
								title: 'Brand Voice Customization',
								description: 'Define your unique voice, tone, and style for authentic content'
							},
							{
								icon: <Clock className="text-green-600" size={28} />,
								title: 'Automated Scheduling',
								description: 'Set it and forget it—content generated daily, weekly, or hourly'
							},
							{
								icon: <BarChart3 className="text-orange-600" size={28} />,
								title: 'Performance Analytics',
								description: 'Track engagement, reach, and ROI across all platforms'
							},
							{
								icon: <Shield className="text-red-600" size={28} />,
								title: 'Human-in-the-Loop',
								description: 'Review, edit, and approve content before publishing'
							}
						].map((feature, index) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								viewport={{ once: true }}
								className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
							>
								<div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-sm">
									{feature.icon}
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
								<p className="text-gray-600 leading-relaxed">{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section id="how-it-works" className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">How Dexter Works</h2>
						<p className="text-xl text-gray-600">From trend to post in 3 simple steps</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								step: '01',
								title: 'Define Your Brand',
								description: 'Tell us about your business, voice, and target audience'
							},
							{
								step: '02',
								title: 'AI Detects Trends',
								description: 'Our AI scans trending topics relevant to your industry'
							},
							{
								step: '03',
								title: 'Review & Publish',
								description: 'Approve AI-generated content and publish to your platforms'
							}
						].map((step, index) => (
							<div key={step.title} className="relative">
								<div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
									<div className="text-6xl font-bold text-indigo-100 mb-4">{step.step}</div>
									<h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
									<p className="text-gray-600 leading-relaxed">{step.description}</p>
								</div>
								{index < 2 && (
									<div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
										<ArrowRight className="text-indigo-300" size={32} />
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="pricing" className="py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
						<p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
						{[
							{
								id: 'day_pass',
								name: 'Day Pass',
								price: 'KES 29',
								period: '24 hours',
								features: ['1 brand profile', '5 content pieces', 'Instant Access', 'No Commitment'],
								cta: 'One-Time Buy',
								popular: false
							},
							{
								id: 'free',
								name: 'Free',
								price: 'KES 0',
								period: 'forever',
								features: ['1 brand profile', '10 content pieces/month', 'Manual trend selection', '7-day history'],
								cta: 'Get Started',
								popular: false
							},
							{
								id: 'starter',
								name: 'Starter',
								price: 'KES 2,999',
								period: 'per month',
								features: ['3 brand profiles', '100 content pieces/month', 'Daily AI trends', '30-day history', 'No watermark', 'M-PESA Supported'],
								cta: 'Start Free Trial',
								popular: false
							},
							{
								id: 'professional',
								name: 'Professional',
								price: 'KES 7,999',
								period: 'per month',
								features: ['10 brand profiles', '500 content pieces/month', '3x daily trends', 'Team collaboration (3)', 'API access', 'Analytics', 'Priority Support'],
								cta: 'Start Free Trial',
								popular: true
							},
							{
								id: 'agency',
								name: 'Agency',
								price: 'KES 19,999',
								period: 'per month',
								features: ['Unlimited brands', '2,000 content pieces/month', 'Hourly trends', 'Unlimited team', 'White-label', 'Priority support', 'Dedicated Account Manager'],
								cta: 'Contact Sales',
								popular: false
							}
						].map((plan, index) => (
							<motion.div
								key={plan.name}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								viewport={{ once: true }}
								className={`relative bg-white rounded-2xl border-2 p-8 ${plan.popular ? 'border-indigo-600 shadow-xl scale-105' : 'border-gray-200'
									}`}
							>
								{plan.popular && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
											Most Loved
										</span>
									</div>
								)}
								<h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
								<div className="mb-6">
									<span className="text-3xl font-bold text-gray-900">{plan.price}</span>
									<span className="text-gray-600 ml-2">/{plan.period}</span>
								</div>

								{plan.id !== 'free' && (
									<div className="flex items-center gap-2 mb-4 text-sm text-gray-500 bg-gray-50 p-2 rounded">
										<CreditCard size={16} />
										<span>Card & M-PESA Accepted</span>
									</div>
								)}

								<ul className="space-y-3 mb-8">
									{plan.features.map((feature) => (
										<li key={feature} className="flex items-start gap-2 text-gray-600">
											<CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
								<button
									onClick={() => handlePlanSelect(plan.id)}
									disabled={loadingPlan === plan.id}
									className={`w-full py-3 rounded-lg font-semibold transition-colors flex justify-center items-center gap-2 ${plan.popular
										? 'bg-indigo-600 text-white hover:bg-indigo-700'
										: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
										}`}
								>
									{loadingPlan === plan.id ? (
										<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
									) : (
										plan.cta
									)}
								</button>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
						Ready to Transform Your Social Media?
					</h2>
					<p className="text-xl text-indigo-100 mb-12">
						Join hundreds of businesses already using Dexter to stay ahead of trends
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="Enter your email"
							className="px-6 py-4 rounded-lg text-gray-900 w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-white"
						/>
						<button
							onClick={handleGetStarted}
							className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap"
						>
							Start Free Trial
						</button>
					</div>
					<p className="text-indigo-200 text-sm mt-4">
						14-day free trial • No credit card required • Cancel anytime
					</p>
				</div>
			</section>
		</div>
	);
}
