import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { tumansiApi } from '../../services/tumansiApi';
import {
    MapPin, Camera, CheckCircle, AlertCircle, Loader,
    Package, Phone, ChevronRight, Clock, Star, TrendingUp
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
    const [activeJob, setActiveJob] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [tab, setTab] = useState('active');   // active | available | history
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);

    const load = async () => {
        try {
            const [riderRes, activeRes] = await Promise.all([
                tumansiApi.getRiderProfile(),
                tumansiApi.riderDeliveries(),
            ]);
            setRider(riderRes.data);

            const all = activeRes.data;
            const active = all.find(d =>
                !['completed', 'cancelled', 'failed'].includes(d.status)
            );
            setActiveJob(active || null);
            setHistory(all.filter(d => ['completed', 'cancelled'].includes(d.status)));
        } catch {
            navigate('/tumanasi/rider');
        } finally {
            setLoading(false);
        }
    };

    const loadJobs = async () => {
        try {
            const res = await tumansiApi.availableJobs();
            setJobs(res.data);
        } catch { /* quiet */ }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { if (tab === 'available') loadJobs(); }, [tab]);

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
                <div>
                    <div className="tum-rider-name">Hey, {rider.full_name.split(' ')[0]} 👋</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--tum-gray-400)' }}>⭐ {parseFloat(rider.average_rating || 0).toFixed(1)} · {rider.completed_deliveries} deliveries</div>
                </div>
                <button
                    className={`tum-avail-toggle ${rider.is_available ? 'online' : 'offline'}`}
                    onClick={toggleAvailability}
                >
                    <span className="tum-avail-dot" />
                    {rider.is_available ? 'Online' : 'Offline'}
                </button>
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
        </div>
    );
}
