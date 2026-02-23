import { useState, useEffect } from 'react';
import { tumansiApi } from '../../services/tumansiApi';
import { toast } from 'sonner';
import { Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import './Tumanasi.css';

const STATUS_OPTIONS = [
    'all', 'pending_assignment', 'assigned', 'en_route_pickup', 'collected',
    'en_route_delivery', 'delivered', 'payment_requested', 'completed', 'cancelled'
];

function StatCard({ label, value, sub }) {
    return (
        <div className="tum-astat">
            <div className="tum-astat-val">{value}</div>
            <div className="tum-astat-label">{label}</div>
            {sub && <div style={{ fontSize: '0.72rem', color: 'var(--tum-green)', marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

export default function TumansiAdmin() {
    const [tab, setTab] = useState('deliveries');
    const [stats, setStats] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [riders, setRiders] = useState([]);
    const [zones, setZones] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verifyFilter, setVerifyFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [statsRes, delivRes, riderRes, zoneRes] = await Promise.all([
                tumansiApi.adminStats(),
                tumansiApi.adminDeliveries({ limit: 100 }),
                tumansiApi.adminRiders({}),
                tumansiApi.listZones(),
            ]);
            setStats(statsRes.data);
            setDeliveries(delivRes.data);
            setRiders(riderRes.data);
            setZones(zoneRes.data);
        } catch (err) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const filterDeliveries = () => {
        let d = deliveries;
        if (statusFilter !== 'all') d = d.filter(x => x.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            d = d.filter(x =>
                x.tracking_number.toLowerCase().includes(q) ||
                x.customer_name.toLowerCase().includes(q) ||
                x.customer_phone.includes(q)
            );
        }
        return d;
    };

    const filterRiders = () => {
        let r = riders;
        if (verifyFilter === 'verified') r = r.filter(x => x.is_verified);
        if (verifyFilter === 'pending') r = r.filter(x => !x.is_verified);
        if (search) {
            const q = search.toLowerCase();
            r = r.filter(x => x.full_name.toLowerCase().includes(q) || x.phone.includes(q));
        }
        return r;
    };

    const verifyRider = async (id, approved) => {
        try {
            await tumansiApi.verifyRider(id, { is_verified: approved });
            toast.success(approved ? 'Rider approved!' : 'Rider rejected');
            setRiders(rs => rs.map(r => r.id === id ? { ...r, is_verified: approved } : r));
        } catch {
            toast.error('Action failed');
        }
    };

    const STATUS_COLOR = {
        pending_assignment: '#92400E', assigned: '#1E40AF', en_route_pickup: '#5B21B6',
        collected: '#065F46', en_route_delivery: '#991B1B', delivered: '#065F46',
        payment_requested: '#92400E', completed: '#065F46', cancelled: '#64748B',
    };

    if (loading) return (
        <div className="tum-admin-page" style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--tum-gray-400)' }}>
            <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem' }} />
            <p>Loading Tumanasi admin data…</p>
        </div>
    );

    return (
        <div className="tum-admin-page">
            <div className="tum-admin-header">
                <h1>📦 Tumanasi Admin</h1>
                <button onClick={loadAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--tum-blue-lt)', color: 'var(--tum-blue)', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', fontSize: '0.85rem' }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="tum-admin-stats">
                    <StatCard label="Total Deliveries" value={stats.total_deliveries} />
                    <StatCard label="Active Right Now" value={stats.active_deliveries} />
                    <StatCard label="Completed Today" value={stats.completed_today}
                        sub={`KES ${parseFloat(stats.revenue_today_kes).toLocaleString()} revenue`} />
                    <StatCard label="Total Revenue" value={`KES ${parseFloat(stats.revenue_total_kes).toLocaleString()}`} />
                    <StatCard label="Total Riders" value={stats.total_riders} />
                    <StatCard label="Online Riders" value={stats.active_riders} />
                    <StatCard label="Verified Riders" value={stats.verified_riders} />
                    <StatCard label="Completion Rate" value={`${stats.avg_completion_rate || 0}%`} />
                </div>
            )}

            {/* Tabs */}
            <div className="tum-admin-tabs">
                {[['deliveries', '🚚 Deliveries'], ['riders', '🏍️ Riders'], ['zones', '📍 Zones']].map(([k, l]) => (
                    <button key={k} className={`tum-admin-tab ${tab === k ? 'active' : ''}`} onClick={() => { setTab(k); setSearch(''); }}>
                        {l}
                    </button>
                ))}
            </div>

            {/* ── DELIVERIES TAB ── */}
            {tab === 'deliveries' && (
                <div className="tum-admin-table-wrap">
                    <div className="tum-admin-toolbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Search size={16} style={{ color: 'var(--tum-gray-400)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search tracking number, name, phone…" style={{ flex: 1 }} />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tum-admin-table">
                            <thead>
                                <tr>
                                    <th>Tracking</th><th>Customer</th><th>Phone</th>
                                    <th>Pickup</th><th>Dropoff</th><th>Type</th>
                                    <th>Price</th><th>Rider</th><th>Status</th><th>Booked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterDeliveries().map(d => (
                                    <tr key={d.id}>
                                        <td><span style={{ fontWeight: 800, letterSpacing: '.04em', color: 'var(--tum-blue)', fontSize: '0.8rem' }}>{d.tracking_number}</span></td>
                                        <td style={{ fontWeight: 600 }}>{d.customer_name}</td>
                                        <td style={{ color: 'var(--tum-gray-600)', fontSize: '0.82rem' }}>{d.customer_phone}</td>
                                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{d.pickup_address}</td>
                                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{d.dropoff_address}</td>
                                        <td style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{d.errand_type}</td>
                                        <td style={{ fontWeight: 700 }}>KES {parseFloat(d.quoted_price_kes).toLocaleString()}</td>
                                        <td style={{ fontSize: '0.82rem' }}>{d.rider_name || <span style={{ color: 'var(--tum-gray-400)' }}>Unassigned</span>}</td>
                                        <td>
                                            <span style={{ background: STATUS_COLOR[d.status] + '22', color: STATUS_COLOR[d.status], padding: '3px 10px', borderRadius: 50, fontWeight: 700, fontSize: '0.73rem', whiteSpace: 'nowrap' }}>
                                                {d.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.78rem', color: 'var(--tum-gray-400)' }}>{new Date(d.created_at).toLocaleDateString('en-KE')}</td>
                                    </tr>
                                ))}
                                {filterDeliveries().length === 0 && (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--tum-gray-400)', padding: '2rem' }}>No deliveries found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── RIDERS TAB ── */}
            {tab === 'riders' && (
                <div className="tum-admin-table-wrap">
                    <div className="tum-admin-toolbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Search size={16} style={{ color: 'var(--tum-gray-400)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search name or phone…" style={{ flex: 1 }} />
                        </div>
                        <select value={verifyFilter} onChange={e => setVerifyFilter(e.target.value)}>
                            <option value="all">All Riders</option>
                            <option value="pending">Pending Verification</option>
                            <option value="verified">Verified</option>
                        </select>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tum-admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th><th>Phone</th><th>Vehicle</th><th>Reg No</th>
                                    <th>Deliveries</th><th>Rating</th><th>Earnings</th>
                                    <th>Status</th><th>Online</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterRiders().map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 600 }}>{r.full_name}</td>
                                        <td style={{ fontSize: '0.82rem' }}>{r.phone}</td>
                                        <td style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{r.vehicle_type?.replace(/_/g, ' ')}</td>
                                        <td style={{ fontSize: '0.82rem' }}>{r.vehicle_reg || '—'}</td>
                                        <td style={{ textAlign: 'center' }}>{r.completed_deliveries}</td>
                                        <td>⭐ {parseFloat(r.average_rating || 0).toFixed(1)}</td>
                                        <td>KES {parseFloat(r.total_earnings_kes || 0).toLocaleString()}</td>
                                        <td>
                                            {r.is_verified
                                                ? <span style={{ color: 'var(--tum-green)', fontWeight: 700, fontSize: '0.82rem' }}>✅ Verified</span>
                                                : <span style={{ color: '#92400E', fontWeight: 700, fontSize: '0.82rem' }}>⏳ Pending</span>}
                                        </td>
                                        <td>
                                            <span style={{ color: r.is_available ? 'var(--tum-green)' : 'var(--tum-gray-400)', fontWeight: 700, fontSize: '0.82rem' }}>
                                                {r.is_available ? '🟢 Online' : '⚫ Offline'}
                                            </span>
                                        </td>
                                        <td>
                                            {!r.is_verified ? (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="tum-verify-btn approve" onClick={() => verifyRider(r.id, true)}>
                                                        <CheckCircle size={12} style={{ display: 'inline', marginRight: 3 }} />Approve
                                                    </button>
                                                    <button className="tum-verify-btn reject" onClick={() => verifyRider(r.id, false)}>
                                                        <XCircle size={12} style={{ display: 'inline', marginRight: 3 }} />Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="tum-verify-btn reject" onClick={() => verifyRider(r.id, false)}>
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filterRiders().length === 0 && (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--tum-gray-400)', padding: '2rem' }}>No riders found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── ZONES TAB ── */}
            {tab === 'zones' && (
                <div className="tum-admin-table-wrap">
                    <div className="tum-admin-toolbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Search size={16} style={{ color: 'var(--tum-gray-400)' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search area or zone…" style={{ flex: 1 }} />
                        </div>
                        <span style={{ color: 'var(--tum-gray-400)', fontSize: '0.85rem' }}>{zones.length} zones</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tum-admin-table">
                            <thead>
                                <tr><th>Area Name</th><th>Zone</th><th>Price (KES)</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {zones
                                    .filter(z => !search || z.area_name.toLowerCase().includes(search.toLowerCase()) || z.zone_name.toLowerCase().includes(search.toLowerCase()))
                                    .map(z => (
                                        <tr key={z.id}>
                                            <td style={{ fontWeight: 600 }}>{z.area_name}</td>
                                            <td style={{ color: 'var(--tum-gray-600)', fontSize: '0.88rem' }}>{z.zone_name}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--tum-blue)' }}>KES {parseFloat(z.price_kes).toLocaleString()}</td>
                                            <td>
                                                <span style={{ color: z.is_active ? 'var(--tum-green)' : 'var(--tum-gray-400)', fontWeight: 700, fontSize: '0.82rem' }}>
                                                    {z.is_active ? '✅ Active' : '⛔ Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
