import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { influencerApi, packageApi, campaignApi } from '../../services/marketplaceApi';
import './Marketplace.css';

const PLATFORMS = [
    { value: '', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter/X' },
];

const SORT_OPTIONS = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'followers', label: 'Most Followers' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'latest', label: 'Newest First' },
];

export default function Marketplace() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState(searchParams.get('view') || 'influencers'); // influencers, packages, or campaigns
    const [loading, setLoading] = useState(true);
    const [influencers, setInfluencers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0 });

    // Filters
    const [filters, setFilters] = useState({
        query: searchParams.get('q') || '',
        platform: searchParams.get('platform') || '',
        niche: searchParams.get('niche') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        verifiedOnly: searchParams.get('verified') === 'true',
        sortBy: searchParams.get('sort') || 'rating',
    });

    useEffect(() => {
        fetchData();
    }, [viewMode, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                query: filters.query || undefined,
                platform: filters.platform || undefined,
                niche: filters.niche || undefined,
                min_price: filters.minPrice || undefined,
                max_price: filters.maxPrice || undefined,
                verified_only: filters.verifiedOnly || undefined,
                sort_by: filters.sortBy,
                page: pagination.page,
                limit: 20,
            };

            // Remove undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined) delete params[key];
            });

            if (viewMode === 'influencers') {
                const response = await influencerApi.search(params);
                setInfluencers(response.influencers || []);
                setPagination(response.pagination || { page: 1, total: 0 });
            } else if (viewMode === 'packages') {
                const response = await packageApi.browse(params);
                setPackages(response.packages || []);
                setPagination(response.pagination || { page: 1, total: 0 });
            } else if (viewMode === 'campaigns') {
                // Adjust sort for campaigns if needed
                if (params.sort_by === 'rating') params.sort_by = 'created_at'; // Campaigns don't usually have a rating to sort by yet
                const response = await campaignApi.getAll({ ...params, status: 'open' }); // Only show open campaigns
                setCampaigns(response.campaigns || []);
                setPagination(response.pagination || { page: 1, total: 0 });
            }
        } catch (error) {
            console.error('Error fetching marketplace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleViewChange = (mode) => {
        setViewMode(mode);
        // Update URL
        setSearchParams(prev => {
            prev.set('view', mode);
            return prev;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <div className="marketplace-page">
            <div className="marketplace-header">
                <div className="marketplace-title">
                    <h1>🎯 Marketplace</h1>
                    <p>Connect with the perfect partners for your next campaign</p>
                </div>

                {/* View Toggle */}
                <div className="view-toggle">
                    <button
                        className={viewMode === 'influencers' ? 'active' : ''}
                        onClick={() => handleViewChange('influencers')}
                    >
                        👤 Influencers
                    </button>
                    <button
                        className={viewMode === 'packages' ? 'active' : ''}
                        onClick={() => handleViewChange('packages')}
                    >
                        📦 Packages
                    </button>
                    <button
                        className={viewMode === 'campaigns' ? 'active' : ''}
                        onClick={() => handleViewChange('campaigns')}
                    >
                        📢 Campaigns
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="marketplace-filters">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder={`Search ${viewMode}...`}
                        value={filters.query}
                        onChange={(e) => handleFilterChange('query', e.target.value)}
                    />
                    <button type="submit">🔍 Search</button>
                </form>

                <div className="filter-row">
                    {viewMode !== 'campaigns' && (
                        <select
                            value={filters.platform}
                            onChange={(e) => handleFilterChange('platform', e.target.value)}
                        >
                            {PLATFORMS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    )}

                    <input
                        type="text"
                        placeholder={viewMode === 'campaigns' ? "Industry / Niche" : "Niche (e.g. Fashion)"}
                        value={filters.niche}
                        onChange={(e) => handleFilterChange('niche', e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />

                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        {SORT_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>

                    {viewMode === 'influencers' && (
                        <label className="verified-toggle">
                            <input
                                type="checkbox"
                                checked={filters.verifiedOnly}
                                onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                            />
                            Verified Only
                        </label>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="marketplace-results">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading results...</p>
                    </div>
                ) : viewMode === 'influencers' ? (
                    <>
                        <div className="results-header">
                            <span>{pagination.total} influencers found</span>
                        </div>
                        <div className="influencer-grid">
                            {influencers.map(influencer => (
                                <InfluencerCard
                                    key={influencer.id}
                                    influencer={influencer}
                                    formatFollowers={formatFollowers}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>
                    </>
                ) : viewMode === 'packages' ? (
                    <>
                        <div className="results-header">
                            <span>{pagination.total} packages found</span>
                        </div>
                        <div className="package-grid">
                            {packages.map(pkg => (
                                <PackageCard
                                    key={pkg.id}
                                    package={pkg}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="results-header">
                            <span>{pagination.total} open campaigns found</span>
                        </div>
                        <div className="campaign-grid">
                            {campaigns.map(campaign => (
                                <CampaignCard
                                    key={campaign.id}
                                    campaign={campaign}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="pagination">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                        >
                            Previous
                        </button>
                        <span>Page {pagination.page} of {pagination.total_pages}</span>
                        <button
                            disabled={pagination.page === pagination.total_pages}
                            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Influencer Card Component
function InfluencerCard({ influencer, formatFollowers, formatPrice }) {
    const getPrimaryStats = () => {
        const stats = [];
        if (influencer.instagram?.followers) {
            stats.push({ platform: 'Instagram', followers: influencer.instagram.followers, icon: '📸' });
        }
        if (influencer.tiktok?.followers) {
            stats.push({ platform: 'TikTok', followers: influencer.tiktok.followers, icon: '🎵' });
        }
        if (influencer.youtube?.followers) {
            stats.push({ platform: 'YouTube', followers: influencer.youtube.followers, icon: '▶️' });
        }
        if (influencer.twitter?.followers) {
            stats.push({ platform: 'Twitter', followers: influencer.twitter.followers, icon: '🐦' });
        }
        return stats.sort((a, b) => b.followers - a.followers);
    };

    const stats = getPrimaryStats();
    const minPrice = influencer.packages?.length
        ? Math.min(...influencer.packages.map(p => p.price))
        : null;

    return (
        <Link to={`/marketplace/influencer/${influencer.id}`} className="influencer-card">
            <div className="card-header">
                <div className="avatar">
                    {influencer.profile_picture_url ? (
                        <img src={influencer.profile_picture_url} alt={influencer.display_name} />
                    ) : (
                        <div className="avatar-placeholder">
                            {influencer.display_name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {influencer.is_verified && <span className="verified-badge">✓</span>}
                </div>
                <div className="info">
                    <h3>{influencer.display_name}</h3>
                    <span className="niche">{influencer.niche}</span>
                </div>
            </div>

            {influencer.bio && (
                <p className="bio">{influencer.bio.substring(0, 100)}...</p>
            )}

            <div className="stats-row">
                {stats.slice(0, 3).map((stat, i) => (
                    <div key={i} className="stat">
                        <span className="icon">{stat.icon}</span>
                        <span className="value">{formatFollowers(stat.followers)}</span>
                    </div>
                ))}
            </div>

            <div className="card-footer">
                <div className="rating">
                    <span className="stars">{'⭐'.repeat(Math.round(influencer.rating || 0))}</span>
                    <span className="count">({influencer.review_count || 0})</span>
                </div>
                {minPrice && (
                    <div className="price">
                        From {formatPrice(minPrice)}
                    </div>
                )}
            </div>
        </Link>
    );
}

// Package Card Component
function PackageCard({ package: pkg, formatPrice }) {
    const getPlatformIcon = (platform) => {
        const icons = {
            instagram: '📸',
            tiktok: '🎵',
            youtube: '▶️',
            twitter: '🐦',
            multi: '🌐',
        };
        return icons[platform] || '📦';
    };

    return (
        <Link to={`/marketplace/package/${pkg.id}`} className="package-card">
            <div className="package-header">
                <span className="platform-icon">{getPlatformIcon(pkg.platform)}</span>
                <span className="content-type">{pkg.content_type}</span>
            </div>

            <h3>{pkg.name}</h3>
            <p className="description">{pkg.description.substring(0, 120)}...</p>

            <div className="package-details">
                <div className="detail">
                    <span className="label">Deliverables</span>
                    <span className="value">{pkg.deliverables_count}x</span>
                </div>
                <div className="detail">
                    <span className="label">Timeline</span>
                    <span className="value">{pkg.timeline_days} days</span>
                </div>
                <div className="detail">
                    <span className="label">Revisions</span>
                    <span className="value">{pkg.revisions_included}x</span>
                </div>
            </div>

            {pkg.influencer && (
                <div className="influencer-preview">
                    <div className="mini-avatar">
                        {pkg.influencer.display_name?.charAt(0)}
                    </div>
                    <span>{pkg.influencer.display_name}</span>
                    {pkg.influencer.is_verified && <span className="verified">✓</span>}
                </div>
            )}

            <div className="package-footer">
                <div className="price">{formatPrice(pkg.price)}</div>
                <button className="view-btn">View Details →</button>
            </div>
        </Link>
    );
}

// Campaign Card Component
function CampaignCard({ campaign, formatPrice }) {
    return (
        <Link to={`/campaigns/${campaign.id}`} className="campaign-card">
            <div className="campaign-badge">
                {campaign.is_public ? 'Public' : 'Private'}
            </div>

            <div className="campaign-info">
                <h3>{campaign.title || "Untitled Campaign"}</h3>
                <div className="brand-info">
                    <span className="icon">🏢</span>
                    <span>{campaign.brand?.name || "Unknown Brand"}</span>
                </div>
            </div>

            <p className="description">{campaign.brief?.substring(0, 120)}...</p>

            <div className="campaign-meta">
                <div className="meta-item">
                    <span className="label">Budget</span>
                    <span className="value highlight">{formatPrice(campaign.budget || 0)}</span>
                </div>
                <div className="meta-item">
                    <span className="label">Platform</span>
                    <span className="value capital">{campaign.platform || 'Multi'}</span>
                </div>
            </div>

            <div className="campaign-footer">
                <span className="posted-date">Posted {new Date(campaign.created_at).toLocaleDateString()}</span>
                <button className="apply-btn">Apply Now →</button>
            </div>
        </Link>
    );
}
