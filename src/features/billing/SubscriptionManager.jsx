import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckCircle, Zap, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionManager({ user }) {
    const [activePlan, setActivePlan] = useState(user?.subscription_tier || 'free');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const plans = [
        {
            id: 'day_pass',
            name: 'Day Pass',
            price: 'KES 29',
            period: '24 hours',
            icon: <Zap className="text-yellow-600" />,
            features: ['24-hour access', '5 content pieces', 'Instant Access']
        },
        {
            id: 'starter',
            name: 'Starter',
            price: 'KES 2,999',
            period: 'monthly',
            icon: <Zap className="text-blue-600" />,
            features: ['3 brand profiles', '100 content pieces/month', 'Daily trends']
        },
        {
            id: 'professional',
            name: 'Professional',
            price: 'KES 7,999',
            period: 'monthly',
            icon: <Crown className="text-purple-600" />,
            features: ['10 brand profiles', '500 content pieces/month', 'Analytics']
        },
        {
            id: 'agency',
            name: 'Agency',
            price: 'KES 19,999',
            period: 'monthly',
            icon: <Shield className="text-indigo-600" />,
            features: ['Unlimited brands', '2,000 content pieces/month', 'Priority Support']
        }
    ];

    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await api.getTransactionHistory();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        }
    };

    const handleUpgrade = async (planId) => {
        setLoading(planId);
        try {
            const callbackUrl = `${window.location.origin}/dashboard/billing/callback`;
            const response = await api.subscribeToPlan(planId, callbackUrl);

            if (response && response.data && response.data.authorization_url) {
                window.location.href = response.data.authorization_url;
            }
        } catch (error) {
            console.error("Upgrade failed:", error);
            alert("Failed to initiate upgrade. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Current Subscription</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Plan</p>
                        <p className="text-2xl font-bold text-indigo-600 capitalize">{activePlan}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {user?.subscription_status || 'Trial'}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white p-6 rounded-xl border-2 transition-all hover:shadow-lg ${activePlan === plan.id
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                                : 'border-gray-200 hover:border-indigo-200'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    {plan.icon}
                                </div>
                                <h4 className="font-bold text-gray-900">{plan.name}</h4>
                            </div>

                            <div className="mb-4">
                                <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-xs text-gray-500 ml-1">/{plan.period}</span>
                            </div>

                            <ul className="space-y-2 mb-6 min-h-[80px]">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                        <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loading || activePlan === plan.id}
                                className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${activePlan === plan.id
                                    ? 'bg-gray-100 text-gray-400 cursor-default'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                {loading === plan.id ? 'Loading...' : (activePlan === plan.id ? 'Current Plan' : 'Upgrade')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Billing History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Reference</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="text-sm">
                                        <td className="px-4 py-3 text-gray-600">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                            {tx.reference}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {tx.currency} {parseFloat(tx.amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-100 text-green-700' :
                                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 italic text-sm">
                                        No transaction history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
