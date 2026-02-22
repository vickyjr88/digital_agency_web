import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Link2,
    Copy,
    ExternalLink,
    Search,
    MousePointerClick,
    ShoppingCart,
    TrendingUp,
    Loader,
    Package,
    CheckCircle,
    Tag,
    BarChart2,
    Share2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { affiliateApi } from '../../../services/affiliateApi';
import './MyLinks.css';

export default function MyLinks() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [expandedLink, setExpandedLink] = useState(null);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        loadLinks();
    }, []);

    const loadLinks = async () => {
        try {
            setLoading(true);
            const res = await affiliateApi.getMyLinks();
            setLinks(res.data || []);
        } catch (err) {
            toast.error('Failed to load affiliate links');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // The backend stores the correct link_url already. Use it directly.
    // Fallback: construct from slug + affiliate_code if link_url is missing.
    const getFullUrl = (link) => {
        if (link.link_url) return link.link_url;
        const slug = link.product?.slug || '';
        const code = link.affiliate_code || '';
        return `${window.location.origin}/shop/p/${slug}?ref=${code}`;
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            toast.success('Affiliate link copied!');
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const shareLink = async (text) => {
        if (navigator.share) {
            try {
                await navigator.share({ url: text, title: 'Check this out!' });
            } catch {
                // user cancelled
            }
        } else {
            copyToClipboard(text, 'share');
        }
    };

    const filteredLinks = links
        .filter((l) => {
            const name = l.product?.name?.toLowerCase() || '';
            const code = l.affiliate_code?.toLowerCase() || '';
            const q = searchQuery.toLowerCase();
            return name.includes(q) || code.includes(q);
        })
        .sort((a, b) => {
            if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
            if (sortBy === 'orders') return (b.orders || 0) - (a.orders || 0);
            if (sortBy === 'conversion') {
                const ra = a.clicks ? (a.orders / a.clicks) : 0;
                const rb = b.clicks ? (b.orders / b.clicks) : 0;
                return rb - ra;
            }
            // newest (default) — by generated_at descending
            return new Date(b.generated_at || 0) - new Date(a.generated_at || 0);
        });

    const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
    const totalOrders = links.reduce((s, l) => s + (l.orders || 0), 0);
    const overallConversion = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : '0.0';

    if (loading) {
        return (
            <div className="my-links-page">
                <div className="my-links-loading">
                    <Loader className="spin-icon" />
                    <p>Loading your affiliate links…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-links-page">
            {/* Page Header */}
            <div className="my-links-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <Link2 className="title-icon" />
                        My Affiliate Links
                    </h1>
                    <p className="page-subtitle">
                        Manage and share your affiliate links. Each click and order is tracked in real time.
                    </p>
                </div>
                <a href="/affiliate/marketplace" className="browse-btn">
                    <Package size={16} />
                    Browse Products
                </a>
            </div>

            {/* Summary Stats */}
            <div className="links-stats-row">
                <div className="stat-card stat-links">
                    <div className="stat-icon-wrap">
                        <Link2 size={20} />
                    </div>
                    <div>
                        <p className="stat-label">Total Links</p>
                        <p className="stat-value">{links.length}</p>
                    </div>
                </div>
                <div className="stat-card stat-clicks">
                    <div className="stat-icon-wrap">
                        <MousePointerClick size={20} />
                    </div>
                    <div>
                        <p className="stat-label">Total Clicks</p>
                        <p className="stat-value">{totalClicks.toLocaleString()}</p>
                    </div>
                </div>
                <div className="stat-card stat-orders">
                    <div className="stat-icon-wrap">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <p className="stat-label">Total Orders</p>
                        <p className="stat-value">{totalOrders.toLocaleString()}</p>
                    </div>
                </div>
                <div className="stat-card stat-conversion">
                    <div className="stat-icon-wrap">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="stat-label">Avg Conversion</p>
                        <p className="stat-value">{overallConversion}%</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="links-filter-bar">
                <div className="search-wrap">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by product name or code…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="sort-wrap">
                    <BarChart2 size={16} />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">Newest</option>
                        <option value="clicks">Most Clicks</option>
                        <option value="orders">Most Orders</option>
                        <option value="conversion">Best Conversion</option>
                    </select>
                </div>
            </div>

            {/* Links List */}
            {filteredLinks.length === 0 ? (
                <div className="links-empty">
                    <Link2 size={56} className="empty-icon" />
                    <h3>{searchQuery ? 'No links match your search' : 'No affiliate links yet'}</h3>
                    <p>
                        {searchQuery
                            ? 'Try a different search term.'
                            : 'Browse the product marketplace and apply to promote products to get started.'}
                    </p>
                    {!searchQuery && (
                        <a href="/affiliate/marketplace" className="browse-btn">
                            <Package size={16} />
                            Explore Products
                        </a>
                    )}
                </div>
            ) : (
                <div className="links-list">
                    {filteredLinks.map((link) => {
                        const fullUrl = getFullUrl(link);
                        const convRate = link.clicks
                            ? ((link.orders / link.clicks) * 100).toFixed(1)
                            : '0.0';
                        const isExpanded = expandedLink === link.id;

                        return (
                            <div key={link.id} className={`link-card ${isExpanded ? 'expanded' : ''}`}>
                                {/* Product thumbnail + name */}
                                <div className="link-card-main">
                                    <div className="link-product-info">
                                        {link.product?.thumbnail ? (
                                            <img
                                                src={link.product.thumbnail}
                                                alt={link.product.name}
                                                className="product-thumb"
                                            />
                                        ) : (
                                            <div className="product-thumb-placeholder">
                                                <Package size={24} />
                                            </div>
                                        )}
                                        <div className="product-meta">
                                            <h3 className="product-name">{link.product?.name || 'Unknown Product'}</h3>
                                            <div className="product-tags">
                                                <span className="code-badge">
                                                    <Tag size={12} />
                                                    {link.affiliate_code}
                                                </span>
                                                <span className="commission-badge">
                                                    {link.product?.commission_type === 'percentage'
                                                        ? `${link.product?.commission_rate}% commission`
                                                        : link.product?.commission_type === 'fixed'
                                                            ? `KES ${parseFloat(link.product?.fixed_commission || 0).toLocaleString()} / sale`
                                                            : 'Commission'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini stats */}
                                    <div className="link-mini-stats">
                                        <div className="mini-stat">
                                            <MousePointerClick size={14} />
                                            <span>{(link.clicks || 0).toLocaleString()}</span>
                                            <small>clicks</small>
                                        </div>
                                        <div className="mini-stat">
                                            <ShoppingCart size={14} />
                                            <span>{(link.orders || 0).toLocaleString()}</span>
                                            <small>orders</small>
                                        </div>
                                        <div className="mini-stat highlight">
                                            <TrendingUp size={14} />
                                            <span>{convRate}%</span>
                                            <small>conv.</small>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="link-actions">
                                        <button
                                            className={`action-btn copy-btn ${copied === link.id ? 'copied' : ''}`}
                                            onClick={() => copyToClipboard(fullUrl, link.id)}
                                            title="Copy link"
                                        >
                                            {copied === link.id ? (
                                                <>
                                                    <CheckCircle size={15} />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={15} />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="action-btn share-btn"
                                            onClick={() => shareLink(fullUrl)}
                                            title="Share link"
                                        >
                                            <Share2 size={15} />
                                            Share
                                        </button>
                                        <a
                                            href={fullUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn open-btn"
                                            title="Open in new tab"
                                        >
                                            <ExternalLink size={15} />
                                        </a>
                                        <button
                                            className="action-btn expand-btn"
                                            onClick={() => setExpandedLink(isExpanded ? null : link.id)}
                                            title={isExpanded ? 'Collapse' : 'Show link'}
                                        >
                                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded URL row */}
                                {isExpanded && (
                                    <div className="link-url-row">
                                        <input
                                            type="text"
                                            readOnly
                                            value={fullUrl}
                                            className="link-url-input"
                                            onClick={(e) => e.target.select()}
                                        />
                                        <button
                                            className={`url-copy-btn ${copied === link.id ? 'copied' : ''}`}
                                            onClick={() => copyToClipboard(fullUrl, link.id)}
                                        >
                                            {copied === link.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                                            {copied === link.id ? 'Copied!' : 'Copy'}
                                        </button>
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
