import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    ShieldAlert, Clock, CheckCircle, XCircle,
    AlertCircle, Eye, X, Send, Gavel,
    MessageSquare, ExternalLink, RefreshCw, Loader2,
    ArrowLeft, User, Building, Landmark, Percent
} from 'lucide-react';
import { disputeApi, campaignApi } from '../../services/marketplaceApi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDisputes() {
    const [loading, setLoading] = useState(true);
    const [disputes, setDisputes] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolving, setResolving] = useState(false);
    const [resolutionModal, setResolutionModal] = useState(false);
    const [campaignDetails, setCampaignDetails] = useState(null);

    const [resolutionData, setResolutionData] = useState({
        resolution: '',
        refund_percentage: 50,
        resolved_in_favor_of: ''
    });

    useEffect(() => {
        fetchDisputes();
    }, [activeTab]);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            // Mapping UI tab to API status if needed
            const status = activeTab === 'pending' ? 'open' : (activeTab === 'resolved' ? 'resolved' : null);
            const res = await disputeApi.getAll(status);
            setDisputes(res || []);
        } catch (error) {
            console.error('Error fetching disputes:', error);
            toast.error('Failed to load disputes');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDispute = async (dispute) => {
        setSelectedDispute(dispute);
        setLoading(true);
        try {
            const campaign = await campaignApi.getById(dispute.campaign_id);
            setCampaignDetails(campaign);

            // Set default "in favor of"
            if (campaign) {
                setResolutionData(prev => ({
                    ...prev,
                    resolved_in_favor_of: campaign.brand_id
                }));
            }
        } catch (error) {
            console.error('Error fetching campaign details:', error);
            toast.error('Failed to load campaign details');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!selectedDispute) return;

        if (!resolutionData.resolution || resolutionData.resolution.length < 20) {
            toast.error('Please provide a detailed resolution (min 20 chars)');
            return;
        }

        setResolving(true);
        try {
            await disputeApi.resolve(selectedDispute.id, {
                ...resolutionData,
                refund_percentage: parseInt(resolutionData.refund_percentage)
            });
            toast.success('Dispute resolved successfully');
            setResolutionModal(false);
            setSelectedDispute(null);
            fetchDisputes();
        } catch (error) {
            console.error('Error resolving dispute:', error);
            toast.error(error.message || 'Failed to resolve dispute');
        } finally {
            setResolving(false);
        }
    };

    const handleClose = async () => {
        if (!selectedDispute) return;
        const reason = prompt('Reason for closing this dispute (invalid/withdrawn):');
        if (!reason) return;

        setResolving(true);
        try {
            await disputeApi.close(selectedDispute.id, reason);
            toast.success('Dispute closed without resolution');
            setSelectedDispute(null);
            fetchDisputes();
        } catch (error) {
            console.error('Error closing dispute:', error);
            toast.error(error.message || 'Failed to close dispute');
        } finally {
            setResolving(false);
        }
    };

    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format((cents || 0) / 100);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'open':
            case 'under_review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    if (selectedDispute) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <button
                    onClick={() => setSelectedDispute(null)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Disputes
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <ShieldAlert className="text-red-500" />
                            Dispute Details
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">ID: {selectedDispute.id}</p>
                    </div>
                    <div className="flex gap-3">
                        {selectedDispute.status === 'open' && (
                            <>
                                <button
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                                    onClick={() => setResolutionModal(true)}
                                >
                                    <Gavel size={18} />
                                    Resolve Dispute
                                </button>
                                <button
                                    className="px-6 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all text-red-600"
                                    onClick={handleClose}
                                >
                                    Close Invalid
                                </button>
                            </>
                        )}
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusStyles(selectedDispute.status)}`}>
                            {selectedDispute.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                <MessageSquare size={18} className="text-gray-400" />
                                Reason for Dispute
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed">
                                {selectedDispute.reason}
                            </div>
                        </section>

                        {selectedDispute.evidence_urls?.length > 0 && (
                            <section className="bg-white p-6 rounded-2xl shadow-sm border">
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <ExternalLink size={18} className="text-gray-400" />
                                    Evidence Provided
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedDispute.evidence_urls.map((url, i) => (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border hover:border-indigo-500 transition-all"
                                        >
                                            <img src={url} alt="Evidence" className="w-full h-full object-cover group-hover:opacity-50" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="text-white" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {selectedDispute.status === 'resolved' && (
                            <section className="bg-green-50 p-6 rounded-2xl border border-green-200">
                                <h3 className="font-bold text-green-900 flex items-center gap-2 mb-3">
                                    <CheckCircle size={18} />
                                    Resolution Outcome
                                </h3>
                                <p className="text-green-800">{selectedDispute.resolution}</p>
                                <div className="mt-4 flex gap-6 text-sm text-green-700 font-medium">
                                    <span>Resolved at: {new Date(selectedDispute.resolved_at).toLocaleString()}</span>
                                    <span>By Admin ID: {selectedDispute.resolved_by?.substring(0, 8)}</span>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar: Context */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border">
                            <h3 className="font-bold mb-4">Campaign Context</h3>
                            {campaignDetails ? (
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Campaign:</span>
                                        <span className="font-medium text-gray-900">{campaignDetails.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status:</span>
                                        <span className="font-bold text-indigo-600 uppercase">{campaignDetails.status}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-gray-500">Brand:</span>
                                        <span className="font-medium">{campaignDetails.brand?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Influencer:</span>
                                        <span className="font-medium">{campaignDetails.influencer?.display_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-gray-500">Escrow Value:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(campaignDetails.escrow?.amount)}</span>
                                    </div>
                                    <div className="pt-2 border-t text-xs text-gray-400">
                                        Raised by: {selectedDispute.raised_by === campaignDetails.brand_id ? 'BRAND' : 'INFLUENCER'}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-gray-300" />
                                </div>
                            )}
                        </section>

                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                            <AlertCircle className="text-red-500 shrink-0" size={20} />
                            <p className="text-xs text-red-700">
                                Resolving a dispute will automatically move funds from escrow to the respective wallets based on the percentage selected.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resolution Modal */}
                <AnimatePresence>
                    {resolutionModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Gavel size={24} />
                                        Dispute Resolution
                                    </h3>
                                    <button onClick={() => setResolutionModal(false)} className="text-white/80 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleResolve} className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Resolution Notice *</label>
                                        <textarea
                                            className="w-full border-2 rounded-2xl p-4 text-gray-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all min-h-[120px]"
                                            placeholder="Explain the reason for this decision. This will be visible to both parties."
                                            value={resolutionData.resolution}
                                            onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 italic">Minimum 20 characters required.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Fund Allocation</label>
                                            <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Refund to Brand</span>
                                                    <span className="font-bold text-red-600">{resolutionData.refund_percentage}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                    value={resolutionData.refund_percentage}
                                                    onChange={(e) => setResolutionData({ ...resolutionData, refund_percentage: e.target.value })}
                                                />
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Release to Influencer</span>
                                                    <span className="font-bold text-green-600">{100 - resolutionData.refund_percentage}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Primary Fault (Favor)</label>
                                            <div className="space-y-3">
                                                <button
                                                    type="button"
                                                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${resolutionData.resolved_in_favor_of === campaignDetails?.brand_id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
                                                    onClick={() => setResolutionData({ ...resolutionData, resolved_in_favor_of: campaignDetails.brand_id })}
                                                >
                                                    <Building size={18} className={resolutionData.resolved_in_favor_of === campaignDetails?.brand_id ? 'text-indigo-600' : 'text-gray-400'} />
                                                    <span className="text-sm font-bold">Favor Brand</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${resolutionData.resolved_in_favor_of === campaignDetails?.influencer?.user_id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
                                                    onClick={() => setResolutionData({ ...resolutionData, resolved_in_favor_of: campaignDetails.influencer?.user_id })}
                                                >
                                                    <User size={18} className={resolutionData.resolved_in_favor_of === campaignDetails?.influencer?.user_id ? 'text-indigo-600' : 'text-gray-400'} />
                                                    <span className="text-sm font-bold">Favor Influencer</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            className="flex-1 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                            onClick={() => setResolutionModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                            disabled={resolving || resolutionData.resolution.length < 20}
                                        >
                                            {resolving ? <Loader2 className="animate-spin mx-auto" /> : 'Execute Resolution'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dispute Center</h1>
                    <p className="text-gray-500">Review and resolve conflicts across the platform</p>
                </div>
                <button
                    onClick={fetchDisputes}
                    className="p-2 bg-white border rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                <button
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Open Disputes
                </button>
                <button
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'resolved' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('resolved')}
                >
                    Resolved
                </button>
                <button
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('all')}
                >
                    All History
                </button>
            </div>

            {loading && disputes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed text-gray-400">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p>Fetching disputes...</p>
                </div>
            ) : disputes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed text-gray-400">
                    <ShieldAlert size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-lg">No {activeTab} disputes found</p>
                    <p className="text-sm">Great job! The platform is operating smoothly.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {disputes.map(dispute => (
                        <motion.div
                            layout
                            key={dispute.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                            onClick={() => handleSelectDispute(dispute)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyles(dispute.status)}`}>
                                    {dispute.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-gray-400">{new Date(dispute.created_at).toLocaleDateString()}</span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                                Campaign Dispute #{dispute.id.substring(0, 8)}
                            </h3>

                            <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                                {dispute.reason}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 text-xs font-bold">
                                        B
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-teal-600 text-xs font-bold">
                                        I
                                    </div>
                                </div>
                                <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Details <Eye size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
