/**
 * Wallet Page
 * Manage wallet balance, deposits, withdrawals, and transactions
 */

import { useState, useEffect } from 'react';
import { walletApi } from '../../services/marketplaceApi';
import './Wallet.css';

export default function Wallet() {
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [escrowHolds, setEscrowHolds] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const [walletRes, transactionsRes] = await Promise.all([
                walletApi.getBalance(),
                walletApi.getTransactions({ limit: 50 }),
            ]);

            setWallet(walletRes);
            setTransactions(transactionsRes || []);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="wallet-loading">
                <div className="spinner"></div>
                <p>Loading your wallet...</p>
            </div>
        );
    }

    return (
        <div className="wallet-page">
            <div className="wallet-header">
                <h1>💳 My Wallet</h1>
                <p>Manage your funds, deposits, and withdrawals</p>
            </div>

            {/* Balance Cards */}
            <div className="balance-grid">
                <div className="balance-card primary">
                    <div className="balance-icon">💰</div>
                    <div className="balance-content">
                        <span className="balance-label">Available Balance</span>
                        <span className="balance-value">
                            {formatPrice((wallet?.balance || 0) - (wallet?.hold_balance || 0))}
                        </span>
                    </div>
                    <div className="balance-actions">
                        <button className="btn-deposit" onClick={() => setShowDepositModal(true)}>
                            + Deposit
                        </button>
                        <button
                            className="btn-withdraw"
                            onClick={() => setShowWithdrawModal(true)}
                            disabled={(wallet?.balance || 0) - (wallet?.hold_balance || 0) <= 0}
                        >
                            ↑ Withdraw
                        </button>
                    </div>
                </div>

                <div className="balance-card">
                    <div className="balance-icon">🔒</div>
                    <div className="balance-content">
                        <span className="balance-label">In Escrow</span>
                        <span className="balance-value locked">{formatPrice(wallet?.hold_balance || 0)}</span>
                        <span className="balance-hint">Held for active campaigns</span>
                    </div>
                </div>

                <div className="balance-card">
                    <div className="balance-icon">📈</div>
                    <div className="balance-content">
                        <span className="balance-label">Total Earned</span>
                        <span className="balance-value earned">{formatPrice(wallet?.total_earned || 0)}</span>
                        <span className="balance-hint">Lifetime earnings</span>
                    </div>
                </div>

                <div className="balance-card">
                    <div className="balance-icon">📉</div>
                    <div className="balance-content">
                        <span className="balance-label">Total Spent</span>
                        <span className="balance-value">{formatPrice(wallet?.total_spent || 0)}</span>
                        <span className="balance-hint">On campaigns & packages</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="wallet-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={activeTab === 'transactions' ? 'active' : ''}
                    onClick={() => setActiveTab('transactions')}
                >
                    📜 Transactions
                </button>
                <button
                    className={activeTab === 'escrow' ? 'active' : ''}
                    onClick={() => setActiveTab('escrow')}
                >
                    🔒 Escrow
                </button>
            </div>

            {/* Tab Content */}
            <div className="wallet-content">
                {activeTab === 'overview' && (
                    <OverviewTab
                        transactions={transactions.slice(0, 5)}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                    />
                )}
                {activeTab === 'transactions' && (
                    <TransactionsTab
                        transactions={transactions}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                    />
                )}
                {activeTab === 'escrow' && (
                    <EscrowTab
                        escrowHolds={escrowHolds}
                        holdBalance={wallet?.hold_balance || 0}
                        formatPrice={formatPrice}
                    />
                )}
            </div>

            {/* Modals */}
            {showDepositModal && (
                <DepositModal
                    onClose={() => setShowDepositModal(false)}
                    onSuccess={() => {
                        setShowDepositModal(false);
                        fetchWalletData();
                    }}
                    formatPrice={formatPrice}
                />
            )}

            {showWithdrawModal && (
                <WithdrawModal
                    availableBalance={(wallet?.balance || 0) - (wallet?.hold_balance || 0)}
                    onClose={() => setShowWithdrawModal(false)}
                    onSuccess={() => {
                        setShowWithdrawModal(false);
                        fetchWalletData();
                    }}
                    formatPrice={formatPrice}
                />
            )}
        </div>
    );
}

// Overview Tab
function OverviewTab({ transactions, formatPrice, formatDate }) {
    return (
        <div className="overview-tab">
            <div className="section">
                <h3>Recent Activity</h3>
                {transactions.length > 0 ? (
                    <TransactionList
                        transactions={transactions}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                    />
                ) : (
                    <div className="empty-state">
                        <span>📭</span>
                        <p>No transactions yet</p>
                    </div>
                )}
            </div>

            <div className="info-cards">
                <div className="info-card">
                    <span className="info-icon">🛡️</span>
                    <h4>Secure Payments</h4>
                    <p>All transactions are protected with bank-level security</p>
                </div>
                <div className="info-card">
                    <span className="info-icon">⚡</span>
                    <h4>Fast Withdrawals</h4>
                    <p>Withdrawals are processed within 24-48 hours</p>
                </div>
                <div className="info-card">
                    <span className="info-icon">🔒</span>
                    <h4>Escrow Protection</h4>
                    <p>Funds are held safely until work is completed</p>
                </div>
            </div>
        </div>
    );
}

// Transactions Tab
function TransactionsTab({ transactions, formatPrice, formatDate }) {
    const [filter, setFilter] = useState('all');

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(t => t.transaction_type === filter);

    return (
        <div className="transactions-tab">
            <div className="filter-row">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Transactions</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="escrow_lock">Escrow Locks</option>
                    <option value="escrow_release">Payments Received</option>
                </select>
            </div>

            {filteredTransactions.length > 0 ? (
                <TransactionList
                    transactions={filteredTransactions}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                    detailed
                />
            ) : (
                <div className="empty-state">
                    <span>📭</span>
                    <p>No transactions match this filter</p>
                </div>
            )}
        </div>
    );
}

// Transaction List Component
function TransactionList({ transactions, formatPrice, formatDate, detailed = false }) {
    const getTransactionIcon = (type) => {
        const icons = {
            deposit: '⬇️',
            withdrawal: '⬆️',
            escrow_lock: '🔒',
            escrow_release: '💰',
            escrow_refund: '↩️',
            platform_fee: '💳',
        };
        return icons[type] || '💵';
    };

    const getTransactionColor = (type) => {
        const colors = {
            deposit: '#10b981',
            withdrawal: '#ef4444',
            escrow_lock: '#f59e0b',
            escrow_release: '#10b981',
            escrow_refund: '#3b82f6',
            platform_fee: '#ef4444',
        };
        return colors[type] || '#a0aec0';
    };

    const isIncoming = (tx) => {
        return ['deposit', 'escrow_release', 'escrow_refund'].includes(tx.transaction_type);
    };

    return (
        <div className="transaction-list">
            {transactions.map(tx => (
                <div key={tx.id} className={`transaction-item ${detailed ? 'detailed' : ''}`}>
                    <div className="tx-icon" style={{ backgroundColor: `${getTransactionColor(tx.transaction_type)}20` }}>
                        {getTransactionIcon(tx.transaction_type)}
                    </div>

                    <div className="tx-info">
                        <span className="tx-description">{tx.description || tx.transaction_type.replace('_', ' ')}</span>
                        <span className="tx-date">{formatDate(tx.created_at)}</span>
                    </div>

                    <div className="tx-amount">
                        <span className={isIncoming(tx) ? 'incoming' : 'outgoing'}>
                            {isIncoming(tx) ? '+' : '-'}{formatPrice(tx.amount)}
                        </span>
                        {tx.fee > 0 && (
                            <span className="tx-fee">Fee: {formatPrice(tx.fee)}</span>
                        )}
                    </div>

                    <span className={`tx-status ${tx.status}`}>
                        {tx.status}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Escrow Tab
function EscrowTab({ escrowHolds, holdBalance, formatPrice }) {
    return (
        <div className="escrow-tab">
            <div className="escrow-summary">
                <div className="escrow-total">
                    <span className="label">Total in Escrow</span>
                    <span className="value">{formatPrice(holdBalance)}</span>
                </div>
                <p className="escrow-note">
                    Funds are held in escrow during active campaigns and released upon completion.
                </p>
            </div>

            {escrowHolds.length > 0 ? (
                <div className="escrow-list">
                    {escrowHolds.map(hold => (
                        <div key={hold.id} className="escrow-item">
                            <div className="escrow-info">
                                <span className="escrow-campaign">Campaign #{hold.campaign_id}</span>
                                <span className="escrow-status">{hold.status}</span>
                            </div>
                            <div className="escrow-amount">{formatPrice(hold.amount)}</div>
                            {hold.auto_release_at && (
                                <span className="escrow-release">
                                    Auto-release: {new Date(hold.auto_release_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <span>🔓</span>
                    <h3>No Active Escrow Holds</h3>
                    <p>When you start or receive campaigns, funds will be held here</p>
                </div>
            )}
        </div>
    );
}

// Deposit Modal
function DepositModal({ onClose, onSuccess, formatPrice }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const presetAmounts = [1000, 5000, 10000, 25000, 50000];

    const handleDeposit = async () => {
        if (!amount || isNaN(amount) || Number(amount) < 100) {
            setError('Minimum deposit is KES 100');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await walletApi.deposit(Number(amount));

            // Redirect to Paystack
            if (response.authorization_url) {
                window.location.href = response.authorization_url;
            } else {
                onSuccess();
            }
        } catch (err) {
            setError(err.message || 'Failed to initiate deposit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>💰 Deposit Funds</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="amount-input">
                        <label>Amount (KES)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="100"
                        />
                    </div>

                    <div className="preset-amounts">
                        {presetAmounts.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset.toString())}
                                className={amount === preset.toString() ? 'selected' : ''}
                            >
                                {formatPrice(preset)}
                            </button>
                        ))}
                    </div>

                    <div className="payment-info">
                        <span className="info-icon">💳</span>
                        <p>You'll be redirected to Paystack to complete the payment securely.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleDeposit}
                        disabled={loading || !amount}
                    >
                        {loading ? 'Processing...' : `Deposit ${amount ? formatPrice(Number(amount)) : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Withdraw Modal
function WithdrawModal({ availableBalance, onClose, onSuccess, formatPrice }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleWithdraw = async () => {
        const numAmount = Number(amount);

        if (!amount || isNaN(numAmount) || numAmount < 100) {
            setError('Minimum withdrawal is KES 100');
            return;
        }

        if (numAmount > availableBalance) {
            setError(`Maximum withdrawal is ${formatPrice(availableBalance)}`);
            return;
        }

        setLoading(true);
        setError('');

        try {
            await walletApi.withdraw(numAmount);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to request withdrawal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⬆️ Withdraw Funds</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="available-balance">
                        <span className="label">Available for Withdrawal</span>
                        <span className="value">{formatPrice(availableBalance)}</span>
                    </div>

                    <div className="amount-input">
                        <label>Withdrawal Amount (KES)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="100"
                            max={availableBalance}
                        />
                        <button
                            className="max-btn"
                            onClick={() => setAmount(availableBalance.toString())}
                        >
                            Max
                        </button>
                    </div>

                    <div className="payment-info warning">
                        <span className="info-icon">⏱️</span>
                        <p>Withdrawals are processed within 24-48 hours to your registered payment method.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary withdraw"
                        onClick={handleWithdraw}
                        disabled={loading || !amount}
                    >
                        {loading ? 'Processing...' : `Withdraw ${amount ? formatPrice(Number(amount)) : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
