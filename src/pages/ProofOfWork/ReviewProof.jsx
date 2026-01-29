/**
 * Review Proof of Work Page
 * Allows brands to review and approve/reject influencer submissions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    ArrowLeft, CheckCircle, XCircle, Clock, Eye, ExternalLink,
    Heart, MessageCircle, Share2, TrendingUp, AlertCircle,
    Loader2, RefreshCw
} from 'lucide-react';
import './ProofOfWork.css';

export default function ReviewProof() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [selectedProof, setSelectedProof] = useState(null);
    const [reviewing, setReviewing] = useState(false);
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        setLoading(true);
        try {
            const response = await api.getPendingProofReviews();
            setPendingReviews(response.pending_reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load pending reviews');
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleApprove = async (proofId) => {
        setReviewing(true);
        try {
            const response = await api.reviewProofOfWork(proofId, {
                approved: true,
                notes: reviewNotes || undefined
            });
            toast.success(`Approved! ${formatCurrency(response.released_amount)} released to influencer.`);
            setReviewModal(null);
            setReviewNotes('');
            fetchPendingReviews();
        } catch (error) {
            console.error('Error approving:', error);
            toast.error(error.message || 'Failed to approve');
        } finally {
            setReviewing(false);
        }
    };

    const handleReject = async (proofId) => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setReviewing(true);
        try {
            await api.reviewProofOfWork(proofId, {
                approved: false,
                notes: reviewNotes || undefined,
                rejection_reason: rejectionReason
            });
            toast.success('Proof rejected. Influencer has been notified.');
            setReviewModal(null);
            setReviewNotes('');
            setRejectionReason('');
            fetchPendingReviews();
        } catch (error) {
            console.error('Error rejecting:', error);
            toast.error(error.message || 'Failed to reject');
        } finally {
            setReviewing(false);
        }
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
                        <Clock size={28} />
                        Review Submissions
                    </h1>
                    <p>Review and approve proof of work from influencers</p>
                </div>
                <button className="btn-secondary" onClick={fetchPendingReviews}>
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading pending reviews...</p>
                </div>
            ) : pendingReviews.length === 0 ? (
                <div className="empty-state">
                    <CheckCircle size={48} className="icon success" />
                    <h2>All Caught Up!</h2>
                    <p>No pending proof of work submissions to review.</p>
                </div>
            ) : (
                <div className="reviews-grid">
                    {pendingReviews.map(proof => (
                        <div key={proof.id} className="review-card">
                            <div className="review-card-header">
                                <div>
                                    <h3>{proof.title}</h3>
                                    <p className="campaign-name">{proof.campaign_title}</p>
                                </div>
                                <span className="status-badge status-pending">
                                    <Clock size={14} />
                                    Pending Review
                                </span>
                            </div>

                            <div className="influencer-info">
                                <div className="avatar">
                                    {proof.influencer_name?.[0] || 'I'}
                                </div>
                                <div>
                                    <span className="name">{proof.influencer_name}</span>
                                    <span className="submitted">Submitted {formatDate(proof.submitted_at)}</span>
                                </div>
                            </div>

                            <div className="bid-amount-banner">
                                <span>Payment Amount:</span>
                                <span className="amount">{formatCurrency(proof.bid_amount)}</span>
                            </div>

                            {proof.description && (
                                <div className="description">
                                    <p>{proof.description}</p>
                                </div>
                            )}

                            {/* Content Links */}
                            <div className="content-links-section">
                                <h4>
                                    <ExternalLink size={16} />
                                    Content Links
                                </h4>
                                <div className="links-grid">
                                    {proof.content_links?.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="content-link"
                                        >
                                            <ExternalLink size={14} />
                                            <span>{link}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            {(proof.views_count > 0 || proof.likes_count > 0 || proof.comments_count > 0) && (
                                <div className="metrics-section">
                                    <h4>
                                        <TrendingUp size={16} />
                                        Reported Metrics
                                    </h4>
                                    <div className="metrics-row">
                                        {proof.views_count > 0 && (
                                            <div className="metric">
                                                <Eye size={16} />
                                                <span>{proof.views_count.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {proof.likes_count > 0 && (
                                            <div className="metric">
                                                <Heart size={16} />
                                                <span>{proof.likes_count.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {proof.comments_count > 0 && (
                                            <div className="metric">
                                                <MessageCircle size={16} />
                                                <span>{proof.comments_count.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {proof.shares_count > 0 && (
                                            <div className="metric">
                                                <Share2 size={16} />
                                                <span>{proof.shares_count.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="review-actions">
                                <button
                                    className="btn-reject"
                                    onClick={() => {
                                        setSelectedProof(proof);
                                        setReviewModal('reject');
                                    }}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                                <button
                                    className="btn-approve"
                                    onClick={() => {
                                        setSelectedProof(proof);
                                        setReviewModal('approve');
                                    }}
                                >
                                    <CheckCircle size={18} />
                                    Approve & Pay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && selectedProof && (
                <div className="modal-overlay" onClick={() => setReviewModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {reviewModal === 'approve' ? (
                            <>
                                <div className="modal-header approve">
                                    <CheckCircle size={24} />
                                    <h2>Approve & Release Payment</h2>
                                </div>
                                <div className="modal-body">
                                    <div className="confirm-details">
                                        <p>You are about to approve this proof of work:</p>
                                        <div className="detail-box">
                                            <strong>{selectedProof.title}</strong>
                                            <span>by {selectedProof.influencer_name}</span>
                                        </div>
                                        <div className="payment-info">
                                            <AlertCircle size={18} />
                                            <span>
                                                <strong>{formatCurrency(selectedProof.bid_amount)}</strong> will be released from escrow to the influencer's wallet (minus platform fee).
                                            </span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Notes (Optional)</label>
                                        <textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Add any feedback for the influencer..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setReviewModal(null)}
                                        disabled={reviewing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleApprove(selectedProof.id)}
                                        disabled={reviewing}
                                    >
                                        {reviewing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={18} />
                                                Approve & Pay
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="modal-header reject">
                                    <XCircle size={24} />
                                    <h2>Reject Proof of Work</h2>
                                </div>
                                <div className="modal-body">
                                    <p>Please provide a reason for rejection:</p>

                                    <div className="form-group">
                                        <label>Rejection Reason *</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Explain why this proof is being rejected..."
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Additional Notes (Optional)</label>
                                        <textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Any additional feedback..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setReviewModal(null)}
                                        disabled={reviewing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => handleReject(selectedProof.id)}
                                        disabled={reviewing || !rejectionReason.trim()}
                                    >
                                        {reviewing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={18} />
                                                Reject
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
