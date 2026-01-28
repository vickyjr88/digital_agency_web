/**
 * Admin Dashboard
 * Management interface for platform administrators
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { influencerApi, packageApi, campaignApi } from '../../services/marketplaceApi';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('influencers');
    const [influencers, setInfluencers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState({
        pending_influencers: 0,
        active_packages: 0,
        total_campaigns: 0,
        active_disputes: 0
    });

    useEffect(() => {
        fetchAdminData();
    }, [activeTab]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // Fetch stats and specific data based on active tab
            if (activeTab === 'influencers') {
                const pendingRes = await influencerApi.getPending().catch(() => []);
                const allRes = await influencerApi.getAllAdmin().catch(() => ({ influencers: [] }));
                setInfluencers(allRes.influencers || []);
                setStats(s => ({ ...s, pending_influencers: pendingRes.length }));
            } else if (activeTab === 'packages') {
                const allRes = await packageApi.getAllAdmin().catch(() => ({ packages: [] }));
                setPackages(allRes.packages || []);
                setStats(s => ({ ...s, active_packages: (allRes.packages || []).filter(p => p.status === 'active').length }));
            } else if (activeTab === 'campaigns') {
                const allRes = await campaignApi.getAllAdmin().catch(() => ({ campaigns: [] }));
                setCampaigns(allRes.campaigns || []);
                const disputes = (allRes.campaigns || []).filter(c => c.status === 'disputed').length;
                setStats(s => ({
                    ...s,
                    total_campaigns: (allRes.campaigns || []).length,
                    active_disputes: disputes
                }));
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyInfluencer = async (influencerId, action) => {
        try {
            await influencerApi.verify(influencerId, action);
            fetchAdminData(); // Refresh list
        } catch (error) {
            console.error('Error verifying influencer:', error);
            alert('Failed to update influencer status');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(price || 0);
    };

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Staff Dashboard</h1>
                    <p>Manage Dexter Marketplace influencers, packages, and campaigns</p>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon pending">⏳</div>
                    <div className="stat-content">
                        <span className="stat-label">Pending Influencers</span>
                        <span className="stat-value">{stats.pending_influencers}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">📦</div>
                    <div className="stat-content">
                        <span className="stat-label">Active Packages</span>
                        <span className="stat-value">{stats.active_packages}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon total">🎯</div>
                    <div className="stat-content">
                        <span className="stat-label">Total Campaigns</span>
                        <span className="stat-value">{stats.total_campaigns}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon disputes">⚠️</div>
                    <div className="stat-content">
                        <span className="stat-label">Active Disputes</span>
                        <span className="stat-value">{stats.active_disputes}</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="admin-tabs">
                <button
                    className={activeTab === 'influencers' ? 'active' : ''}
                    onClick={() => setActiveTab('influencers')}
                >
                    🤳 Influencers
                </button>
                <button
                    className={activeTab === 'packages' ? 'active' : ''}
                    onClick={() => setActiveTab('packages')}
                >
                    📦 Packages
                </button>
                <button
                    className={activeTab === 'campaigns' ? 'active' : ''}
                    onClick={() => setActiveTab('campaigns')}
                >
                    🎯 Campaigns
                </button>
            </nav>

            <main className="tab-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading management data...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'influencers' && (
                            <InfluencerManagement
                                influencers={influencers}
                                onVerify={handleVerifyInfluencer}
                            />
                        )}
                        {activeTab === 'packages' && (
                            <PackageManagement
                                packages={packages}
                                formatPrice={formatPrice}
                            />
                        )}
                        {activeTab === 'campaigns' && (
                            <CampaignManagement
                                campaigns={campaigns}
                                formatPrice={formatPrice}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// --- Sub-components ---

function InfluencerManagement({ influencers, onVerify }) {
    return (
        <div className="management-section">
            <div className="tab-header">
                <h2>Influencer Management</h2>
            </div>

            {influencers.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Influencer</th>
                                <th>Niche</th>
                                <th>Followers</th>
                                <th>Verification</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {influencers.map(inf => (
                                <tr key={inf.id}>
                                    <td>
                                        <Link to={`/marketplace/influencer/${inf.id}`} className="user-info">
                                            <div className="user-avatar">
                                                {inf.profile_picture_url ? (
                                                    <img src={inf.profile_picture_url} alt={inf.display_name} />
                                                ) : (
                                                    inf.display_name?.charAt(0)
                                                )}
                                            </div>
                                            <div className="user-details">
                                                <span className="name">{inf.display_name}</span>
                                                <span className="handle">@{inf.handle || inf.username}</span>
                                            </div>
                                        </Link>
                                    </td>
                                    <td>{inf.niche}</td>
                                    <td>{new Intl.NumberFormat().format(inf.follower_count || 0)}</td>
                                    <td>
                                        <span className={`status-badge ${inf.verification_status?.toLowerCase()}`}>
                                            {inf.verification_status}
                                        </span>
                                    </td>
                                    <td>{new Date(inf.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {inf.verification_status === 'pending' && (
                                                <>
                                                    <button className="btn-approve" onClick={() => onVerify(inf.id, 'approve')}>Approve</button>
                                                    <button className="btn-reject" onClick={() => onVerify(inf.id, 'reject')}>Reject</button>
                                                </>
                                            )}
                                            <Link to={`/marketplace/influencer/${inf.id}`} className="btn-view">View</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <span className="icon">🤳</span>
                    <p>No influencers found matching the criteria</p>
                </div>
            )}
        </div>
    );
}

function PackageManagement({ packages, formatPrice }) {
    return (
        <div className="management-section">
            <div className="tab-header">
                <h2>Package Management</h2>
            </div>

            {packages.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Package Name</th>
                                <th>Influencer</th>
                                <th>Platform</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Sales</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map(pkg => (
                                <tr key={pkg.id}>
                                    <td>
                                        <strong>{pkg.name}</strong>
                                        <p className="text-xs text-gray-500">{pkg.content_type}</p>
                                    </td>
                                    <td>{pkg.influencer?.display_name || 'Unknown'}</td>
                                    <td>{pkg.platform}</td>
                                    <td>{formatPrice(pkg.price)}</td>
                                    <td>
                                        <span className={`status-badge ${pkg.status?.toLowerCase()}`}>
                                            {pkg.status}
                                        </span>
                                    </td>
                                    <td>{pkg.times_purchased || 0}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/marketplace/package/${pkg.id}`} className="btn-view">View</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <span className="icon">📦</span>
                    <p>No packages found in the system</p>
                </div>
            )}
        </div>
    );
}

function CampaignManagement({ campaigns, formatPrice }) {
    return (
        <div className="management-section">
            <div className="tab-header">
                <h2>Campaign Tracking</h2>
            </div>

            {campaigns.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Package</th>
                                <th>Influencer</th>
                                <th>Brand</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(cp => (
                                <tr key={cp.id}>
                                    <td className="text-xs font-mono">{cp.id.substring(0, 8)}</td>
                                    <td>{cp.package?.name || 'Custom'}</td>
                                    <td>{cp.influencer?.display_name || 'N/A'}</td>
                                    <td>{cp.brand?.name || 'N/A'}</td>
                                    <td>{formatPrice(cp.package?.price || 0)}</td>
                                    <td>
                                        <span className={`status-badge ${cp.status?.toLowerCase()}`}>
                                            {cp.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/campaigns/${cp.id}`} className="btn-view">Details</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <span className="icon">🎯</span>
                    <p>No campaigns found in the system</p>
                </div>
            )}
        </div>
    );
}
