import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { campaignApi } from '../../services/marketplaceApi';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send, Loader2, Sparkles, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PartiesCard, PackageInfoCard } from './CampaignSidebarComponents';
import './CampaignDetail.css';

export default function EditGeneratedContent() {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [content, setContent] = useState(null);
    const [campaign, setCampaign] = useState(null);
    const [formData, setFormData] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAction, setReviewAction] = useState(null); // 'approve' or 'revision'
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchContent();
    }, [contentId]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const data = await api.getCampaignContentDetail(contentId);
            setContent(data);

            // Fetch campaign details for the sidebar
            if (data.campaign?.id) {
                const campaignData = await campaignApi.getById(data.campaign.id);
                setCampaign(campaignData);
            }

            // Initialize form data based on content type
            setFormData({
                tweet: data.tweet || '',
                facebook_post: data.facebook_post || '',
                instagram_caption: data.instagram_caption || '',
                linkedin_post: data.linkedin_post || '',
                instagram_reel_script: data.instagram_reel_script || { visuals: '', audio: '', caption: '' },
                tiktok_idea: data.tiktok_idea || { hook: '', action: '', sound: '' }
            });
        } catch (error) {
            console.error('Failed to load content', error);
            toast.error('Failed to load content');
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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parentField, nestedField, value) => {
        setFormData(prev => ({
            ...prev,
            [parentField]: {
                ...prev[parentField],
                [nestedField]: value
            }
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.submitContentForApproval(contentId);
            toast.success('Content submitted for approval!');
            navigate(`/campaigns/${campaign.id}`);
        } catch (error) {
            console.error('Failed to submit', error);
            toast.error('Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReview = async () => {
        if (reviewAction === 'revision' && !feedback) {
            toast.error('Please provide feedback for revisions');
            return;
        }

        setReviewing(true);
        try {
            await api.approveContent(contentId, {
                approved: reviewAction === 'approve',
                feedback: feedback || (reviewAction === 'approve' ? 'Approved!' : '')
            });
            toast.success(reviewAction === 'approve' ? 'Content approved!' : 'Revision requested');
            navigate(`/campaigns/${campaign.id}`);
        } catch (error) {
            console.error('Failed to review content', error);
            toast.error('Failed to process review');
        } finally {
            setReviewing(false);
            setShowReviewModal(false);
        }
    };

    const isInfluencer = user?.id === content?.influencer_id;
    const isBrand = user?.id === campaign?.brand_id;
    const isAdmin = user?.user_type === 'admin';
    const canReview = (isBrand || isAdmin) && content?.status === 'pending_approval';
    const canEdit = isInfluencer && content?.status === 'draft';

    if (loading) return (
        <div className="campaign-loading">
            <div className="spinner"></div>
            <p>Loading content editor...</p>
        </div>
    );

    if (!content) return (
        <div className="campaign-error">
            <h2>Content not found</h2>
            <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    return (
        <div className="campaign-detail-page">
            {/* Navigation */}
            <div className="page-nav">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back to Campaign
                </button>
                <div className="status-badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                    AI Content: {content.status}
                </div>
            </div>

            {/* Header */}
            <header className="campaign-header">
                <h1>Edit AI Generated Content</h1>
                <div className="header-meta">
                    <div className="meta-item">
                        <span>Campaign:</span>
                        <strong>{content.campaign.title}</strong>
                    </div>
                    <div className="meta-item">
                        <span className={`platform-tag ${content.platform}`}>{content.platform}</span>
                        <span className="type-tag">{content.content_type}</span>
                    </div>
                </div>
            </header>

            <div className="campaign-content">
                {/* Main Content */}
                <div className="campaign-main">
                    <div className="campaign-section">
                        <h3>✍️ Editor</h3>
                        <div className="space-y-6">
                            {content.tweet && (
                                <div className="form-group">
                                    <label>Tweet</label>
                                    <textarea
                                        value={formData.tweet}
                                        onChange={(e) => handleChange('tweet', e.target.value)}
                                        className="w-full p-3 border rounded-lg min-h-[100px]"
                                    />
                                    <p className="text-right text-xs text-gray-400 mt-1">{formData.tweet.length}/280</p>
                                </div>
                            )}

                            {content.instagram_caption && (
                                <div className="form-group">
                                    <label>Instagram Caption</label>
                                    <textarea
                                        value={formData.instagram_caption}
                                        onChange={(e) => handleChange('instagram_caption', e.target.value)}
                                        className="w-full p-3 border rounded-lg min-h-[150px]"
                                    />
                                </div>
                            )}

                            {content.instagram_reel_script && (
                                <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }} className="font-medium flex items-center gap-2">
                                        <Sparkles size={16} className="text-purple-500" />
                                        Reel Script
                                    </h3>
                                    <div className="form-group">
                                        <label className="text-xs">Visuals</label>
                                        <textarea
                                            value={formData.instagram_reel_script.visuals}
                                            onChange={(e) => handleNestedChange('instagram_reel_script', 'visuals', e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs">Audio/Voiceover</label>
                                        <textarea
                                            value={formData.instagram_reel_script.audio}
                                            onChange={(e) => handleNestedChange('instagram_reel_script', 'audio', e.target.value)}
                                            rows={2}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs">Caption</label>
                                        <textarea
                                            value={formData.instagram_reel_script.caption}
                                            onChange={(e) => handleNestedChange('instagram_reel_script', 'caption', e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {content.tiktok_idea && (
                                <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }} className="font-medium flex items-center gap-2">
                                        <Sparkles size={16} className="text-pink-500" />
                                        TikTok Concept
                                    </h3>
                                    <div className="form-group">
                                        <label className="text-xs">Hook (0-3s)</label>
                                        <input
                                            type="text"
                                            value={formData.tiktok_idea.hook}
                                            onChange={(e) => handleNestedChange('tiktok_idea', 'hook', e.target.value)}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs">Main Action</label>
                                        <textarea
                                            value={formData.tiktok_idea.action}
                                            onChange={(e) => handleNestedChange('tiktok_idea', 'action', e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs">Sound/Audio</label>
                                        <input
                                            type="text"
                                            value={formData.tiktok_idea.sound}
                                            onChange={(e) => handleNestedChange('tiktok_idea', 'sound', e.target.value)}
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="campaign-sidebar">
                    <div className="actions-card">
                        <h4>⚡ Actions</h4>
                        <div className="action-buttons">
                            {canEdit && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn-primary full"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Send size={18} className="mr-2" />}
                                    Submit for Approval
                                </button>
                            )}

                            {canReview && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => { setReviewAction('approve'); setShowReviewModal(true); }}
                                        className="btn-primary full"
                                        style={{ background: '#10b981' }}
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        Approve Content
                                    </button>
                                    <button
                                        onClick={() => { setReviewAction('revision'); setShowReviewModal(true); }}
                                        className="btn-reject full"
                                    >
                                        <XCircle size={18} className="mr-2" />
                                        Request Revision
                                    </button>
                                </div>
                            )}

                            {content.status === 'approved' && (
                                <div className="completed-message" style={{ color: '#059669', background: '#ecfdf5', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={20} />
                                    <span className="font-bold">Content Approved!</span>
                                </div>
                            )}

                            {content.status === 'rejected' && (
                                <div className="completed-message" style={{ color: '#dc2626', background: '#fef2f2', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <XCircle size={20} />
                                    <span className="font-bold">Revision Requested</span>
                                </div>
                            )}

                            <button onClick={() => navigate(`/campaigns/${campaign?.id}`)} className="btn-secondary full" style={{ marginTop: '12px' }}>
                                Back to Campaign
                            </button>
                        </div>
                    </div>

                    {campaign && <PartiesCard campaign={campaign} />}
                    {campaign && <PackageInfoCard campaign={campaign} formatPrice={formatPrice} />}
                </div>
            </div>

            {/* Simple Review Modal */}
            {showReviewModal && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
                        <h3>{reviewAction === 'approve' ? 'Approve Content' : 'Request Revision'}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {reviewAction === 'approve'
                                ? 'Are you sure you want to approve this content? The influencer will be notified.'
                                : 'Please describe what changes are needed to the content.'}
                        </p>

                        <div className="form-group mb-4">
                            <label className="text-xs font-bold uppercase text-gray-400">Feedback (Optional for approval)</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full p-3 border rounded-lg min-h-[100px] mt-2"
                                placeholder="Write your feedback here..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReview}
                                disabled={reviewing}
                                className={`flex-1 ${reviewAction === 'approve' ? 'btn-primary' : 'btn-reject'}`}
                                style={reviewAction === 'approve' ? { background: '#10b981', color: 'white' } : { background: '#ef4444', color: 'white' }}
                            >
                                {reviewing ? <Loader2 className="animate-spin" /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
