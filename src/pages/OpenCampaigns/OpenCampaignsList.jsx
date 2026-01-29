/**
 * Open Campaigns List
 * For influencers: Browse and bid on open campaigns
 * For brands: View their own campaigns
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    Search, Filter, Briefcase, DollarSign, Calendar,
    Users, ChevronRight, Plus, Clock, Target
} from 'lucide-react';
import './OpenCampaigns.css';

export default function OpenCampaignsList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        platform: '',
        minBudget: '',
        maxBudget: ''
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.platform) params.platform = filters.platform;
            if (filters.minBudget) params.min_budget = parseInt(filters.minBudget) * 100;
            if (filters.maxBudget) params.max_budget = parseInt(filters.maxBudget) * 100;

            const response = await api.getOpenCampaigns(params);
            setCampaigns(response.campaigns || []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
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
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPlatformBadges = (platforms) => {
        const platformColors = {
            instagram: 'bg-pink-100 text-pink-700',
            tiktok: 'bg-gray-800 text-white',
            youtube: 'bg-red-100 text-red-700',
            twitter: 'bg-blue-100 text-blue-700'
        };

        return platforms?.map(p => (
            <span key={p} className={`platform-badge ${platformColors[p] || 'bg-gray-100 text-gray-700'}`}>
                {p}
            </span>
        ));
    };

    return (
        <div className="open-campaigns-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <Target size={28} />
                        Campaigns
                    </h1>
                    <p>Browse open campaigns and submit your bids</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/campaigns/create')}>
                    <Plus size={18} />
                    Create Campaign
                </button>
            </div>

            {/* Search & Filters */}
            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={filters.platform}
                        onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                    >
                        <option value="">All Platforms</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter</option>
                    </select>
                </div>

                <button className="btn-secondary btn-sm" onClick={fetchCampaigns}>
                    <Filter size={16} />
                    Apply
                </button>
            </div>

            {/* Campaigns List */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading campaigns...</p>
                </div>
            ) : filteredCampaigns.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} className="icon" />
                    <h3>No Campaigns Found</h3>
                    <p>There are no open campaigns at the moment. Check back later!</p>
                </div>
            ) : (
                <div className="campaigns-grid">
                    {filteredCampaigns.map(campaign => (
                        <Link
                            key={campaign.id}
                            to={`/campaigns/open/${campaign.id}`}
                            className="campaign-card"
                        >
                            <div className="card-header">
                                <div className="brand-info">
                                    <div className="brand-avatar">
                                        {campaign.brand?.name?.[0] || 'B'}
                                    </div>
                                    <span className="brand-name">{campaign.brand?.name || 'Brand'}</span>
                                </div>
                                <span className={`status-badge ${campaign.status}`}>
                                    {campaign.status}
                                </span>
                            </div>

                            <h3 className="campaign-title">{campaign.title}</h3>
                            <p className="campaign-description">{campaign.description}</p>

                            <div className="platforms-row">
                                {getPlatformBadges(campaign.platforms)}
                            </div>

                            <div className="campaign-meta">
                                <div className="meta-item budget">
                                    <DollarSign size={16} />
                                    <span>{formatCurrency(campaign.budget)}</span>
                                </div>
                                {campaign.budget_remaining < campaign.budget && (
                                    <div className="meta-item remaining">
                                        <span className="label">Remaining:</span>
                                        <span>{formatCurrency(campaign.budget_remaining)}</span>
                                    </div>
                                )}
                                {campaign.deadline && (
                                    <div className="meta-item deadline">
                                        <Calendar size={16} />
                                        <span>{formatDate(campaign.deadline)}</span>
                                    </div>
                                )}
                                <div className="meta-item bids">
                                    <Users size={16} />
                                    <span>{campaign.bids_count || 0} bids</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="view-link">
                                    View Details <ChevronRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
