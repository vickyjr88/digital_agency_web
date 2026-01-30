/**
 * Admin Bids Management
 * Comprehensive view of all bids and invites across the platform
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidApi } from '../../services/marketplaceApi';
import { toast } from 'sonner';
import {
    Search, Filter, TrendingUp, DollarSign, Calendar,
    User, Briefcase, CheckCircle, XCircle, Clock,
    Eye, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

export default function AdminBids() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedBid, setExpandedBid] = useState(null);

    useEffect(() => {
        fetchBids();
    }, []);

    const fetchBids = async () => {
        setLoading(true);
        try {
            // Fetch all bids (we'll need to add an admin endpoint for this)
            const data = await bidApi.getAll();
            setBids(data);
        } catch (error) {
            console.error('Error fetching bids:', error);
            toast.error('Failed to load bids');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bidId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change this bid status to "${newStatus}"?`)) {
            return;
        }

        try {
            await bidApi.updateStatusAdmin(bidId, newStatus);
            toast.success(`Bid status updated to ${newStatus}`);
            fetchBids(); // Refresh the list
        } catch (error) {
            console.error('Error updating bid status:', error);
            toast.error(error.message || 'Failed to update bid status');
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
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            withdrawn: 'bg-gray-100 text-gray-800'
        };
        return styles[status] || styles.pending;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'rejected':
                return <XCircle size={16} className="text-red-600" />;
            case 'withdrawn':
                return <AlertCircle size={16} className="text-gray-600" />;
            default:
                return <Clock size={16} className="text-yellow-600" />;
        }
    };

    // Filter bids
    const filteredBids = bids.filter(bid => {
        const matchesSearch =
            bid.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bid.influencer?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total: bids.length,
        pending: bids.filter(b => b.status === 'pending').length,
        accepted: bids.filter(b => b.status === 'accepted').length,
        rejected: bids.filter(b => b.status === 'rejected').length,
        totalValue: bids.reduce((sum, b) => sum + (b.amount || 0), 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bids...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bids & Invites Management</h1>
                <p className="text-gray-600">Monitor and manage all campaign bids across the platform</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Bids</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Briefcase className="text-indigo-600" size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <Clock className="text-yellow-600" size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Accepted</p>
                            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                        </div>
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                        <XCircle className="text-red-600" size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Value</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                        </div>
                        <DollarSign className="text-indigo-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by campaign or influencer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bids Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredBids.length === 0 ? (
                    <div className="text-center py-12">
                        <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">No bids found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Influencer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBids.map((bid) => (
                                    <>
                                        <tr key={bid.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Briefcase size={16} className="text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {bid.campaign?.title || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {bid.campaign_id?.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User size={16} className="text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {bid.influencer?.display_name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {bid.influencer?.niche || 'No niche'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(bid.amount)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {bid.timeline_days} days
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(bid.status)}`}>
                                                    {getStatusIcon(bid.status)}
                                                    {bid.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar size={14} className="mr-1" />
                                                    {formatDate(bid.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    {expandedBid === bid.id ? (
                                                        <>Hide <ChevronUp size={16} /></>
                                                    ) : (
                                                        <>View <ChevronDown size={16} /></>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedBid === bid.id && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Deliverables</h4>
                                                                <p className="text-sm text-gray-700">{bid.deliverables_description}</p>
                                                                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                                                                    <span>Platform: {bid.platform}</span>
                                                                    <span>Type: {bid.content_type}</span>
                                                                    <span>Count: {bid.deliverables_count}x</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Proposal</h4>
                                                                <p className="text-sm text-gray-700">{bid.proposal}</p>
                                                            </div>
                                                        </div>
                                                        {bid.package && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Package</h4>
                                                                <p className="text-sm text-gray-700">{bid.package.name}</p>
                                                            </div>
                                                        )}

                                                        {/* Status Update Section */}
                                                        <div className="border-t border-gray-200 pt-4">
                                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h4>
                                                            <div className="flex gap-2">
                                                                {bid.status !== 'pending' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(bid.id, 'pending')}
                                                                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 text-sm font-medium flex items-center gap-1"
                                                                    >
                                                                        <Clock size={16} />
                                                                        Set to Pending
                                                                    </button>
                                                                )}
                                                                {bid.status !== 'accepted' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(bid.id, 'accepted')}
                                                                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm font-medium flex items-center gap-1"
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                        Accept Bid
                                                                    </button>
                                                                )}
                                                                {bid.status !== 'rejected' && (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(bid.id, 'rejected')}
                                                                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm font-medium flex items-center gap-1"
                                                                    >
                                                                        <XCircle size={16} />
                                                                        Reject Bid
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 border-t border-gray-200 pt-4">
                                                            <button
                                                                onClick={() => navigate(`/campaigns/${bid.campaign_id}`)}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                                                            >
                                                                View Campaign
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/influencer/${bid.influencer_id}`)}
                                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                                                            >
                                                                View Influencer
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
