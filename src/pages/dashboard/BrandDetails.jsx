import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, RefreshCw, Settings, Loader, Zap, Eye, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BrandDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [brand, setBrand] = useState(null);
	const [content, setContent] = useState([]);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [copiedId, setCopiedId] = useState(null);
	const [showTrendModal, setShowTrendModal] = useState(false);
	const [trends, setTrends] = useState([]);
	const [loadingTrends, setLoadingTrends] = useState(false);
	const [selectedTrend, setSelectedTrend] = useState(null);

	useEffect(() => {
		fetchBrandData();
	}, [id]);

	const fetchBrandData = async () => {
		try {
			const brandData = await api.request(`/brands/${id}`);
			setBrand(brandData);

			const contentData = await api.request(`/brands/${id}/content`);
			setContent(contentData);
		} catch (error) {
			console.error('Error:', error);
			toast.error('Failed to load brand details');
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = (text, contentId) => {
		navigator.clipboard.writeText(text);
		setCopiedId(contentId);
		toast.success('Copied to clipboard');
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleOpenGenerateModal = async () => {
		setShowTrendModal(true);
		setLoadingTrends(true);
		try {
			const data = await api.request('/trends');
			setTrends(data);
		} catch (error) {
			console.error('Failed to fetch trends:', error);
			toast.error('Failed to fetch trends');
		} finally {
			setLoadingTrends(false);
		}
	};

	const handleGenerate = async () => {
		if (!selectedTrend) return;

		setGenerating(true);
		const toastId = toast.loading('Generating content...');
		try {
			await api.request(`/generate/${id}`, {
				method: 'POST',
				body: JSON.stringify({
					trend: selectedTrend.topic,
					trend_id: selectedTrend.id
				})
			});
			setShowTrendModal(false);
			setSelectedTrend(null);
			await fetchBrandData();
			toast.success('Content generated successfully!', { id: toastId });
		} catch (error) {
			toast.error('Generation failed. Please try again.', { id: toastId });
			console.error('Generation failed:', error);
		} finally {
			setGenerating(false);
		}
	};

	if (loading) return <div className="p-8 text-center">Loading brand...</div>;
	if (!brand) return <div className="p-8 text-center">Brand not found</div>;

	return (
		<div className="bg-gray-50 p-8 font-sans min-h-full">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div className="flex gap-4 w-full md:w-auto">
							<div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0">
								{brand.name[0]}
							</div>
							<div>
								<h1 className="text-2xl font-bold text-gray-900 break-words">{brand.name}</h1>
								<p className="text-gray-500 mt-1">
									{brand.industry} • {brand.voice} Voice
								</p>
								<div className="flex gap-2 mt-3 flex-wrap">
									{brand.hashtags?.map((tag) => (
										<span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
											{tag}
										</span>
									))}
								</div>
							</div>
						</div>
						<div className="flex gap-2 w-full md:w-auto">
							<button
								onClick={handleOpenGenerateModal}
								className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
							>
								<RefreshCw size={18} />
								Generate New Content
							</button>
							<button
								onClick={() => navigate(`/brand/${id}/edit`)}
								className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
							>
								<Settings size={20} />
							</button>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{content.map((item, index) => (
						<motion.div
							key={item.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col"
						>
							<div className="p-5 border-b border-gray-50 bg-gray-50/30">
								<div className="flex justify-between items-start mb-2">
									<span
										className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-full ${item.scheduled_at
											? 'bg-blue-100 text-blue-700'
											: item.status === 'approved'
												? 'bg-green-100 text-green-700'
												: 'bg-yellow-100 text-yellow-700'
											}`}
									>
										{item.scheduled_at ? 'Scheduled' : (item.status || 'Pending')}
									</span>
									<span className="text-xs text-gray-400 font-mono">
										{new Date(item.generated_at).toLocaleDateString()}
									</span>
								</div>
								<h3 className="font-bold text-gray-900 line-clamp-2 text-lg leading-tight mt-2">{item.trend}</h3>
							</div>

							<div className="p-5 space-y-4 flex-1 flex flex-col">
								<div className="flex-1">
									<p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
										{item.tweet || 'No tweet content.'}
									</p>
								</div>

								<div className="flex gap-2 pt-4 mt-auto border-t border-gray-50">
									<button
										onClick={() => navigate(`/dashboard/content/${item.id}/edit`, { state: { item } })}
										className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
										title="View Details"
									>
										<Eye size={18} />
									</button>
									<button
										onClick={() => handleCopy(item.tweet, item.id)}
										className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
										title="Copy Tweet"
									>
										{copiedId === item.id ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
									</button>
									<button
										onClick={() => navigate(`/dashboard/content/${item.id}/edit`, { state: { item } })}
										className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-semibold"
									>
										<Edit2 size={16} /> Edit
									</button>
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{content.length === 0 && (
					<div className="text-center py-12 text-gray-500">
						No content generated yet. Click "Generate New Content" to start.
					</div>
				)}
			</div>

			{showTrendModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
					>
						<div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
							<h3 className="text-xl font-bold text-gray-900">Select a Trend</h3>
							<button onClick={() => setShowTrendModal(false)} className="text-gray-400 hover:text-gray-600">
								<span className="text-2xl">&times;</span>
							</button>
						</div>

						<div className="p-6 overflow-y-auto flex-1">
							{loadingTrends ? (
								<div className="text-center py-8">
									<Loader className="animate-spin mx-auto text-indigo-600" size={32} />
									<p className="mt-2 text-gray-500">Fetching latest trends...</p>
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{trends.map((trend) => (
										<div
											key={trend.id}
											onClick={() => setSelectedTrend(trend)}
											className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTrend?.id === trend.id
												? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
												: 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
												}`}
										>
											<div className="flex justify-between items-start mb-2">
												<span className="text-xs font-bold text-indigo-600 uppercase">{trend.source}</span>
												<span className="text-xs text-gray-400">{trend.volume}</span>
											</div>
											<h4 className="font-bold text-gray-900">{trend.topic}</h4>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
							<button
								onClick={() => setShowTrendModal(false)}
								className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleGenerate}
								disabled={!selectedTrend || generating}
								className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
							>
								{generating ? <Loader className="animate-spin" size={18} /> : <Zap size={18} />}
								{generating ? 'Generating...' : 'Generate Content'}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
}
