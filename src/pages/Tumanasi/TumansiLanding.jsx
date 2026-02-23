import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Package, MapPin, Camera, CreditCard, Clock, Shield,
    ChevronRight, Phone, Star, Zap, ArrowRight
} from 'lucide-react';
import SEO from '../../components/SEO';
import './Tumanasi.css';

const STEPS = [
    { icon: Package, title: 'Book', desc: 'Fill in your details, errand type, and locations in under 2 minutes.' },
    { icon: Zap, title: 'Match', desc: 'We instantly find the best available rider near your pickup location.' },
    { icon: Camera, title: 'Proof', desc: 'Rider takes a photo on collection and delivery — full transparency.' },
    { icon: CreditCard, title: 'Pay', desc: 'Pay via MPesa or cash on delivery after your item arrives safely.' },
];

const FEATURES = [
    { icon: Clock, title: 'Fast', desc: 'Same-day delivery across Nairobi and surrounding areas.' },
    { icon: Shield, title: 'Safe', desc: 'Every rider is verified, and photo proof is taken at every step.' },
    { icon: MapPin, title: '200+ Areas', desc: 'We cover Nairobi CBD, Ngong Road, Thika Road, Mombasa Road, and beyond.' },
    { icon: Star, title: 'Rated', desc: 'Rate your rider after each delivery. Quality is our standard.' },
];

export default function TumansiLanding() {
    const { user } = useAuth();

    return (
        <div className="tum-landing">
            <SEO
                title="Tumanasi - Fast & Safe Delivery Service in Nairobi"
                description="Fast, safe, photo-verified errand and parcel delivery across Nairobi. Same-day delivery to 200+ areas. Verified riders, transparent pricing from KES 100. Book in minutes, pay on delivery."
                image="/og-images/tumanasi-landing.png"
                imageAlt="Tumanasi - Your Partner in Sending Easy"
                keywords="Tumanasi delivery, Nairobi delivery service, same-day delivery Kenya, parcel delivery Nairobi, errand service, fast delivery, verified riders, photo proof delivery"
                type="website"
            />
            {/* ── HERO ── */}
            <section className="tum-hero">
                <div className="tum-hero-bg" />
                <div className="tum-hero-content">
                    <div className="tum-brand-badge">
                        <Package size={18} />
                        Delivery Service
                    </div>
                    <h1 className="tum-hero-title">
                        <span className="tum-name">TUMANASI</span>
                        <br />
                        <span className="tum-tagline">Your Partner in Sending Easy</span>
                    </h1>
                    <p className="tum-hero-desc">
                        Fast, safe, photo-verified errand and parcel delivery across Nairobi.
                        Book in minutes. Pay on delivery.
                    </p>
                    <div className="tum-hero-cta">
                        <Link to="/tumanasi/book" className="tum-btn-primary">
                            Book a Delivery
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/tumanasi/pricing" className="tum-btn-outline">
                            View Prices
                        </Link>
                        <Link to="/tumanasi/track" className="tum-btn-outline">
                            Track a Parcel
                        </Link>
                    </div>
                    <div className="tum-hero-phones">
                        <a href="tel:0118687088" className="tum-phone-chip">
                            <Phone size={14} /> 0118 687 088
                        </a>
                        <a href="tel:0784008487" className="tum-phone-chip">
                            <Phone size={14} /> 0784 008 487
                        </a>
                    </div>
                </div>

                {/* floating delivery card */}
                <div className="tum-hero-card">
                    <div className="tum-card-track">
                        <span className="tum-track-label">Live Tracking</span>
                        <span className="tum-status-dot" />
                    </div>
                    <div className="tum-card-steps">
                        {['📦 Collected', '🏍️ En Route', '✅ Delivered'].map((s, i) => (
                            <div key={i} className={`tum-card-step ${i <= 1 ? 'done' : ''}`}>{s}</div>
                        ))}
                    </div>
                    <div className="tum-card-price">KES 450</div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="tum-section">
                <div className="tum-container">
                    <h2 className="tum-section-title">How It Works</h2>
                    <p className="tum-section-sub">Four simple steps from booking to delivery</p>
                    <div className="tum-steps-grid">
                        {STEPS.map((step, i) => (
                            <div key={i} className="tum-step-card">
                                <div className="tum-step-num">{i + 1}</div>
                                <div className="tum-step-icon">
                                    <step.icon size={24} />
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="tum-section tum-section-alt">
                <div className="tum-container">
                    <h2 className="tum-section-title">Why Choose Tumanasi?</h2>
                    <div className="tum-features-grid">
                        {FEATURES.map((feat, i) => (
                            <div key={i} className="tum-feature-card">
                                <div className="tum-feature-icon">
                                    <feat.icon size={22} />
                                </div>
                                <div>
                                    <h3>{feat.title}</h3>
                                    <p>{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING CALLOUT ── */}
            <section className="tum-section">
                <div className="tum-container tum-pricing-cta">
                    <div className="tum-pricing-text">
                        <h2>Prices from KES 100</h2>
                        <p>Within CBD from KES 100 · Ngong Road from KES 300 · Thika Road from KES 250 · and 200+ more areas</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to="/tumanasi/book" className="tum-btn-primary">
                            Book Now <ChevronRight size={18} />
                        </Link>
                        <Link to="/tumanasi/pricing" className="tum-btn-outline" style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
                            Full Price List
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── RIDER CTA ── */}
            <section className="tum-section tum-section-dark">
                <div className="tum-container tum-rider-cta">
                    <h2>Are you a rider?</h2>
                    <p>Join the Tumanasi rider network. Set your hours, take jobs, earn daily.</p>
                    <Link to="/tumanasi/rider/register" className="tum-btn-light">
                        Register as a Rider <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
