import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { tumansiApi } from '../../services/tumansiApi';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import './Tumanasi.css';

const VEHICLE_TYPES = [
    { value: 'motorcycle', label: '🏍️ Motorcycle' },
    { value: 'bicycle', label: '🚲 Bicycle' },
    { value: 'tuk_tuk', label: '🛺 Tuk-Tuk' },
    { value: 'car', label: '🚗 Car' },
    { value: 'commute_walk', label: '🚶 Commute/Walk' },
    { value: 'courier', label: '📦 Courier' },
];

export default function RiderRegister() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const [form, setForm] = useState({
        full_name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        id_number: '',
        vehicle_type: 'motorcycle',
        vehicle_reg: '',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.full_name || !form.phone) { toast.error('Name and phone are required'); return; }
        if (!form.phone.startsWith('+')) { toast.error('Phone must include country code e.g. +254712345678'); return; }

        setLoading(true);
        try {
            await tumansiApi.registerRider(form);
            setDone(true);
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (done) return (
        <div className="tum-wizard-page">
            <div className="tum-wizard-inner">
                <div className="tum-success-box">
                    <div className="tum-success-icon">🏍️</div>
                    <h2>Registration Submitted!</h2>
                    <p>Your rider profile is under review. Our team will verify your details and approve your account within 24 hours.</p>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <button className="tum-btn-submit" onClick={() => navigate('/tumanasi/rider/dashboard')}>
                            Go to Dashboard
                        </button>
                        <button className="tum-btn-back" onClick={() => navigate('/tumanasi')}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="tum-wizard-page">
            <div className="tum-wizard-inner">
                <div className="tum-wizard-header">
                    <h1>🏍️ Become a Tumanasi Rider</h1>
                    <p>Earn money delivering parcels across Nairobi on your own schedule</p>
                </div>

                <form className="tum-wizard-card" onSubmit={submit}>
                    <div className="tum-card-title">Personal Details</div>

                    <div className="tum-row">
                        <div className="tum-field">
                            <label className="tum-label">Full Name *</label>
                            <input className="tum-input" value={form.full_name}
                                onChange={e => set('full_name', e.target.value)} placeholder="John Kamau" required />
                        </div>
                        <div className="tum-field">
                            <label className="tum-label">Phone *</label>
                            <input className="tum-input" value={form.phone}
                                onChange={e => set('phone', e.target.value)} placeholder="+254712345678" required />
                        </div>
                    </div>

                    <div className="tum-row">
                        <div className="tum-field">
                            <label className="tum-label">Email</label>
                            <input className="tum-input" type="email" value={form.email}
                                onChange={e => set('email', e.target.value)} placeholder="john@email.com" />
                        </div>
                        <div className="tum-field">
                            <label className="tum-label">National ID Number</label>
                            <input className="tum-input" value={form.id_number}
                                onChange={e => set('id_number', e.target.value)} placeholder="12345678" />
                        </div>
                    </div>

                    <div className="tum-card-title" style={{ marginTop: '1rem' }}>Vehicle Details</div>
                    <div className="tum-field">
                        <label className="tum-label">Vehicle Type *</label>
                        <div className="tum-errand-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                            {VEHICLE_TYPES.map(v => (
                                <div key={v.value}
                                    className={`tum-errand-opt ${form.vehicle_type === v.value ? 'selected' : ''}`}
                                    onClick={() => set('vehicle_type', v.value)}>
                                    <span className="tum-errand-icon">{v.label.split(' ')[0]}</span>
                                    {v.label.split(' ').slice(1).join(' ')}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="tum-field">
                        <label className="tum-label">Vehicle Registration</label>
                        <input className="tum-input" value={form.vehicle_reg}
                            onChange={e => set('vehicle_reg', e.target.value.toUpperCase())}
                            placeholder="e.g. KAA 123B" />
                    </div>

                    <div style={{ background: 'var(--tum-gray-50)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--tum-gray-200)', fontSize: '0.85rem', color: 'var(--tum-gray-600)' }}>
                        ℹ️ Your profile will be reviewed and verified by the Tumanasi team before you can accept deliveries. You'll be notified once approved.
                    </div>

                    <button type="submit" className="tum-btn-submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <><Loader size={16} className="spin" /> Submitting…</> : '🏍️ Submit Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
}
