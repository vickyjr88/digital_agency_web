/**
 * My Proof Submissions Page
 * Shows influencer's proof of work submissions and their status
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    ArrowLeft, Upload, Link, CheckCircle, Clock, XCircle,
    Eye, ExternalLink, Plus, RefreshCw
} from 'lucide-react';
import './ProofOfWork.css';

const STATUS_CONFIG = {
    pending: {
        label: 'Pending Review',
        icon: Clock,
        className: 'status-pending'
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle,
        className: 'status-approved'
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        className: 'status-rejected'
    },
    revision_requested: {
        label: 'Revision Requested',
        icon: RefreshCw,
        className: 'status-revision'
    }
};

export default function MySubmissions() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, [statusFilter]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const response = await api.getMyProofSubmissions(params);
            setSubmissions(response.submissions || []);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount / 100);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-KE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusConfig = (status) => {
        return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    };

    return (
        <div className="proof-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content">
                    <h1>
                        <Upload size={28} />
                        My Submissions
                    </h1>
                    <p>Track the status of your proof of work submissions</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/proof-of-work/submit')}>
                    <Plus size={18} />
                    New Submission
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <button
                    className={`filter-chip ${!statusFilter ? 'active' : ''}`}
                    onClick={() => setStatusFilter('')}
                >
                    All
                </button>
                <button
                    className={`filter-chip ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                >
                    <Clock size={14} />
                    Pending
                </button>
                <button
                    className={`filter-chip ${statusFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('approved')}
                >
                    <CheckCircle size={14} />
                    Approved
                </button>
                <button
                    className={`filter-chip ${statusFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('rejected')}
                >
                    <XCircle size={14} />
                    Rejected
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading submissions...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className="empty-state">
                    <Upload size={48} className="icon" />
                    <h2>No Submissions Yet</h2>
                    <p>Submit proof of work for your accepted campaigns to get paid.</p>
                    <button className="btn-primary" onClick={() => navigate('/proof-of-work/submit')}>
                        <Plus size={18} />
                        Submit Proof
                    </button>
                </div>
            ) : (
                <div className="submissions-list">
                    {submissions.map(submission => {
                        const statusConfig = getStatusConfig(submission.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div key={submission.id} className="submission-card">
                                <div className="submission-header">
                                    <div>
                                        <h3>{submission.title}</h3>
                                        <p className="campaign-name">{submission.campaign_title}</p>
                                    </div>
                                    <span className={`status-badge ${statusConfig.className}`}>
                                        <StatusIcon size={14} />
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="submission-details">
                                    <div className="detail-item">
                                        <label>Submitted:</label>
                                        <span>{formatDate(submission.submitted_at)}</span>
                                    </div>
                                    {submission.bid_amount && (
                                        <div className="detail-item">
                                            <label>Amount:</label>
                                            <span className="amount">{formatCurrency(submission.bid_amount)}</span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <label>Links:</label>
                                        <span>{submission.content_links?.length || 0} link(s)</span>
                                    </div>
                                </div>

                                {submission.content_links && submission.content_links.length > 0 && (
                                    <div className="content-links">
                                        {submission.content_links.slice(0, 2).map((link, i) => (
                                            <a
                                                key={i}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link-pill"
                                            >
                                                <ExternalLink size={14} />
                                                {new URL(link).hostname}
                                            </a>
                                        ))}
                                        {submission.content_links.length > 2 && (
                                            <span className="more-links">+{submission.content_links.length - 2} more</span>
                                        )}
                                    </div>
                                )}

                                {submission.status === 'approved' && (
                                    <div className="approved-banner">
                                        <CheckCircle size={16} />
                                        <span>Payment released to your wallet!</span>
                                    </div>
                                )}

                                {submission.status === 'rejected' && submission.rejection_reason && (
                                    <div className="rejection-banner">
                                        <XCircle size={16} />
                                        <span>{submission.rejection_reason}</span>
                                    </div>
                                )}

                                {submission.brand_notes && (
                                    <div className="brand-notes">
                                        <label>Brand Notes:</label>
                                        <p>{submission.brand_notes}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
