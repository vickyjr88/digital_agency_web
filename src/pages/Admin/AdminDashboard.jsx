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
        <div className="admin-dashboard bg-gray-50 min-h-screen">
            <header className="dashboard-header bg-white shadow-sm px-8 py-6 sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage users, brands, content, and system health</p>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto p-6">
                <div className="flex flex-col md:flex-row gap-6 relative items-start">
                    {/* Sidebar Navigation */}
                    <nav className="admin-sidebar md:w-64 flex-shrink-0 bg-white shadow-sm rounded-xl overflow-hidden sticky top-32 self-start">
                        <div className="p-4 bg-gray-50/50 border-b font-bold text-gray-400 uppercase text-[10px] tracking-wider">Core Platform</div>
                        <div className="flex flex-col p-2 space-y-1">
                            <TabButton name="users" label="Users" icon="👥" />
                            <TabButton name="brands" label="Brands" icon="🏢" />
                            <TabButton name="content" label="Content" icon="📝" />
                            <TabButton name="failures" label="Failures/Logs" icon="⚠️" />
                        </div>

                        <div className="p-4 bg-gray-50/50 border-b border-t font-bold text-gray-400 uppercase text-[10px] tracking-wider mt-2">Marketplace</div>
                        <div className="flex flex-col p-2 space-y-1">
                            <TabButton name="influencers" label="Influencers" icon="🤳" />
                            <TabButton name="packages" label="Packages" icon="📦" />
                            <TabButton name="campaigns" label="Campaigns" icon="🎯" />
                        </div>
                    </nav>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 bg-white shadow-sm rounded-xl border border-gray-100">
                        {!children && (
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 rounded-t-xl">
                                <h2 className="text-lg font-bold capitalize text-gray-800 flex items-center gap-2">
                                    {activeTab} Management
                                </h2>
                                <button onClick={fetchAdminData} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors" title="Refresh">
                                    <span className="text-lg">↻</span>
                                </button>
                            </div>
                        )}

                        <div className="p-6">
                            {children ? (
                                children
                            ) : (
                                loading ? (
                                    <div className="loading-state py-20 flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                        <p className="text-gray-500 font-medium">Loading data...</p>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-300">
                                        {activeTab === 'users' && <UserManagement users={data.users} />}
                                        {activeTab === 'brands' && <BrandManagement brands={data.brands} />}
                                        {activeTab === 'content' && <ContentManagement content={data.content} />}
                                        {activeTab === 'failures' && <FailureManagement failures={data.failures} />}
                                        {activeTab === 'influencers' && <InfluencerManagement influencers={data.influencers} onVerify={handleVerifyInfluencer} />}
                                        {activeTab === 'packages' && <PackageManagement packages={data.packages} formatPrice={formatPrice} />}
                                        {activeTab === 'campaigns' && <CampaignManagement campaigns={data.campaigns} formatPrice={formatPrice} />}
                                    </div>
                                )
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

// --- Sub-components ---

// --- Sub-components ---

function UserManagement({ users }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{user.name || 'Unknown User'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">{user.role}</span></td>
                            <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">{user.subscription_tier}</span></td>
                            <td className="p-4 text-sm text-gray-600 capitalize">{user.subscription_status}</td>
                            <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                                <Link to={`/admin/user/${user.id}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-800 hover:underline">Manage</Link>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No users found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function BrandManagement({ brands }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand Name</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {brands.map(brand => (
                        <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{brand.name}</td>
                            <td className="p-4">
                                <Link to={`/admin/user/${brand.owner?.id}`} className="text-indigo-600 hover:underline text-sm">
                                    {brand.owner?.email}
                                </Link>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{brand.industry || 'N/A'}</td>
                            <td className="p-4 text-sm text-gray-500">{new Date(brand.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {brands.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No brands found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function ContentManagement({ content }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content ID</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref Trend</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generated</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {content.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-xs text-gray-500">{c.id.substring(0, 8)}...</td>
                            <td className="p-4">
                                <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{c.trend}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${c.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-500">{new Date(c.generated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                    {content.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No content found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function FailureManagement({ failures }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Error</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {failures.map(fail => (
                        <tr key={fail.id} className="hover:bg-red-50/30 transition-colors">
                            <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(fail.timestamp).toLocaleString()}</td>
                            <td className="p-4">
                                <div className="text-xs text-gray-500 mb-1">Brand: <span className="font-mono">{fail.brand_id?.substring(0, 8)}</span></div>
                                <div className="font-medium text-gray-900">{fail.trend}</div>
                            </td>
                            <td className="p-4 text-red-600 text-sm font-mono whitespace-pre-wrap max-w-md">{fail.error_message}</td>
                        </tr>
                    ))}
                    {failures.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-green-600 font-medium bg-green-50/30">✅ No failures recorded</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function InfluencerManagement({ influencers, onVerify }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Niche</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {influencers.map(inf => (
                        <tr key={inf.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <Link to={`/marketplace/influencer/${inf.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {inf.profile_picture_url ? <img src={inf.profile_picture_url} className="w-full h-full object-cover" /> : <span className="text-gray-500 font-bold">{inf.display_name?.[0]}</span>}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{inf.display_name}</div>
                                        <div className="text-xs text-gray-500">@{inf.handle || inf.username}</div>
                                    </div>
                                </Link>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{inf.niche}</td>
                            <td className="p-4 text-sm text-gray-900 font-medium">{new Intl.NumberFormat().format(inf.follower_count || 0)}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs capitalize font-medium ${inf.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {inf.verification_status}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    {inf.verification_status === 'pending' && (
                                        <>
                                            <button className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors" onClick={() => onVerify(inf.id, 'approve')}>Approve</button>
                                            <button className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors" onClick={() => onVerify(inf.id, 'reject')}>Reject</button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {influencers.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No influencers found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function PackageManagement({ packages, formatPrice }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {packages.map(pkg => (
                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{pkg.name}</td>
                            <td className="p-4 text-sm text-gray-600">{pkg.influencer?.display_name || 'N/A'}</td>
                            <td className="p-4 font-mono text-sm text-gray-900">{formatPrice(pkg.price)}</td>
                            <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize text-gray-600">{pkg.status}</span></td>
                            <td className="p-4 text-sm text-gray-600">{pkg.times_purchased}</td>
                        </tr>
                    ))}
                    {packages.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No packages found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function CampaignManagement({ campaigns, formatPrice }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign ID</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Influencer</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {campaigns.map(cp => (
                        <tr key={cp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-xs font-mono text-gray-500">{cp.id.substring(0, 8)}</td>
                            <td className="p-4 text-sm font-medium text-gray-900">{cp.brand?.name}</td>
                            <td className="p-4 text-sm text-gray-600">{cp.influencer?.display_name}</td>
                            <td className="p-4 font-mono text-sm text-gray-900">{formatPrice(cp.package?.price)}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium uppercase text-gray-600">{cp.status}</span>
                            </td>
                        </tr>
                    ))}
                    {campaigns.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No campaigns found</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
