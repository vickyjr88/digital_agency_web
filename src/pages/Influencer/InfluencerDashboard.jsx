/**
 * Influencer Dashboard
 * Main dashboard for influencers to manage their profile, packages, and campaigns
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { influencerApi, packageApi, campaignApi, walletApi } from '../../services/marketplaceApi';
import InfluencerProfileSettings from './InfluencerProfileSettings';
import './InfluencerDashboard.css';

export default function InfluencerDashboard() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [packages, setPackages] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [activeTab, setActiveTab] = useState(
        location.pathname === '/influencer/profile' ? 'profile' :
            location.pathname === '/influencer/packages' ? 'packages' : 'overview'
    );
    const [welcomeMessage, setWelcomeMessage] = useState(location.state?.message || null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [profileRes, statsRes, packagesRes, campaignsRes, walletRes] = await Promise.all([
                influencerApi.getMyProfile().catch(() => null),
                influencerApi.getMyStats().catch(() => null),
                packageApi.getMine().catch(() => ({ packages: [] })),
                campaignApi.getAll({ role: 'influencer', limit: 5 }).catch(() => ({ campaigns: [] })),
                walletApi.getBalance().catch(() => null),
            ]);

            setProfile(profileRes);
            setStats(statsRes);
            setPackages(packagesRes || []);
            setCampaigns(campaignsRes.campaigns || []);
            setWallet(walletRes);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="no-profile">
                <div className="no-profile-content">
                    <span className="icon">👋</span>
                    <h2>Welcome to Dexter Marketplace</h2>
                    <p>Complete your influencer profile to start receiving campaign requests</p>
                    <Link to="/influencer/onboarding" className="btn-primary">
                        Complete Your Profile →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="influencer-dashboard">
            {/* Welcome Message */}
            {welcomeMessage && (
                <div className="welcome-toast" onClick={() => setWelcomeMessage(null)}>
                    <span>🎉</span> {welcomeMessage}
                    <button>&times;</button>
                </div>
            )}

            {/* Header */}
            <div className="dashboard-header">
                <div className="profile-summary">
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
                    <div className="info">
                        <h1>{profile.display_name}</h1>
                        <span className="niche">{profile.niche}</span>
                        <div className="rating">
                            <span className="stars">{'⭐'.repeat(Math.round(profile.rating || 0))}</span>
                            <span className="count">({profile.review_count || 0} reviews)</span>
                        </div>
                    </div>
                </div>

                <div className="quick-actions">
                    <Link to="/influencer/packages/new" className="btn-primary">
                        + New Package
                    </Link>
                    <Link to="/influencer/profile" className="btn-secondary">
                        Edit Profile
                    </Link>
                </div>
            </div>

            {/* Verification Banner */}
            {!profile.is_verified && (
                <div className="verification-banner">
                    <div className="banner-content">
                        <span className="icon">⏳</span>
                        <div>
                            <strong>Verification Pending</strong>
                            <p>Your profile is under review. You can still create packages and accept campaigns.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card earnings">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <span className="stat-label">Total Earnings</span>
                        <span className="stat-value">{formatPrice(wallet?.total_earned || 0)}</span>
                    </div>
                </div>
                <div className="stat-card balance">
                    <div className="stat-icon">💳</div>
                    <div className="stat-content">
                        <span className="stat-label">Available Balance</span>
                        <span className="stat-value">{formatPrice(wallet?.balance || 0)}</span>
                    </div>
                    <Link to="/wallet" className="stat-action">Manage →</Link>
                </div>
                <div className="stat-card campaigns">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <span className="stat-label">Completed Campaigns</span>
                        <span className="stat-value">{stats?.completed_campaigns || 0}</span>
                    </div>
                </div>
                <div className="stat-card packages">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <span className="stat-label">Active Packages</span>
                        <span className="stat-value">{packages.filter(p => p.status === 'active').length}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={activeTab === 'campaigns' ? 'active' : ''}
                    onClick={() => setActiveTab('campaigns')}
                >
                    🎯 Campaigns
                </button>
                <button
                    className={activeTab === 'packages' ? 'active' : ''}
                    onClick={() => setActiveTab('packages')}
                >
                    📦 Packages
                </button>
                <button
                    className={activeTab === 'profile' ? 'active' : ''}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 Profile Settings
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <OverviewTab
                        campaigns={campaigns}
                        packages={packages}
                        stats={stats}
                        formatPrice={formatPrice}
                    />
                )}
                {activeTab === 'campaigns' && (
                    <CampaignsTab
                        campaigns={campaigns}
                        formatPrice={formatPrice}
                    />
                )}
                {activeTab === 'packages' && (
                    <PackagesTab
                        packages={packages}
                        formatPrice={formatPrice}
                    />
                )}
                {activeTab === 'profile' && (
                    <InfluencerProfileSettings
                        profile={profile}
                        onUpdate={(updated) => setProfile(updated)}
                    />
                )}
            </div>
        </div>
    );
}

// Overview Tab
function OverviewTab({ campaigns, packages, stats, formatPrice }) {
    const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
    const activeCampaigns = campaigns.filter(c =>
        ['accepted', 'in_progress', 'draft_submitted', 'draft_approved'].includes(c.status)
    );

    return (
        <div className="overview-tab">
            {/* Pending Campaign Requests */}
            {pendingCampaigns.length > 0 && (
                <div className="section">
                    <h3>📬 Pending Requests ({pendingCampaigns.length})</h3>
                    <div className="campaign-list">
                        {pendingCampaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} formatPrice={formatPrice} />
                        ))}
                    </div>
                </div>
            )}

            {/* Active Campaigns */}
            {activeCampaigns.length > 0 && (
                <div className="section">
                    <h3>🔥 Active Campaigns ({activeCampaigns.length})</h3>
                    <div className="campaign-list">
                        {activeCampaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} formatPrice={formatPrice} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {campaigns.length === 0 && (
                <div className="empty-state">
                    <span className="icon">🎯</span>
                    {packages.length === 0 ? (
                        <>
                            <h3>No campaigns yet</h3>
                            <p>Create attractive packages and brands will start reaching out!</p>
                            <Link to="/influencer/packages/new" className="btn-primary">
                                Create Your First Package
                            </Link>
                        </>
                    ) : (
                        <>
                            <h3>Awaiting campaigns</h3>
                            <p>You have {packages.length} active service {packages.length === 1 ? 'package' : 'packages'}. Brands will reach out once they are interested in your profile.</p>
                        </>
                    )}
                </div>
            )}

            {/* Recent Performance */}
            {stats && (
                <div className="section">
                    <h3>📈 This Month's Performance</h3>
                    <div className="performance-grid">
                        <div className="perf-stat">
                            <span className="perf-value">{stats.views_this_month || 0}</span>
                            <span className="perf-label">Profile Views</span>
                        </div>
                        <div className="perf-stat">
                            <span className="perf-value">{stats.inquiries_this_month || 0}</span>
                            <span className="perf-label">Inquiries</span>
                        </div>
                        <div className="perf-stat">
                            <span className="perf-value">{formatPrice(stats.earnings_this_month || 0)}</span>
                            <span className="perf-label">Earnings</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Campaigns Tab
function CampaignsTab({ campaigns, formatPrice }) {
    const [filter, setFilter] = useState('all');

    const filteredCampaigns = filter === 'all'
        ? campaigns
        : campaigns.filter(c => c.status === filter);

    return (
        <div className="campaigns-tab">
            <div className="tab-header">
                <div className="filter-pills">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={filter === 'pending' ? 'active' : ''}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={filter === 'accepted' ? 'active' : ''}
                        onClick={() => setFilter('accepted')}
                    >
                        Active
                    </button>
                    <button
                        className={filter === 'completed' ? 'active' : ''}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {filteredCampaigns.length > 0 ? (
                <div className="campaign-list full">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} formatPrice={formatPrice} detailed />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <span className="icon">📭</span>
                    <p>No campaigns match this filter</p>
                </div>
            )}
        </div>
    );
}

// Packages Tab
function PackagesTab({ packages, formatPrice }) {
    return (
        <div className="packages-tab">
            <div className="tab-header">
                <Link to="/influencer/packages/new" className="btn-primary">
                    + Create Package
                </Link>
            </div>

            {packages.length > 0 ? (
                <div className="package-grid">
                    {packages.map(pkg => (
                        <PackageCard key={pkg.id} package={pkg} formatPrice={formatPrice} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <span className="icon">📦</span>
                    <h3>No packages yet</h3>
                    <p>Create packages to showcase your services to brands</p>
                    <Link to="/influencer/packages/new" className="btn-primary">
                        Create Your First Package
                    </Link>
                </div>
            )}
        </div>
    );
}

// Campaign Card Component
function CampaignCard({ campaign, formatPrice, detailed = false }) {
    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            accepted: '#3b82f6',
            in_progress: '#8b5cf6',
            draft_submitted: '#6366f1',
            draft_approved: '#10b981',
            published: '#059669',
            completed: '#10b981',
            disputed: '#ef4444',
            cancelled: '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    return (
        <Link to={`/campaigns/${campaign.id}`} className="campaign-card">
            <div className="campaign-header">
                <span
                    className="status-badge"
                    style={{ backgroundColor: `${getStatusColor(campaign.status)}20`, color: getStatusColor(campaign.status) }}
                >
                    {campaign.status.replace('_', ' ')}
                </span>
                {campaign.deadline && (
                    <span className="deadline">
                        Due: {new Date(campaign.deadline).toLocaleDateString()}
                    </span>
                )}
            </div>

            <h4>{campaign.package?.name || 'Campaign'}</h4>

            {detailed && campaign.brief && (
                <p className="brief">{campaign.brief.description?.substring(0, 100)}...</p>
            )}

            <div className="campaign-footer">
                <span className="price">{formatPrice(campaign.package?.price || 0)}</span>
                <span className="arrow">→</span>
            </div>
        </Link>
    );
}

// Package Card Component
function PackageCard({ package: pkg, formatPrice }) {
    return (
        <div className="package-card">
            <div className="package-header">
                <span className={`status ${pkg.status}`}>{pkg.status}</span>
                <span className="purchases">{pkg.times_purchased || 0} purchases</span>
            </div>

            <h4>{pkg.name}</h4>
            <p className="description">{pkg.description?.substring(0, 80)}...</p>

            <div className="package-meta">
                <span>{pkg.platform}</span>
                <span>{pkg.content_type}</span>
                <span>{pkg.timeline_days} days</span>
            </div>

            <div className="package-footer">
                <span className="price">{formatPrice(pkg.price)}</span>
                <Link to={`/influencer/packages/${pkg.id}/edit`} className="edit-btn">
                    Edit
                </Link>
            </div>
        </div>
    );
}
