/**
 * Wallet Page
 * Manage wallet balance, deposits, withdrawals, and transactions
 */

import { useState, useEffect } from 'react';
import { walletApi } from '../../services/marketplaceApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Shield,
    Clock,
    DollarSign,
    Lock,
    Activity,
    Filter,
    X,
    Check,
    AlertCircle
} from 'lucide-react';

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
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Loading your wallet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        My Wallet
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your funds, deposits, and withdrawals</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={(wallet?.balance || 0) - (wallet?.hold_balance || 0) <= 0}
                        className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <ArrowUpRight size={18} />
                        Withdraw
                    </button>
                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <ArrowDownLeft size={18} />
                        Deposit Funds
                    </button>
                </div>
            </header>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BalanceCard
                    title="Available Balance"
                    value={formatPrice((wallet?.balance || 0) - (wallet?.hold_balance || 0))}
                    icon={DollarSign}
                    color="bg-indigo-50 text-indigo-600"
                    trend="Ready to use"
                    active
                />
                <BalanceCard
                    title="In Escrow"
                    value={formatPrice(wallet?.hold_balance || 0)}
                    icon={Lock}
                    color="bg-yellow-50 text-yellow-600"
                    trend="Held for campaigns"
                />
                <BalanceCard
                    title="Total Earned"
                    value={formatPrice(wallet?.total_earned || 0)}
                    icon={Activity}
                    color="bg-green-50 text-green-600"
                    trend="Lifetime earnings"
                />
                <BalanceCard
                    title="Total Spent"
                    value={formatPrice(wallet?.total_spent || 0)}
                    icon={CreditCard}
                    color="bg-purple-50 text-purple-600"
                    trend="Lifetime spending"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-6">
                    <TabButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        label="Overview"
                        icon={Activity}
                    />
                    <TabButton
                        active={activeTab === 'transactions'}
                        onClick={() => setActiveTab('transactions')}
                        label="Transactions"
                        icon={Clock}
                    />
                    <TabButton
                        active={activeTab === 'escrow'}
                        onClick={() => setActiveTab('escrow')}
                        label="Escrow Holds"
                        icon={Shield}
                    />
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
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
            <AnimatePresence>
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
            </AnimatePresence>
        </div>
    );
}

function BalanceCard({ title, value, icon: Icon, color, trend, active }) {
    return (
        <div className={`p-6 rounded-xl border transition-all hover:shadow-md ${active ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 shadow-lg' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : color}`}>
                    <Icon size={24} className={active ? 'text-white' : ''} />
                </div>
                {active && <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded text-white">Active</span>}
            </div>
            <div>
                <p className={`text-sm font-medium ${active ? 'text-indigo-100' : 'text-gray-500'}`}>{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
                <p className={`text-xs mt-2 ${active ? 'text-indigo-200' : 'text-gray-400'}`}>{trend}</p>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, icon: Icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${active
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

// Overview Tab
function OverviewTab({ transactions, formatPrice, formatDate }) {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard icon={Shield} title="Secure Payments" desc="Bank-level security" color="text-green-600 bg-green-50" />
                <InfoCard icon={ArrowUpRight} title="Fast Withdrawals" desc="Processed in 24-48h" color="text-blue-600 bg-blue-50" />
                <InfoCard icon={Lock} title="Escrow Protection" desc="Safe fund holding" color="text-yellow-600 bg-yellow-50" />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Activity</h3>
                    <span className="text-sm text-indigo-600 cursor-pointer hover:underline">View all</span>
                </div>
                {transactions.length > 0 ? (
                    <TransactionList
                        transactions={transactions}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                    />
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>No transactions yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCard({ icon: Icon, title, desc, color }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
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
        <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                <FilterButton label="Deposits" active={filter === 'deposit'} onClick={() => setFilter('deposit')} />
                <FilterButton label="Withdrawals" active={filter === 'withdrawal'} onClick={() => setFilter('withdrawal')} />
                <FilterButton label="Escrow Locks" active={filter === 'escrow_lock'} onClick={() => setFilter('escrow_lock')} />
                <FilterButton label="Payments" active={filter === 'escrow_release'} onClick={() => setFilter('escrow_release')} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredTransactions.length > 0 ? (
                    <TransactionList
                        transactions={filteredTransactions}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                    />
                ) : (
                    <div className="p-16 text-center text-gray-500">
                        <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>No transactions match this filter</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );
}

// Transaction List Component
function TransactionList({ transactions, formatPrice, formatDate, detailed = false }) {
    const getTransactionIcon = (type) => {
        const icons = {
            deposit: ArrowDownLeft,
            withdrawal: ArrowUpRight,
            escrow_lock: Lock,
            escrow_release: Check,
            escrow_refund: ArrowDownLeft,
            platform_fee: CreditCard,
        };
        return icons[type] || DollarSign;
    };

    const getTransactionColor = (type) => {
        const colors = {
            deposit: 'text-green-600 bg-green-50',
            withdrawal: 'text-red-600 bg-red-50',
            escrow_lock: 'text-yellow-600 bg-yellow-50',
            escrow_release: 'text-green-600 bg-green-50',
            escrow_refund: 'text-blue-600 bg-blue-50',
            platform_fee: 'text-red-600 bg-red-50',
        };
        return colors[type] || 'text-gray-600 bg-gray-50';
    };

    const isIncoming = (tx) => {
        return ['deposit', 'escrow_release', 'escrow_refund'].includes(tx.transaction_type);
    };

    return (
        <div className="divide-y divide-gray-50">
            {transactions.map(tx => {
                const Icon = getTransactionIcon(tx.transaction_type);
                const colorClass = getTransactionColor(tx.transaction_type);

                return (
                    <div key={tx.id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${colorClass}`}>
                            <Icon size={20} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {tx.description || tx.transaction_type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatDate(tx.created_at)}
                            </p>
                        </div>

                        <div className="text-right ml-4">
                            <p className={`text-sm font-bold ${isIncoming(tx) ? 'text-green-600' : 'text-gray-900'}`}>
                                {isIncoming(tx) ? '+' : '-'}{formatPrice(tx.amount)}
                            </p>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${tx.status === 'success' ? 'bg-green-100 text-green-700' :
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {tx.status}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Escrow Tab
function EscrowTab({ escrowHolds, holdBalance, formatPrice }) {
    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 mb-3">
                    <Lock size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Total in Escrow</h3>
                <p className="text-3xl font-bold text-yellow-600 my-2">{formatPrice(holdBalance)}</p>
                <p className="text-sm text-yellow-700 max-w-md mx-auto">
                    Funds are safely held here during active campaigns and released to influencers upon completion.
                </p>
            </div>

            {escrowHolds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {escrowHolds.map(hold => (
                        <div key={hold.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Campaign #{hold.campaign_id}</h4>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium uppercase">
                                        {hold.status}
                                    </span>
                                </div>
                                <span className="font-bold text-lg text-yellow-600">{formatPrice(hold.amount)}</span>
                            </div>

                            {hold.auto_release_at && (
                                <div className="mt-auto pt-3 border-t border-gray-50 text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    Auto-release: {new Date(hold.auto_release_at).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
                    <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Escrow Holds</h3>
                    <p>When you start or receive campaigns, held funds will appear here.</p>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ArrowDownLeft className="text-indigo-600" /> Deposit Funds
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">KES</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="100"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {presetAmounts.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setAmount(preset.toString())}
                                className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${amount === preset.toString()
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {formatPrice(preset)}
                            </button>
                        ))}
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl flex items-start gap-3">
                        <Shield className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-indigo-800">
                            You'll be redirected to Paystack to complete the payment securely.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeposit}
                        disabled={loading || !amount}
                        className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {loading ? 'Processing...' : `Deposit ${amount ? formatPrice(Number(amount)) : ''}`}
                    </button>
                </div>
            </motion.div>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ArrowUpRight className="text-indigo-600" /> Withdraw Funds
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-xl mb-6 text-center border border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available for Withdrawal</span>
                        <div className="text-2xl font-bold text-green-600 mt-1">{formatPrice(availableBalance)}</div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount (KES)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">KES</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="100"
                                max={availableBalance}
                                className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                            />
                            <button
                                onClick={() => setAmount(availableBalance.toString())}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl flex items-start gap-3">
                        <Clock className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                        <p className="text-sm text-yellow-800">
                            Withdrawals are processed within 24-48 hours to your registered payment method.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleWithdraw}
                        disabled={loading || !amount}
                        className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {loading ? 'Processing...' : `Withdraw ${amount ? formatPrice(Number(amount)) : ''}`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
