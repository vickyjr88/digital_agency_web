
import { useState, useEffect } from 'react';
import { walletApi } from '../../services/marketplaceApi';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';

export default function AdminWalletTransactions() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [pagination.page, typeFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };
            if (typeFilter) params.type = typeFilter;

            const response = await walletApi.getAllTransactionsAdmin(params);

            // Backend returns { transactions: [], pagination: {} }
            if (response.transactions) {
                setTransactions(response.transactions);
                setPagination(response.pagination);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching wallet transactions:', error);
            // toast.error('Failed to load transactions'); // Squelch generic error if unrelated
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount / 100);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} /> Completed</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> Failed</span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} /> Pending</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'deposit': return <span className="text-green-600 flex items-center gap-1"><ArrowDownLeft size={14} /> Deposit</span>;
            case 'withdrawal': return <span className="text-red-600 flex items-center gap-1"><ArrowUpRight size={14} /> Withdrawal</span>;
            case 'payment': return <span className="text-blue-600 flex items-center gap-1"><ArrowUpRight size={14} /> Payment</span>;
            case 'escrow_release': return <span className="text-purple-600 flex items-center gap-1"><CheckCircle size={14} /> Release</span>;
            case 'refund': return <span className="text-orange-600 flex items-center gap-1"><RefreshCcw size={14} /> Refund</span>;
            default: return <span className="text-gray-600 capitalize">{type?.replace('_', ' ')}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Wallet Transactions</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor all wallet deposits, withdrawals, and payments</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPagination(p => ({ ...p, page: 1 }));
                        }}
                    >
                        <option value="">All Types</option>
                        <option value="deposit">Deposits</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="payment">Payments</option>
                        <option value="escrow_release">Escrow Releases</option>
                        <option value="refund">Refunds</option>
                    </select>
                    <button
                        onClick={() => fetchTransactions()}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <Clock size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                        </div>
                                        <p className="text-sm text-gray-500">Loading transactions...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No wallet transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {formatDate(tx.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[200px]">
                                                <div className="text-sm font-medium text-gray-900 truncate">{tx.user_name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500 truncate">{tx.user_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {getTypeIcon(tx.transaction_type)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[250px] truncate" title={tx.description}>
                                            {tx.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {formatAmount(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                disabled={pagination.page === 1 || loading}
                                className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.total_pages, p.page + 1) }))}
                                disabled={pagination.page === pagination.total_pages || loading}
                                className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
