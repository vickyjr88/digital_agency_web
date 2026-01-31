import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Briefcase, Zap, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { influencerApi, packageApi } from '../services/marketplaceApi';

/**
 * NextActionWidget
 * Guides users through the critical onboarding steps based on their role and current state.
 */
export default function NextActionWidget({ user, brands = [] }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({
        hasProfile: false,
        hasPackages: false,
        hasBrands: brands && brands.length > 0
    });

    useEffect(() => {
        if (user) {
            checkStatus();
        }
    }, [user, brands]);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const newStatus = {
                hasProfile: false,
                hasPackages: false,
                hasBrands: brands && brands.length > 0
            };

            // For influencers, check profile and packages
            if (user.user_type === 'influencer') {
                try {
                    const profile = await influencerApi.getMyProfile();
                    newStatus.hasProfile = !!profile;
                } catch (e) {
                    // 404 means no profile
                    newStatus.hasProfile = false;
                }

                if (newStatus.hasProfile) {
                    try {
                        const packages = await packageApi.getMine();
                        newStatus.hasPackages = packages && packages.length > 0;
                    } catch (e) {
                        newStatus.hasPackages = false;
                    }
                }
            } else {
                // For brands, these steps are skipped/assumed true for the flow logic
                newStatus.hasProfile = true;
                newStatus.hasPackages = true;
            }

            setStatus(newStatus);
        } catch (error) {
            console.error("Error checking user status:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null; // Or a skeleton

    // Determine the next best action
    let action = null;

    if (user.user_type === 'influencer') {
        if (!status.hasProfile) {
            action = {
                title: "Complete Your Influencer Profile",
                description: "Set up your profile to start accepting campaign invites.",
                btnText: "Setup Profile",
                path: "/influencer/onboarding",
                icon: User,
                color: "bg-orange-100 text-orange-600",
                btnColor: "bg-orange-600 hover:bg-orange-700"
            };
        } else if (!status.hasPackages) {
            action = {
                title: "Create Your First Package",
                description: "Define your services and pricing so brands can hire you.",
                btnText: "Create Package",
                path: "/influencer/packages/new",
                icon: Package,
                color: "bg-blue-100 text-blue-600",
                btnColor: "bg-blue-600 hover:bg-blue-700"
            };
        } else if (!status.hasBrands) {
            action = {
                title: "Create a Brand Persona",
                description: "Create a brand profile to generate AI content for yourself or clients.",
                btnText: "Create Brand",
                path: "/brands/new",
                icon: Briefcase,
                color: "bg-purple-100 text-purple-600",
                btnColor: "bg-purple-600 hover:bg-purple-700"
            };
        } else {
            action = {
                title: "Generate AI Content",
                description: "You're all set! Start creating amazing content for your social media.",
                btnText: "Generate Now",
                path: null, // Handle click to scroll/focus trends
                icon: Zap,
                color: "bg-indigo-100 text-indigo-600",
                btnColor: "bg-indigo-600 hover:bg-indigo-700",
                isGenerate: true
            };
        }
    } else {
        // Brand User
        if (!status.hasBrands) {
            action = {
                title: "Create Your First Brand",
                description: "Set up your brand identity to start generating tailored content.",
                btnText: "Create Brand",
                path: "/brands/new",
                icon: Briefcase,
                color: "bg-purple-100 text-purple-600",
                btnColor: "bg-purple-600 hover:bg-purple-700"
            };
        } else {
            action = {
                title: "Generate AI Content",
                description: "Ready to go! Pick a trend below and create viral content.",
                btnText: "Generate Now",
                path: null,
                icon: Zap,
                color: "bg-indigo-100 text-indigo-600",
                btnColor: "bg-indigo-600 hover:bg-indigo-700",
                isGenerate: true
            };
        }
    }

    const handleClick = () => {
        if (action.isGenerate) {
            // Scroll to trends section if on dashboard
            const trendsSection = document.getElementById('trends-section');
            if (trendsSection) {
                trendsSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate(action.path);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm"
        >
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

                <div className="flex gap-5 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${action.color}`}>
                        <action.icon size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">Next Step: {action.title}</h2>
                            {!action.isGenerate && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-wider">Recommended</span>}
                        </div>
                        <p className="text-gray-600 max-w-xl text-sm md:text-base leading-relaxed">
                            {action.description}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto">
                    <button
                        onClick={handleClick}
                        className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-gray-200 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center justify-center gap-2 ${action.btnColor}`}
                    >
                        {action.btnText}
                        <ArrowRight size={18} />
                    </button>
                    {action.isGenerate && (
                        <p className="text-center text-xs text-gray-400 mt-2">Scroll down to see trends</p>
                    )}
                </div>
            </div>

            {/* Progress Indicators (Only for Influencer to show journey) */}
            {user.user_type === 'influencer' && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center overflow-x-auto gap-8 md:justify-center no-scrollbar">
                    <div className={`flex items-center gap-2 whitespace-nowrap text-sm font-medium ${status.hasProfile ? 'text-green-600' : 'text-gray-400'}`}>
                        {status.hasProfile ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                        Profile Setup
                    </div>
                    <div className="w-8 h-0.5 bg-gray-200 shrink-0"></div>
                    <div className={`flex items-center gap-2 whitespace-nowrap text-sm font-medium ${status.hasPackages ? 'text-green-600' : 'text-gray-400'}`}>
                        {status.hasPackages ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                        Create Services
                    </div>
                    <div className="w-8 h-0.5 bg-gray-200 shrink-0"></div>
                    <div className={`flex items-center gap-2 whitespace-nowrap text-sm font-medium ${status.hasBrands ? 'text-green-600' : 'text-gray-400'}`}>
                        {status.hasBrands ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                        Create Brand
                    </div>
                    <div className="w-8 h-0.5 bg-gray-200 shrink-0"></div>
                    <div className={`flex items-center gap-2 whitespace-nowrap text-sm font-medium ${action.isGenerate ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <Zap size={16} />
                        Generate Content
                    </div>
                </div>
            )}
        </motion.div>
    );
}
