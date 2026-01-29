/**
 * Admin Dashboard
 * Management interface for platform administrators
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { influencerApi, packageApi, campaignApi } from '../../services/marketplaceApi';
import './AdminDashboard.css';
import { toast } from 'sonner';

export default function AdminDashboard({ defaultTab = 'users', children }) {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [data, setData] = useState({
        users: [],
        brands: [],
        content: [],
        failures: [],
        influencers: [],
        packages: [],
        campaigns: []
    });

    useEffect(() => {
        fetchAdminData();
    }, [activeTab]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const res = await api.getAdminUsers();
                setData(d => ({ ...d, users: res }));
            } else if (activeTab === 'brands') {
                const res = await api.getAdminBrands();
                setData(d => ({ ...d, brands: res }));
            } else if (activeTab === 'content') {
                const res = await api.getAdminContent();
                setData(d => ({ ...d, content: res }));
            } else if (activeTab === 'failures') {
                const res = await api.getGeneratorFailures();
                setData(d => ({ ...d, failures: res }));
            } else if (activeTab === 'influencers') {
                const allRes = await influencerApi.getAllAdmin().catch(() => ({ influencers: [] }));
                setData(d => ({ ...d, influencers: allRes.influencers || [] }));
            } else if (activeTab === 'packages') {
                const allRes = await packageApi.getAllAdmin().catch(() => ({ packages: [] }));
                setData(d => ({ ...d, packages: allRes.packages || [] }));
            } else if (activeTab === 'campaigns') {
                const allRes = await campaignApi.getAllAdmin().catch(() => ({ campaigns: [] }));
                setData(d => ({ ...d, campaigns: allRes.campaigns || [] }));
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyInfluencer = async (influencerId, action) => {
        try {
            await influencerApi.verify(influencerId, action);
            fetchAdminData();
            toast.success(`Influencer ${action}ed`);
        } catch (error) {
            console.error('Error verifying influencer:', error);
            toast.error('Failed to update influencer status');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format((price || 0) / 100);
    };

    const TabButton = ({ name, label, icon }) => (
        <button
            className={activeTab === name ? 'active' : ''}
            onClick={() => setActiveTab(name)}
        >
            <span className="text-lg">{icon}</span> {label}
        </button>
    );

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>System Administration</h1>
                    <p>Manage users, brands, content, and system health</p>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-6 mt-6">
                {/* Sidebar Navigation */}
                <nav className="admin-sidebar md:w-64 flex-shrink-0 bg-white shadow-sm rounded-lg overflow-hidden h-fit">
                    <div className="p-4 bg-gray-50 border-b font-bold text-gray-500 uppercase text-xs">Core Platform</div>
                    <div className="flex flex-col">
                        <TabButton name="users" label="Users" icon="👥" />
                        <TabButton name="brands" label="Brands" icon="🏢" />
                        <TabButton name="content" label="Content" icon="📝" />
                        <TabButton name="failures" label="Failures/Logs" icon="⚠️" />
                    </div>

                    <div className="p-4 bg-gray-50 border-b border-t font-bold text-gray-500 uppercase text-xs mt-2">Marketplace</div>
                    <div className="flex flex-col">
                        <TabButton name="influencers" label="Influencers" icon="🤳" />
                        <TabButton name="packages" label="Packages" icon="📦" />
                        <TabButton name="campaigns" label="Campaigns" icon="🎯" />
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-white shadow-sm rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold capitalize">{activeTab} Management</h2>
                        <button onClick={fetchAdminData} className="p-2 hover:bg-gray-100 rounded-full" title="Refresh">🔄</button>
                    </div>

                    {children ? (
                        children
                    ) : (
                        loading ? (
                            <div className="loading-state py-12">
                                <div className="spinner"></div>
                                <p className="mt-4 text-gray-500">Loading data...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'users' && <UserManagement users={data.users} />}
                                {activeTab === 'brands' && <BrandManagement brands={data.brands} />}
                                {activeTab === 'content' && <ContentManagement content={data.content} />}
                                {activeTab === 'failures' && <FailureManagement failures={data.failures} />}
                                {activeTab === 'influencers' && <InfluencerManagement influencers={data.influencers} onVerify={handleVerifyInfluencer} />}
                                {activeTab === 'packages' && <PackageManagement packages={data.packages} formatPrice={formatPrice} />}
                                {activeTab === 'campaigns' && <CampaignManagement campaigns={data.campaigns} formatPrice={formatPrice} />}
                            </>
                        )
                    )}
                </main>
            </div>
        </div>
    );
}

// --- Sub-components ---

function UserManagement({ users }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="p-3">User</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Tier</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Joined</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-t hover:bg-gray-50">
                            <td className="p-3">
                                <div className="font-bold">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </td>
                            <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{user.role}</span></td>
                            <td className="p-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs uppercase">{user.subscription_tier}</span></td>
                            <td className="p-3">{user.subscription_status}</td>
                            <td className="p-3 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                                <Link to={`/admin/user/${user.id}`} className="text-blue-600 text-sm hover:underline">Manage</Link>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-gray-500">No users found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function BrandManagement({ brands }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="p-3">Brand Name</th>
                        <th className="p-3">Owner</th>
                        <th className="p-3">Industry</th>
                        <th className="p-3">Created</th>
                    </tr>
                </thead>
                <tbody>
                    {brands.map(brand => (
                        <tr key={brand.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{brand.name}</td>
                            <td className="p-3">
                                <Link to={`/admin/user/${brand.owner?.id}`} className="text-blue-600 hover:underline">
                                    {brand.owner?.email}
                                </Link>
                            </td>
                            <td className="p-3">{brand.industry || 'N/A'}</td>
                            <td className="p-3 text-sm text-gray-500">{new Date(brand.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {brands.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No brands found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function ContentManagement({ content }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="p-3">Content ID</th>
                        <th className="p-3">Ref Trend</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Generated</th>
                    </tr>
                </thead>
                <tbody>
                    {content.map(c => (
                        <tr key={c.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs text-gray-600">{c.id.substring(0, 8)}...</td>
                            <td className="p-3">
                                <div className="font-medium line-clamp-1">{c.trend}</div>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="p-3 text-sm text-gray-500">{new Date(c.generated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                    {content.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No content found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function FailureManagement({ failures }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Details</th>
                        <th className="p-3">Error</th>
                    </tr>
                </thead>
                <tbody>
                    {failures.map(fail => (
                        <tr key={fail.id} className="border-t hover:bg-red-50">
                            <td className="p-3 text-sm whitespace-nowrap">{new Date(fail.timestamp).toLocaleString()}</td>
                            <td className="p-3">
                                <div className="text-xs text-gray-500 mb-1">Brand: {fail.brand_id}</div>
                                <div className="font-medium">{fail.trend}</div>
                            </td>
                            <td className="p-3 text-red-600 text-sm font-mono whitespace-pre-wrap">{fail.error_message}</td>
                        </tr>
                    ))}
                    {failures.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-green-600">✅ No failures recorded</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function InfluencerManagement({ influencers, onVerify }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="p-3">Influencer</th>
                        <th className="p-3">Niche</th>
                        <th className="p-3">Followers</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {influencers.map(inf => (
                        <tr key={inf.id} className="border-t hover:bg-gray-50">
                            <td className="p-3">
                                <Link to={`/marketplace/influencer/${inf.id}`} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                        {inf.profile_picture_url ? <img src={inf.profile_picture_url} className="w-full h-full object-cover" /> : inf.display_name?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium">{inf.display_name}</div>
                                        <div className="text-xs text-gray-500">@{inf.handle || inf.username}</div>
                                    </div>
                                </Link>
                            </td>
                            <td className="p-3">{inf.niche}</td>
                            <td className="p-3">{new Intl.NumberFormat().format(inf.follower_count || 0)}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs capitalize ${inf.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {inf.verification_status}
                                </span>
                            </td>
                            <td className="p-3">
                                <div className="flex gap-2">
                                    {inf.verification_status === 'pending' && (
                                        <>
                                            <button className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700" onClick={() => onVerify(inf.id, 'approve')}>Approve</button>
                                            <button className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700" onClick={() => onVerify(inf.id, 'reject')}>Reject</button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {influencers.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-500">No influencers found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function PackageManagement({ packages, formatPrice }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="p-3">Package</th>
                        <th className="p-3">Influencer</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Sales</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map(pkg => (
                        <tr key={pkg.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{pkg.name}</td>
                            <td className="p-3">{pkg.influencer?.display_name || 'N/A'}</td>
                            <td className="p-3 font-mono">{formatPrice(pkg.price)}</td>
                            <td className="p-3"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{pkg.status}</span></td>
                            <td className="p-3">{pkg.times_purchased}</td>
                        </tr>
                    ))}
                    {packages.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-500">No packages found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function CampaignManagement({ campaigns, formatPrice }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="p-3">Campaign ID</th>
                        <th className="p-3">Brand</th>
                        <th className="p-3">Influencer</th>
                        <th className="p-3">Value</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map(cp => (
                        <tr key={cp.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 text-xs font-mono">{cp.id.substring(0, 8)}</td>
                            <td className="p-3">{cp.brand?.name}</td>
                            <td className="p-3">{cp.influencer?.display_name}</td>
                            <td className="p-3 font-mono">{formatPrice(cp.package?.price)}</td>
                            <td className="p-3">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs uppercase">{cp.status}</span>
                            </td>
                        </tr>
                    ))}
                    {campaigns.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-500">No campaigns found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
