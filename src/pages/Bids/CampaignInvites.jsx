/**
 * Campaign Invites Page
 * Shows bids received on brand's campaigns (invites from influencers)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi, bidApi } from '../../services/marketplaceApi';
import {
    Mail, Clock, CheckCircle, XCircle, Loader2,
    DollarSign, Calendar, Package, ArrowRight, Filter,
    User, Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function CampaignInvites() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [bids, setBids] = useState([]);
    const [loadingBids, setLoadingBids] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await campaignApi.getAll({ role: 'brand', status: 'open', limit: 100 });
            const openCampaigns = (response.campaigns || []).filter(c => c.status === 'open');
            setCampaigns(openCampaigns);

            if (openCampaigns.length > 0) {
                setSelectedCampaign(openCampaigns[0].id);
                fetchBidsForCampaign(openCampaigns[0].id);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const fetchBidsForCampaign = async (campaignId) => {
        setLoadingBids(true);
        try {
            const response = await bidApi.getCampaignBids(campaignId, { limit: 100 });
            setBids(response.bids || []);
        } catch (error) {
            console.error('Error fetching bids:', error);
            toast.error('Failed to load bids');
        } finally {
            setLoadingBids(false);
        }
    };

    const handleCampaignSelect = (campaignId) => {
        setSelectedCampaign(campaignId);
        fetchBidsForCampaign(campaignId);
    };

    const handleAcceptBid = async (bidId) => {
        if (!confirm('Accept this bid? This will assign the campaign to the influencer and reject other pending bids.')) return;

        try {
            await bidApi.accept(bidId);
            toast.success('Bid accepted! Campaign assigned to influencer.');
            fetchBidsForCampaign(selectedCampaign);
            fetchCampaigns(); // Refresh campaigns list
        } catch (error) {
            console.error('Error accepting bid:', error);
            toast.error(error.message || 'Failed to accept bid');
        }
    };

    const handleRejectBid = async (bidId) => {
        if (!confirm('Reject this bid?')) return;

        try {
            await bidApi.reject(bidId);
            toast.success('Bid rejected');
            fetchBidsForCampaign(selectedCampaign);
        } catch (error) {
            console.error('Error rejecting bid:', error);
            toast.error('Failed to reject bid');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format((price || 0) / 100);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);
    const pendingBids = bids.filter(b => b.status === 'pending');
    const acceptedBids = bids.filter(b => b.status === 'accepted');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="text-center py-16 px-4 bg-white rounded-xl border border-gray-200">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Open Campaigns</h3>
                    <p className="text-gray-500 mb-6">
                        Create an open campaign to start receiving bids from influencers
                    </p>
                    <button
                        onClick={() => navigate('/campaigns/create')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Create Campaign
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaign Invites</h1>
                <p className="text-gray-500 mt-1">Review and manage bids from influencers</p>
            </div>

            {/* Campaign Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Campaign
                </label>
                <select
                    value={selectedCampaign || ''}
                    onChange={(e) => handleCampaignSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                            {campaign.title || 'Untitled Campaign'} ({campaign.budget ? formatPrice(campaign.budget) : 'No budget'})
                        </option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            {selectedCampaignData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500">Total Bids</span>
                            <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{bids.length}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500">Pending Review</span>
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{pendingBids.length}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-500">Campaign Budget</span>
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(selectedCampaignData.budget || 0)}
                        </p>
                    </div>
                </div>
            )}

            {/* Bids List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loadingBids ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : bids.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bids Yet</h3>
                        <p className="text-gray-500">
                            Influencers haven't placed any bids on this campaign yet
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {bids.map((bid) => {
                            const isPending = bid.status === 'pending';
                            const isAccepted = bid.status === 'accepted';

                            return (
                                <div
                                    key={bid.id}
                                    className={`p-6 ${isPending ? 'hover:bg-gray-50' : 'bg-gray-50'} transition-colors`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Influencer Info */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                                    {bid.influencer?.display_name?.charAt(0) || 'I'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3
                                                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                                                            onClick={() => navigate(`/marketplace/influencer/${bid.influencer_id}`)}
                                                        >
                                                            {bid.influencer?.display_name || 'Influencer'}
                                                        </h3>
                                                        {isAccepted && (
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                                                                <CheckCircle size={12} />
                                                                Accepted
                                                            </span>
                                                        )}
                                                    </div>
                                                    {bid.influencer?.niche && (
                                                        <p className="text-sm text-gray-500">{bid.influencer.niche}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Proposal */}
                                            {bid.proposal && (
                                                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {bid.proposal}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Bid Details */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                {bid.package && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Package className="w-4 h-4" />
                                                        <span>{bid.package.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="capitalize">{bid.platform}</span>
                                                    {bid.content_type && <span>• {bid.content_type}</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span>{bid.deliverables_count}x deliverables</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{bid.timeline_days} days</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">
                                                        Received {formatDate(bid.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col items-end gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Bid Amount</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {formatPrice(bid.amount)}
                                                </p>
                                            </div>

                                            {isPending && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRejectBid(bid.id)}
                                                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptBid(bid.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Accept Bid
                                                    </button>
                                                </div>
                                            )}

                                            {isAccepted && (
                                                <button
                                                    onClick={() => navigate(`/campaigns/${bid.campaign_id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                >
                                                    View Campaign
                                                    <ArrowRight size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
