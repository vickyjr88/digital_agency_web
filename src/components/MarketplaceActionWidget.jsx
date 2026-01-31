import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Search, ArrowRight, Loader2 } from 'lucide-react';
import { campaignApi, bidApi } from '../services/marketplaceApi';

/**
 * MarketplaceActionWidget
 * Guides users to take marketplace actions (Campaigns/Bids) after they have set up their brand.
 */
export default function MarketplaceActionWidget({ user, brands = [] }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({
        hasCampaigns: false,
        hasBids: false
    });

    useEffect(() => {
        if (user && brands.length > 0) {
            checkStatus();
        } else {
            setLoading(false);
        }
    }, [user, brands]);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const newStatus = { hasCampaigns: false, hasBids: false };

            if (user.user_type === 'brand') {
                try {
                    const campaigns = await campaignApi.getAll();
                    newStatus.hasCampaigns = campaigns && campaigns.length > 0;
                } catch (e) {
                    console.error("Error fetching campaigns:", e);
                }
            } else if (user.user_type === 'influencer') {
                try {
                    const bids = await bidApi.getMyBids();
                    newStatus.hasBids = bids && bids.length > 0;
                } catch (e) {
                    console.error("Error fetching bids:", e);
                }
            }

            setStatus(newStatus);
        } catch (error) {
            console.error("Error checking marketplace status:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    // Condition: Only visible after brands are created
    if (!brands || brands.length === 0) return null;

    let action = null;

    if (user.user_type === 'brand') {
        if (!status.hasCampaigns) {
            action = {
                title: "Launch Your First Campaign",
                description: "Connect with influencers to promote your brand to a wider audience.",
                btnText: "Create Campaign",
                path: "/campaigns/create",
                icon: Target,
                color: "bg-teal-100 text-teal-600",
                btnColor: "bg-teal-600 hover:bg-teal-700"
            };
        } else {
            // Nudge for growth
            action = {
                title: "Scale Your Brand",
                description: "Keep the momentum going! Launch another campaign to reach new audiences.",
                btnText: "New Campaign",
                path: "/campaigns/create",
                icon: Target,
                color: "bg-indigo-100 text-indigo-600",
                btnColor: "bg-indigo-600 hover:bg-indigo-700"
            };
        }
    } else if (user.user_type === 'influencer') {
        if (!status.hasBids) {
            action = {
                title: "Find Campaigns to Bid On",
                description: "Browse open campaigns and submit proposals to start earning.",
                btnText: "Browse Campaigns",
                path: "/campaigns/open",
                icon: Search,
                color: "bg-blue-100 text-blue-600",
                btnColor: "bg-blue-600 hover:bg-blue-700"
            };
        } else {
            // Nudge for growth
            action = {
                title: "Boost Your Earnings",
                description: "Don't stop now! Find more campaigns to fill your schedule and maximize income.",
                btnText: "Browse Campaigns",
                path: "/campaigns/open",
                icon: Search,
                color: "bg-green-100 text-green-600",
                btnColor: "bg-green-600 hover:bg-green-700"
            };
        }
    }

    if (!action) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm"
        >
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-50 to-blue-50 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 opacity-50 pointer-events-none"></div>

                <div className="flex gap-5 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${action.color}`}>
                        <action.icon size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">{action.title}</h2>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider">Marketplace</span>
                        </div>
                        <p className="text-gray-600 max-w-xl text-sm md:text-base leading-relaxed">
                            {action.description}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto">
                    <button
                        onClick={() => navigate(action.path)}
                        className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-gray-200 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2 ${action.btnColor}`}
                    >
                        {action.btnText}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
