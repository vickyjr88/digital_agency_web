/**
 * Brand Dashboard
 * Campaign management dashboard for brands
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { campaignApi, walletApi, notificationApi } from '../../services/marketplaceApi';
import './BrandDashboard.css';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#f59e0b', icon: '⏳' },
    accepted: { label: 'Accepted', color: '#3b82f6', icon: '✓' },
    rejected: { label: 'Rejected', color: '#ef4444', icon: '✗' },
    in_progress: { label: 'In Progress', color: '#8b5cf6', icon: '🔄' },
    draft_submitted: { label: 'Review Needed', color: '#667eea', icon: '👀' },
    revision_requested: { label: 'Revision Sent', color: '#f59e0b', icon: '🔄' },
    draft_approved: { label: 'Approved', color: '#10b981', icon: '✅' },
    published: { label: 'Published', color: '#059669', icon: '📢' },
    completed: { label: 'Completed', color: '#10b981', icon: '🎉' },
    disputed: { label: 'Disputed', color: '#ef4444', icon: '⚠️' },
    cancelled: { label: 'Cancelled', color: '#6b7280', icon: '❌' },
};

export default function BrandDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending_review: 0,
        completed: 0,
        total_spent: 0,
    });
    const [activeTab, setActiveTab] = useState('all');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, walletRes, notificationsRes] = await Promise.all([
                campaignApi.getAll({ role: 'brand', limit: 50 }),
                walletApi.getBalance().catch(() => null),
                notificationApi.getAll({ limit: 10, unread_only: true }).catch(() => ({ notifications: [] })),
            ]);

            const allCampaigns = campaignsRes.campaigns || [];
            setCampaigns(allCampaigns);
            setWallet(walletRes);
            setNotifications(notificationsRes.notifications || []);

            // Calculate stats
            setStats({
                total: allCampaigns.length,
                active: allCampaigns.filter(c =>
                    ['accepted', 'in_progress', 'draft_submitted', 'revision_requested', 'draft_approved'].includes(c.status)
                ).length,
                pending_review: allCampaigns.filter(c => c.status === 'draft_submitted').length,
                completed: allCampaigns.filter(c => c.status === 'completed').length,
                total_spent: allCampaigns
                    .filter(c => c.status === 'completed')
                    .reduce((sum, c) => sum + (c.package?.price || 0), 0),
            });
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
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getFilteredCampaigns = () => {
        if (filter === 'all') return campaigns;
        if (filter === 'active') {
            return campaigns.filter(c =>
                ['accepted', 'in_progress', 'draft_submitted', 'revision_requested', 'draft_approved'].includes(c.status)
            );
        }
        if (filter === 'review') {
            return campaigns.filter(c => c.status === 'draft_submitted');
        }
        if (filter === 'completed') {
            return campaigns.filter(c => c.status === 'completed');
        }
        if (filter === 'disputed') {
            return campaigns.filter(c => c.status === 'disputed');
        }
        return campaigns;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="brand-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>🎯 Brand Dashboard</h1>
                    <p>Manage your influencer campaigns</p>
                </div>
                <div className="header-actions">
                    <Link to="/marketplace" className="btn-primary">
                        🔍 Find Influencers
                    </Link>
                    <Link to="/wallet" className="btn-secondary">
                        💳 Wallet ({formatPrice((wallet?.balance || 0) - (wallet?.hold_balance || 0))})
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">📊</span>
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Campaigns</span>
                    </div>
                </div>
                <div className="stat-card active">
                    <span className="stat-icon">🔥</span>
                    <div className="stat-content">
                        <span className="stat-value">{stats.active}</span>
                        <span className="stat-label">Active Campaigns</span>
                    </div>
                </div>
                <div className="stat-card review">
                    <span className="stat-icon">👀</span>
                    <div className="stat-content">
                        <span className="stat-value">{stats.pending_review}</span>
                        <span className="stat-label">Pending Review</span>
                    </div>
                    {stats.pending_review > 0 && (
                        <span className="stat-badge">Action Required</span>
                    )}
                </div>
                <div className="stat-card completed">
                    <span className="stat-icon">✅</span>
                    <div className="stat-content">
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="stat-card spent">
                    <span className="stat-icon">💰</span>
                    <div className="stat-content">
                        <span className="stat-value">{formatPrice(stats.total_spent)}</span>
                        <span className="stat-label">Total Spent</span>
                    </div>
                </div>
            </div>

            {/* Notifications Banner */}
            {notifications.length > 0 && (
                <div className="notifications-banner">
                    <div className="banner-content">
                        <span className="icon">🔔</span>
                        <span>You have {notifications.length} unread notification{notifications.length > 1 ? 's' : ''}</span>
                    </div>
                    <Link to="/notifications" className="view-all">View All →</Link>
                </div>
            )}

            {/* Campaigns Section */}
            <div className="campaigns-section">
                <div className="section-header">
                    <h2>📋 Your Campaigns</h2>
                    <div className="filter-pills">
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            All ({campaigns.length})
                        </button>
                        <button
                            className={filter === 'active' ? 'active' : ''}
                            onClick={() => setFilter('active')}
                        >
                            Active ({stats.active})
                        </button>
                        <button
                            className={filter === 'review' ? 'active' : ''}
                            onClick={() => setFilter('review')}
                        >
                            Review ({stats.pending_review})
                        </button>
                        <button
                            className={filter === 'completed' ? 'active' : ''}
                            onClick={() => setFilter('completed')}
                        >
                            Completed ({stats.completed})
                        </button>
                    </div>
                </div>

                {getFilteredCampaigns().length > 0 ? (
                    <div className="campaigns-list">
                        {getFilteredCampaigns().map(campaign => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                formatPrice={formatPrice}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="icon">🎯</span>
                        <h3>No campaigns yet</h3>
                        <p>Find influencers and start your first campaign!</p>
                        <Link to="/marketplace" className="btn-primary">
                            Browse Influencers →
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>⚡ Quick Actions</h3>
                <div className="actions-grid">
                    <Link to="/marketplace" className="action-card">
                        <span className="action-icon">🔍</span>
                        <span className="action-label">Find Influencers</span>
                    </Link>
                    <Link to="/wallet" className="action-card">
                        <span className="action-icon">💳</span>
                        <span className="action-label">Manage Wallet</span>
                    </Link>
                    <Link to="/campaigns?filter=review" className="action-card">
                        <span className="action-icon">👀</span>
                        <span className="action-label">Review Submissions</span>
                    </Link>
                    <Link to="/notifications" className="action-card">
                        <span className="action-icon">🔔</span>
                        <span className="action-label">Notifications</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Campaign Card Component
function CampaignCard({ campaign, formatPrice, formatDate }) {
    const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.pending;
    const needsAction = campaign.status === 'draft_submitted';

    return (
        <Link to={`/campaigns/${campaign.id}`} className={`campaign-card ${needsAction ? 'needs-action' : ''}`}>
            <div className="card-header">
                <div className="influencer-info">
                    <div className="influencer-avatar">
                        {campaign.influencer?.display_name?.charAt(0) || 'I'}
                    </div>
                    <div className="influencer-details">
                        <span className="influencer-name">{campaign.influencer?.display_name || 'Influencer'}</span>
                        <span className="package-name">{campaign.package?.name || 'Package'}</span>
                    </div>
                </div>
                <span
                    className="status-badge"
                    style={{
                        backgroundColor: `${statusConfig.color}20`,
                        color: statusConfig.color
                    }}
                >
                    {statusConfig.icon} {statusConfig.label}
                </span>
            </div>

            <div className="card-meta">
                <div className="meta-item">
                    <span className="icon">📅</span>
                    <span>Created {formatDate(campaign.created_at)}</span>
                </div>
                {campaign.deadline && (
                    <div className="meta-item">
                        <span className="icon">⏰</span>
                        <span>Due {formatDate(campaign.deadline)}</span>
                    </div>
                )}
                <div className="meta-item price">
                    <span className="icon">💰</span>
                    <span>{formatPrice(campaign.package?.price || 0)}</span>
                </div>
            </div>

            {needsAction && (
                <div className="action-banner">
                    <span className="icon">👀</span>
                    <span>Review Required - New deliverable submitted</span>
                </div>
            )}

            <div className="card-footer">
                <span className="view-link">View Details →</span>
            </div>
        </Link>
    );
}
