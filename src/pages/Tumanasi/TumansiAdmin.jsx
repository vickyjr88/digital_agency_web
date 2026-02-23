import { useState, useEffect, useCallback } from 'react';
import { tumansiApi } from '../../services/tumansiApi';
import { toast } from 'sonner';
import {
    BarChart3, Truck, Users, MapPin, RefreshCw, Search,
    CheckCircle, XCircle, Plus, Edit2, Trash2, ToggleLeft,
    ToggleRight, DollarSign, X, Save, UserCheck,
    AlertTriangle, FileEdit,
} from 'lucide-react';
import './Tumanasi.css';

/* ─── Colour map for delivery statuses ─────────────────────────────────────── */
const S_COLOR = {
    pending_assignment: ['#92400E', '#FEF3C7'],
    assigned: ['#1E40AF', '#DBEAFE'],
    en_route_pickup: ['#5B21B6', '#EDE9FE'],
    collected: ['#065F46', '#D1FAE5'],
    en_route_delivery: ['#991B1B', '#FEE2E2'],
    delivered: ['#065F46', '#D1FAE5'],
    payment_requested: ['#92400E', '#FEF3C7'],
    completed: ['#065F46', '#D1FAE5'],
    cancelled: ['#374151', '#F3F4F6'],
};

const ERRAND_TYPES = ['parcel', 'document', 'food', 'shopping', 'errand'];
const STATUSES = ['pending_assignment', 'assigned', 'en_route_pickup', 'collected', 'en_route_delivery', 'delivered', 'payment_requested', 'completed', 'cancelled'];
const PAY_METHODS = ['cash_on_delivery', 'mobile_money', 'card'];
const PAY_STATUSES = ['pending', 'paid', 'failed'];

/* ─── Sidebar items ─────────────────────────────────────────────────────────── */
const SIDEBAR = [
    { key: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { key: 'deliveries', icon: Truck, label: 'Deliveries' },
    { key: 'riders', icon: Users, label: 'Riders' },
    { key: 'zones', icon: MapPin, label: 'Zones & Pricing' },
];

/* ─── Stat card ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, color = '#0f62a8' }) {
    return (
        <div style={{
            background: '#fff', borderRadius: 14, padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
            borderLeft: `4px solid ${color}`,
        }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3, fontWeight: 600 }}>{label}</div>
            {sub && <div style={{ fontSize: '0.72rem', color: color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
        </div>
    );
}

/* ─── Modal wrapper ─────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
            <div style={{
                background: '#fff', borderRadius: 18, width: '100%', maxWidth: 520,
                boxShadow: '0 20px 60px rgba(0,0,0,.2)', overflow: 'hidden',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
                }}>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: '1.5rem' }}>{children}</div>
            </div>
        </div>
    );
}

/* ─── Input helper ──────────────────────────────────────────────────────────── */
function Field({ label, children }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                {label}
            </label>
            {children}
        </div>
    );
}

const inp = { width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'Poppins, sans-serif', outline: 'none', boxSizing: 'border-box' };

/* ═══════════════════════════════════════════════════════════ MAIN COMPONENT ═══ */
export default function TumansiAdmin() {
    const [section, setSection] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [riders, setRiders] = useState([]);
    const [zones, setZones] = useState([]);
    const [availRiders, setAvailRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile toggle

    /* filters */
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verifyFilter, setVerifyFilter] = useState('all');
    const [zoneSearch, setZoneSearch] = useState('');

    /* modals */
    const [zoneModal, setZoneModal] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editDelivery, setEditDelivery] = useState(null);  // delivery being edited
    const [df, setDf] = useState({});    // delivery form state

    /* zone form state */
    const [zf, setZf] = useState({ zone_name: '', area_name: '', price_kes: '' });
    const [saving, setSaving] = useState(false);
    const [selectedRider, setSelectedRider] = useState('');

    /* ── Load all data ── */
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [s, d, r, z, ar] = await Promise.all([
                tumansiApi.adminStats(),
                tumansiApi.adminDeliveries({ limit: 200 }),
                tumansiApi.adminRiders({}),
                tumansiApi.listZones(),
                tumansiApi.availableRiders(),
            ]);
            setStats(s.data); setDeliveries(d.data);
            setRiders(r.data); setZones(z.data); setAvailRiders(ar.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    /* ── Open edit delivery modal ── */
    const openEditDelivery = (d) => {
        setDf({
            customer_name: d.customer_name || '',
            customer_phone: d.customer_phone || '',
            customer_email: d.customer_email || '',
            errand_type: d.errand_type || 'parcel',
            errand_description: d.errand_description || '',
            special_instructions: d.special_instructions || '',
            is_fragile: d.is_fragile ?? false,
            requires_handling: d.requires_handling ?? false,
            pickup_address: d.pickup_address || '',
            pickup_contact_name: d.pickup_contact_name || '',
            pickup_contact_phone: d.pickup_contact_phone || '',
            dropoff_address: d.dropoff_address || '',
            dropoff_contact_name: d.dropoff_contact_name || '',
            dropoff_contact_phone: d.dropoff_contact_phone || '',
            final_price_kes: String(d.quoted_price_kes || ''),
            status: d.status || 'pending_assignment',
            payment_status: d.payment_status || 'pending',
            payment_method: d.payment_method || 'cash_on_delivery',
            cancellation_reason: d.cancellation_reason || '',
        });
        setEditDelivery(d);
    };

    /* ── Save delivery edits ── */
    const saveDelivery = async () => {
        setSaving(true);
        try {
            const payload = {
                ...df,
                final_price_kes: df.final_price_kes ? parseFloat(df.final_price_kes) : undefined,
            };
            // strip empty strings to avoid overwriting with blanks
            Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
            const res = await tumansiApi.updateDelivery(editDelivery.id, payload);
            // Patch in delivery list
            setDeliveries(ds => ds.map(d => d.id === editDelivery.id ? {
                ...d,
                ...payload,
                quoted_price_kes: payload.final_price_kes || d.quoted_price_kes,
            } : d));
            toast.success('Delivery updated!');
            setEditDelivery(null);
        } catch (e) { toast.error(e.response?.data?.detail || 'Save failed'); }
        finally { setSaving(false); }
    };

    /* ── Open zone modal ── */
    const openZone = (zone = null) => {
        if (zone) setZf({ zone_name: zone.zone_name, area_name: zone.area_name, price_kes: String(zone.price_kes) });
        else setZf({ zone_name: '', area_name: '', price_kes: '' });
        setZoneModal(zone || 'new');
    };

    /* ── Save zone ── */
    const saveZone = async () => {
        if (!zf.zone_name || !zf.area_name || !zf.price_kes) { toast.error('All fields are required'); return; }
        setSaving(true);
        try {
            const body = { zone_name: zf.zone_name, area_name: zf.area_name, price_kes: parseFloat(zf.price_kes) };
            if (zoneModal === 'new') {
                const res = await tumansiApi.createZone(body);
                setZones(z => [...z, res.data]);
                toast.success('Zone created!');
            } else {
                const res = await tumansiApi.updateZone(zoneModal.id, body);
                setZones(z => z.map(x => x.id === zoneModal.id ? res.data : x));
                toast.success('Zone updated!');
            }
            setZoneModal(null);
        } catch (e) { toast.error(e.response?.data?.detail || 'Save failed'); }
        finally { setSaving(false); }
    };

    /* ── Toggle zone active ── */
    const toggleZoneActive = async (zone) => {
        try {
            const res = await tumansiApi.updateZone(zone.id, { is_active: !zone.is_active });
            setZones(z => z.map(x => x.id === zone.id ? res.data : x));
            toast.success(res.data.is_active ? 'Zone activated' : 'Zone deactivated');
        } catch { toast.error('Failed to update zone'); }
    };

    /* ── Delete zone ── */
    const deleteZone = async (zone) => {
        try {
            await tumansiApi.deleteZone(zone.id);
            setZones(z => z.filter(x => x.id !== zone.id));
            setDeleteConfirm(null);
            toast.success('Zone deleted');
        } catch (e) { toast.error(e.response?.data?.detail || 'Delete failed'); setDeleteConfirm(null); }
    };

    /* ── Adjust price only ── */
    const adjustPrice = async (zone, newPrice) => {
        try {
            const res = await tumansiApi.updateZone(zone.id, { price_kes: parseFloat(newPrice) });
            setZones(z => z.map(x => x.id === zone.id ? res.data : x));
            toast.success('Price updated');
        } catch { toast.error('Failed to update price'); }
    };

    /* ── Verify rider ── */
    const verifyRider = async (id, approved) => {
        try {
            await tumansiApi.verifyRider(id, { is_verified: approved });
            setRiders(rs => rs.map(r => r.id === id ? { ...r, is_verified: approved } : r));
            toast.success(approved ? 'Rider approved!' : 'Verification revoked');
        } catch { toast.error('Action failed'); }
    };

    /* ── Assign rider ── */
    const doAssign = async () => {
        if (!selectedRider) { toast.error('Select a rider'); return; }
        setSaving(true);
        try {
            await tumansiApi.assignRider(assignModal.id, selectedRider);
            setDeliveries(d => d.map(x => x.id === assignModal.id ? { ...x, rider_name: availRiders.find(r => r.id === selectedRider)?.full_name, status: 'assigned' } : x));
            toast.success('Rider assigned!');
            setAssignModal(null); setSelectedRider('');
        } catch (e) { toast.error(e.response?.data?.detail || 'Assignment failed'); }
        finally { setSaving(false); }
    };

    /* ── Filtered data ── */
    const filteredDeliveries = deliveries.filter(d => {
        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
        const q = search.toLowerCase();
        const matchQ = !search || d.tracking_number.toLowerCase().includes(q) || d.customer_name.toLowerCase().includes(q) || d.customer_phone.includes(q);
        return matchStatus && matchQ;
    });

    const filteredRiders = riders.filter(r => {
        const matchV = verifyFilter === 'all' || (verifyFilter === 'verified' && r.is_verified) || (verifyFilter === 'pending' && !r.is_verified);
        const q = search.toLowerCase();
        const matchQ = !search || r.full_name.toLowerCase().includes(q) || r.phone.includes(q);
        return matchV && matchQ;
    });

    const filteredZones = zones.filter(z => {
        const q = zoneSearch.toLowerCase();
        return !q || z.area_name.toLowerCase().includes(q) || z.zone_name.toLowerCase().includes(q);
    });

    /* ── Styles ── */
    const S = {
        page: { display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Poppins, sans-serif' },
        sidebar: { width: 220, background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2443 100%)', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '1.5rem 0' },
        main: { flex: 1, overflow: 'auto', padding: '2rem' },
        navItem: (active) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
            color: active ? '#fff' : 'rgba(255,255,255,.55)', fontWeight: active ? 700 : 500,
            background: active ? 'rgba(255,255,255,.12)' : 'transparent',
            borderLeft: active ? '3px solid #f97316' : '3px solid transparent',
            cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
            fontSize: '0.88rem', transition: 'all .15s', fontFamily: 'Poppins, sans-serif',
        }),
        tbl: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
        th: { padding: '10px 14px', background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' },
        td: { padding: '11px 14px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
        btn: (c = '#0f62a8') => ({ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 7, border: 'none', background: c + '18', color: c, fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Poppins, sans-serif', transition: 'background .15s' }),
        badge: (status) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 50, fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap', background: (S_COLOR[status] || ['#64748b', '#f1f5f9'])[1], color: (S_COLOR[status] || ['#64748b', '#f1f5f9'])[0] }),
    };

    if (loading) return (
        <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <RefreshCw size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <p>Loading Tumanasi admin…</p>
            </div>
        </div>
    );

    return (
        <div style={S.page}>
            {/* ── SIDEBAR ── */}
            <aside style={S.sidebar}>
                <div style={{ padding: '0 20px 1.5rem', borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>🚚 Tumanasi</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Admin Console</div>
                </div>
                {SIDEBAR.map(({ key, icon: Icon, label }) => (
                    <button key={key} style={S.navItem(section === key)} onClick={() => { setSection(key); setSearch(''); }}>
                        <Icon size={17} /> {label}
                    </button>
                ))}
                <div style={{ marginTop: 'auto', padding: '1rem 20px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
                    <button onClick={loadAll} style={{ ...S.btn(), background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', width: '100%', justifyContent: 'center' }}>
                        <RefreshCw size={13} /> Refresh Data
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <main style={S.main}>

                {/* ════ DASHBOARD ════ */}
                {section === 'dashboard' && stats && (
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e293b', margin: '0 0 1.5rem' }}>📊 Dashboard Overview</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <StatCard label="Total Deliveries" value={stats.total_deliveries} color="#0f62a8" />
                            <StatCard label="Active Right Now" value={stats.active_deliveries} color="#7c3aed" />
                            <StatCard label="Completed Today" value={stats.completed_today} color="#059669"
                                sub={`KES ${parseFloat(stats.revenue_today_kes).toLocaleString()} revenue`} />
                            <StatCard label="Total Revenue" value={`KES ${parseFloat(stats.revenue_total_kes).toLocaleString()}`} color="#d97706" />
                            <StatCard label="Total Riders" value={stats.total_riders} color="#0891b2" />
                            <StatCard label="Online Riders" value={stats.active_riders} color="#059669" />
                            <StatCard label="Verified Riders" value={stats.verified_riders} color="#0f62a8" />
                            <StatCard label="Completion Rate" value={`${stats.avg_completion_rate || 0}%`} color="#f97316" />
                        </div>
                        {/* Quick actions */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {[['Deliveries', 'deliveries', '#0f62a8'], ['Riders', 'riders', '#7c3aed'], ['Zones', 'zones', '#059669']].map(([l, k, c]) => (
                                <button key={k} onClick={() => setSection(k)}
                                    style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: c, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                                    Manage {l} →
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ════ DELIVERIES ════ */}
                {section === 'deliveries' && (
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1e293b', margin: '0 0 1.25rem' }}>🚚 Deliveries</h1>

                        {/* Toolbar */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tracking / name / phone…" style={{ ...inp, paddingLeft: 30, width: '100%' }} />
                            </div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, width: 'auto' }}>
                                <option value="all">All Statuses</option>
                                {Object.keys(S_COLOR).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>

                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={S.tbl}>
                                    <thead>
                                        <tr>
                                            {['Tracking', 'Customer', 'Phone', 'Pickup', 'Dropoff', 'Type', 'Price', 'Rider', 'Status', 'Date', 'Actions'].map(h => (
                                                <th key={h} style={S.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDeliveries.map(d => (
                                            <tr key={d.id}>
                                                <td style={S.td}><span style={{ fontWeight: 800, color: '#0f62a8', fontSize: '0.78rem', letterSpacing: '.04em' }}>{d.tracking_number}</span></td>
                                                <td style={{ ...S.td, fontWeight: 600 }}>{d.customer_name}</td>
                                                <td style={{ ...S.td, color: '#64748b', fontSize: '0.8rem' }}>{d.customer_phone}</td>
                                                <td style={{ ...S.td, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.pickup_address}</td>
                                                <td style={{ ...S.td, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.dropoff_address}</td>
                                                <td style={{ ...S.td, textTransform: 'capitalize' }}>{d.errand_type}</td>
                                                <td style={{ ...S.td, fontWeight: 700 }}>KES {parseFloat(d.quoted_price_kes).toLocaleString()}</td>
                                                <td style={S.td}>{d.rider_name || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                                                <td style={S.td}><span style={S.badge(d.status)}>{d.status.replace(/_/g, ' ')}</span></td>
                                                <td style={{ ...S.td, color: '#94a3b8', fontSize: '0.78rem' }}>{new Date(d.created_at).toLocaleDateString('en-KE')}</td>
                                                <td style={S.td}>
                                                    {(d.status === 'pending_assignment' || d.status === 'assigned') && (
                                                        <button style={S.btn('#7c3aed')} onClick={() => { setAssignModal(d); setSelectedRider(''); }}>
                                                            <UserCheck size={12} /> Assign
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredDeliveries.length === 0 && (
                                            <tr><td colSpan={11} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>No deliveries found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ RIDERS ════ */}
                {section === 'riders' && (
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1e293b', margin: '0 0 1.25rem' }}>🏍️ Riders</h1>

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or phone…" style={{ ...inp, paddingLeft: 30, width: '100%' }} />
                            </div>
                            <select value={verifyFilter} onChange={e => setVerifyFilter(e.target.value)} style={{ ...inp, width: 'auto' }}>
                                <option value="all">All Riders</option>
                                <option value="pending">Pending Verification</option>
                                <option value="verified">Verified</option>
                            </select>
                        </div>

                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={S.tbl}>
                                    <thead>
                                        <tr>
                                            {['Name', 'Phone', 'Vehicle', 'Reg No', 'Deliveries', 'Rating', 'Earnings (KES)', 'Status', 'Online', 'Actions'].map(h => (
                                                <th key={h} style={S.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRiders.map(r => (
                                            <tr key={r.id}>
                                                <td style={{ ...S.td, fontWeight: 700 }}>{r.full_name}</td>
                                                <td style={S.td}>{r.phone}</td>
                                                <td style={{ ...S.td, textTransform: 'capitalize' }}>{r.vehicle_type?.replace(/_/g, ' ')}</td>
                                                <td style={S.td}>{r.vehicle_reg || '—'}</td>
                                                <td style={{ ...S.td, textAlign: 'center' }}>{r.completed_deliveries}</td>
                                                <td style={S.td}>⭐ {parseFloat(r.average_rating || 0).toFixed(1)}</td>
                                                <td style={{ ...S.td, fontWeight: 700 }}>{parseFloat(r.total_earnings_kes || 0).toLocaleString()}</td>
                                                <td style={S.td}>
                                                    <span style={{ color: r.is_verified ? '#059669' : '#d97706', fontWeight: 700, fontSize: '0.8rem' }}>
                                                        {r.is_verified ? '✅ Verified' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td style={S.td}>
                                                    <span style={{ color: r.is_available ? '#059669' : '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                                                        {r.is_available ? '🟢 Online' : '⚫ Offline'}
                                                    </span>
                                                </td>
                                                <td style={S.td}>
                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                        {!r.is_verified ? (
                                                            <>
                                                                <button style={S.btn('#059669')} onClick={() => verifyRider(r.id, true)}><CheckCircle size={12} /> Approve</button>
                                                                <button style={S.btn('#dc2626')} onClick={() => verifyRider(r.id, false)}><XCircle size={12} /> Reject</button>
                                                            </>
                                                        ) : (
                                                            <button style={S.btn('#64748b')} onClick={() => verifyRider(r.id, false)}>Revoke</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredRiders.length === 0 && (
                                            <tr><td colSpan={10} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>No riders found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ ZONES & PRICING ════ */}
                {section === 'zones' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                            <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1e293b', margin: 0 }}>📍 Zones &amp; Pricing</h1>
                            <button onClick={() => openZone()} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#0f62a8', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Poppins, sans-serif' }}>
                                <Plus size={15} /> Add Zone
                            </button>
                        </div>

                        {/* search */}
                        <div style={{ position: 'relative', maxWidth: 340, marginBottom: '1rem' }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input value={zoneSearch} onChange={e => setZoneSearch(e.target.value)} placeholder="Search area or corridor…" style={{ ...inp, paddingLeft: 30, width: '100%' }} />
                        </div>

                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={S.tbl}>
                                    <thead>
                                        <tr>
                                            {['Area Name', 'Corridor', 'Price (KES)', 'Status', 'Actions'].map(h => (
                                                <th key={h} style={S.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredZones.map(z => (
                                            <ZoneRow key={z.id} zone={z}
                                                onEdit={() => openZone(z)}
                                                onToggle={() => toggleZoneActive(z)}
                                                onDelete={() => setDeleteConfirm(z)}
                                                onPriceChange={(p) => adjustPrice(z, p)}
                                                S={S} />
                                        ))}
                                        {filteredZones.length === 0 && (
                                            <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>No zones found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 8 }}>{zones.length} total zones · {zones.filter(z => z.is_active).length} active</p>
                    </div>
                )}
            </main>

            {/* ══════ MODALS ══════ */}

            {/* Zone create/edit modal */}
            {zoneModal && (
                <Modal title={zoneModal === 'new' ? '➕ New Zone' : `✏️ Edit Zone — ${zoneModal.area_name}`} onClose={() => setZoneModal(null)}>
                    <Field label="Corridor Name (e.g. Ngong Road)">
                        <input style={inp} value={zf.zone_name} onChange={e => setZf(p => ({ ...p, zone_name: e.target.value }))} placeholder="Ngong Road" />
                    </Field>
                    <Field label="Area Name (e.g. Dagoretti Corner)">
                        <input style={inp} value={zf.area_name} onChange={e => setZf(p => ({ ...p, area_name: e.target.value }))} placeholder="Dagoretti Corner" />
                    </Field>
                    <Field label="Price (KES)">
                        <input style={inp} type="number" min="0" step="50" value={zf.price_kes} onChange={e => setZf(p => ({ ...p, price_kes: e.target.value }))} placeholder="350" />
                    </Field>
                    <button disabled={saving} onClick={saveZone} style={{ width: '100%', padding: '12px', background: '#0f62a8', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Save size={15} /> {saving ? 'Saving…' : 'Save Zone'}
                    </button>
                </Modal>
            )}

            {/* Delete confirmation */}
            {deleteConfirm && (
                <Modal title="⚠️ Delete Zone" onClose={() => setDeleteConfirm(null)}>
                    <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
                        <AlertTriangle size={42} color="#dc2626" style={{ marginBottom: 12 }} />
                        <p style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600, margin: '0 0 .5rem' }}>
                            Delete <strong>{deleteConfirm.area_name}</strong>?
                        </p>
                        <p style={{ fontSize: '0.83rem', color: '#64748b' }}>
                            This is permanent and cannot be undone. If deliveries reference this zone, deletion will be blocked — deactivate it instead.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                            Cancel
                        </button>
                        <button onClick={() => deleteZone(deleteConfirm)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                            Yes, Delete
                        </button>
                    </div>
                </Modal>
            )}

            {/* Assign rider modal */}
            {assignModal && (
                <Modal title={`Assign Rider — ${assignModal.tracking_number}`} onClose={() => setAssignModal(null)}>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                        <div><strong>Customer:</strong> {assignModal.customer_name} · {assignModal.customer_phone}</div>
                        <div><strong>Pickup:</strong> {assignModal.pickup_address}</div>
                        <div><strong>Dropoff:</strong> {assignModal.dropoff_address}</div>
                        <div><strong>Price:</strong> KES {parseFloat(assignModal.quoted_price_kes).toLocaleString()}</div>
                    </div>
                    <Field label="Select Rider">
                        <select value={selectedRider} onChange={e => setSelectedRider(e.target.value)} style={{ ...inp, width: '100%' }}>
                            <option value="">-- Choose a rider --</option>
                            {availRiders.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.is_available ? '🟢' : '⚫'} {r.full_name} · {r.vehicle_type?.replace(/_/g, ' ')}
                                    {r.current_delivery_id ? ` (busy)` : ''}
                                </option>
                            ))}
                            {availRiders.length === 0 && <option disabled>No verified riders available</option>}
                        </select>
                    </Field>
                    <button disabled={saving || !selectedRider} onClick={doAssign} style={{ width: '100%', padding: '12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving || !selectedRider ? .6 : 1 }}>
                        <UserCheck size={15} /> {saving ? 'Assigning…' : 'Assign Rider'}
                    </button>
                </Modal>
            )}

            {/* Edit delivery modal (admin override) */}
            {editDelivery && (
                <Modal title={`✏️ Edit Delivery — ${editDelivery.tracking_number}`} onClose={() => setEditDelivery(null)}>
                    <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 8 }}>
                        {/* Section: Status & Pricing */}
                        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <Field label="Status">
                                    <select style={inp} value={df.status} onChange={e => setDf(p => ({ ...p, status: e.target.value }))}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </Field>
                                <Field label="Final Price (KES)">
                                    <input style={inp} type="number" value={df.final_price_kes} onChange={e => setDf(p => ({ ...p, final_price_kes: e.target.value }))} placeholder="Override quoted price" />
                                </Field>
                            </div>
                        </div>

                        {/* Section: Payment */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="Pay Method">
                                <select style={inp} value={df.payment_method} onChange={e => setDf(p => ({ ...p, payment_method: e.target.value }))}>
                                    {PAY_METHODS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </select>
                            </Field>
                            <Field label="Pay Status">
                                <select style={inp} value={df.payment_status} onChange={e => setDf(p => ({ ...p, payment_status: e.target.value }))}>
                                    {PAY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                        </div>

                        {/* Section: Addresses */}
                        <Field label="Pickup Address">
                            <input style={inp} value={df.pickup_address} onChange={e => setDf(p => ({ ...p, pickup_address: e.target.value }))} />
                        </Field>
                        <Field label="Dropoff Address">
                            <input style={inp} value={df.dropoff_address} onChange={e => setDf(p => ({ ...p, dropoff_address: e.target.value }))} />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="Pickup Contact Phone">
                                <input style={inp} value={df.pickup_contact_phone} onChange={e => setDf(p => ({ ...p, pickup_contact_phone: e.target.value }))} placeholder="+254..." />
                            </Field>
                            <Field label="Dropoff Contact Phone">
                                <input style={inp} value={df.dropoff_contact_phone} onChange={e => setDf(p => ({ ...p, dropoff_contact_phone: e.target.value }))} placeholder="+254..." />
                            </Field>
                        </div>

                        {/* Section: Customer */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <Field label="Customer Name">
                                <input style={inp} value={df.customer_name} onChange={e => setDf(p => ({ ...p, customer_name: e.target.value }))} />
                            </Field>
                            <Field label="Customer Phone">
                                <input style={inp} value={df.customer_phone} onChange={e => setDf(p => ({ ...p, customer_phone: e.target.value }))} />
                            </Field>
                        </div>

                        {df.status === 'cancelled' && (
                            <Field label="Cancellation Reason">
                                <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} value={df.cancellation_reason} onChange={e => setDf(p => ({ ...p, cancellation_reason: e.target.value }))} />
                            </Field>
                        )}
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <button disabled={saving} onClick={saveDelivery} style={{ width: '100%', padding: '12px', background: '#0f62a8', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* ─── Zone row with inline price editing ───────────────────────────────────── */
function ZoneRow({ zone, onEdit, onToggle, onDelete, onPriceChange, S }) {
    const [editing, setEditing] = useState(false);
    const [price, setPrice] = useState(String(zone.price_kes));

    const save = () => {
        if (!price || isNaN(price)) return;
        onPriceChange(price);
        setEditing(false);
    };

    return (
        <tr>
            <td style={{ ...S.td, fontWeight: 600 }}>{zone.area_name}</td>
            <td style={{ ...S.td, color: '#64748b' }}>{zone.zone_name}</td>
            <td style={S.td}>
                {editing ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <input
                            type="number" value={price} min="0" step="50"
                            onChange={e => setPrice(e.target.value)}
                            style={{ ...S.td, width: 100, padding: '5px 8px', border: '1.5px solid #0f62a8', borderRadius: 7, fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem' }}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setPrice(String(zone.price_kes)); } }}
                        />
                        <button style={S.btn('#059669')} onClick={save}><Save size={11} /></button>
                        <button style={S.btn('#64748b')} onClick={() => { setEditing(false); setPrice(String(zone.price_kes)); }}><X size={11} /></button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, color: '#f97316' }}>KES {parseFloat(zone.price_kes).toLocaleString()}</span>
                        <button title="Edit price" style={{ ...S.btn('#f97316'), padding: '3px 7px' }} onClick={() => setEditing(true)}>
                            <DollarSign size={11} />
                        </button>
                    </div>
                )}
            </td>
            <td style={S.td}>
                <span style={{ color: zone.is_active ? '#059669' : '#94a3b8', fontWeight: 700, fontSize: '0.82rem' }}>
                    {zone.is_active ? '✅ Active' : '⛔ Inactive'}
                </span>
            </td>
            <td style={S.td}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <button style={S.btn('#0f62a8')} onClick={onEdit} title="Edit"><Edit2 size={12} /> Edit</button>
                    <button style={S.btn(zone.is_active ? '#d97706' : '#059669')} onClick={onToggle}>
                        {zone.is_active ? <><ToggleLeft size={12} /> Deactivate</> : <><ToggleRight size={12} /> Activate</>}
                    </button>
                    <button style={S.btn('#dc2626')} onClick={onDelete} title="Delete"><Trash2 size={12} /> Delete</button>
                </div>
            </td>
        </tr>
    );
}
