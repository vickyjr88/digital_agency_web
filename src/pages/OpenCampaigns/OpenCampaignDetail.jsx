/**
 * Open Campaign Detail Page
 * Shows campaign details, bids, and allows bidding/bid management
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    ArrowLeft, Briefcase, DollarSign, Calendar, Clock,
    Users, Check, X, MessageSquare, Star, Award,
    Send, Loader2, ChevronDown, ChevronUp, Lock, Eye, Sparkles, CheckCircle, XCircle
} from 'lucide-react';
import { campaignApi } from '../../services/marketplaceApi';
import './OpenCampaigns.css';

export default function OpenCampaignDetail() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [showBidForm, setShowBidForm] = useState(false);
    const [bidding, setBidding] = useState(false);
    const [expandedBid, setExpandedBid] = useState(null);
    const [activeAction, setActiveAction] = useState(null);
    const [selectedDeliverable, setSelectedDeliverable] = useState(null);
    const [reviewing, setReviewing] = useState(false);

    const [bidData, setBidData] = useState({
        amount: '',
        platform: 'instagram',
        content_type: 'post',
        deliverables_count: 1,
        deliverables_description: '',
        timeline_days: 7,
        proposal: ''
    });

    useEffect(() => {
        fetchCampaign();
    }, [campaignId]);

    const fetchCampaign = async () => {
        setLoading(true);
        try {
            const data = await api.getOpenCampaign(campaignId);
            setCampaign(data);
        } catch (error) {
            console.error('Error fetching campaign:', error);
            toast.error('Failed to load campaign');
        } finally {
            setLoading(false);
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

            await api.submitBid(campaignId, payload);
            toast.success('Bid submitted successfully!');
            setShowBidForm(false);
            fetchCampaign();
        } catch (error) {
            console.error('Error submitting bid:', error);
            toast.error(error.message || 'Failed to submit bid');
        } finally {
            setBidding(false);
        }
    };

    const handleAcceptBid = async (bidId) => {
        if (!confirm('Accept this bid? Funds will be moved to escrow.')) return;

        try {
            await api.acceptBid(campaignId, bidId);
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
            await api.rejectBid(campaignId, bidId);
            toast.success('Bid rejected');
            fetchCampaign();
        } catch (error) {
            console.error('Error rejecting bid:', error);
            toast.error(error.message || 'Failed to reject bid');
        }
    };

    const handleWithdrawBid = async () => {
        if (!confirm('Withdraw your bid?')) return;

        try {
            await api.withdrawBid(campaignId, campaign.user_bid.id);
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
        if (!confirm('Mark as complete and release payment?')) return;
        setReviewing(true);
        try {
            await campaignApi.complete(campaignId);
            toast.success('Campaign completed successfully!');
            fetchCampaign();
        } catch (error) {
            console.error('Failed to complete campaign', error);
            toast.error('Failed to complete campaign');
        } finally {
            setReviewing(false);
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
    const isAdmin = user && user.user_type === 'admin';
    const isBrandOwner = campaign.is_owner || isAdmin;
    const canBid = user && isInfluencer && campaign.status === 'open' && !campaign.user_bid;
    const hasPendingBid = campaign.user_bid?.status === 'pending';

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
                                                        <div className="accepted-notice">
                                                            <Lock size={16} />
                                                            <span>Bid accepted - Funds in escrow</span>
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
                    {!campaign.is_owner && campaign.user_bid && (
                        <div className="your-bid-section">
                            <h3>Your Bid</h3>
                            <div className={`your-bid-card ${campaign.user_bid.status}`}>
                                <div className="bid-status-badge">
                                    {campaign.user_bid.status}
                                </div>
                                <div className="bid-info">
                                    <span className="amount">{formatCurrency(campaign.user_bid.amount * 100)}</span>
                                    <p className="proposal-preview">{campaign.user_bid.proposal}</p>
                                </div>
                                {campaign.user_bid.status === 'pending' && (
                                    <button className="btn-secondary" onClick={handleWithdrawBid}>
                                        Withdraw Bid
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bid Form */}
                    {canBid && (
                        <>
                            {!showBidForm ? (
                                <button
                                    className="btn-primary large full-width"
                                    onClick={() => setShowBidForm(true)}
                                >
                                    <Send size={18} />
                                    Submit Your Bid
                                </button>
                            ) : (
                                <form className="bid-form" onSubmit={handleSubmitBid}>
                                    <h3>Submit Your Bid</h3>

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
                                        <button type="button" className="btn-secondary" onClick={() => setShowBidForm(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary" disabled={bidding}>
                                            {bidding ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={16} />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    Submit Bid
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
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

                            {campaign.status === 'draft_submitted' && (
                                <div className="space-y-2">
                                    <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-sm text-yellow-800 mb-3">
                                        <Clock size={16} className="inline mr-2" />
                                        Deliverables awaiting review
                                    </div>
                                    <button
                                        className="btn-primary full-width"
                                        onClick={() => {
                                            const firstSub = campaign.deliverables?.find(d => d.status === 'submitted');
                                            if (firstSub) {
                                                setSelectedDeliverable(firstSub);
                                                setActiveAction('review');
                                            } else {
                                                toast.error('No pending deliverables found');
                                            }
                                        }}
                                    >
                                        👀 Review Proof of Work
                                    </button>
                                </div>
                            )}

                            {campaign.status === 'draft_approved' && (
                                <button
                                    className="btn-primary full-width success"
                                    onClick={handleComplete}
                                    disabled={reviewing}
                                    style={{ background: '#10b981' }}
                                >
                                    {reviewing ? <Loader2 className="animate-spin" /> : '🎉 Mark Complete & Release'}
                                </button>
                            )}

                            {campaign.status === 'completed' && (
                                <div className="flex items-center gap-2 text-green-600 font-bold p-3 bg-green-50 rounded-lg justify-center">
                                    <CheckCircle size={20} />
                                    Campaign Completed
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {activeAction === 'review' && selectedDeliverable && (
                <ReviewDeliverableModal
                    campaign={campaign}
                    deliverable={selectedDeliverable}
                    onClose={() => {
                        setActiveAction(null);
                        setSelectedDeliverable(null);
                    }}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
}

/**
 * Sub-components
 */

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
        </div>
    );
}


