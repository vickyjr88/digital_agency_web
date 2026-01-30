/**
 * Brand Dashboard
 * Campaign management dashboard for brands - Redesigned with light theme
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { campaignApi, walletApi, notificationApi } from '../../services/marketplaceApi';
import {
    Plus, Target, Clock, CheckCircle, TrendingUp,
    DollarSign, Calendar, Eye, MessageSquare, Filter,
    ArrowRight, Loader2
} from 'lucide-react';

const STATUS_CONFIG = {
    open: { label: 'Open', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '📢' },
    pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '⏳' },
    accepted: { label: 'Accepted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '✓' },
    in_progress: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🔄' },
    draft_submitted: { label: 'Review Needed', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '👀' },
    revision_requested: { label: 'Revision Sent', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🔄' },
    draft_approved: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
    published: { label: 'Published', color: 'bg-green-50 text-green-700 border-green-200', icon: '📢' },
    completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200', icon: '🎉' },
    disputed: { label: 'Disputed', color: 'bg-red-50 text-red-700 border-red-200', icon: '⚠️' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: '❌' },
};

export default function BrandDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending_review: 0,
        completed: 0,
        total_spent: 0,
    });
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, walletRes] = await Promise.all([
                campaignApi.getAll({ role: 'brand', limit: 50 }),
                walletApi.getBalance().catch(() => null),
            ]);

            const allCampaigns = campaignsRes.campaigns || [];
            setCampaigns(allCampaigns);
            setWallet(walletRes);

            // Calculate stats
            setStats({
                total: allCampaigns.length,
                active: allCampaigns.filter(c =>
                    ['accepted', 'in_progress', 'draft_submitted', 'revision_requested', 'draft_approved', 'open'].includes(c.status)
                ).length,
                pending_review: allCampaigns.filter(c => c.status === 'draft_submitted').length,
                completed: allCampaigns.filter(c => c.status === 'completed').length,
                total_spent: allCampaigns
                    .filter(c => c.status === 'completed')
                    .reduce((sum, c) => sum + (c.package?.price || c.budget || 0), 0),
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
        }).format((price || 0) / 100);
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
                ['accepted', 'in_progress', 'draft_submitted', 'revision_requested', 'draft_approved', 'open'].includes(c.status)
            );
        }
        if (filter === 'completed') {
            return campaigns.filter(c => c.status === 'completed');
        }
        return campaigns.filter(c => c.status === filter);
    };

    const filteredCampaigns = getFilteredCampaigns();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
                    <p className="text-gray-500 mt-1">Manage and track your influencer campaigns</p>
                </div>
                <button
                    onClick={() => navigate('/campaigns/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Plus size={18} />
                    New Campaign
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Total Campaigns</span>
                        <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Active</span>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Pending Review</span>
                        <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending_review}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Total Spent</span>
                        <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.total_spent)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    {['all', 'active', 'open', 'completed', 'pending'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredCampaigns.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all'
                                ? "Start your first campaign to connect with influencers"
                                : `No ${filter} campaigns at the moment`
                            }
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => navigate('/campaigns/create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                <Plus size={18} />
                                Create Campaign
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredCampaigns.map((campaign) => {
                            const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.pending;
                            return (
                                <div
                                    key={campaign.id}
                                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {campaign.title || 'Untitled Campaign'}
                                                </h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} whitespace-nowrap`}>
                                                    {statusConfig.icon} {statusConfig.label}
                                                </span>
                                            </div>

                                            {campaign.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {campaign.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                {campaign.influencer && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-medium text-gray-700">
                                                            {campaign.influencer.display_name}
                                                        </span>
                                                    </div>
                                                )}
                                                {campaign.deadline && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Due {formatDate(campaign.deadline)}</span>
                                                    </div>
                                                )}
                                                {campaign.platforms && campaign.platforms.length > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="capitalize">{campaign.platforms.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Budget</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatPrice(campaign.package?.price || campaign.budget || 0)}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
