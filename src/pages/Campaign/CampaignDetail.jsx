/**
 * Campaign Detail Page
 * Full campaign management with deliverable submission and approval workflow
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignApi } from '../../services/marketplaceApi';
import { useAuth } from '../../context/AuthContext';
import './CampaignDetail.css';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#f59e0b', icon: '⏳' },
    accepted: { label: 'Accepted', color: '#3b82f6', icon: '✓' },
    rejected: { label: 'Rejected', color: '#ef4444', icon: '✗' },
    in_progress: { label: 'In Progress', color: '#8b5cf6', icon: '🔄' },
    draft_submitted: { label: 'Draft Submitted', color: '#6366f1', icon: '📤' },
    revision_requested: { label: 'Revision Requested', color: '#f59e0b', icon: '🔄' },
    draft_approved: { label: 'Draft Approved', color: '#10b981', icon: '✅' },
    published: { label: 'Published', color: '#059669', icon: '📢' },
    completed: { label: 'Completed', color: '#10b981', icon: '🎉' },
    disputed: { label: 'Disputed', color: '#ef4444', icon: '⚠️' },
    cancelled: { label: 'Cancelled', color: '#6b7280', icon: '❌' },
};

export default function CampaignDetail() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [error, setError] = useState(null);
    const [activeAction, setActiveAction] = useState(null);

    useEffect(() => {
        fetchCampaign();
    }, [campaignId]);

    const fetchCampaign = async () => {
        setLoading(true);
        try {
            const response = await campaignApi.getById(campaignId);
            setCampaign(response);
        } catch (err) {
            console.error('Error fetching campaign:', err);
            setError('Campaign not found');
        } finally {
            setLoading(false);
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

    const isInfluencer = user?.user_type === 'influencer' || campaign?.influencer_id === user?.id;
    const isBrand = !isInfluencer;

    const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    if (loading) {
        return (
            <div className="campaign-loading">
                <div className="spinner"></div>
                <p>Loading campaign...</p>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="campaign-error">
                <span className="error-icon">🎯</span>
                <h2>Campaign Not Found</h2>
                <p>This campaign doesn't exist or you don't have access.</p>
                <button className="btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(campaign.status);

    return (
        <div className="campaign-detail-page">
            {/* Navigation */}
            <div className="page-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <span className={`status-badge`} style={{
                    backgroundColor: `${statusConfig.color}20`,
                    color: statusConfig.color
                }}>
                    {statusConfig.icon} {statusConfig.label}
                </span>
            </div>

            {/* Campaign Header */}
            <div className="campaign-header">
                <div className="header-content">
                    <h1>{campaign.package?.name || 'Campaign'}</h1>
                    <div className="header-meta">
                        <span className="meta-item">
                            <span className="icon">📅</span>
                            Created {formatDate(campaign.created_at)}
                        </span>
                        {campaign.deadline && (
                            <span className="meta-item deadline">
                                <span className="icon">⏰</span>
                                Due {formatDate(campaign.deadline)}
                            </span>
                        )}
                        <span className="meta-item">
                            <span className="icon">💰</span>
                            {formatPrice(campaign.package?.price)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="campaign-content">
                {/* Main Content */}
                <div className="campaign-main">
                    {/* Progress Timeline */}
                    <CampaignTimeline status={campaign.status} />

                    {/* Brief Section */}
                    <div className="campaign-section">
                        <h3>📋 Campaign Brief</h3>
                        <div className="brief-content">
                            <div className="brief-item">
                                <span className="label">Brand</span>
                                <span className="value">{campaign.brief?.brand_name || 'N/A'}</span>
                            </div>
                            <div className="brief-item">
                                <span className="label">Objective</span>
                                <span className="value">{campaign.brief?.campaign_objective?.replace('_', ' ') || 'N/A'}</span>
                            </div>
                            {campaign.brief?.target_audience && (
                                <div className="brief-item full">
                                    <span className="label">Target Audience</span>
                                    <span className="value">{campaign.brief.target_audience}</span>
                                </div>
                            )}
                            {campaign.brief?.key_messages && (
                                <div className="brief-item full">
                                    <span className="label">Key Messages</span>
                                    <span className="value">{campaign.brief.key_messages}</span>
                                </div>
                            )}
                            {campaign.brief?.content_guidelines && (
                                <div className="brief-item full">
                                    <span className="label">Content Guidelines</span>
                                    <span className="value">{campaign.brief.content_guidelines}</span>
                                </div>
                            )}
                            {campaign.brief?.special_requirements && (
                                <div className="brief-item full">
                                    <span className="label">Special Requirements</span>
                                    <span className="value">{campaign.brief.special_requirements}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deliverables Section */}
                    <div className="campaign-section">
                        <h3>📦 Deliverables</h3>
                        <DeliverablesSection
                            campaign={campaign}
                            isInfluencer={isInfluencer}
                            onUpdate={fetchCampaign}
                        />
                    </div>

                    {/* Messages/Activity */}
                    <div className="campaign-section">
                        <h3>💬 Activity Log</h3>
                        <ActivityLog activities={campaign.activities || []} formatDate={formatDate} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="campaign-sidebar">
                    {/* Actions Card */}
                    <ActionsCard
                        campaign={campaign}
                        isInfluencer={isInfluencer}
                        onAction={setActiveAction}
                        onUpdate={fetchCampaign}
                    />

                    {/* Parties Card */}
                    <div className="parties-card">
                        <h4>👥 Parties</h4>

                        <div className="party">
                            <span className="role">Brand</span>
                            <div className="party-info">
                                <div className="party-avatar">
                                    {campaign.brand?.name?.charAt(0) || 'B'}
                                </div>
                                <span className="party-name">{campaign.brand?.name || 'Brand'}</span>
                            </div>
                        </div>

                        <div className="party">
                            <span className="role">Influencer</span>
                            <Link to={`/marketplace/influencer/${campaign.influencer?.id}`} className="party-info">
                                <div className="party-avatar">
                                    {campaign.influencer?.display_name?.charAt(0) || 'I'}
                                </div>
                                <span className="party-name">{campaign.influencer?.display_name || 'Influencer'}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Package Info */}
                    {campaign.package && (
                        <div className="package-info-card">
                            <h4>📦 Package Details</h4>
                            <Link to={`/marketplace/package/${campaign.package.id}`} className="package-link">
                                <span className="pkg-name">{campaign.package.name}</span>
                                <ul className="pkg-includes">
                                    <li>📍 {campaign.package.platform}</li>
                                    <li>📦 {campaign.package.deliverables_count}x Deliverables</li>
                                    <li>⏱️ {campaign.package.timeline_days} days</li>
                                    <li>🔄 {campaign.package.revisions_included} revisions</li>
                                </ul>
                                <span className="pkg-price">{formatPrice(campaign.package.price)}</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Modals */}
            {activeAction === 'submit' && (
                <SubmitDeliverableModal
                    campaignId={campaign.id}
                    onClose={() => setActiveAction(null)}
                    onSuccess={() => {
                        setActiveAction(null);
                        fetchCampaign();
                    }}
                />
            )}
            {activeAction === 'review' && (
                <ReviewDeliverableModal
                    campaign={campaign}
                    onClose={() => setActiveAction(null)}
                    onSuccess={() => {
                        setActiveAction(null);
                        fetchCampaign();
                    }}
                />
            )}
            {activeAction === 'dispute' && (
                <DisputeModal
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

// Campaign Timeline Component
function CampaignTimeline({ status }) {
    const steps = [
        { key: 'pending', label: 'Request Sent' },
        { key: 'accepted', label: 'Accepted' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'draft_submitted', label: 'Draft Submitted' },
        { key: 'draft_approved', label: 'Approved' },
        { key: 'completed', label: 'Completed' },
    ];

    const currentIndex = steps.findIndex(s => s.key === status);
    const isCompleted = status === 'completed';
    const isDisputed = status === 'disputed';
    const isCancelled = status === 'cancelled' || status === 'rejected';

    return (
        <div className="campaign-timeline">
            {steps.map((step, index) => {
                let stepStatus = 'upcoming';
                if (isCompleted || index < currentIndex) stepStatus = 'completed';
                else if (index === currentIndex) stepStatus = 'current';

                if (isDisputed && index === currentIndex) stepStatus = 'disputed';
                if (isCancelled) stepStatus = index <= currentIndex ? 'cancelled' : 'upcoming';

                return (
                    <div key={step.key} className={`timeline-step ${stepStatus}`}>
                        <div className="step-indicator">
                            {stepStatus === 'completed' ? '✓' :
                                stepStatus === 'disputed' ? '!' :
                                    stepStatus === 'cancelled' ? '✗' : index + 1}
                        </div>
                        <span className="step-label">{step.label}</span>
                        {index < steps.length - 1 && <div className="step-line" />}
                    </div>
                );
            })}
        </div>
    );
}

// Deliverables Section
function DeliverablesSection({ campaign, isInfluencer, onUpdate }) {
    const deliverables = campaign.deliverables || [];

    if (deliverables.length === 0) {
        return (
            <div className="no-deliverables">
                <span>📦</span>
                <p>No deliverables submitted yet</p>
                {isInfluencer && campaign.status === 'accepted' && (
                    <p className="hint">Start working on the campaign and submit your deliverables when ready!</p>
                )}
            </div>
        );
    }

    return (
        <div className="deliverables-list">
            {deliverables.map((del, i) => (
                <div key={i} className={`deliverable-item ${del.status}`}>
                    <div className="del-header">
                        <span className="del-type">{del.type}</span>
                        <span className={`del-status ${del.status}`}>{del.status}</span>
                    </div>

                    {del.url && (
                        <a href={del.url} target="_blank" rel="noopener noreferrer" className="del-preview">
                            {del.type === 'image' && <img src={del.url} alt="Deliverable" />}
                            {del.type === 'video' && <span className="video-icon">▶️ View Video</span>}
                            {del.type === 'link' && <span className="link-icon">🔗 {del.url}</span>}
                        </a>
                    )}

                    {del.description && (
                        <p className="del-description">{del.description}</p>
                    )}

                    {del.feedback && (
                        <div className="del-feedback">
                            <span className="feedback-label">Feedback:</span>
                            <p>{del.feedback}</p>
                        </div>
                    )}

                    <span className="del-date">Submitted {new Date(del.submitted_at).toLocaleDateString()}</span>
                </div>
            ))}
        </div>
    );
}

// Activity Log
function ActivityLog({ activities, formatDate }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="no-activities">
                <p>No activity yet</p>
            </div>
        );
    }

    return (
        <div className="activity-list">
            {activities.map((activity, i) => (
                <div key={i} className="activity-item">
                    <div className="activity-icon">{activity.icon || '📌'}</div>
                    <div className="activity-content">
                        <span className="activity-text">{activity.message}</span>
                        <span className="activity-date">{formatDate(activity.created_at)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Actions Card
function ActionsCard({ campaign, isInfluencer, onAction, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccept = async () => {
        setLoading(true);
        try {
            await campaignApi.accept(campaign.id);
            onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to accept');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this campaign?')) return;
        setLoading(true);
        try {
            await campaignApi.reject(campaign.id, { reason: 'Not interested at this time' });
            onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to reject');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!confirm('Mark this campaign as complete? The influencer will receive payment.')) return;
        setLoading(true);
        try {
            await campaignApi.complete(campaign.id);
            onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to complete');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="actions-card">
            <h4>⚡ Actions</h4>

            {error && <div className="action-error">{error}</div>}

            {/* Influencer Actions */}
            {isInfluencer && campaign.status === 'pending' && (
                <div className="action-buttons">
                    <button className="btn-accept" onClick={handleAccept} disabled={loading}>
                        ✓ Accept Campaign
                    </button>
                    <button className="btn-reject" onClick={handleReject} disabled={loading}>
                        ✗ Decline
                    </button>
                </div>
            )}

            {isInfluencer && ['accepted', 'in_progress', 'revision_requested'].includes(campaign.status) && (
                <button className="btn-primary full" onClick={() => onAction('submit')}>
                    📤 Submit Deliverable
                </button>
            )}

            {/* Brand Actions */}
            {!isInfluencer && campaign.status === 'draft_submitted' && (
                <div className="action-buttons">
                    <button className="btn-primary full" onClick={() => onAction('review')}>
                        👀 Review Deliverable
                    </button>
                </div>
            )}

            {!isInfluencer && campaign.status === 'draft_approved' && (
                <button className="btn-complete full" onClick={handleComplete} disabled={loading}>
                    🎉 Mark Complete & Release Payment
                </button>
            )}

            {/* Common Actions */}
            {['in_progress', 'draft_submitted', 'revision_requested', 'draft_approved'].includes(campaign.status) && (
                <button className="btn-dispute" onClick={() => onAction('dispute')}>
                    ⚠️ Open Dispute
                </button>
            )}

            {campaign.status === 'completed' && (
                <div className="completed-message">
                    <span className="icon">🎉</span>
                    <span>Campaign completed successfully!</span>
                </div>
            )}

            {campaign.status === 'disputed' && (
                <div className="disputed-message">
                    <span className="icon">⚠️</span>
                    <span>This campaign is under dispute review</span>
                </div>
            )}
        </div>
    );
}

// Submit Deliverable Modal
function SubmitDeliverableModal({ campaignId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        type: 'link',
        url: '',
        description: '',
    });

    const handleSubmit = async () => {
        if (!formData.url) {
            setError('Please provide a URL or file');
            return;
        }

        setLoading(true);
        try {
            await campaignApi.submitDeliverable(campaignId, formData);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to submit deliverable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📤 Submit Deliverable</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="link">Link (Instagram, TikTok, etc.)</option>
                            <option value="image">Image URL</option>
                            <option value="video">Video URL</option>
                            <option value="file">File URL</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>URL *</label>
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Description / Notes</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Any notes about this deliverable..."
                            rows={3}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || !formData.url}
                    >
                        {loading ? 'Submitting...' : 'Submit Deliverable'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Review Deliverable Modal
function ReviewDeliverableModal({ campaign, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [action, setAction] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleReview = async () => {
        if (!action) {
            setError('Please select an action');
            return;
        }

        setLoading(true);
        try {
            if (action === 'approve') {
                await campaignApi.approveDeliverable(campaign.id);
            } else {
                await campaignApi.requestRevision(campaign.id, { feedback });
            }
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>👀 Review Deliverable</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="review-options">
                        <button
                            className={`option-btn approve ${action === 'approve' ? 'selected' : ''}`}
                            onClick={() => setAction('approve')}
                        >
                            <span className="icon">✅</span>
                            <span className="label">Approve</span>
                            <span className="desc">The deliverable meets requirements</span>
                        </button>

                        <button
                            className={`option-btn revision ${action === 'revision' ? 'selected' : ''}`}
                            onClick={() => setAction('revision')}
                        >
                            <span className="icon">🔄</span>
                            <span className="label">Request Revision</span>
                            <span className="desc">Changes are needed</span>
                        </button>
                    </div>

                    {action === 'revision' && (
                        <div className="form-group">
                            <label>Feedback for Influencer *</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Describe what changes are needed..."
                                rows={4}
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleReview}
                        disabled={loading || !action || (action === 'revision' && !feedback)}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Dispute Modal
function DisputeModal({ campaignId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reason, setReason] = useState('');

    const handleDispute = async () => {
        if (!reason.trim()) {
            setError('Please describe the issue');
            return;
        }

        setLoading(true);
        try {
            await campaignApi.openDispute(campaignId, { reason });
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to open dispute');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚠️ Open Dispute</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="dispute-warning">
                        <span className="icon">⚠️</span>
                        <p>Disputes should only be opened when there's a genuine issue that can't be resolved through direct communication.</p>
                    </div>

                    <div className="form-group">
                        <label>Describe the Issue *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain what went wrong and why you're opening a dispute..."
                            rows={5}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-danger"
                        onClick={handleDispute}
                        disabled={loading || !reason.trim()}
                    >
                        {loading ? 'Submitting...' : 'Open Dispute'}
                    </button>
                </div>
            </div>
        </div>
    );
}
