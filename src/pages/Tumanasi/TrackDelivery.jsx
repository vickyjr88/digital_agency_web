import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { tumansiApi } from '../../services/tumansiApi';
import { MapPin, Package, Phone, Clock, CheckCircle, Search } from 'lucide-react';
import './Tumanasi.css';

const STATUS_STEPS = [
    { key: 'pending_assignment', label: 'Booking Placed', icon: '📋' },
    { key: 'assigned', label: 'Rider Assigned', icon: '🏍️' },
    { key: 'en_route_pickup', label: 'Rider En Route', icon: '🚀' },
    { key: 'collected', label: 'Item Collected', icon: '📸' },
    { key: 'en_route_delivery', label: 'Out for Delivery', icon: '🚛' },
    { key: 'delivered', label: 'Delivered', icon: '📸' },
    { key: 'payment_requested', label: 'Payment Requested', icon: '💳' },
    { key: 'completed', label: 'Completed', icon: '✅' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

function StatusBadge({ status }) {
    return <span className={`tum-status-badge ${status}`}>{status?.replace(/_/g, ' ').toUpperCase()}</span>;
}

export default function TrackDelivery() {
    const { trackingNumber: paramNum } = useParams();
    const navigate = useNavigate();

    const [query, setQuery] = useState(paramNum || '');
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(!!paramNum);
    const [error, setError] = useState(null);

    const fetch = async (num) => {
        if (!num) return;
        setLoading(true); setError(null);
        try {
            const res = await tumansiApi.track(num.trim().toUpperCase());
            setDelivery(res.data);
        } catch (err) {
            setError('Delivery not found. Please check your tracking number.');
            setDelivery(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (paramNum) fetch(paramNum); }, [paramNum]);

    const currentStep = STATUS_ORDER.indexOf(delivery?.status);

    const handleSearch = () => {
        if (!query.trim()) return;
        navigate(`/tumanasi/track/${query.trim().toUpperCase()}`);
    };

    return (
        <div className="tum-track-page">
            <div className="tum-track-inner">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.8rem', color: 'var(--tum-blue)' }}>
                        📦 Track Your Delivery
                    </h1>
                    <p style={{ color: 'var(--tum-gray-600)', marginTop: '.25rem' }}>Enter your tracking number below</p>
                </div>

                <div className="tum-track-search">
                    <input
                        className="tum-input"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="e.g. TUM-20260223-AB12"
                        style={{ textTransform: 'uppercase' }}
                    />
                    <button className="tum-btn-track" onClick={handleSearch}>
                        <Search size={16} />
                        Track
                    </button>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tum-gray-400)' }}>
                        <div className="spin-icon" style={{ fontSize: '2rem' }}>⏳</div>
                        <p style={{ marginTop: '.5rem' }}>Fetching delivery status…</p>
                    </div>
                )}

                {error && (
                    <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 12, padding: '1.25rem', color: '#991B1B', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {delivery && (
                    <div>
                        {/* Status header */}
                        <div className="tum-delivery-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '.06em', color: 'var(--tum-blue)' }}>
                                        {delivery.tracking_number}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--tum-gray-400)', marginTop: 2 }}>
                                        Booked {new Date(delivery.created_at).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                                <StatusBadge status={delivery.status} />
                            </div>

                            <div className="tum-info-grid">
                                <div className="tum-info-item">
                                    <div className="tum-info-label">From</div>
                                    <div className="tum-info-val">{delivery.pickup_address}</div>
                                    {delivery.pickup_zone && <div style={{ fontSize: '0.78rem', color: 'var(--tum-gray-400)' }}>{delivery.pickup_zone.area_name}</div>}
                                </div>
                                <div className="tum-info-item">
                                    <div className="tum-info-label">To</div>
                                    <div className="tum-info-val">{delivery.dropoff_address}</div>
                                    {delivery.dropoff_zone && <div style={{ fontSize: '0.78rem', color: 'var(--tum-gray-400)' }}>{delivery.dropoff_zone.area_name}</div>}
                                </div>
                                <div className="tum-info-item">
                                    <div className="tum-info-label">Errand</div>
                                    <div className="tum-info-val" style={{ textTransform: 'capitalize' }}>{delivery.errand_type}</div>
                                </div>
                                <div className="tum-info-item">
                                    <div className="tum-info-label">Delivery Fee</div>
                                    <div className="tum-info-val">KES {parseFloat(delivery.quoted_price_kes).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Rider info (if assigned) */}
                        {delivery.rider && (
                            <div className="tum-delivery-card">
                                <h3>🏍️ Your Rider</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {delivery.rider.photo_url ? (
                                        <img src={delivery.rider.photo_url} alt={delivery.rider.full_name}
                                            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tum-blue-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                            🏍️
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--tum-gray-900)' }}>{delivery.rider.full_name}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--tum-gray-400)', textTransform: 'capitalize' }}>{delivery.rider.vehicle_type}</div>
                                        {delivery.rider.average_rating > 0 && (
                                            <div style={{ fontSize: '0.82rem', color: 'var(--tum-amber-dk)', fontWeight: 600 }}>
                                                ⭐ {parseFloat(delivery.rider.average_rating).toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                    <a href={`tel:${delivery.rider.phone}`}
                                        className="tum-btn-primary"
                                        style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>
                                        <Phone size={14} /> Call
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Photo proofs */}
                        {(delivery.pickup_photo_url || delivery.delivery_photo_url) && (
                            <div className="tum-delivery-card">
                                <h3>📸 Proof of Delivery</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {delivery.pickup_photo_url && (
                                        <div>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tum-gray-400)', textTransform: 'uppercase', marginBottom: 6 }}>On Collection</div>
                                            <img src={delivery.pickup_photo_url} alt="Pickup proof"
                                                style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 180 }} />
                                        </div>
                                    )}
                                    {delivery.delivery_photo_url && (
                                        <div>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tum-gray-400)', textTransform: 'uppercase', marginBottom: 6 }}>On Delivery</div>
                                            <img src={delivery.delivery_photo_url} alt="Delivery proof"
                                                style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 180 }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status timeline */}
                        <div className="tum-delivery-card">
                            <h3>📍 Status Timeline</h3>
                            <div className="tum-timeline">
                                {STATUS_STEPS.map((s, i) => {
                                    const isDone = i < currentStep;
                                    const isActive = i === currentStep;
                                    return (
                                        <div key={s.key} className={`tum-tl-step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                                            <div className="tum-tl-dot">{isDone ? '✓' : s.icon}</div>
                                            <div className="tum-tl-label">{s.label}</div>
                                            {isActive && <div className="tum-tl-sub">Current status</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <a href="tel:0118687088" style={{ color: 'var(--tum-blue)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                                <Phone size={14} style={{ display: 'inline', marginRight: 4 }} />
                                Need help? Call 0118 687 088
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
