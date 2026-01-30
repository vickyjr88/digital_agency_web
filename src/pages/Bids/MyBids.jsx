/**
 * My Bids Page
 * Shows all bids placed by the influencer on open campaigns
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidApi } from '../../services/marketplaceApi';
import {
    Target, Clock, CheckCircle, XCircle, Loader2,
    DollarSign, Calendar, Package, ArrowRight, Filter
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
    accepted: { label: 'Accepted', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
    withdrawn: { label: 'Withdrawn', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle },
};

export default function MyBids() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState([]);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
    });

    useEffect(() => {
        fetchBids();
    }, []);

    const fetchBids = async () => {
        setLoading(true);
        try {
            const response = await bidApi.getMyBids({ limit: 100 });
            const allBids = response.bids || [];
            setBids(allBids);

            // Calculate stats
            setStats({
                total: allBids.length,
                pending: allBids.filter(b => b.status === 'pending').length,
                accepted: allBids.filter(b => b.status === 'accepted').length,
                rejected: allBids.filter(b => b.status === 'rejected').length,
            });
        } catch (error) {
            console.error('Error fetching bids:', error);
            toast.error('Failed to load bids');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (bidId) => {
        if (!confirm('Are you sure you want to withdraw this bid?')) return;

        try {
            await bidApi.withdraw(bidId);
            toast.success('Bid withdrawn successfully');
            fetchBids();
        } catch (error) {
            console.error('Error withdrawing bid:', error);
            toast.error('Failed to withdraw bid');
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

    const getFilteredBids = () => {
        if (filter === 'all') return bids;
        return bids.filter(b => b.status === filter);
    };

    const filteredBids = getFilteredBids();

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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
                <p className="text-gray-500 mt-1">Track your campaign proposals and their status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Total Bids</span>
                        <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Pending</span>
                        <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Accepted</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.accepted}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Rejected</span>
                        <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    {['all', 'pending', 'accepted', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bids List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredBids.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bids found</h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all'
                                ? "You haven't placed any bids yet. Browse open campaigns to get started!"
                                : `No ${filter} bids at the moment`
                            }
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => navigate('/marketplace?view=campaigns')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Browse Campaigns
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredBids.map((bid) => {
                            const statusConfig = STATUS_CONFIG[bid.status] || STATUS_CONFIG.pending;
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={bid.id}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 mb-2">
                                                <h3
                                                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/campaigns/${bid.campaign_id}`)}
                                                >
                                                    {bid.campaign?.title || 'Campaign'}
                                                </h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} whitespace-nowrap flex items-center gap-1`}>
                                                    <StatusIcon size={12} />
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            {bid.proposal && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {bid.proposal}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                {bid.package && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Package className="w-4 h-4" />
                                                        <span>{bid.package.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="capitalize">{bid.platform}</span>
                                                    {bid.content_type && <span>• {bid.content_type}</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{bid.timeline_days} days</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">
                                                        Submitted {formatDate(bid.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-right mr-4">
                                                <p className="text-sm text-gray-500 mb-1">Bid Amount</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    {formatPrice(bid.amount)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/campaigns/${bid.campaign_id}`)}
                                                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                                            >
                                                View
                                            </button>

                                            {bid.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/campaigns/${bid.campaign_id}?edit_bid=${bid.id}`)}
                                                        className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleWithdraw(bid.id)}
                                                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        Withdraw
                                                    </button>
                                                </>
                                            )}
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
