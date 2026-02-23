import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { tumansiApi } from '../../services/tumansiApi';
import {
    User, Phone, Mail, Package, FileText, Utensils, ShoppingBag,
    MapPin, ArrowRight, CheckCircle, Loader, AlertCircle
} from 'lucide-react';
import './Tumanasi.css';

const STEPS = ['Your Details', 'Errand', 'Locations', 'Confirm'];

const ERRAND_TYPES = [
    { value: 'parcel', label: 'Parcel', icon: '📦' },
    { value: 'document', label: 'Document', icon: '📄' },
    { value: 'food', label: 'Food', icon: '🍔' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'errand', label: 'Errand', icon: '🔧' },
];

const PAYMENT_OPTS = [
    { value: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay the rider in cash when delivered' },
    { value: 'mobile_money', label: 'MPesa', desc: 'You\'ll receive an STK push on delivery' },
];

function ZoneSearch({ label, value, onSelect }) {
    const [q, setQ] = useState(value?.area_name || '');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        if (value) setQ(value.area_name);
    }, [value]);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const search = async (text) => {
        setQ(text);
        if (text.length < 2) { setResults([]); setOpen(false); return; }
        try {
            const res = await tumansiApi.searchZones(text);
            setResults(res.data);
            setOpen(true);
        } catch { /* silent */ }
    };

    const pick = (zone) => {
        setQ(zone.area_name);
        setOpen(false);
        onSelect(zone);
    };

    return (
        <div className="tum-field">
            <label className="tum-label">{label}</label>
            <div className="tum-zone-search" ref={ref}>
                <input
                    className="tum-input"
                    value={q}
                    onChange={(e) => search(e.target.value)}
                    placeholder="Search area e.g. Karen, TRM, Westlands…"
                />
                {open && results.length > 0 && (
                    <div className="tum-zone-dropdown">
                        {results.map((z) => (
                            <div key={z.id} className="tum-zone-option" onClick={() => pick(z)}>
                                <div>
                                    <div>{z.area_name}</div>
                                    <div className="tum-zone-label">{z.zone_name}</div>
                                </div>
                                <span className="tum-zone-price">KES {z.price_kes}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookingWizard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [trackingNum, setTrackingNum] = useState(null);

    const [form, setForm] = useState({
        customer_name: user?.name || '',
        customer_phone: user?.phone || '',
        customer_email: user?.email || '',

        errand_type: 'parcel',
        errand_description: '',
        special_instructions: '',
        is_fragile: false,
        requires_handling: false,

        pickup_address: '',
        pickup_area: null,
        pickup_contact_name: '',
        pickup_contact_phone: '',

        dropoff_address: '',
        dropoff_area: null,
        dropoff_contact_name: '',
        dropoff_contact_phone: '',

        payment_method: 'cash_on_delivery',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const priceKes = form.dropoff_area?.price_kes;

    const canNext = () => {
        if (step === 0) return form.customer_name.trim() && form.customer_phone.trim();
        if (step === 1) return form.errand_description.trim().length >= 3;
        if (step === 2) return form.pickup_address.trim() && form.dropoff_address.trim() && form.dropoff_area;
        return true;
    };

    const submit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                customer_name: form.customer_name,
                customer_phone: form.customer_phone,
                customer_email: form.customer_email || undefined,

                errand_type: form.errand_type,
                errand_description: form.errand_description,
                special_instructions: form.special_instructions || undefined,
                is_fragile: form.is_fragile,
                requires_handling: form.requires_handling,

                pickup_address: form.pickup_address,
                pickup_area_id: form.pickup_area?.id || undefined,
                pickup_contact_name: form.pickup_contact_name || form.customer_name,
                pickup_contact_phone: form.pickup_contact_phone || form.customer_phone,

                dropoff_address: form.dropoff_address,
                dropoff_area_id: form.dropoff_area.id,
                dropoff_contact_name: form.dropoff_contact_name || form.customer_name,
                dropoff_contact_phone: form.dropoff_contact_phone || form.customer_phone,

                payment_method: form.payment_method,
            };

            const res = await tumansiApi.bookDelivery(payload);
            setTrackingNum(res.data.tracking_number);
            toast.success('Booking confirmed! 🎉');
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (trackingNum) {
        return (
            <div className="tum-wizard-page">
                <div className="tum-wizard-inner">
                    <div className="tum-success-box">
                        <div className="tum-success-icon">🎉</div>
                        <h2>Booking Confirmed!</h2>
                        <p>Your errand has been placed. We're finding the best rider for you.</p>
                        <div className="tum-tracking-badge">{trackingNum}</div>
                        <p style={{ color: 'var(--tum-gray-400)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Save this tracking number to follow your delivery
                        </p>
                        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                className="tum-btn-submit"
                                onClick={() => navigate(`/tumanasi/track/${trackingNum}`)}
                            >
                                Track Delivery <ArrowRight size={16} />
                            </button>
                            <button
                                className="tum-btn-back"
                                onClick={() => navigate('/tumanasi')}
                                style={{ padding: '12px 24px' }}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tum-wizard-page">
            <div className="tum-wizard-inner">
                <div className="tum-wizard-header">
                    <h1>📦 Book a Delivery</h1>
                    <p>Takes under 2 minutes</p>
                </div>

                {/* Progress bar */}
                <div className="tum-progress">
                    {STEPS.map((label, i) => (
                        <>
                            <div key={i} className={`tum-prog-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                                <div className="tum-prog-circle">
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span>{label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`tum-prog-line ${i < step ? 'done' : ''}`} />
                            )}
                        </>
                    ))}
                </div>

                <div className="tum-wizard-card">

                    {/* ── STEP 0: Customer Details ── */}
                    {step === 0 && (
                        <>
                            <div className="tum-card-title"><User size={18} /> Your Details</div>
                            {user && (
                                <div style={{ background: 'var(--tum-blue-lt)', borderRadius: 10, padding: '10px 14px', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--tum-blue)' }}>
                                    ✅ Pre-filled from your account
                                </div>
                            )}
                            <div className="tum-field">
                                <label className="tum-label">Full Name *</label>
                                <input className="tum-input" value={form.customer_name}
                                    onChange={e => set('customer_name', e.target.value)}
                                    placeholder="John Kamau" />
                            </div>
                            <div className="tum-row">
                                <div className="tum-field">
                                    <label className="tum-label">Phone *</label>
                                    <input className="tum-input" value={form.customer_phone}
                                        onChange={e => set('customer_phone', e.target.value)}
                                        placeholder="+254712345678" />
                                </div>
                                <div className="tum-field">
                                    <label className="tum-label">Email (optional)</label>
                                    <input className="tum-input" value={form.customer_email}
                                        onChange={e => set('customer_email', e.target.value)}
                                        placeholder="john@email.com" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── STEP 1: Errand Details ── */}
                    {step === 1 && (
                        <>
                            <div className="tum-card-title"><Package size={18} /> Errand Details</div>
                            <div className="tum-field">
                                <label className="tum-label">What are you sending?</label>
                                <div className="tum-errand-grid">
                                    {ERRAND_TYPES.map(t => (
                                        <div key={t.value}
                                            className={`tum-errand-opt ${form.errand_type === t.value ? 'selected' : ''}`}
                                            onClick={() => set('errand_type', t.value)}
                                        >
                                            <span className="tum-errand-icon">{t.icon}</span>
                                            {t.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="tum-field">
                                <label className="tum-label">Description *</label>
                                <textarea className="tum-textarea" value={form.errand_description}
                                    onChange={e => set('errand_description', e.target.value)}
                                    placeholder="Describe what needs to be sent or done (e.g. A sealed envelope to be delivered to the office)" />
                            </div>
                            <div className="tum-field">
                                <label className="tum-label">Special Instructions (optional)</label>
                                <input className="tum-input" value={form.special_instructions}
                                    onChange={e => set('special_instructions', e.target.value)}
                                    placeholder="e.g. Handle with care, call before arriving" />
                            </div>
                            <div className="tum-field">
                                <label className="tum-label">Item Handling</label>
                                <div className="tum-toggle-row">
                                    <div className={`tum-toggle ${form.is_fragile ? 'active' : ''}`}
                                        onClick={() => set('is_fragile', !form.is_fragile)}>
                                        🥚 Fragile item
                                    </div>
                                    <div className={`tum-toggle ${form.requires_handling ? 'active' : ''}`}
                                        onClick={() => set('requires_handling', !form.requires_handling)}>
                                        🧤 Requires special handling
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── STEP 2: Locations ── */}
                    {step === 2 && (
                        <>
                            <div className="tum-card-title"><MapPin size={18} /> Pickup & Dropoff</div>

                            <div style={{ background: 'var(--tum-gray-50)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--tum-gray-200)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--tum-blue)', marginBottom: '.75rem', fontSize: '0.9rem' }}>📍 Pickup Location</div>
                                <div className="tum-field" style={{ marginBottom: '.75rem' }}>
                                    <label className="tum-label">Full Pickup Address *</label>
                                    <input className="tum-input" value={form.pickup_address}
                                        onChange={e => set('pickup_address', e.target.value)}
                                        placeholder="e.g. Ground floor, ABC Plaza, Westlands" />
                                </div>
                                <ZoneSearch label="Pickup Area (for pricing reference)" value={form.pickup_area} onSelect={z => set('pickup_area', z)} />
                                <div className="tum-row">
                                    <div className="tum-field" style={{ marginBottom: 0 }}>
                                        <label className="tum-label">Contact Name at Pickup</label>
                                        <input className="tum-input" value={form.pickup_contact_name}
                                            onChange={e => set('pickup_contact_name', e.target.value)}
                                            placeholder={form.customer_name || 'Same as you'} />
                                    </div>
                                    <div className="tum-field" style={{ marginBottom: 0 }}>
                                        <label className="tum-label">Contact Phone at Pickup</label>
                                        <input className="tum-input" value={form.pickup_contact_phone}
                                            onChange={e => set('pickup_contact_phone', e.target.value)}
                                            placeholder={form.customer_phone || '+254…'} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--tum-gray-50)', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--tum-gray-200)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--tum-green)', marginBottom: '.75rem', fontSize: '0.9rem' }}>🏁 Drop-off Location</div>
                                <div className="tum-field" style={{ marginBottom: '.75rem' }}>
                                    <label className="tum-label">Full Dropoff Address *</label>
                                    <input className="tum-input" value={form.dropoff_address}
                                        onChange={e => set('dropoff_address', e.target.value)}
                                        placeholder="e.g. 3rd floor, Office 12, Karen Road" />
                                </div>
                                <ZoneSearch label="Dropoff Area * (determines price)" value={form.dropoff_area} onSelect={z => set('dropoff_area', z)} />
                                <div className="tum-row">
                                    <div className="tum-field" style={{ marginBottom: 0 }}>
                                        <label className="tum-label">Recipient Name</label>
                                        <input className="tum-input" value={form.dropoff_contact_name}
                                            onChange={e => set('dropoff_contact_name', e.target.value)}
                                            placeholder="e.g. Jane Njeri" />
                                    </div>
                                    <div className="tum-field" style={{ marginBottom: 0 }}>
                                        <label className="tum-label">Recipient Phone</label>
                                        <input className="tum-input" value={form.dropoff_contact_phone}
                                            onChange={e => set('dropoff_contact_phone', e.target.value)}
                                            placeholder="+254…" />
                                    </div>
                                </div>
                            </div>

                            {!form.dropoff_area && (
                                <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginTop: '1rem', fontSize: '0.85rem', color: '#92400E' }}>
                                    ⚠️ Please search and select a <strong>Dropoff Area</strong> above to see the price and enable Next.
                                </div>
                            )}

                            {priceKes && (
                                <div className="tum-price-preview">
                                    <div>
                                        <div className="tum-price-label">Delivery Fee</div>
                                        <div className="tum-price-label" style={{ marginTop: 2, opacity: .65, fontSize: '0.75rem' }}>
                                            {form.dropoff_area?.area_name} · {form.dropoff_area?.zone_name}
                                        </div>
                                    </div>
                                    <div className="tum-price-value">KES {priceKes}</div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── STEP 3: Confirm ── */}
                    {step === 3 && (
                        <>
                            <div className="tum-card-title"><CheckCircle size={18} /> Review & Confirm</div>

                            {[
                                ['Name', form.customer_name],
                                ['Phone', form.customer_phone],
                                ['Errand Type', ERRAND_TYPES.find(t => t.value === form.errand_type)?.label],
                                ['Description', form.errand_description],
                                ['Pickup Address', form.pickup_address],
                                ['Pickup Area', form.pickup_area?.area_name || 'Not selected'],
                                ['Dropoff Address', form.dropoff_address],
                                ['Dropoff Area', form.dropoff_area?.area_name],
                                ['Recipient', form.dropoff_contact_name || form.customer_name],
                                ['Payment', PAYMENT_OPTS.find(p => p.value === form.payment_method)?.label],
                            ].map(([k, v]) => (
                                <div key={k} className="tum-summary-row">
                                    <span className="tum-summary-key">{k}</span>
                                    <span className="tum-summary-val">{v}</span>
                                </div>
                            ))}

                            {priceKes && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div className="tum-price-preview">
                                        <div>
                                            <div className="tum-price-label">Total to Pay on Delivery</div>
                                            <div className="tum-price-label" style={{ opacity: .65, fontSize: '0.75rem', marginTop: 2 }}>Cash / MPesa</div>
                                        </div>
                                        <div className="tum-price-value">KES {priceKes}</div>
                                    </div>
                                </div>
                            )}

                            <div className="tum-field" style={{ marginTop: '1.5rem' }}>
                                <label className="tum-label">Payment Method</label>
                                <div className="tum-payment-opts">
                                    {PAYMENT_OPTS.map(p => (
                                        <label key={p.value} className={`tum-payment-opt ${form.payment_method === p.value ? 'selected' : ''}`}>
                                            <input type="radio" name="payment" value={p.value} checked={form.payment_method === p.value}
                                                onChange={() => set('payment_method', p.value)} />
                                            <div>
                                                <div className="tum-payment-label">{p.label}</div>
                                                <div className="tum-payment-desc">{p.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                </div>

                {/* Wizard Nav */}
                <div className="tum-wizard-nav">
                    {step > 0 ? (
                        <button className="tum-btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>
                    ) : <span />}

                    {step < 3 ? (
                        <button className="tum-btn-next" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button className="tum-btn-submit" onClick={submit} disabled={submitting || !canNext()}>
                            {submitting ? <><Loader size={16} className="spin" /> Booking…</> : <>✅ Confirm Booking</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
