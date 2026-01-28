/**
 * Package Detail Page
 * Shows complete package information with booking functionality
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { packageApi, campaignApi, walletApi } from '../../services/marketplaceApi';
import { useAuth } from '../../context/AuthContext';
import './PackageDetail.css';

export default function PackageDetail() {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [pkg, setPkg] = useState(null);
    const [influencer, setInfluencer] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPackageData();
    }, [packageId]);

    const fetchPackageData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching package:', packageId);
            const response = await packageApi.getById(packageId);
            console.log('Package API Response:', response);

            if (!response) {
                throw new Error('Package not found');
            }

            setPkg(response);
            setInfluencer(response.influencer);

            // Fetch wallet balance if authenticated
            if (isAuthenticated) {
                const walletRes = await walletApi.getBalance().catch(() => null);
                setWallet(walletRes);
            }
        } catch (err) {
            console.error('Error fetching package:', err);
            setError(err.message || 'Package not found');
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

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count?.toString() || '0';
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            instagram: '📸',
            tiktok: '🎵',
            youtube: '▶️',
            twitter: '🐦',
            multi: '🌐',
        };
        return icons[platform?.toLowerCase()] || '📦';
    };

    if (loading) {
        return (
            <div className="package-loading">
                <div className="spinner"></div>
                <p>Loading package details...</p>
            </div>
        );
    }

    if (error || !pkg) {
        return (
            <div className="package-error">
                <span className="error-icon">📦</span>
                <h2>{error === 'Package not found' ? 'Package Not Found' : 'Error Loading Package'}</h2>
                <p>{error || "This package doesn't exist or has been removed."}</p>
                <div className="error-actions">
                    <Link to="/marketplace" className="btn-primary">← Back to Marketplace</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="package-detail-page">
            {/* Navigation */}
            <div className="page-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
            </div>

            <div className="package-content">
                {/* Main Content */}
                <div className="package-main">
                    {/* Package Header */}
                    <div className="package-header">
                        <div className="package-badges">
                            <span className="platform-badge">
                                {getPlatformIcon(pkg.platform)} {pkg.platform}
                            </span>
                            <span className="content-type-badge">{pkg.content_type}</span>
                            {pkg.is_featured && (
                                <span className="featured-badge">⭐ Featured</span>
                            )}
                        </div>

                        <h1>{pkg.name}</h1>

                        <div className="package-meta">
                            <div className="meta-item">
                                <span className="icon">📦</span>
                                <span>{pkg.deliverables_count} Deliverables</span>
                            </div>
                            <div className="meta-item">
                                <span className="icon">⏱️</span>
                                <span>{pkg.timeline_days} Days Delivery</span>
                            </div>
                            <div className="meta-item">
                                <span className="icon">🔄</span>
                                <span>{pkg.revisions_included} Revisions</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="package-section">
                        <h3>📝 Description</h3>
                        <p className="description">{pkg.description}</p>
                    </div>

                    {/* What's Included */}
                    <div className="package-section">
                        <h3>✅ What's Included</h3>
                        <ul className="includes-list">
                            {pkg.deliverables?.map((item, i) => (
                                <li key={i}>
                                    <span className="check">✓</span>
                                    {item}
                                </li>
                            )) || (
                                    <>
                                        <li><span className="check">✓</span> {pkg.deliverables_count}x {pkg.content_type}</li>
                                        <li><span className="check">✓</span> {pkg.revisions_included} revision rounds</li>
                                        <li><span className="check">✓</span> Delivery within {pkg.timeline_days} days</li>
                                    </>
                                )}
                        </ul>
                    </div>

                    {/* Requirements */}
                    {pkg.requirements && (
                        <div className="package-section">
                            <h3>📋 Requirements from You</h3>
                            <div className="requirements-list">
                                {pkg.requirements.brand_guidelines && (
                                    <div className="requirement-item">
                                        <span className="icon">📄</span>
                                        <span>Brand guidelines required for content creation</span>
                                    </div>
                                )}
                                {pkg.requirements.product_samples && (
                                    <div className="requirement-item">
                                        <span className="icon">📦</span>
                                        <span>Physical product samples must be provided</span>
                                    </div>
                                )}
                                {pkg.requirements.hashtags_required && pkg.requirements.hashtags_required.length > 0 && (
                                    <div className="requirement-item">
                                        <span className="icon">#️⃣</span>
                                        <span>Required Hashtags: {pkg.requirements.hashtags_required.join(', ')}</span>
                                    </div>
                                )}
                                {pkg.requirements.mentions_required && pkg.requirements.mentions_required.length > 0 && (
                                    <div className="requirement-item">
                                        <span className="icon">@</span>
                                        <span>Required Mentions: {pkg.requirements.mentions_required.join(', ')}</span>
                                    </div>
                                )}
                                <div className="requirement-item">
                                    <span className="icon">⚖️</span>
                                    <span>Content Rights: {pkg.requirements.content_rights === 'exclusive' ? 'Full Exclusive Rights' : 'Shared Usage Rights'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FAQ */}
                    {pkg.faq && pkg.faq.length > 0 && (
                        <div className="package-section">
                            <h3>❓ Frequently Asked Questions</h3>
                            <div className="faq-list">
                                {pkg.faq.map((item, i) => (
                                    <details key={i} className="faq-item">
                                        <summary>{item.question}</summary>
                                        <p>{item.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="package-sidebar">
                    {/* Price Card */}
                    <div className="price-card">
                        <div className="price-row">
                            <span className="price">{formatPrice(pkg.price)}</span>
                            {pkg.original_price && pkg.original_price > pkg.price && (
                                <span className="original-price">{formatPrice(pkg.original_price)}</span>
                            )}
                        </div>

                        <div className="delivery-info">
                            <span className="icon">⏱️</span>
                            <span>{pkg.timeline_days}-day delivery</span>
                        </div>

                        <button
                            className="btn-book"
                            onClick={() => setShowBookingModal(true)}
                        >
                            Book Now →
                        </button>

                        <button
                            className="btn-contact"
                            onClick={() => {
                                if (influencer?.contact_email) {
                                    window.location.href = `mailto:${influencer.contact_email}?subject=Inquiry about ${pkg.name}`;
                                } else {
                                    alert('Contact information not available');
                                }
                            }}
                        >
                            💬 Contact Influencer
                        </button>
                    </div>

                    {/* Influencer Card */}
                    {influencer && (
                        <Link to={`/marketplace/influencer/${influencer.id}`} className="influencer-card">
                            <div className="influencer-header">
                                <div className="avatar">
                                    {influencer.profile_picture_url ? (
                                        <img src={influencer.profile_picture_url} alt={influencer.display_name} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {influencer.display_name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {influencer.is_verified && <span className="verified">✓</span>}
                                </div>
                                <div className="info">
                                    <span className="name">{influencer.display_name}</span>
                                    <span className="niche">{influencer.niche}</span>
                                </div>
                            </div>

                            <div className="influencer-stats">
                                <div className="rating">
                                    <span className="stars">{'⭐'.repeat(Math.round(influencer.rating || 0))}</span>
                                    <span className="value">{(influencer.rating || 0).toFixed(1)}</span>
                                    <span className="count">({influencer.review_count || 0})</span>
                                </div>

                                {influencer.total_followers && (
                                    <div className="followers">
                                        <span className="icon">👥</span>
                                        <span>{formatFollowers(influencer.total_followers)} Total Followers</span>
                                    </div>
                                )}
                            </div>

                            <span className="view-profile">View Full Profile →</span>
                        </Link>
                    )}

                    {/* Stats Card */}
                    <div className="stats-card">
                        <div className="stat">
                            <span className="stat-value">{pkg.times_purchased || 0}</span>
                            <span className="stat-label">Times Purchased</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{pkg.avg_response_time || '< 1h'}</span>
                            <span className="stat-label">Avg. Response</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    pkg={pkg}
                    influencer={influencer}
                    wallet={wallet}
                    formatPrice={formatPrice}
                    onClose={() => setShowBookingModal(false)}
                    onSuccess={(campaignId) => navigate(`/campaigns/${campaignId}`)}
                />
            )}
        </div>
    );
}

// Booking Modal Component
function BookingModal({ pkg, influencer, wallet, formatPrice, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [briefData, setBriefData] = useState({
        brand_name: '',
        campaign_objective: '',
        target_audience: '',
        key_messages: '',
        content_guidelines: '',
        deadline: '',
        special_requirements: '',
    });

    const platformFee = pkg.price * 0.1; // 10% platform fee
    const totalAmount = pkg.price + platformFee;
    const availableBalance = (wallet?.balance || 0) - (wallet?.hold_balance || 0);
    const hasEnoughBalance = availableBalance >= totalAmount;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBriefData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!hasEnoughBalance) {
            setError(`Insufficient balance. You need ${formatPrice(totalAmount)} but only have ${formatPrice(availableBalance)}`);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await campaignApi.create({
                package_id: pkg.id,
                brief: briefData,
            });

            onSuccess(response.campaign_id);
        } catch (err) {
            setError(err.message || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📦 Book Package</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    {step === 1 && (
                        <div className="step-content">
                            <h3>Campaign Brief</h3>
                            <p className="step-description">Tell {influencer?.display_name} about your campaign</p>

                            <div className="form-group">
                                <label>Brand Name *</label>
                                <input
                                    type="text"
                                    name="brand_name"
                                    value={briefData.brand_name}
                                    onChange={handleChange}
                                    placeholder="Your brand or company name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Campaign Objective *</label>
                                <select
                                    name="campaign_objective"
                                    value={briefData.campaign_objective}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select objective</option>
                                    <option value="brand_awareness">Brand Awareness</option>
                                    <option value="product_launch">Product Launch</option>
                                    <option value="engagement">Increase Engagement</option>
                                    <option value="sales">Drive Sales</option>
                                    <option value="leads">Generate Leads</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Target Audience</label>
                                <input
                                    type="text"
                                    name="target_audience"
                                    value={briefData.target_audience}
                                    onChange={handleChange}
                                    placeholder="e.g. Women 25-34 in Kenya interested in fashion"
                                />
                            </div>

                            <div className="form-group">
                                <label>Key Messages</label>
                                <textarea
                                    name="key_messages"
                                    value={briefData.key_messages}
                                    onChange={handleChange}
                                    placeholder="What key points should be highlighted?"
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Content Guidelines</label>
                                <textarea
                                    name="content_guidelines"
                                    value={briefData.content_guidelines}
                                    onChange={handleChange}
                                    placeholder="Any specific dos and don'ts?"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Preferred Deadline</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={briefData.deadline}
                                        onChange={handleChange}
                                        min={new Date(Date.now() + pkg.timeline_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Special Requirements</label>
                                <textarea
                                    name="special_requirements"
                                    value={briefData.special_requirements}
                                    onChange={handleChange}
                                    placeholder="Any other details the influencer should know"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content">
                            <h3>Review & Pay</h3>
                            <p className="step-description">Confirm your order details</p>

                            <div className="order-summary">
                                <div className="order-item">
                                    <span className="item-name">{pkg.name}</span>
                                    <span className="item-price">{formatPrice(pkg.price)}</span>
                                </div>
                                <div className="order-item fee">
                                    <span className="item-name">Platform Fee (10%)</span>
                                    <span className="item-price">{formatPrice(platformFee)}</span>
                                </div>
                                <div className="order-divider"></div>
                                <div className="order-item total">
                                    <span className="item-name">Total</span>
                                    <span className="item-price">{formatPrice(totalAmount)}</span>
                                </div>
                            </div>

                            <div className="wallet-balance">
                                <div className="balance-row">
                                    <span>Your Wallet Balance</span>
                                    <span className={hasEnoughBalance ? 'sufficient' : 'insufficient'}>
                                        {formatPrice(availableBalance)}
                                    </span>
                                </div>
                                {!hasEnoughBalance && (
                                    <div className="balance-warning">
                                        <span>⚠️</span>
                                        <span>You need to deposit {formatPrice(totalAmount - availableBalance)} more</span>
                                        <Link to="/wallet" className="deposit-link">Deposit Now</Link>
                                    </div>
                                )}
                            </div>

                            <div className="escrow-info">
                                <span className="icon">🔒</span>
                                <div>
                                    <strong>Secure Escrow Payment</strong>
                                    <p>Your payment will be held securely until the work is completed and approved.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step === 1 ? (
                        <>
                            <button className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={() => setStep(2)}
                                disabled={!briefData.brand_name || !briefData.campaign_objective}
                            >
                                Continue to Payment →
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                            <button
                                className="btn-primary book"
                                onClick={handleSubmit}
                                disabled={loading || !hasEnoughBalance}
                            >
                                {loading ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
