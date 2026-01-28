/**
 * Influencer Profile Detail Page
 * Shows complete influencer profile with packages, reviews, and booking options
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { influencerApi, packageApi, reviewApi } from '../../services/marketplaceApi';
import './InfluencerProfile.css';

export default function InfluencerProfile() {
    const { influencerId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [packages, setPackages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('packages');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInfluencerData();
    }, [influencerId]);

    const fetchInfluencerData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [profileRes, packagesRes, reviewsRes] = await Promise.all([
                influencerApi.getProfile(influencerId),
                packageApi.getByInfluencer(influencerId),
                reviewApi.getByInfluencer(influencerId),
            ]);

            setProfile(profileRes);
            setPackages(packagesRes || []);
            setReviews(reviewsRes.reviews || []);
        } catch (err) {
            console.error('Error fetching influencer:', err);
            setError('Influencer not found');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(price || 0);
    };

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count?.toString() || '0';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="profile-error">
                <span className="error-icon">😔</span>
                <h2>Profile Not Found</h2>
                <p>This influencer profile doesn't exist or has been removed.</p>
                <Link to="/marketplace" className="btn-primary">← Back to Marketplace</Link>
            </div>
        );
    }

    const socialStats = [
        profile.instagram && { platform: 'Instagram', icon: '📸', handle: profile.instagram.handle, followers: profile.instagram.followers, engagement: profile.instagram.engagement_rate },
        profile.tiktok && { platform: 'TikTok', icon: '🎵', handle: profile.tiktok.handle, followers: profile.tiktok.followers, engagement: profile.tiktok.engagement_rate },
        profile.youtube && { platform: 'YouTube', icon: '▶️', handle: profile.youtube.channel, followers: profile.youtube.subscribers, engagement: null },
        profile.twitter && { platform: 'Twitter', icon: '🐦', handle: profile.twitter.handle, followers: profile.twitter.followers, engagement: null },
    ].filter(Boolean);

    const minPrice = packages.length ? Math.min(...packages.map(p => p.price)) : null;

    return (
        <div className="influencer-profile-page">
            {/* Back Navigation */}
            <div className="profile-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
            </div>

            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-cover">
                    {profile.cover_image_url ? (
                        <img src={profile.cover_image_url} alt="Cover" />
                    ) : (
                        <div className="cover-gradient"></div>
                    )}
                </div>

                <div className="profile-info">
                    <div className="avatar-section">
                        <div className="avatar">
                            {profile.profile_picture_url ? (
                                <img src={profile.profile_picture_url} alt={profile.display_name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profile.display_name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {profile.is_verified && <span className="verified-badge">✓</span>}
                        </div>
                    </div>

                    <div className="info-content">
                        <div className="name-row">
                            <h1>{profile.display_name}</h1>
                            {profile.is_verified && (
                                <span className="verified-label">Verified Creator</span>
                            )}
                        </div>

                        <div className="meta-row">
                            <span className="niche">{profile.niche}</span>
                            {profile.location && (
                                <span className="location">📍 {profile.location}</span>
                            )}
                        </div>

                        <div className="rating-row">
                            <div className="rating">
                                <span className="stars">
                                    {'⭐'.repeat(Math.round(profile.rating || 0))}
                                    {'☆'.repeat(5 - Math.round(profile.rating || 0))}
                                </span>
                                <span className="rating-value">{(profile.rating || 0).toFixed(1)}</span>
                                <span className="review-count">({profile.review_count || 0} reviews)</span>
                            </div>
                            {minPrice && (
                                <div className="starting-price">
                                    Starting from <strong>{formatPrice(minPrice)}</strong>
                                </div>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="bio">{profile.bio}</p>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button className="btn-primary">
                            💬 Contact
                        </button>
                        <button className="btn-secondary">
                            ❤️ Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Stats */}
            <div className="social-stats-section">
                <h3>Social Media Presence</h3>
                <div className="social-stats-grid">
                    {socialStats.map((stat, i) => (
                        <div key={i} className="social-stat-card">
                            <div className="stat-header">
                                <span className="platform-icon">{stat.icon}</span>
                                <span className="platform-name">{stat.platform}</span>
                                {stat.handle && (
                                    <span className="handle">@{stat.handle}</span>
                                )}
                            </div>
                            <div className="stat-body">
                                <div className="stat-item">
                                    <span className="stat-value">{formatFollowers(stat.followers)}</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                                {stat.engagement && (
                                    <div className="stat-item">
                                        <span className="stat-value">{stat.engagement}%</span>
                                        <span className="stat-label">Engagement</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                <button
                    className={activeTab === 'packages' ? 'active' : ''}
                    onClick={() => setActiveTab('packages')}
                >
                    📦 Packages ({packages.length})
                </button>
                <button
                    className={activeTab === 'reviews' ? 'active' : ''}
                    onClick={() => setActiveTab('reviews')}
                >
                    ⭐ Reviews ({reviews.length})
                </button>
                <button
                    className={activeTab === 'portfolio' ? 'active' : ''}
                    onClick={() => setActiveTab('portfolio')}
                >
                    🖼️ Portfolio
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'packages' && (
                    <PackagesSection
                        packages={packages}
                        formatPrice={formatPrice}
                        influencerName={profile.display_name}
                    />
                )}
                {activeTab === 'reviews' && (
                    <ReviewsSection
                        reviews={reviews}
                        rating={profile.rating}
                        reviewCount={profile.review_count}
                        formatDate={formatDate}
                    />
                )}
                {activeTab === 'portfolio' && (
                    <PortfolioSection portfolio={profile.portfolio || []} />
                )}
            </div>
        </div>
    );
}

// Packages Section
function PackagesSection({ packages, formatPrice, influencerName }) {
    if (packages.length === 0) {
        return (
            <div className="empty-section">
                <span>📦</span>
                <h3>No Packages Yet</h3>
                <p>{influencerName} hasn't listed any packages yet.</p>
            </div>
        );
    }

    return (
        <div className="packages-section">
            <div className="packages-grid">
                {packages.map(pkg => (
                    <Link to={`/marketplace/package/${pkg.id}`} key={pkg.id} className="package-card">
                        <div className="package-badge">
                            {pkg.is_featured && <span className="featured">⭐ Featured</span>}
                            <span className="platform">{pkg.platform}</span>
                        </div>

                        <h4>{pkg.name}</h4>
                        <p className="description">{pkg.description?.substring(0, 100)}...</p>

                        <div className="package-includes">
                            <span>📍 {pkg.content_type}</span>
                            <span>📦 {pkg.deliverables_count}x Deliverables</span>
                            <span>⏱️ {pkg.timeline_days} days delivery</span>
                            <span>🔄 {pkg.revisions_included} revisions</span>
                        </div>

                        <div className="package-footer">
                            <span className="price">{formatPrice(pkg.price)}</span>
                            <button className="book-btn">Book Now →</button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Reviews Section
function ReviewsSection({ reviews, rating, reviewCount, formatDate }) {
    if (reviews.length === 0) {
        return (
            <div className="empty-section">
                <span>⭐</span>
                <h3>No Reviews Yet</h3>
                <p>Be the first to work with this creator and leave a review!</p>
            </div>
        );
    }

    // Rating distribution
    const distribution = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: reviews.filter(r => Math.round(r.rating) === stars).length,
        percentage: (reviews.filter(r => Math.round(r.rating) === stars).length / reviews.length) * 100,
    }));

    return (
        <div className="reviews-section">
            {/* Rating Summary */}
            <div className="rating-summary">
                <div className="overall-rating">
                    <span className="big-rating">{(rating || 0).toFixed(1)}</span>
                    <div className="rating-stars">
                        {'⭐'.repeat(Math.round(rating || 0))}
                    </div>
                    <span className="total-reviews">{reviewCount} reviews</span>
                </div>

                <div className="rating-distribution">
                    {distribution.map(d => (
                        <div key={d.stars} className="distribution-row">
                            <span className="stars-label">{d.stars} ⭐</span>
                            <div className="bar-container">
                                <div className="bar" style={{ width: `${d.percentage}%` }}></div>
                            </div>
                            <span className="count">{d.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review List */}
            <div className="review-list">
                {reviews.map(review => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="reviewer-info">
                                <div className="reviewer-avatar">
                                    {review.reviewer_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <span className="reviewer-name">{review.reviewer_name || 'Anonymous'}</span>
                                    <span className="review-date">{formatDate(review.created_at)}</span>
                                </div>
                            </div>
                            <div className="review-rating">
                                {'⭐'.repeat(Math.round(review.rating))}
                            </div>
                        </div>

                        <p className="review-content">{review.content}</p>

                        {review.response && (
                            <div className="review-response">
                                <span className="response-label">↳ Response from creator:</span>
                                <p>{review.response}</p>
                            </div>
                        )}

                        {review.verified_purchase && (
                            <span className="verified-purchase">✓ Verified Purchase</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Portfolio Section
function PortfolioSection({ portfolio }) {
    if (!portfolio || portfolio.length === 0) {
        return (
            <div className="empty-section">
                <span>🖼️</span>
                <h3>No Portfolio Items</h3>
                <p>This creator hasn't added portfolio items yet.</p>
            </div>
        );
    }

    return (
        <div className="portfolio-section">
            <div className="portfolio-grid">
                {portfolio.map((item, i) => (
                    <div key={i} className="portfolio-item">
                        {item.type === 'image' ? (
                            <img src={item.url} alt={item.title || 'Portfolio item'} />
                        ) : item.type === 'video' ? (
                            <div className="video-thumbnail">
                                <img src={item.thumbnail_url} alt={item.title} />
                                <span className="play-icon">▶️</span>
                            </div>
                        ) : (
                            <div className="link-item">
                                <span className="link-icon">🔗</span>
                                <span>{item.title}</span>
                            </div>
                        )}
                        {item.title && <span className="item-title">{item.title}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}
