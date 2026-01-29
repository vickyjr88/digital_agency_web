/**
 * Admin Withdrawal Management Page
 * Allows admins to view and process pending withdrawals
 */

import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    ArrowUpRight, Clock, CheckCircle, XCircle, DollarSign,
    User, Phone, CreditCard, Building, RefreshCw, Loader2,
    AlertCircle, Eye, X, Send, Ban, Filter, TrendingUp
} from 'lucide-react';
import './AdminWithdrawals.css';

const METHOD_LABELS = {
    mpesa: 'M-Pesa',
    airtel_money: 'Airtel Money',
    bank_transfer: 'Bank Transfer'
};

export default function AdminWithdrawals() {
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processModal, setProcessModal] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData();
    }, [activeTab, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, withdrawalsRes] = await Promise.all([
                api.getWithdrawalStats(),
                activeTab === 'pending'
                    ? api.getPendingWithdrawals({ page, limit: 20 })
                    : api.getWithdrawalHistory({ page, limit: 20 })
            ]);

            setStats(statsRes);
            setWithdrawals(withdrawalsRes.withdrawals || []);
            setTotalPages(withdrawalsRes.pages || 1);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load withdrawals');
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (method) => {
        if (!selectedWithdrawal) return;

        setProcessing(true);
        try {
            const response = await api.processWithdrawal(selectedWithdrawal.id, {
                method,
                admin_notes: adminNotes || undefined
            });
            toast.success(response.message || 'Withdrawal processed');
            setProcessModal(null);
            setSelectedWithdrawal(null);
            setAdminNotes('');
            fetchData();
        } catch (error) {
            console.error('Error processing:', error);
            toast.error(error.message || 'Failed to process');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedWithdrawal || !rejectionReason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        setProcessing(true);
        try {
            await api.rejectWithdrawal(selectedWithdrawal.id, rejectionReason);
            toast.success('Withdrawal rejected');
            setProcessModal(null);
            setSelectedWithdrawal(null);
            setRejectionReason('');
            fetchData();
        } catch (error) {
            console.error('Error rejecting:', error);
            toast.error(error.message || 'Failed to reject');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format((amount || 0) / 100);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-KE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { className: 'status-pending', icon: Clock, label: 'Pending' },
            success: { className: 'status-success', icon: CheckCircle, label: 'Completed' },
            failed: { className: 'status-failed', icon: XCircle, label: 'Rejected' }
        };
        return config[status] || config.pending;
    };

    return (
        <div className="admin-withdrawals">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <ArrowUpRight size={28} />
                        Withdrawal Management
                    </h1>
                    <p>Process and manage user withdrawal requests</p>
                </div>
                <button className="btn-secondary" onClick={fetchData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card pending">
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value">{stats.pending?.count || 0}</span>
                            <span className="stat-amount">{formatCurrency(stats.pending?.total_amount)}</span>
                        </div>
                    </div>
                    <div className="stat-card month">
                        <div className="stat-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">This Month</span>
                            <span className="stat-value">{stats.completed_this_month?.count || 0}</span>
                            <span className="stat-amount">{formatCurrency(stats.completed_this_month?.total_amount)}</span>
                        </div>
                    </div>
                    <div className="stat-card total">
                        <div className="stat-icon">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Processed</span>
                            <span className="stat-value">{stats.total_completed?.count || 0}</span>
                            <span className="stat-amount">{formatCurrency(stats.total_completed?.total_amount)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs-bar">
                <button
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('pending'); setPage(1); }}
                >
                    <Clock size={16} />
                    Pending
                    {stats?.pending?.count > 0 && (
                        <span className="badge">{stats.pending.count}</span>
                    )}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('history'); setPage(1); }}
                >
                    <Filter size={16} />
                    All History
                </button>
            </div>

            {/* Withdrawals List */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading withdrawals...</p>
                </div>
            ) : withdrawals.length === 0 ? (
                <div className="empty-state">
                    <CheckCircle size={48} className="icon success" />
                    <h2>No Pending Withdrawals</h2>
                    <p>All withdrawal requests have been processed.</p>
                </div>
            ) : (
                <div className="withdrawals-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.map(w => {
                                const statusConfig = getStatusBadge(w.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <tr key={w.id}>
                                        <td className="user-cell">
                                            <div className="user-avatar">
                                                {w.user?.name?.[0] || 'U'}
                                            </div>
                                            <div className="user-info">
                                                <span className="name">{w.user?.name || 'Unknown'}</span>
                                                <span className="email">{w.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="amount-cell">
                                            <span className="amount">{formatCurrency(w.net_amount)}</span>
                                            {w.fee > 0 && (
                                                <span className="fee">Fee: {formatCurrency(w.fee)}</span>
                                            )}
                                        </td>
                                        <td className="method-cell">
                                            {w.payment_method ? (
                                                <div className="method-info">
                                                    <span className="method-type">
                                                        {METHOD_LABELS[w.payment_method?.type] || w.payment_method?.type || w.payment_method}
                                                    </span>
                                                    {w.payment_method?.phone_number && (
                                                        <span className="method-detail">{w.payment_method.phone_number}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="no-method">No method set</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${statusConfig.className}`}>
                                                <StatusIcon size={14} />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="date-cell">{formatDate(w.created_at)}</td>
                                        <td className="actions-cell">
                                            {w.status === 'pending' ? (
                                                <>
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => {
                                                            setSelectedWithdrawal(w);
                                                            setProcessModal('process');
                                                        }}
                                                        title="Process"
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn reject"
                                                        onClick={() => {
                                                            setSelectedWithdrawal(w);
                                                            setProcessModal('reject');
                                                        }}
                                                        title="Reject"
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => setSelectedWithdrawal(w)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Process Modal */}
            {processModal === 'process' && selectedWithdrawal && (
                <div className="modal-overlay" onClick={() => setProcessModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header process">
                            <Send size={24} />
                            <h2>Process Withdrawal</h2>
                        </div>
                        <div className="modal-body">
                            <div className="withdrawal-summary">
                                <div className="summary-row">
                                    <span>User:</span>
                                    <strong>{selectedWithdrawal.user?.name}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Amount:</span>
                                    <strong className="amount">{formatCurrency(selectedWithdrawal.net_amount)}</strong>
                                </div>
                                {selectedWithdrawal.payment_method && (
                                    <div className="summary-row">
                                        <span>Send to:</span>
                                        <strong>
                                            {METHOD_LABELS[selectedWithdrawal.payment_method?.type] || 'Unknown'} - {selectedWithdrawal.payment_method?.phone_number || selectedWithdrawal.payment_method?.account_number}
                                        </strong>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Admin Notes (Optional)</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add any notes about this transaction..."
                                    rows={3}
                                />
                            </div>

                            <div className="process-options">
                                <p className="hint">Choose how to process this withdrawal:</p>
                                <div className="options-grid">
                                    <button
                                        className="option-btn paystack"
                                        onClick={() => handleProcess('paystack')}
                                        disabled={processing || !selectedWithdrawal.payment_method}
                                    >
                                        {processing ? <Loader2 className="spin" size={20} /> : <CreditCard size={20} />}
                                        <span>Via Paystack</span>
                                        <small>Automated transfer</small>
                                    </button>
                                    <button
                                        className="option-btn manual"
                                        onClick={() => handleProcess('manual')}
                                        disabled={processing}
                                    >
                                        {processing ? <Loader2 className="spin" size={20} /> : <DollarSign size={20} />}
                                        <span>Manual Transfer</span>
                                        <small>Mark as completed</small>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setProcessModal(null)}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {processModal === 'reject' && selectedWithdrawal && (
                <div className="modal-overlay" onClick={() => setProcessModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header reject">
                            <Ban size={24} />
                            <h2>Reject Withdrawal</h2>
                        </div>
                        <div className="modal-body">
                            <div className="withdrawal-summary">
                                <div className="summary-row">
                                    <span>User:</span>
                                    <strong>{selectedWithdrawal.user?.name}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Amount:</span>
                                    <strong>{formatCurrency(selectedWithdrawal.net_amount)}</strong>
                                </div>
                            </div>

                            <div className="alert-box warning">
                                <AlertCircle size={18} />
                                <p>The withdrawal amount will be returned to the user's available balance.</p>
                            </div>

                            <div className="form-group">
                                <label>Rejection Reason *</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this withdrawal is being rejected..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setProcessModal(null)}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-reject"
                                onClick={handleReject}
                                disabled={processing || !rejectionReason.trim()}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="spin" size={18} />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <Ban size={18} />
                                        Reject Withdrawal
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
