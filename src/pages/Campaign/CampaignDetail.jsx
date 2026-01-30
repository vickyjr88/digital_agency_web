/**
 * Campaign Detail Page
 * Full campaign management with deliverable submission and approval workflow
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignApi } from '../../services/marketplaceApi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ContentGeneratorModal from './ContentGeneratorModal';
import { PartiesCard, PackageInfoCard } from './CampaignSidebarComponents';
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
    const [generatedContents, setGeneratedContents] = useState([]);

    useEffect(() => {
        fetchCampaign();
    }, [campaignId]);

    const fetchCampaign = async () => {
        setLoading(true);
        try {
            const response = await campaignApi.getById(campaignId);
            setCampaign(response);

            // Try to fetch generated contents
            try {
                const contentData = await api.getMyGeneratedContent({ campaign_id: campaignId });
                setGeneratedContents(contentData.contents || []);
            } catch (err) {
                console.error('Failed to fetch generated contents:', err);
            }
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

    const isInfluencer = user?.id === campaign?.influencer?.user_id;
    const isBrand = user?.id === campaign?.brand_id;
    const isAdmin = user?.user_type === 'admin';
    const isParticipant = isInfluencer || isBrand || isAdmin;

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
                <button className="back-btn" onClick={() => navigate(-1)}>← Go Back</button>
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

                    {/* AI Generated Content Section */}
                    {generatedContents.length > 0 && (
                        <div className="campaign-section">
                            <div className="section-header">
                                <h3>✨ AI Generated Content</h3>
                                <div className="deliverable-requirements">
                                    <span className="req-tag">{generatedContents.length} items</span>
                                </div>
                            </div>
                            <GeneratedContentSection
                                contents={generatedContents}
                                isInfluencer={isInfluencer}
                                isBrand={isBrand}
                                isAdmin={isAdmin}
                            />
                        </div>
                    )}

                    {/* Deliverables Section (Moved up for visibility) */}
                    <div className="campaign-section">
                        <div className="section-header">
                            <h3>📦 Deliverables</h3>
                            <div className="deliverable-requirements">
                                {campaign.platforms?.map(p => (
                                    <span key={p} className="req-tag">#{p}</span>
                                ))}
                                {campaign.content_types?.map(t => (
                                    <span key={t} className="req-tag">@{t}</span>
                                ))}
                            </div>
                        </div>
                        <DeliverablesSection
                            campaign={campaign}
                            isInfluencer={isInfluencer}
                            onUpdate={fetchCampaign}
                        />
                    </div>

                    {/* Brief Section */}
                    <div className="campaign-section">
                        <h3>📋 Campaign Brief</h3>
                        <div className="brief-content">
                            <div className="brief-item">
                                <span className="label">Brand</span>
                                <span className="value">
                                    {campaign.brand_entity?.name || campaign.brand?.name || 'Brand'}
                                </span>
                            </div>
                            <div className="brief-item">
                                <span className="label">Industry</span>
                                <span className="value">
                                    {campaign.brand_entity?.industry || 'N/A'}
                                </span>
                            </div>
                            <div className="brief-item full">
                                <span className="label">Brand Description</span>
                                <span className="value">
                                    {campaign.brand_entity?.description || 'N/A'}
                                </span>
                            </div>

                            <div className="brief-item full">
                                <span className="label">Campaign Description / Objective</span>
                                <span className="value">{campaign.description || campaign.brief?.campaign_objective?.replace('_', ' ') || 'N/A'}</span>
                            </div>

                            {(campaign.product_name || campaign.product_description) && (
                                <div className="brief-item full">
                                    <span className="label">Product / Service</span>
                                    <span className="value">
                                        <strong>{campaign.product_name}</strong>
                                        {campaign.product_description && <p>{campaign.product_description}</p>}
                                        {campaign.product_url && (
                                            <a href={campaign.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                View Product
                                            </a>
                                        )}
                                    </span>
                                </div>
                            )}

                            {campaign.custom_requirements && (
                                <div className="brief-item full">
                                    <span className="label">Requirements / Instructions</span>
                                    <span className="value">{campaign.custom_requirements}</span>
                                </div>
                            )}

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
                            {campaign.platforms && (
                                <div className="brief-item">
                                    <span className="label">Platforms</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {campaign.platforms.map(p => (
                                            <span key={p} className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {campaign.content_types && (
                                <div className="brief-item">
                                    <span className="label">Content Types</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {campaign.content_types.map(t => (
                                            <span key={t} className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages/Activity */}
                    <div className="campaign-section">
                        <h3>� Activity Log</h3>
                        <ActivityLog
                            activities={campaign.activities || []}
                            campaign={campaign}
                            formatDate={formatDate}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="campaign-sidebar">
                    {/* Actions Card */}
                    <ActionsCard
                        campaign={campaign}
                        isInfluencer={isInfluencer}
                        isBrand={isBrand}
                        isAdmin={isAdmin}
                        onAction={setActiveAction}
                        onUpdate={fetchCampaign}
                    />

                    {/* Parties Card */}
                    <PartiesCard campaign={campaign} />

                    {/* Package Info Card */}
                    <PackageInfoCard campaign={campaign} formatPrice={formatPrice} />
                </div>
            </div>

            {/* Action Modals */}
            {activeAction === 'submit' && (
                <SubmitDeliverableModal
                    campaign={campaign}
                    onClose={() => setActiveAction(null)}
                    onSuccess={() => {
                        setActiveAction(null);
                        fetchCampaign();
                    }}
                />
            )}
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
            {activeAction === 'review' && (
                <ReviewDeliverableModal
                    campaign={campaign}
                    deliverable={campaign.deliverables?.find(d => d.status === 'submitted')}
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

// Generated Content Section
function GeneratedContentSection({ contents, isInfluencer, isBrand, isAdmin }) {
    const navigate = useNavigate();

    return (
        <div className="generated-contents-list">
            {contents.map((item) => (
                <div key={item.id} className="generated-item">
                    <div className="item-main">
                        <div className="item-info">
                            <div className="item-meta">
                                <span className={`platform-tag ${item.platform}`}>{item.platform}</span>
                                <span className="type-tag">{item.content_type}</span>
                            </div>
                            <h4 className="item-topic">{item.trend_topic}</h4>
                            <p className="item-date">Generated {new Date(item.generated_at).toLocaleDateString()}</p>
                        </div>
                        <div className="item-status">
                            <span className={`status-pill ${item.status}`}>{item.status.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <div className="item-actions">
                        {isInfluencer && item.status === 'draft' ? (
                            <button
                                onClick={() => navigate(`/campaign-content/${item.id}/edit`)}
                                className="btn-secondary sm"
                            >
                                ✏️ Edit & Submit
                            </button>
                        ) : (isBrand || isAdmin) && item.status === 'pending_approval' ? (
                            <button
                                onClick={() => navigate(`/campaign-content/${item.id}/edit`)}
                                className="btn-secondary sm"
                                style={{ background: '#4f46e5', color: 'white' }}
                            >
                                👀 Review & Approve
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/campaign-content/${item.id}/edit`)}
                                className="btn-secondary sm"
                            >
                                👁️ View Content
                            </button>
                        )}
                    </div>
                </div>
            ))}
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
                        <span className="del-type">{del.platform} - {del.content_type}</span>
                        <span className={`del-status ${del.status}`}>{del.status}</span>
                    </div>

                    {(del.draft_url || del.published_url) && (
                        <a href={del.published_url || del.draft_url} target="_blank" rel="noopener noreferrer" className="del-preview">
                            {del.published_url ? (
                                <span className="link-icon">📢 View Published Content</span>
                            ) : (
                                <span className="link-icon">🔗 View Draft</span>
                            )}
                        </a>
                    )}

                    {(del.draft_description || del.draft_caption) && (
                        <div className="del-description">
                            {del.draft_caption && <strong>{del.draft_caption}</strong>}
                            {del.draft_description && <p>{del.draft_description}</p>}
                        </div>
                    )}

                    {del.feedback && (
                        <div className="del-feedback">
                            <span className="feedback-label">Feedback:</span>
                            <p>{del.feedback}</p>
                        </div>
                    )}

                    <span className="del-date">Submitted {new Date(del.created_at).toLocaleDateString()}</span>
                </div>
            ))}
        </div>
    );
}

// Activity Log
function ActivityLog({ activities, campaign, formatDate }) {
    // Synthesize milestones if activities is empty
    const synthesized = [...(activities || [])];

    if (synthesized.length === 0 && campaign) {
        if (campaign.created_at) synthesized.push({ icon: '🎯', message: 'Campaign created', created_at: campaign.created_at });
        if (campaign.started_at) synthesized.push({ icon: '🚀', message: 'Campaign started', created_at: campaign.started_at });
        if (campaign.draft_submitted_at) synthesized.push({ icon: '📤', message: 'Draft submitted for review', created_at: campaign.draft_submitted_at });
        if (campaign.published_at) synthesized.push({ icon: '📢', message: 'Content published', created_at: campaign.published_at });
        if (campaign.completed_at) synthesized.push({ icon: '🎉', message: 'Campaign completed', created_at: campaign.completed_at });

        // Sort descending
        synthesized.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (synthesized.length === 0) {
        return (
            <div className="no-activities">
                <p>No activity recorded yet</p>
            </div>
        );
    }

    return (
        <div className="activity-list">
            {synthesized.map((activity, i) => (
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
function ActionsCard({ campaign, isInfluencer, isBrand, isAdmin, onAction, onUpdate }) {
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

            {isInfluencer && ['open', 'accepted', 'in_progress', 'revision_requested', 'draft_submitted', 'draft_approved'].includes(campaign.status) && (
                <>
                    <button className="btn-secondary full" onClick={() => onAction('generate')} style={{ marginBottom: '12px' }}>
                        ✨ Create Content with AI
                    </button>
                    <button className="btn-primary full" onClick={() => onAction('submit')}>
                        📤 Submit Deliverable
                    </button>
                </>
            )}

            {/* Brand Actions */}
            {(isBrand || isAdmin) && campaign.status === 'draft_submitted' && (
                <div className="action-buttons">
                    <button className="btn-primary full" onClick={() => onAction('review')}>
                        👀 Review Deliverable
                    </button>
                </div>
            )}

            {(isBrand || isAdmin) && campaign.status === 'draft_approved' && (
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
function SubmitDeliverableModal({ campaign, onClose, onSuccess }) {
    const campaignId = campaign.id;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        content_type: campaign.content_types?.[0] || 'post',
        platform: campaign.platforms?.[0] || (campaign.package?.platform?.toLowerCase()) || 'twitter',
        draft_url: '',
        draft_description: '',
    });

    const handleSubmit = async () => {
        if (!formData.draft_url) {
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

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Platform *</label>
                            <select
                                value={formData.platform}
                                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                            >
                                {campaign.platforms && campaign.platforms.length > 0 ? (
                                    campaign.platforms.map(p => (
                                        <option key={p} value={p.toLowerCase()}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="instagram">Instagram</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="twitter">Twitter</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="youtube">YouTube</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="form-group half">
                            <label>Content Type *</label>
                            <select
                                value={formData.content_type}
                                onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                            >
                                {campaign.content_types && campaign.content_types.length > 0 ? (
                                    campaign.content_types.map(t => (
                                        <option key={t} value={t.toLowerCase()}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="post">Post</option>
                                        <option value="reel">Reel</option>
                                        <option value="story">Story</option>
                                        <option value="tweet">Tweet</option>
                                        <option value="video">Video</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Draft URL *</label>
                        <input
                            type="url"
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
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || !formData.draft_url}
                    >
                        {loading ? 'Submitting...' : 'Submit Deliverable'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Review Deliverable Modal
function ReviewDeliverableModal({ campaign, deliverable, onClose, onSuccess }) {
    const activeDeliverable = deliverable || campaign.deliverables?.find(d => d.status === 'submitted');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [action, setAction] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleReview = async () => {
        if (!activeDeliverable) {
            setError('No deliverable found to review');
            return;
        }
        if (!action) {
            setError('Please select an action');
            return;
        }

        setLoading(true);
        try {
            if (action === 'approve') {
                await campaignApi.approveDeliverable(campaign.id, activeDeliverable.id);
            } else {
                await campaignApi.requestRevision(campaign.id, activeDeliverable.id, feedback);
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

                    {activeDeliverable && (
                        <div className="review-target-info">
                            <span className="label">Reviewing:</span>
                            <span className="value">{activeDeliverable.platform} {activeDeliverable.content_type}</span>
                            {activeDeliverable.draft_url && (
                                <a href={activeDeliverable.draft_url} target="_blank" rel="noopener noreferrer" className="view-link">
                                    🔗 View Content
                                </a>
                            )}
                        </div>
                    )}

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
