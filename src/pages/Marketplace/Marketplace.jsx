import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { influencerApi, packageApi, campaignApi } from '../../services/marketplaceApi';
import {
    Search,
    Filter,
    Users,
    Package,
    Megaphone,
    Instagram,
    Youtube,
    Twitter,
    CheckCircle,
    Star,
    ArrowRight,
    MapPin,
    DollarSign,
    Briefcase,
    Globe
} from 'lucide-react';

const PLATFORMS = [
    { value: '', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter/X' },
];

const SORT_OPTIONS = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'followers', label: 'Most Followers' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'latest', label: 'Newest First' },
];

export default function Marketplace() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState(searchParams.get('view') || 'influencers'); // influencers, packages, or campaigns
    const [loading, setLoading] = useState(true);
    const [influencers, setInfluencers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0 });

    // Filters
    const [filters, setFilters] = useState({
        query: searchParams.get('q') || '',
        platform: searchParams.get('platform') || '',
        niche: searchParams.get('niche') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        verifiedOnly: searchParams.get('verified') === 'true',
        sortBy: searchParams.get('sort') || 'rating',
    });

    useEffect(() => {
        fetchData();
    }, [viewMode, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                query: filters.query || undefined,
                platform: filters.platform || undefined,
                niche: filters.niche || undefined,
                min_price: filters.minPrice || undefined,
                max_price: filters.maxPrice || undefined,
                verified_only: filters.verifiedOnly || undefined,
                sort_by: filters.sortBy,
                page: pagination.page,
                limit: 20,
            };

            // Remove undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined) delete params[key];
            });

            if (viewMode === 'influencers') {
                const response = await influencerApi.search(params);
                setInfluencers(response.influencers || []);
                setPagination(response.pagination || { page: 1, total: 0 });
            } else if (viewMode === 'packages') {
                const response = await packageApi.browse(params);
                setPackages(response.packages || []);
                setPagination(response.pagination || { page: 1, total: 0 });
            } else if (viewMode === 'campaigns') {
                // Adjust sort for campaigns if needed
                if (params.sort_by === 'rating') params.sort_by = 'created_at'; // Campaigns don't usually have a rating to sort by yet
                const response = await campaignApi.getAll({ ...params, status: 'open' }); // Only show open campaigns
                setCampaigns(response.campaigns || []);
                setPagination(response.pagination || { page: 1, total: 0 });
            }
        } catch (error) {
            console.error('Error fetching marketplace data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleViewChange = (mode) => {
        setViewMode(mode);
        // Update URL
        setSearchParams(prev => {
            prev.set('view', mode);
            return prev;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatFollowers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            Marketplace
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Connect with the perfect partners for your next campaign
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                        <button
                            onClick={() => handleViewChange('influencers')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'influencers'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Users size={16} />
                            Influencers
                        </button>
                        <button
                            onClick={() => handleViewChange('packages')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'packages'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Package size={16} />
                            Packages
                        </button>
                        <button
                            onClick={() => handleViewChange('campaigns')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'campaigns'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <Megaphone size={16} />
                            Campaigns
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={`Search ${viewMode}...`}
                                value={filters.query}
                                onChange={(e) => handleFilterChange('query', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Filter size={16} />
                            Filters:
                        </div>

                        {viewMode !== 'campaigns' && (
                            <select
                                value={filters.platform}
                                onChange={(e) => handleFilterChange('platform', e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {PLATFORMS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        )}

                        <input
                            type="text"
                            placeholder={viewMode === 'campaigns' ? "Industry / Niche" : "Niche (e.g. Fashion)"}
                            value={filters.niche}
                            onChange={(e) => handleFilterChange('niche', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
                        />

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28"
                            />
                        </div>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="ml-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {SORT_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        {viewMode === 'influencers' && (
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.verifiedOnly}
                                    onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Verified Only
                            </label>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-gray-500">Loading results...</p>
                        </div>
                    ) : viewMode === 'influencers' ? (
                        <>
                            <div className="mb-4 text-gray-500 text-sm">
                                Found {pagination.total} influencers
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {influencers.map(influencer => (
                                    <InfluencerCard
                                        key={influencer.id}
                                        influencer={influencer}
                                        formatFollowers={formatFollowers}
                                        formatPrice={formatPrice}
                                    />
                                ))}
                            </div>
                        </>
                    ) : viewMode === 'packages' ? (
                        <>
                            <div className="mb-4 text-gray-500 text-sm">
                                Found {pagination.total} packages
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {packages.map(pkg => (
                                    <PackageCard
                                        key={pkg.id}
                                        package={pkg}
                                        formatPrice={formatPrice}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 text-gray-500 text-sm">
                                Found {pagination.total} open campaigns
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {campaigns.map(campaign => (
                                    <CampaignCard
                                        key={campaign.id}
                                        campaign={campaign}
                                        formatPrice={formatPrice}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-gray-600 text-sm">
                                Page {pagination.page} of {pagination.total_pages}
                            </span>
                            <button
                                disabled={pagination.page === pagination.total_pages}
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Influencer Card Component
function InfluencerCard({ influencer, formatFollowers, formatPrice }) {
    const getPrimaryStats = () => {
        const stats = [];
        if (influencer.instagram?.followers) {
            stats.push({ platform: 'Instagram', followers: influencer.instagram.followers, icon: <Instagram size={14} /> });
        }
        if (influencer.tiktok?.followers) {
            stats.push({ platform: 'TikTok', followers: influencer.tiktok.followers, icon: <span className="text-xs font-bold">Tk</span> }); // Lucide doesn't have tiktok icon yet usually
        }
        if (influencer.youtube?.followers) {
            stats.push({ platform: 'YouTube', followers: influencer.youtube.followers, icon: <Youtube size={14} /> });
        }
        if (influencer.twitter?.followers) {
            stats.push({ platform: 'Twitter', followers: influencer.twitter.followers, icon: <Twitter size={14} /> });
        }
        return stats.sort((a, b) => b.followers - a.followers);
    };

    const stats = getPrimaryStats();
    const minPrice = influencer.packages?.length
        ? Math.min(...influencer.packages.map(p => p.price))
        : null;

    return (
        <Link to={`/marketplace/influencer/${influencer.id}`} className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
            <div className="p-5 flex items-center gap-4 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
                <div className="relative">
                    {influencer.profile_picture_url ? (
                        <img
                            src={influencer.profile_picture_url}
                            alt={influencer.display_name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-white shadow-sm">
                            {influencer.display_name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {influencer.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                            <CheckCircle size={10} fill="currentColor" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {influencer.display_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{influencer.niche}</p>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                {influencer.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {influencer.bio}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {stats.slice(0, 3).map((stat, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md text-xs font-medium text-gray-600">
                            <span className="text-gray-400">{stat.icon}</span>
                            <span>{formatFollowers(stat.followers)}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span>{influencer.rating?.toFixed(1) || 'New'}</span>
                        <span className="text-gray-400 font-normal ml-1">({influencer.review_count || 0})</span>
                    </div>
                    {minPrice && (
                        <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            From {formatPrice(minPrice)}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Package Card Component
function PackageCard({ package: pkg, formatPrice }) {
    const getPlatformIcon = (platform) => {
        const icons = {
            instagram: <Instagram size={18} />,
            tiktok: <span className="text-sm font-bold">Tk</span>,
            youtube: <Youtube size={18} />,
            twitter: <Twitter size={18} />,
            multi: <Globe size={18} />,
        };
        return icons[platform] || <Package size={18} />;
    };

    return (
        <Link to={`/marketplace/package/${pkg.id}`} className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    {getPlatformIcon(pkg.platform)}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wide">
                    {pkg.content_type}
                </span>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {pkg.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                    {pkg.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-6 bg-gray-50 rounded-xl p-3">
                    <div className="text-center">
                        <span className="block text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Items</span>
                        <span className="block font-bold text-gray-900 text-sm">{pkg.deliverables_count}x</span>
                    </div>
                    <div className="text-center border-l border-gray-200">
                        <span className="block text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Days</span>
                        <span className="block font-bold text-gray-900 text-sm">{pkg.timeline_days}</span>
                    </div>
                    <div className="text-center border-l border-gray-200">
                        <span className="block text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Revisions</span>
                        <span className="block font-bold text-gray-900 text-sm">{pkg.revisions_included}</span>
                    </div>
                </div>

                <div className="mt-auto">
                    {pkg.influencer && (
                        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            {pkg.influencer.display_name ? (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-bold">
                                    {pkg.influencer.display_name.charAt(0)}
                                </div>
                            ) : null}
                            <span className="text-sm text-gray-600 truncate">{pkg.influencer.display_name}</span>
                            {pkg.influencer.is_verified && <CheckCircle size={10} className="text-green-500" fill="currentColor" />}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xl font-bold text-gray-900">
                            {formatPrice(pkg.price)}
                        </span>
                        <span className="text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            View <ArrowRight size={14} />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Campaign Card Component
function CampaignCard({ campaign, formatPrice }) {
    return (
        <Link to={`/campaigns/${campaign.id}`} className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1 relative">
            <div className="absolute top-4 right-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${campaign.is_public
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                    {campaign.is_public ? 'Public' : 'Private'}
                </span>
            </div>

            <div className="p-6 pb-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <Briefcase size={16} />
                    <span>{campaign.brand?.name || "Unknown Brand"}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {campaign.title || "Untitled Campaign"}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-6">
                    {campaign.brief}
                </p>

                <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                        <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Budget</span>
                        <span className="block font-bold text-green-600">
                            {formatPrice(campaign.budget || 0)}
                        </span>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                        <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Platform</span>
                        <span className="block font-bold text-gray-900 capitalize">
                            {campaign.platform || 'Multi'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center mt-auto">
                <span className="text-xs text-gray-500">
                    Posted {new Date(campaign.created_at).toLocaleDateString()}
                </span>
                <span className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-lg group-hover:bg-indigo-700 transition-colors shadow-sm">
                    Apply Now
                </span>
            </div>
        </Link>
    );
}
