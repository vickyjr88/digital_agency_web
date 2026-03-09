import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { tumansiApi } from '../../services/tumansiApi';
import {
    MapPin, Camera, CheckCircle, AlertCircle, Loader,
    Package, Phone, ChevronRight, Clock, Star, TrendingUp, X, Plus, Save, Bike
} from 'lucide-react';
import './Tumanasi.css';

const STATUS_LABELS = {
    pending_assignment: '⏳ Awaiting Pickup',
    assigned: '✅ Assigned to You',
    en_route_pickup: '🚀 Go to Pickup',
    collected: '📦 Item Collected',
    en_route_delivery: '🚛 Out for Delivery',
    delivered: '📸 Delivered',
    payment_requested: '💳 Payment Requested',
    completed: '✅ Completed',
};

const NEXT_ACTION = {
    assigned: { label: '🚀 Start — Head to Pickup', next: 'en_route_pickup' },
    en_route_pickup: { label: '📸 I\'ve Arrived — Take Photo', next: null, action: 'pickup_photo' },
    collected: { label: '🚛 Head to Dropoff', next: 'en_route_delivery' },
    en_route_delivery: { label: '📸 Arrived — Take Delivery Photo', next: null, action: 'delivery_photo' },
    delivered: { label: '💳 Request Payment', next: 'payment_requested' },
    payment_requested: { label: '✅ Confirm Cash Collected', next: null, action: 'confirm_cash' },
};

function PhotoCapture({ label, onPhoto }) {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const inputRef = useRef();

    const pick = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        onPhoto(f);
    };

    return (
        <div>
            <label className="tum-label">{label}</label>
            <div
                className={`tum-photo-area ${preview ? 'has-photo' : ''}`}
                onClick={() => inputRef.current?.click()}
            >
                {preview ? (
                    <img src={preview} className="tum-photo-preview" alt="Preview" />
                ) : (
                    <>
                        <Camera size={28} style={{ marginBottom: 8 }} />
                        <div style={{ fontWeight: 600 }}>Tap to take photo</div>
                        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Use your camera or select from gallery</div>
                    </>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" capture="environment"
                style={{ display: 'none' }} onChange={pick} />
        </div>
    );
}

export default function RiderDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [rider, setRider] = useState(null);
    const [notRegistered, setNotRegistered] = useState(false);
    const [activeJob, setActiveJob] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [tab, setTab] = useState('active');   // active | available | history
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);

    // Context for logging delivery for client
    const [showLogModal, setShowLogModal] = useState(false);
    const [zones, setZones] = useState([]);
    const [df, setDf] = useState({ errand_type: 'parcel', customer_name: '', customer_phone: '', pickup_address: '', dropoff_address: '', dropoff_area_id: '', payment_method: 'cash_on_delivery' });
    const [loggingReq, setLoggingReq] = useState(false);

    const load = async () => {
        try {
            const [riderRes, activeRes] = await Promise.all([
                tumansiApi.getRiderProfile(),
                tumansiApi.riderDeliveries(),
            ]);
            setRider(riderRes.data);
            setNotRegistered(false);

            const all = activeRes.data;
            const active = all.find(d =>
                !['completed', 'cancelled', 'failed'].includes(d.status)
            );
            setActiveJob(active || null);
            setHistory(all.filter(d => ['completed', 'cancelled'].includes(d.status)));
        } catch (err) {
            if (err.response?.status === 404) {
                setNotRegistered(true);
            } else {
                toast.error('Failed to load rider data');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadZ = async () => {
        if (zones.length > 0) return;
        try {
            const z = await tumansiApi.listZones();
            setZones(z.data);
            if (z.data.length > 0) setDf(d => ({ ...d, dropoff_area_id: z.data[0].id }));
        } catch (e) { toast.error('Failed to load zones'); }
    };

    const loadJobs = async () => {
        try {
            const res = await tumansiApi.availableJobs();
            setJobs(res.data);
        } catch { /* quiet */ }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { if (tab === 'available') loadJobs(); }, [tab]);
    useEffect(() => { if (showLogModal) loadZ(); }, [showLogModal]);

    const toggleAvailability = async () => {
        try {
            await tumansiApi.setAvailability(!rider.is_available);
            setRider(r => ({ ...r, is_available: !r.is_available }));
            toast.success(rider.is_available ? 'You are now Offline' : 'You are now Online!');
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Error');
        }
    };

    const acceptJob = async (id) => {
        try {
            await tumansiApi.acceptDelivery(id);
            toast.success('Job accepted!');
            setTab('active');
            await load();
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Error accepting job');
        }
    };

    const handleNextAction = async () => {
        if (!activeJob) return;
        const action = NEXT_ACTION[activeJob.status];
        if (!action) return;

        setActing(true);
        try {
            if (action.action === 'pickup_photo') {
                if (!photoFile) { toast.error('Please take a photo first'); setActing(false); return; }
                const fd = new FormData();
                fd.append('photo', photoFile);
                await tumansiApi.uploadPickupPhoto(activeJob.id, fd);
                toast.success('Pickup photo uploaded! ✅');
                setPhotoFile(null);
                await load();
            } else if (action.action === 'delivery_photo') {
                if (!photoFile) { toast.error('Please take a photo first'); setActing(false); return; }
                const fd = new FormData();
                fd.append('photo', photoFile);
                await tumansiApi.uploadDeliveryPhoto(activeJob.id, fd);
                toast.success('Delivery photo uploaded! ✅');
                setPhotoFile(null);
                await load();
            } else if (action.action === 'confirm_cash') {
                await tumansiApi.confirmCash(activeJob.id);
                toast.success('Cash confirmed — delivery complete! 🎉');
                await load();
            } else if (action.next) {
                await tumansiApi.updateStatus(activeJob.id, action.next);
                toast.success('Status updated!');
                await load();
            }
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Action failed');
        } finally {
            setActing(false);
        }
    };

    if (loading) return (
        <div className="tum-rider-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', color: 'var(--tum-gray-400)' }}>
                <Loader size={32} className="spin" />
                <p style={{ marginTop: '.5rem' }}>Loading your dashboard…</p>
            </div>
        </div>
    );

    if (notRegistered) return (
        <div className="tum-rider-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: 450 }}>
                <Bike size={54} style={{ color: 'var(--tum-blue)', marginBottom: '1.5rem', margin: '0 auto' }} />
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--tum-gray-900)', marginBottom: '.5rem' }}>Not a Rider Yet</h2>
                <p style={{ color: 'var(--tum-gray-600)', marginBottom: '2rem', lineHeight: 1.6 }}>You currently don't have an active rider profile on our system. Register to start making money taking deliveries!</p>
                <button className="tum-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/tumanasi/rider/register')}>
                    Register as a Rider <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );

    if (!rider?.is_verified) return (
        <div className="tum-rider-page">
            <div style={{ background: '#FEF3C7', borderRadius: 16, padding: '2rem', textAlign: 'center', border: '1px solid #FDE68A' }}>
                <Clock size={40} style={{ color: '#92400E', marginBottom: '1rem' }} />
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--tum-gray-900)', marginBottom: '.5rem' }}>Verification Pending</h2>
                <p style={{ color: 'var(--tum-gray-600)' }}>Your rider profile is being reviewed by our team. You'll be notified once approved.</p>
            </div>
        </div>
    );

    const currentAction = activeJob ? NEXT_ACTION[activeJob.status] : null;
    const needsPhoto = currentAction?.action === 'pickup_photo' || currentAction?.action === 'delivery_photo';

    return (
        <div className="tum-rider-page">
            {/* Top bar */}
            <div className="tum-rider-topbar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1, marginRight: '1rem' }}>
                    <div>
                        <div className="tum-rider-name">Hey, {rider.full_name.split(' ')[0]} 👋</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--tum-gray-400)' }}>⭐ {parseFloat(rider.average_rating || 0).toFixed(1)} · {rider.completed_deliveries} deliveries</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="tum-btn-outline" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowLogModal(true)}>
                        <Plus size={14} /> Log Client Delivery
                    </button>
                    <button
                        className={`tum-avail-toggle ${rider.is_available ? 'online' : 'offline'}`}
                        onClick={toggleAvailability}
                    >
                        <span className="tum-avail-dot" />
                        {rider.is_available ? 'Online' : 'Offline'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="tum-rider-stats">
                <div className="tum-rstat-card">
                    <div className="tum-rstat-val">{rider.completed_deliveries}</div>
                    <div className="tum-rstat-label">Completed</div>
                </div>
                <div className="tum-rstat-card">
                    <div className="tum-rstat-val">KES {parseFloat(rider.total_earnings_kes || 0).toLocaleString()}</div>
                    <div className="tum-rstat-label">Earned</div>
                </div>
                <div className="tum-rstat-card">
                    <div className="tum-rstat-val">{parseFloat(rider.average_rating || 0).toFixed(1)} ⭐</div>
                    <div className="tum-rstat-label">Rating</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tum-admin-tabs" style={{ marginBottom: '1rem' }}>
                {[['active', 'Active Job'], ['available', 'Available Jobs'], ['history', 'History']].map(([k, l]) => (
                    <button key={k} className={`tum-admin-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
                ))}
            </div>

            {/* ── ACTIVE JOB ── */}
            {tab === 'active' && (
                <>
                    {!activeJob ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 16, boxShadow: 'var(--tum-shadow)' }}>
                            <Package size={48} style={{ color: 'var(--tum-gray-200)', marginBottom: '1rem' }} />
                            <div style={{ fontWeight: 600, color: 'var(--tum-gray-400)' }}>No active delivery right now</div>
                            <button className="tum-btn-accept" style={{ marginTop: '1rem', maxWidth: 200, margin: '1rem auto 0' }}
                                onClick={() => setTab('available')}>
                                Browse Jobs
                            </button>
                        </div>
                    ) : (
                        <div className="tum-active-delivery">
                            <div className="tum-ad-header">
                                <span className="tum-ad-tracking">{activeJob.tracking_number}</span>
                                <span className={`tum-status-badge ${activeJob.status}`} style={{ fontSize: '0.72rem' }}>
                                    {STATUS_LABELS[activeJob.status]}
                                </span>
                            </div>

                            <div className="tum-ad-info">
                                <div className="tum-ad-loc">
                                    <MapPin size={16} style={{ color: 'var(--tum-blue)' }} className="tum-ad-loc-icon" />
                                    <div>
                                        <div className="tum-ad-loc-label">Pickup From</div>
                                        <div className="tum-ad-loc-addr">{activeJob.pickup_address}</div>
                                        <a href={`tel:${activeJob.customer_phone}`} style={{ fontSize: '0.8rem', color: 'var(--tum-blue)', fontWeight: 600, textDecoration: 'none' }}>
                                            <Phone size={12} style={{ display: 'inline', marginRight: 3 }} />
                                            {activeJob.customer_phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="tum-ad-loc">
                                    <MapPin size={16} style={{ color: 'var(--tum-green)' }} className="tum-ad-loc-icon" />
                                    <div>
                                        <div className="tum-ad-loc-label">Drop Off At</div>
                                        <div className="tum-ad-loc-addr">{activeJob.dropoff_address}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="tum-ad-price">
                                <span>{activeJob.errand_type} · {activeJob.payment_method === 'cash_on_delivery' ? 'Cash' : 'MPesa'}</span>
                                <span className="tum-ad-price-val">KES {parseFloat(activeJob.quoted_price_kes).toLocaleString()}</span>
                            </div>

                            <div style={{ marginTop: '1.25rem' }}>
                                {needsPhoto && (
                                    <PhotoCapture
                                        label={currentAction?.action === 'pickup_photo' ? '📸 Take Pickup Photo' : '📸 Take Delivery Photo'}
                                        onPhoto={setPhotoFile}
                                    />
                                )}

                                {currentAction && (
                                    <div className="tum-status-pipeline">
                                        <button
                                            className={`tum-pipeline-btn ${currentAction.action === 'confirm_cash' ? 'success' : currentAction.action ? 'amber' : 'primary'}`}
                                            onClick={handleNextAction}
                                            disabled={acting || (needsPhoto && !photoFile)}
                                        >
                                            {acting ? <><Loader size={16} className="spin" /> Working…</> : currentAction.label}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── AVAILABLE JOBS ── */}
            {tab === 'available' && (
                <>
                    <button onClick={loadJobs} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: 'var(--tum-blue)', fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', fontSize: '0.88rem' }}>
                        🔄 Refresh Jobs
                    </button>
                    {jobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tum-gray-400)' }}>
                            No available jobs right now. Check back soon!
                        </div>
                    ) : (
                        <div className="tum-jobs-list">
                            {jobs.map(job => (
                                <div key={job.id} className="tum-job-card">
                                    <div className="tum-job-header">
                                        <span className="tum-job-type">{job.errand_type}</span>
                                        <span className="tum-job-price-tag">KES {parseFloat(job.quoted_price_kes).toLocaleString()}</span>
                                    </div>
                                    <div className="tum-job-loc"><MapPin size={12} style={{ color: 'var(--tum-blue)', flexShrink: 0 }} /> {job.pickup_address}</div>
                                    <div className="tum-job-loc">🏁 {job.dropoff_address}</div>
                                    <button className="tum-btn-accept" onClick={() => acceptJob(job.id)}>
                                        Accept Job <ChevronRight size={16} style={{ display: 'inline' }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── HISTORY ── */}
            {tab === 'history' && (
                <div className="tum-jobs-list">
                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tum-gray-400)' }}>No completed deliveries yet.</div>
                    ) : history.map(d => (
                        <div key={d.id} className="tum-job-card">
                            <div className="tum-job-header">
                                <span className="tum-ad-tracking">{d.tracking_number}</span>
                                <span className={`tum-status-badge ${d.status}`} style={{ fontSize: '0.72rem' }}>{d.status.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="tum-job-loc"><MapPin size={12} style={{ flexShrink: 0 }} /> {d.pickup_address}</div>
                            <div className="tum-job-loc">🏁 {d.dropoff_address}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.5rem', fontSize: '0.82rem', color: 'var(--tum-gray-400)' }}>
                                <span>{new Date(d.created_at).toLocaleDateString('en-KE')}</span>
                                <span style={{ fontWeight: 700, color: d.payment_status === 'paid' ? 'var(--tum-green)' : 'var(--tum-gray-400)' }}>
                                    KES {parseFloat(d.quoted_price_kes).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── LOG CLIENT DELIVERY MODAL ── */}
            {showLogModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, padding: '1.5rem', position: 'relative', marginTop: 'max(4vh, 20px)', marginBottom: 'max(4vh, 20px)' }}>
                        <button onClick={() => setShowLogModal(false)} style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tum-gray-400)' }}>
                            <X size={24} />
                        </button>
                        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.3rem', color: 'var(--tum-gray-900)', marginBottom: '1rem' }}>Log Client Delivery</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--tum-gray-500)', marginBottom: '1.5rem' }}>Enter the client's errand details. This delivery will be logged and instantly assigned to you.</p>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label className="tum-label">Errand Type</label>
                                <select className="tum-input" value={df.errand_type} onChange={e => setDf({ ...df, errand_type: e.target.value })}>
                                    {['parcel', 'document', 'food', 'shopping', 'errand'].map(x => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label className="tum-label">Client Name</label><input className="tum-input" placeholder="e.g. Jane Doe" value={df.customer_name} onChange={e => setDf({ ...df, customer_name: e.target.value })} /></div>
                                <div><label className="tum-label">Client Phone</label><input className="tum-input" placeholder="+254..." value={df.customer_phone} onChange={e => setDf({ ...df, customer_phone: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="tum-label">Pickup Location (From client)</label>
                                <input className="tum-input" value={df.pickup_address} onChange={e => setDf({ ...df, pickup_address: e.target.value })} />
                            </div>
                            <div>
                                <label className="tum-label">Drop-off Area (Determines Price)</label>
                                <select className="tum-input" value={df.dropoff_area_id} onChange={e => setDf({ ...df, dropoff_area_id: e.target.value })}>
                                    <option value="">Select a zone...</option>
                                    {zones.map(z => <option key={z.id} value={z.id}>{z.area_name} ({z.zone_name}) - KES {parseFloat(z.price_kes)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="tum-label">Specific Drop-off Address</label>
                                <input className="tum-input" value={df.dropoff_address} onChange={e => setDf({ ...df, dropoff_address: e.target.value })} />
                            </div>
                            <div>
                                <label className="tum-label">Payment Collection</label>
                                <select className="tum-input" value={df.payment_method} onChange={e => setDf({ ...df, payment_method: e.target.value })}>
                                    <option value="cash_on_delivery">Cash on Delivery (You collect)</option>
                                    <option value="mobile_money">MPESA (Client paid online)</option>
                                </select>
                            </div>
                            <button
                                className="tum-btn-primary"
                                style={{ justifyContent: 'center', marginTop: '1rem' }}
                                disabled={loggingReq || !df.customer_name || !df.customer_phone || !df.pickup_address || !df.dropoff_address || !df.dropoff_area_id}
                                onClick={async () => {
                                    setLoggingReq(true);
                                    try {
                                        await tumansiApi.riderLogClientDelivery({
                                            customer_name: df.customer_name,
                                            customer_phone: df.customer_phone,
                                            errand_type: df.errand_type,
                                            pickup_address: df.pickup_address,
                                            dropoff_address: df.dropoff_address,
                                            dropoff_area_id: df.dropoff_area_id,
                                            payment_method: df.payment_method,
                                            errand_description: 'Logged by Rider'
                                        });
                                        toast.success('Delivery logged and assigned to you!');
                                        setShowLogModal(false);
                                        setTab('active');
                                        await load();
                                    } catch (err) {
                                        toast.error(err?.response?.data?.detail || 'Failed to log delivery');
                                    } finally {
                                        setLoggingReq(false);
                                    }
                                }}
                            >
                                {loggingReq ? <Loader size={16} className="spin" /> : <Save size={16} />} Save & Start Delivery
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
