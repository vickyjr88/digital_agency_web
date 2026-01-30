/**
 * Admin Campaign Management
 * Full campaign management for admins with ability to update all aspects
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi } from '../../services/marketplaceApi';
import {
    Target, Edit, Trash2, UserX, CheckCircle, XCircle,
    Loader2, Search, Filter, Calendar, DollarSign, User,
    Package, AlertCircle, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = [
    'open', 'pending', 'accepted', 'in_progress', 'draft_submitted',
    'revision_requested', 'draft_approved', 'published', 'completed',
    'disputed', 'cancelled'
];

export default function AdminCampaigns() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await campaignApi.getAllAdmin();
            setCampaigns(response.campaigns || []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCampaign = (campaign) => {
        setEditingCampaign({
            id: campaign.id,
            title: campaign.title || '',
            description: campaign.description || '',
            budget: campaign.budget || 0,
            status: campaign.status || 'open',
            influencer_id: campaign.influencer_id || '',
            package_id: campaign.package_id || '',
            deadline: campaign.deadline ? new Date(campaign.deadline).toISOString().split('T')[0] : ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            await campaignApi.updateAdmin(editingCampaign.id, editingCampaign);
            toast.success('Campaign updated successfully');
            setShowEditModal(false);
            setEditingCampaign(null);
            fetchCampaigns();
        } catch (error) {
            console.error('Error updating campaign:', error);
            toast.error(error.message || 'Failed to update campaign');
        }
    };

    const handleDisassociateInfluencer = async (campaignId) => {
        if (!confirm('Are you sure you want to remove the influencer from this campaign?')) return;

        try {
            await campaignApi.disassociateInfluencer(campaignId);
            toast.success('Influencer removed from campaign');
            fetchCampaigns();
        } catch (error) {
            console.error('Error disassociating influencer:', error);
            toast.error('Failed to remove influencer');
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;

        try {
            await campaignApi.deleteAdmin(campaignId);
            toast.success('Campaign deleted');
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Failed to delete campaign');
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
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = !searchTerm ||
            campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.influencer?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
                <p className="text-gray-500 mt-1">Manage all campaigns across the platform</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns, brands, influencers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>
                                    {status.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span>Showing {filteredCampaigns.length} of {campaigns.length} campaigns</span>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Influencer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Budget
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Deadline
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCampaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No campaigns found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {campaign.title || 'Untitled Campaign'}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {campaign.id.substring(0, 8)}...
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                {campaign.brand?.name || campaign.brand_entity?.name || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-gray-900">
                                                    {campaign.influencer?.display_name || 'None'}
                                                </p>
                                                {campaign.influencer_id && (
                                                    <button
                                                        onClick={() => handleDisassociateInfluencer(campaign.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Remove influencer"
                                                    >
                                                        <UserX size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatPrice(campaign.budget || campaign.package?.price || 0)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                campaign.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    campaign.status === 'open' ? 'bg-purple-100 text-purple-800' :
                                                        campaign.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {campaign.status?.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {formatDate(campaign.deadline)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <Target size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditCampaign(campaign)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit campaign"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete campaign"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && editingCampaign && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                                <h3 className="text-xl font-bold text-gray-900">Edit Campaign</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editingCampaign.title}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={editingCampaign.description}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget (in cents)
                                    </label>
                                    <input
                                        type="number"
                                        value={editingCampaign.budget}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, budget: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatPrice(editingCampaign.budget)}
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={editingCampaign.status}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>
                                                {status.replace('_', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deadline
                                    </label>
                                    <input
                                        type="date"
                                        value={editingCampaign.deadline}
                                        onChange={(e) => setEditingCampaign({ ...editingCampaign, deadline: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Warning */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium">Admin Override</p>
                                        <p className="text-xs mt-1">
                                            Changes made here will override user-set values. Use with caution.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
