/**
 * Submit Proof of Work Page
 * Allows influencers to submit proof of delivered work for accepted campaigns
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    ArrowLeft, Upload, Link, Image, Plus, X, Loader2,
    CheckCircle, Clock, XCircle, Eye, ExternalLink,
    MessageCircle, Heart, Share2, TrendingUp
} from 'lucide-react';
import './ProofOfWork.css';

export default function SubmitProof() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedBidId = searchParams.get('bid');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [myBids, setMyBids] = useState([]);
    const [selectedBid, setSelectedBid] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content_links: [''],
        screenshot_urls: [],
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0
    });

    useEffect(() => {
        fetchAcceptedBids();
    }, []);

    const fetchAcceptedBids = async () => {
        setLoading(true);
        try {
            const response = await api.getMyBids({ status: 'accepted' });
            const acceptedBids = response.bids || [];
            setMyBids(acceptedBids);

            // Pre-select if bid ID provided
            if (preselectedBidId) {
                const bid = acceptedBids.find(b => b.id === preselectedBidId);
                if (bid) {
                    setSelectedBid(bid);
                    setFormData(prev => ({
                        ...prev,
                        title: `Deliverables for: ${bid.campaign?.title || 'Campaign'}`
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching bids:', error);
            toast.error('Failed to load your campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleBidSelect = (bid) => {
        setSelectedBid(bid);
        setFormData(prev => ({
            ...prev,
            title: `Deliverables for: ${bid.campaign?.title || 'Campaign'}`
        }));
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const addContentLink = () => {
        setFormData(prev => ({
            ...prev,
            content_links: [...prev.content_links, '']
        }));
    };

    const updateContentLink = (index, value) => {
        setFormData(prev => ({
            ...prev,
            content_links: prev.content_links.map((link, i) => i === index ? value : link)
        }));
    };

    const removeContentLink = (index) => {
        if (formData.content_links.length === 1) return;
        setFormData(prev => ({
            ...prev,
            content_links: prev.content_links.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBid) {
            toast.error('Please select a campaign');
            return;
        }

        const validLinks = formData.content_links.filter(link => link.trim());
        if (validLinks.length === 0) {
            toast.error('Please add at least one content link');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                bid_id: selectedBid.id,
                title: formData.title,
                description: formData.description || undefined,
                content_links: validLinks,
                screenshot_urls: formData.screenshot_urls.length > 0 ? formData.screenshot_urls : undefined,
                views_count: formData.views_count,
                likes_count: formData.likes_count,
                comments_count: formData.comments_count,
                shares_count: formData.shares_count
            };

            await api.submitProofOfWork(payload);
            toast.success('Proof submitted! Waiting for brand approval.');
            navigate('/proof-of-work/my-submissions');
        } catch (error) {
            console.error('Error submitting proof:', error);
            toast.error(error.message || 'Failed to submit proof');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount / 100);
    };

    if (loading) {
        return (
            <div className="proof-page loading-state">
                <div className="spinner" />
                <p>Loading your campaigns...</p>
            </div>
        );
    }

    if (myBids.length === 0) {
        return (
            <div className="proof-page empty-state">
                <Upload size={48} className="icon" />
                <h2>No Accepted Campaigns</h2>
                <p>You need to have an accepted bid before you can submit proof of work.</p>
                <button className="btn-primary" onClick={() => navigate('/campaigns/open')}>
                    Browse Open Campaigns
                </button>
            </div>
        );
    }

    return (
        <div className="proof-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content">
                    <h1>
                        <Upload size={28} />
                        Submit Proof of Work
                    </h1>
                    <p>Submit evidence of your completed deliverables to receive payment</p>
                </div>
            </div>

            <div className="proof-layout">
                {/* Campaign Selection */}
                <div className="proof-sidebar">
                    <div className="sidebar-section">
                        <h3>Select Campaign</h3>
                        <div className="campaign-list">
                            {myBids.map(bid => (
                                <button
                                    key={bid.id}
                                    className={`campaign-card ${selectedBid?.id === bid.id ? 'selected' : ''}`}
                                    onClick={() => handleBidSelect(bid)}
                                >
                                    <div className="campaign-card-header">
                                        <span className="campaign-title">{bid.campaign?.title}</span>
                                        <span className="bid-amount">{formatCurrency(bid.amount)}</span>
                                    </div>
                                    <div className="campaign-card-meta">
                                        <span>{bid.campaign?.brand_name || 'Brand'}</span>
                                        <span>•</span>
                                        <span>{bid.platform}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedBid && (
                        <div className="sidebar-section campaign-info">
                            <h4>Campaign Details</h4>
                            <div className="info-item">
                                <label>Your Bid:</label>
                                <span className="value highlight">{formatCurrency(selectedBid.amount)}</span>
                            </div>
                            <div className="info-item">
                                <label>Platform:</label>
                                <span>{selectedBid.platform}</span>
                            </div>
                            <div className="info-item">
                                <label>Content Type:</label>
                                <span>{selectedBid.content_type}</span>
                            </div>
                            {selectedBid.deliverables_description && (
                                <div className="info-item">
                                    <label>Deliverables:</label>
                                    <p>{selectedBid.deliverables_description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Submission Form */}
                <div className="proof-main">
                    <form className="proof-form" onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className="form-section">
                            <h3>Submission Details</h3>

                            <div className="form-group">
                                <label htmlFor="title">Title *</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="What did you deliver?"
                                    required
                                    minLength={5}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what you delivered, any special notes for the brand..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Content Links */}
                        <div className="form-section">
                            <h3>
                                <Link size={18} />
                                Content Links *
                            </h3>
                            <p className="section-hint">Add links to the content you posted</p>

                            <div className="links-list">
                                {formData.content_links.map((link, index) => (
                                    <div key={index} className="link-input-row">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => updateContentLink(index, e.target.value)}
                                            placeholder="https://instagram.com/p/..."
                                            required={index === 0}
                                        />
                                        {formData.content_links.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeContentLink(index)}
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={addContentLink}
                            >
                                <Plus size={16} />
                                Add Another Link
                            </button>
                        </div>

                        {/* Performance Metrics (Optional) */}
                        <div className="form-section">
                            <h3>
                                <TrendingUp size={18} />
                                Performance Metrics (Optional)
                            </h3>
                            <p className="section-hint">Share engagement data if available</p>

                            <div className="metrics-grid">
                                <div className="metric-input">
                                    <Eye size={18} />
                                    <input
                                        type="number"
                                        name="views_count"
                                        value={formData.views_count}
                                        onChange={handleChange}
                                        min={0}
                                        placeholder="0"
                                    />
                                    <span>Views</span>
                                </div>

                                <div className="metric-input">
                                    <Heart size={18} />
                                    <input
                                        type="number"
                                        name="likes_count"
                                        value={formData.likes_count}
                                        onChange={handleChange}
                                        min={0}
                                        placeholder="0"
                                    />
                                    <span>Likes</span>
                                </div>

                                <div className="metric-input">
                                    <MessageCircle size={18} />
                                    <input
                                        type="number"
                                        name="comments_count"
                                        value={formData.comments_count}
                                        onChange={handleChange}
                                        min={0}
                                        placeholder="0"
                                    />
                                    <span>Comments</span>
                                </div>

                                <div className="metric-input">
                                    <Share2 size={18} />
                                    <input
                                        type="number"
                                        name="shares_count"
                                        value={formData.shares_count}
                                        onChange={handleChange}
                                        min={0}
                                        placeholder="0"
                                    />
                                    <span>Shares</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitting || !selectedBid}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Submit Proof
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
