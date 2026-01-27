import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Shield, Briefcase, Activity, CreditCard, Edit, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null); // Contains { user, transactions }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);

    // Edit form state
    const [selectedTier, setSelectedTier] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            // Use the new endpoint that returns user + transactions
            const result = await api.request(`/admin/users/${id}/transactions`);
            setData(result);
            setSelectedTier(result.user.subscription_tier || 'free');
            setSelectedStatus(result.user.subscription_status || 'active');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubscription = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await api.request(`/admin/users/${id}/subscription`, {
                method: 'PUT',
                body: JSON.stringify({
                    subscription_tier: selectedTier,
                    subscription_status: selectedStatus
                })
            });
            await fetchUserDetails(); // Refresh data
            setShowEditModal(false);
        } catch (err) {
            alert('Failed to update: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!data) return <div className="p-8 text-center">User not found</div>;

    const { user, transactions } = data;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl">
                                {user.name?.[0]}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <div className="flex items-center gap-4 mt-2 text-gray-500">
                                    <span className="flex items-center gap-1.5 text-sm">
                                        <Mail size={16} />
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <div className="flex gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {user.role || 'user'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 capitalize">
                                    {user.subscription_tier || 'Free'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} capitalize`}>
                                    {user.subscription_status || 'Inactive'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1"
                            >
                                <Edit size={14} /> Manage Subscription
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Transactions */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="text-indigo-600" />
                            Transaction History
                        </h2>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions?.map(tx => (
                                        <tr key={tx.id}>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {tx.plan ? `Subscription: ${tx.plan}` : 'Payment'}
                                                <div className="text-xs text-gray-400">{tx.payment_reference}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {tx.currency} {(tx.amount / 100).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-100 text-green-700' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!transactions || transactions.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 italic">
                                                No transactions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column: Other Info (Placeholder for now) */}
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-900 mb-2">Admin Actions</h3>
                            <p className="text-sm text-indigo-700 mb-4">
                                Use the "Manage Subscription" button above to fix user plan issues manually.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Subscription Modal */}
                <AnimatePresence>
                    {showEditModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
                            >
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>

                                <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Subscription</h2>

                                <form onSubmit={handleUpdateSubscription} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                                        <select
                                            value={selectedTier}
                                            onChange={(e) => setSelectedTier(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="free">Free</option>
                                            <option value="day_pass">Day Pass</option>
                                            <option value="starter">Starter</option>
                                            <option value="professional">Professional</option>
                                            <option value="agency">Agency</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="active">Active</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="expired">Expired</option>
                                            <option value="trial">Trial</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Note: Setting to 'Active' will unlock features.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {updating ? 'Updating...' : <><Check size={18} /> Update Plan</>}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
