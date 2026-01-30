/**
 * Open Campaign Detail Page
 * Shows campaign details, bids, and allows bidding/bid management
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    ArrowLeft, Briefcase, DollarSign, Calendar, Clock,
    Users, Check, X, MessageSquare, Star, Award,
    Send, Loader2, ChevronDown, ChevronUp, Lock, Eye, Sparkles, CheckCircle, XCircle, ShieldAlert
} from 'lucide-react';
import { campaignApi, bidApi, influencerApi } from '../../services/marketplaceApi';
import ContentGeneratorModal from '../Campaign/ContentGeneratorModal';
import './OpenCampaigns.css';

export default function OpenCampaignDetail() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [showBidForm, setShowBidForm] = useState(false);
    const [bidding, setBidding] = useState(false);
    const [expandedBid, setExpandedBid] = useState(null);
    const [selectedDeliverable, setSelectedDeliverable] = useState(null);
    const [reviewing, setReviewing] = useState(false);
    const [influencerProfile, setInfluencerProfile] = useState(null);
    const [generatedContents, setGeneratedContents] = useState([]);
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [submittingDispute, setSubmittingDispute] = useState(false);
    const [editingBidId, setEditingBidId] = useState(null);
    const [activeAction, setActiveAction] = useState(null);

    const [bidData, setBidData] = useState({
        amount: '',
        platform: '',
        content_type: '',
        deliverables_count: 1,
        deliverables_description: '',
        timeline_days: 7,
        proposal: ''
    });

    useEffect(() => {
        fetchCampaign();
        if (user?.user_type === 'influencer') {
            fetchInfluencerProfile();
        }
    }, [campaignId, user]);

    useEffect(() => {
        const editBidId = searchParams.get('edit_bid');
        if (editBidId && campaign?.user_bids) {
            const bidToEdit = campaign.user_bids.find(b => b.id === editBidId);
            if (bidToEdit && bidToEdit.status === 'pending') {
                handleEditBid(bidToEdit);
            }
        }
    }, [searchParams, campaign?.user_bids]);

    const fetchCampaign = async () => {
        setLoading(true);
        try {
            const data = await api.getOpenCampaign(campaignId);
            setCampaign(data);

            // Fetch generated contents
            if (user) {
                try {
                    const contentData = await api.getMyGeneratedContent({ campaign_id: campaignId });
                    setGeneratedContents(contentData.contents || []);
                } catch (err) {
                    console.error('Failed to fetch generated contents:', err);
                }
            }

            // Set default platform and content type from campaign data
            if (data.platforms && data.platforms.length > 0) {
                setBidData(prev => ({
                    ...prev,
                    platform: data.platforms[0],
                    content_type: data.content_types?.[0] || 'post'
                }));
            } else {
                setBidData(prev => ({
                    ...prev,
                    platform: 'instagram',
                    content_type: 'post'
                }));
            }
        } catch (error) {
            console.error('Error fetching campaign:', error);
            toast.error('Failed to load campaign');
        } finally {
            setLoading(false);
        }
    };

    const fetchInfluencerProfile = async () => {
        try {
            const profile = await influencerApi.getMyProfile();
            setInfluencerProfile(profile);
        } catch (error) {
            console.error('Error fetching influencer profile:', error);
        }
    };

    const formatCurrency = (cents) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format((cents || 0) / 100);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleBidChange = (e) => {
        const { name, value } = e.target;
        setBidData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitBid = async (e) => {
        e.preventDefault();

        if (!bidData.deliverables_description || !bidData.proposal) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (bidData.proposal.length < 20) {
            toast.error('Proposal must be at least 20 characters long');
            return;
        }

        if (bidData.deliverables_description.length < 20) {
            toast.error('Deliverables description must be at least 20 characters long');
            return;
        }

        setBidding(true);
        try {
            const payload = {
                ...bidData,
                amount: parseInt(bidData.amount) * 100,
                deliverables_count: parseInt(bidData.deliverables_count),
                timeline_days: parseInt(bidData.timeline_days)
            };

            if (editingBidId) {
                await bidApi.update(editingBidId, payload);
                toast.success('Bid updated successfully!');
            } else {
                await api.submitBid(campaignId, payload);
                toast.success('Bid submitted successfully!');
            }
            setShowBidForm(false);
            setEditingBidId(null);
            fetchCampaign();
        } catch (error) {
            console.error('Error submitting bid:', error);
            toast.error(error.message || 'Failed to submit bid');
        } finally {
            setBidding(false);
        }
    };

    const handleEditBid = (bid) => {
        setBidData({
            amount: (bid.amount / 100).toString(),
            platform: bid.platform || '',
            content_type: bid.content_type || '',
            deliverables_count: bid.deliverables_count || 1,
            deliverables_description: bid.deliverables_description || '',
            timeline_days: bid.timeline_days || 7,
            proposal: bid.proposal || '',
            package_id: bid.package_id || ''
        });
        setEditingBidId(bid.id);
        setShowBidForm(true);
    };

    const handleAcceptBid = async (bidId) => {
        if (!confirm('Accept this bid? Funds will be moved to escrow.')) return;

        try {
            await bidApi.accept(campaignId, bidId);
            toast.success('Bid accepted! Funds moved to escrow.');
            fetchCampaign();
        } catch (error) {
            console.error('Error accepting bid:', error);
            toast.error(error.message || 'Failed to accept bid');
        }
    };

    const handleRejectBid = async (bidId) => {
        if (!confirm('Reject this bid?')) return;

        try {
            await bidApi.reject(campaignId, bidId);
            toast.success('Bid rejected');
            fetchCampaign();
        } catch (error) {
            console.error('Error rejecting bid:', error);
            toast.error(error.message || 'Failed to reject bid');
        }
    };

    const handleAction = (action, deliverable = null, bidId = null) => {
        setSelectedDeliverable(deliverable);
        setActiveAction(action);
        if (bidId) setSelectedBidId(bidId);
    };

    const [selectedBidId, setSelectedBidId] = useState(null);

    const handleWithdrawBid = async (bidId) => {
        if (!confirm('Withdraw your bid?')) return;

        try {
            await bidApi.withdraw(campaignId, bidId);
            toast.success('Bid withdrawn');
            fetchCampaign();
        } catch (error) {
            console.error('Error withdrawing bid:', error);
            toast.error(error.message || 'Failed to withdraw bid');
        }
    };

    const handleCloseCampaign = async () => {
        if (!confirm('Close this campaign? No more bids will be accepted.')) return;

        try {
            await api.closeCampaign(campaignId);
            toast.success('Campaign closed');
            fetchCampaign();
        } catch (error) {
            console.error('Error closing campaign:', error);
            toast.error(error.message || 'Failed to close campaign');
        }
    };

    const handleReviewSuccess = () => {
        setActiveAction(null);
        setSelectedDeliverable(null);
        fetchCampaign();
    };

    const handleComplete = async () => {
        if (!confirm('Mark as complete and release all pending payments?')) return;
        setReviewing(true);
        try {
            await campaignApi.complete(campaignId);
            toast.success('Campaign completed successfully!');
            fetchCampaign();
        } catch (error) {
            console.error('Failed to complete campaign', error);
            toast.error(error.message || 'Failed to complete campaign');
        } finally {
            setReviewing(false);
        }
    };

    const handleReleasePayment = async (bidId) => {
        if (!confirm('Mark this influencer\'s work as complete and release payment?')) return;
        setReviewing(true);
        try {
            await campaignApi.complete(campaignId, bidId);
            toast.success('Payment released to influencer!');
            fetchCampaign();
        } catch (error) {
            console.error('Failed to release payment', error);
            toast.error(error.message || 'Failed to release payment');
        } finally {
            setReviewing(false);
        }
    };

    const handleRaiseDispute = async (e) => {
        e.preventDefault();
        if (disputeReason.length < 20) {
            toast.error('Please provide a detailed reason (at least 20 characters)');
            return;
        }

        setSubmittingDispute(true);
        try {
            await campaignApi.dispute(campaignId, disputeReason);
            toast.success('Dispute raised successfully. Our team will review it.');
            setShowDisputeForm(false);
            setDisputeReason('');
            fetchCampaign();
        } catch (error) {
            console.error('Error raising dispute:', error);
            toast.error(error.message || 'Failed to raise dispute');
        } finally {
            setSubmittingDispute(false);
        }
    };

    if (loading) {
        return (
            <div className="campaign-detail-page loading-state">
                <div className="spinner" />
                <p>Loading campaign...</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="campaign-detail-page error-state">
                <h2>Campaign Not Found</h2>
                <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const budgetProgress = ((campaign.budget_spent / campaign.budget) * 100).toFixed(0);
    const isInfluencer = user && user.user_type === 'influencer';
    const isApprovedInfluencer = isInfluencer; // Relaxed verification check
    const isAdmin = user && user.user_type === 'admin';
    const isBrandOwner = campaign.is_owner || isAdmin;
    const canBid = user && isInfluencer && campaign.status === 'open';
    const hasActiveBids = campaign.user_bids?.length > 0;

    return (
        <div className="campaign-detail-page">
            {/* Header */}
            <div className="page-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    Back
                </button>
                <span className={`status-badge large ${campaign.status}`}>
                    {campaign.status}
                </span>
            </div>

            <div className="campaign-layout">
                {/* Main Content */}
                <div className="campaign-main">
                    <div className="campaign-header-card">
                        <div className="brand-row">
                            <div className="brand-avatar large">
                                {campaign.brand?.name?.[0] || 'B'}
                            </div>
                            <div className="brand-details">
                                <span className="label">Campaign by</span>
                                <span className="brand-name">{campaign.brand?.name}</span>
                            </div>
                        </div>

                        <h1>{campaign.title}</h1>
                        <p className="description">{campaign.description}</p>

                        {campaign.requirements && (
                            <div className="requirements-box">
                                <h4>Requirements</h4>
                                <p>{campaign.requirements}</p>
                            </div>
                        )}
                    </div>

                    {/* Platforms & Content Types */}
                    <div className="info-card">
                        <h3>Target Platforms</h3>
                        <div className="chips-row">
                            {campaign.platforms?.map(p => (
                                <span key={p} className="chip">{p}</span>
                            ))}
                        </div>

                        <h3>Content Types</h3>
                        <div className="chips-row">
                            {campaign.content_types?.map(t => (
                                <span key={t} className="chip">{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* AI Generated Content Section */}
                    {generatedContents.length > 0 && (
                        <div className="info-card">
                            <div className="section-header">
                                <h3 className="flex items-center gap-2">
                                    <Sparkles size={20} className="text-purple-500" />
                                    AI Generated Content
                                </h3>
                                <span className="status-badge sm draft">{generatedContents.length} items</span>
                            </div>
                            <div className="deliverables-list mt-4 grid gap-4">
                                {generatedContents.map((content) => (
                                    <div key={content.id} className="deliverable-item p-4 border rounded-xl bg-purple-50 flex items-center justify-between">
                                        <div className="del-info">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold capitalize">{content.platform}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600 font-medium capitalize">{content.content_type?.replace('_', ' ')}</span>
                                                <span className={`status-tag text-xs px-2 py-0.5 rounded ${content.status}`}>
                                                    {content.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-1 italic">
                                                "{content.instagram_caption || content.tweet || content.facebook_post || 'Content Script/Idea'}"
                                            </p>
                                        </div>
                                        <button
                                            className="btn-secondary btn-sm"
                                            onClick={() => navigate(`/content/${content.id}`)}
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deliverables Section */}
                    {campaign.deliverables && campaign.deliverables.length > 0 && (
                        <div className="info-card deliverables-section">
                            <div className="section-header">
                                <h3>
                                    <Sparkles size={20} className="text-purple-500" />
                                    Proof of Work / Deliverables
                                </h3>
                                <span className={`status-badge sm ${campaign.status}`}>{campaign.status}</span>
                            </div>

                            <div className="deliverables-list mt-4 grid gap-4">
                                {campaign.deliverables.map((del) => (
                                    <div key={del.id} className={`deliverable-item p-4 border rounded-xl bg-gray-50 flex items-center justify-between ${del.status}`}>
                                        <div className="del-info">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{del.platform}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600">{del.content_type}</span>
                                                <span className={`status-tag text-xs px-2 py-0.5 rounded ${del.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {del.status}
                                                </span>
                                            </div>
                                            {del.draft_url && (
                                                <a href={del.draft_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                                                    <Eye size={14} /> View Draft Content
                                                </a>
                                            )}
                                            {del.feedback && (
                                                <div className="mt-2 text-sm text-gray-500 italic bg-white p-2 border rounded">
                                                    <strong>Feedback:</strong> {del.feedback}
                                                </div>
                                            )}
                                        </div>

                                        {isBrandOwner && del.status === 'submitted' && (
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={() => {
                                                    setSelectedDeliverable(del);
                                                    setActiveAction('review');
                                                }}
                                            >
                                                👀 Review
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bids Section (Owner Only) */}
                    {campaign.is_owner && (
                        <div className="bids-section">
                            <div className="section-header">
                                <h3>
                                    <Users size={20} />
                                    Bids ({campaign.bids?.length || 0})
                                </h3>
                            </div>

                            {campaign.bids?.length === 0 ? (
                                <div className="empty-bids">
                                    <p>No bids yet. Share your campaign to attract influencers!</p>
                                </div>
                            ) : (
                                <div className="bids-list">
                                    {campaign.bids.map(bid => (
                                        <div
                                            key={bid.id}
                                            className={`bid-card ${bid.status} ${expandedBid === bid.id ? 'expanded' : ''}`}
                                        >
                                            <div
                                                className="bid-header"
                                                onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
                                            >
                                                <div className="influencer-info">
                                                    <div className="influencer-avatar">
                                                        {bid.influencer?.profile_picture_url ? (
                                                            <img src={bid.influencer.profile_picture_url} alt="" />
                                                        ) : (
                                                            bid.influencer?.display_name?.[0] || 'I'
                                                        )}
                                                    </div>
                                                    <div className="influencer-details">
                                                        <span className="name">{bid.influencer?.display_name}</span>
                                                        <div className="stats">
                                                            <span><Star size={12} /> {bid.influencer?.rating?.toFixed(1) || '0.0'}</span>
                                                            <span><Award size={12} /> {bid.influencer?.completed_campaigns || 0} campaigns</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bid-amount">
                                                    {formatCurrency(bid.amount)}
                                                </div>
                                                <div className="expand-icon">
                                                    {expandedBid === bid.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                            </div>

                                            {expandedBid === bid.id && (
                                                <div className="bid-details">
                                                    <div className="detail-grid">
                                                        <div className="detail-item">
                                                            <span className="label">Platform</span>
                                                            <span className="value">{bid.platform}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Content Type</span>
                                                            <span className="value">{bid.content_type}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Deliverables</span>
                                                            <span className="value">{bid.deliverables_count}x</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Timeline</span>
                                                            <span className="value">{bid.timeline_days} days</span>
                                                        </div>
                                                    </div>

                                                    <div className="proposal-section">
                                                        <h4>Proposal</h4>
                                                        <p>{bid.proposal}</p>
                                                    </div>

                                                    <div className="deliverables-section">
                                                        <h4>What they'll deliver</h4>
                                                        <p>{bid.deliverables_description}</p>
                                                    </div>

                                                    {bid.status === 'pending' && (
                                                        <div className="bid-actions">
                                                            <button
                                                                className="btn-accept"
                                                                onClick={() => handleAcceptBid(bid.id)}
                                                            >
                                                                <Check size={16} />
                                                                Accept Bid
                                                            </button>
                                                            <button
                                                                className="btn-reject"
                                                                onClick={() => handleRejectBid(bid.id)}
                                                            >
                                                                <X size={16} />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}

                                                    {bid.status === 'accepted' && (
                                                        <div className="accepted-notice-container">
                                                            <div className="accepted-notice">
                                                                <Lock size={16} />
                                                                <span>Bid accepted - Funds in escrow</span>
                                                            </div>

                                                            {/* Show deliverables for this bid */}
                                                            {campaign.deliverables?.filter(d => d.bid_id === bid.id).length > 0 && (
                                                                <div className="bid-deliverables mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                                                                        <CheckCircle size={14} className="text-green-500" />
                                                                        Submitted Deliverables
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        {campaign.deliverables.filter(d => d.bid_id === bid.id).map(d => (
                                                                            <div key={d.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-50 text-xs">
                                                                                <span>{d.platform} • {d.content_type}</span>
                                                                                <div className="flex gap-2">
                                                                                    <span className={`status-tag ${d.status}`}>{d.status}</span>
                                                                                    {d.status === 'submitted' && (
                                                                                        <button
                                                                                            className="text-blue-600 hover:text-blue-800 font-bold"
                                                                                            onClick={() => {
                                                                                                setSelectedDeliverable(d);
                                                                                                setActiveAction('review');
                                                                                            }}
                                                                                        >
                                                                                            Review
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <button
                                                                className="btn-primary success full-width mt-3"
                                                                style={{ background: '#10b981' }}
                                                                onClick={() => handleReleasePayment(bid.id)}
                                                                disabled={reviewing}
                                                            >
                                                                {reviewing ? <Loader2 className="animate-spin mx-auto" size={18} /> : '🎉 Release Payment'}
                                                            </button>

                                                            <button
                                                                className="text-red-500 text-xs font-medium mt-3 flex items-center justify-center gap-1 hover:underline w-full"
                                                                onClick={() => setShowDisputeForm(true)}
                                                            >
                                                                <ShieldAlert size={14} /> Raise a Dispute
                                                            </button>
                                                        </div>
                                                    )}

                                                    {bid.status === 'paid' && (
                                                        <div className="paid-notice text-center p-3 bg-green-50 rounded-lg border border-green-100 text-green-700 font-bold">
                                                            <CheckCircle size={18} className="inline mr-2" />
                                                            Work Completed & Payment Released
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* User's Bid (Influencer View) */}
                    {/* User's Bids (Influencer View) */}
                    {!campaign.is_owner && campaign.user_bids?.length > 0 && (
                        <div className="your-bids-section">
                            <h3>Your Bids</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {campaign.user_bids.map(bid => (
                                    <div key={bid.id} className={`your-bid-card ${bid.status}`}>
                                        <div className="bid-status-badge">
                                            {bid.status}
                                        </div>
                                        <div className="bid-info">
                                            <span className="amount">{formatCurrency(bid.amount)}</span>
                                            <p className="proposal-preview">{bid.proposal}</p>
                                        </div>
                                        {bid.status === 'pending' && (
                                            <div className="flex gap-2 mt-3 w-full">
                                                <button className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 py-2 px-4 rounded-lg flex-1 text-sm font-medium transition-colors" onClick={() => handleEditBid(bid)}>
                                                    Edit Bid
                                                </button>
                                                <button className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 py-2 px-4 rounded-lg flex-1 text-sm font-medium transition-colors" onClick={() => handleWithdrawBid(bid.id)}>
                                                    Withdraw
                                                </button>
                                            </div>
                                        )}
                                        {bid.status === 'accepted' && (
                                            <div className="flex flex-col gap-2 mt-3 w-full">
                                                {isInfluencer && (
                                                    <button
                                                        className="btn-secondary full-width flex items-center justify-center gap-2 py-2 px-4 rounded-lg"
                                                        onClick={() => handleAction('generate', null, bid.id)}
                                                    >
                                                        <Sparkles size={16} className="text-purple-500" />
                                                        Generate AI Content
                                                    </button>
                                                )}
                                                <button className="btn-primary full-width" onClick={() => handleAction('submit', null, bid.id)}>
                                                    📤 Submit Proof of Work
                                                </button>
                                                <button
                                                    className="text-red-500 text-xs font-medium mt-1 flex items-center justify-center gap-1 hover:underline"
                                                    onClick={() => setShowDisputeForm(true)}
                                                >
                                                    <ShieldAlert size={14} /> Raise Dispute
                                                </button>
                                            </div>
                                        )}
                                        {bid.status === 'paid' && (
                                            <div className="paid-status-text text-green-600 font-bold mt-3 text-center">
                                                ✅ Work Completed & Payment Received
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bid Form */}
                    {canBid && (
                        <div className="mt-8 pt-8 border-t">
                            {!showBidForm ? (
                                <button
                                    className="btn-primary large full-width"
                                    onClick={() => setShowBidForm(true)}
                                >
                                    <Send size={18} />
                                    Submit Another Bid
                                </button>
                            ) : (
                                <form className="bid-form" onSubmit={handleSubmitBid}>
                                    <h3>{editingBidId ? 'Edit Your Bid' : 'Submit Your Bid'}</h3>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Bid Amount (KES) *</label>
                                            <input
                                                type="number"
                                                name="amount"
                                                value={bidData.amount}
                                                onChange={handleBidChange}
                                                placeholder="15000"
                                                required
                                                min={10}
                                                max={(campaign.budget_remaining || campaign.budget) / 100}
                                            />
                                            <span className="hint">
                                                Max: {formatCurrency(campaign.budget_remaining)}
                                            </span>
                                        </div>

                                        <div className="form-group">
                                            <label>Timeline (Days)</label>
                                            <input
                                                type="number"
                                                name="timeline_days"
                                                value={bidData.timeline_days}
                                                onChange={handleBidChange}
                                                min={1}
                                                max={90}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Platform</label>
                                            <select name="platform" value={bidData.platform} onChange={handleBidChange}>
                                                {campaign.platforms?.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Content Type</label>
                                            <select name="content_type" value={bidData.content_type} onChange={handleBidChange}>
                                                {campaign.content_types?.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Deliverables Count</label>
                                            <input
                                                type="number"
                                                name="deliverables_count"
                                                value={bidData.deliverables_count}
                                                onChange={handleBidChange}
                                                min={1}
                                                max={10}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>What will you deliver? * (min. 20 characters)</label>
                                        <textarea
                                            name="deliverables_description"
                                            value={bidData.deliverables_description}
                                            onChange={handleBidChange}
                                            placeholder="Describe exactly what the brand will receive... (minimum 20 characters)"
                                            rows={3}
                                            required
                                            minLength={20}
                                        />
                                        <span className="hint" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {bidData.deliverables_description.length}/20 characters minimum
                                        </span>
                                    </div>

                                    <div className="form-group">
                                        <label>Your Proposal / Cover Letter * (min. 20 characters)</label>
                                        <textarea
                                            name="proposal"
                                            value={bidData.proposal}
                                            onChange={handleBidChange}
                                            placeholder="Tell the brand why you're the right fit for this campaign... (minimum 20 characters)"
                                            rows={5}
                                            required
                                            minLength={20}
                                        />
                                        <span className="hint" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {bidData.proposal.length}/20 characters minimum
                                        </span>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => {
                                                setShowBidForm(false);
                                                setEditingBidId(null);
                                                setBidData({
                                                    amount: '',
                                                    platform: '',
                                                    content_type: '',
                                                    deliverables_count: 1,
                                                    deliverables_description: '',
                                                    timeline_days: 7,
                                                    proposal: ''
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={bidding}
                                        >
                                            {bidding ? <Loader2 className="animate-spin" size={20} /> : (editingBidId ? 'Update Bid' : 'Submit Bid')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="campaign-sidebar">
                    {/* Budget Card */}
                    <div className="sidebar-card budget-card">
                        <h4>
                            <DollarSign size={18} />
                            Budget
                        </h4>
                        <div className="budget-amount">
                            {formatCurrency(campaign.budget)}
                        </div>

                        <div className="budget-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${budgetProgress}%` }}
                                />
                            </div>
                            <div className="progress-labels">
                                <span>{formatCurrency(campaign.budget_spent)} spent</span>
                                <span>{formatCurrency(campaign.budget_remaining)} left</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="sidebar-card">
                        <h4>Details</h4>
                        <div className="detail-list">
                            <div className="detail-row">
                                <Calendar size={16} />
                                <span className="label">Deadline</span>
                                <span className="value">{formatDate(campaign.deadline)}</span>
                            </div>
                            <div className="detail-row">
                                <Users size={16} />
                                <span className="label">Bids</span>
                                <span className="value">{campaign.bids_count}</span>
                            </div>
                            <div className="detail-row">
                                <Clock size={16} />
                                <span className="label">Posted</span>
                                <span className="value">{formatDate(campaign.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Owner Actions */}
                    {isBrandOwner && (
                        <div className="sidebar-card">
                            <h4>Actions</h4>
                            {campaign.status === 'open' && (
                                <button
                                    className="btn-secondary full-width"
                                    onClick={handleCloseCampaign}
                                >
                                    Close Campaign
                                </button>
                            )}

                            {(campaign.status === 'completed' || campaign.status === 'closed') && (
                                <div className="flex items-center gap-2 text-green-600 font-bold p-3 bg-green-50 rounded-lg justify-center">
                                    <CheckCircle size={20} />
                                    Campaign {campaign.status === 'closed' ? 'Closed' : 'Completed'}
                                </div>
                            )}

                            <div className="mt-4 text-xs text-gray-500 italic p-3 border rounded-lg bg-gray-50">
                                Payments are handled per-bid for open campaigns. Click on an "Accepted" bid above to manage deliverables and release funds.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {
                activeAction === 'review' && selectedDeliverable && (
                    <ReviewDeliverableModal
                        campaign={campaign}
                        deliverable={selectedDeliverable}
                        onClose={() => {
                            setActiveAction(null);
                            setSelectedDeliverable(null);
                        }}
                        onSuccess={handleReviewSuccess}
                    />
                )
            }

            {
                activeAction === 'submit' && (
                    <SubmitDeliverableModal
                        campaign={campaign}
                        bidId={selectedBidId}
                        onClose={() => {
                            setActiveAction(null);
                            setSelectedBidId(null);
                        }}
                        onSuccess={handleReviewSuccess}
                    />
                )
            }
        </div >
    );
}


/**
 * Sub-components
 */


function SubmitDeliverableModal({ campaign, bidId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        content_type: 'post',
        platform: campaign.platforms?.[0] || 'instagram',
        draft_url: '',
        draft_description: '',
        bid_id: bidId || campaign.user_bids?.[0]?.id
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await campaignApi.submitDeliverable(campaign.id, formData);
            toast.success('Deliverable submitted successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to submit deliverable', error);
            toast.error(error.message || 'Failed to submit deliverable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📤 Submit Proof of Work</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Content Platform</label>
                            <select
                                value={formData.platform}
                                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                            >
                                {campaign.platforms?.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Content Type</label>
                            <select
                                value={formData.content_type}
                                onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                            >
                                <option value="post">Post</option>
                                <option value="story">Story</option>
                                <option value="reel">Reel</option>
                                <option value="video">Video</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>URL / Link to Content *</label>
                            <input
                                type="url"
                                required
                                value={formData.draft_url}
                                onChange={(e) => setFormData(prev => ({ ...prev, draft_url: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Description / Notes</label>
                            <textarea
                                value={formData.draft_description}
                                onChange={(e) => setFormData(prev => ({ ...prev, draft_description: e.target.value }))}
                                placeholder="Any notes about this deliverable..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !formData.draft_url}
                        >
                            {loading ? 'Submitting...' : 'Submit Deliverable'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ReviewDeliverableModal({ campaign, deliverable, onClose, onSuccess }) {
    const [action, setAction] = useState(null); // approve, revision
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleReview = async () => {
        if (!action) return;
        if (action === 'revision' && !feedback) {
            setError('Please provide feedback for the influencer');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (action === 'approve') {
                await campaignApi.approveDeliverable(campaign.id, deliverable.id);
            } else {
                await campaignApi.requestRevision(campaign.id, deliverable.id, feedback);
            }
            toast.success(action === 'approve' ? 'Deliverable approved!' : 'Revision requested');
            onSuccess();
        } catch (err) {
            console.error('Failed to submit review', err);
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>👀 Review Deliverable</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900">{deliverable.platform} • {deliverable.content_type}</h4>
                                <p className="text-sm text-gray-500">Submitted for review</p>
                            </div>
                            {deliverable.draft_url && (
                                <a href={deliverable.draft_url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm flex items-center gap-1">
                                    <Eye size={14} /> View Content
                                </a>
                            )}
                        </div>
                        {deliverable.draft_caption && (
                            <div className="mt-3 text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 italic">
                                "{deliverable.draft_caption}"
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${action === 'approve' ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
                            onClick={() => setAction('approve')}
                        >
                            <CheckCircle size={32} className={action === 'approve' ? 'text-green-500' : 'text-gray-300'} />
                            <div className="text-center">
                                <span className="block font-bold">Approve</span>
                                <span className="text-xs text-gray-500">Meets requirements</span>
                            </div>
                        </button>

                        <button
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${action === 'revision' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-100 hover:border-gray-200'}`}
                            onClick={() => setAction('revision')}
                        >
                            <XCircle size={32} className={action === 'revision' ? 'text-yellow-500' : 'text-gray-300'} />
                            <div className="text-center">
                                <span className="block font-bold">Revision</span>
                                <span className="text-xs text-gray-500">Needs changes</span>
                            </div>
                        </button>
                    </div>

                    {action === 'revision' && (
                        <div className="form-group">
                            <label className="block text-sm font-medium mb-1">Feedback for Influencer *</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Describe what changes are needed..."
                                rows={4}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer flex gap-3">
                    <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary flex-1"
                        onClick={handleReview}
                        disabled={loading || !action || (action === 'revision' && !feedback)}
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Submit Review'}
                    </button>
                </div>
            </div>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-content {
                    background: white;
                    width: 100%;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h2 { margin: 0; font-size: 1.25rem; }
                .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; }
                .modal-body { padding: 20px; }
                .modal-footer { padding: 20px; border-top: 1px solid #f3f4f6; display: flex; gap: 12px; }
                .btn-primary.success { background-color: #10b981; border-color: #10b981; }
                .btn-primary.success:hover { background-color: #059669; }
            `}</style>

            {/* Dispute Form Modal */}
            {showDisputeForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShieldAlert className="text-red-500" size={20} />
                                Raise a Dispute
                            </h3>
                            <button onClick={() => setShowDisputeForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleRaiseDispute} className="p-6 space-y-4">
                            <div className="bg-red-50 p-3 rounded-lg text-xs text-red-700">
                                <strong>Warning:</strong> Disputes are reviewed by the Dexter team. Please provide as much detail as possible.
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Dispute</label>
                                <textarea
                                    className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[120px]"
                                    placeholder="Explain why you are raising this dispute..."
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    required
                                />
                                <span className="text-xs text-gray-400">{disputeReason.length}/2000 (min 20)</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    className="flex-1 py-2 px-4 border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowDisputeForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                    disabled={submittingDispute || disputeReason.length < 20}
                                >
                                    {submittingDispute ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Raise Dispute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Generator Modal */}
            {activeAction === 'generate' && (
                <ContentGeneratorModal
                    campaignId={campaign.id}
                    onClose={() => setActiveAction(null)}
                    onSuccess={() => {
                        setActiveAction(null);
                        fetchCampaign();
                    }}
                />
            )}
        </div>
    );
}


