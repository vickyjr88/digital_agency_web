import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { tumansiApi } from '../../services/tumansiApi';
import { ArrowRight, Search, MapPin, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../../components/SEO';
import './Tumanasi.css';

/* ─── Mini zone autocomplete ─── */
function ZoneInput({ placeholder, value, onSelect, onClear }) {
    const [q, setQ] = useState(value?.area_name || '');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        if (value) setQ(value.area_name);
        else setQ('');
    }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const search = async (text) => {
        setQ(text);
        if (text.length < 1) { setResults([]); setOpen(false); onClear(); return; }
        try {
            const res = await tumansiApi.searchZones(text);
            setResults(res.data || []);
            setOpen(true);
        } catch { /* silent */ }
    };

    const pick = (zone) => {
        setQ(zone.area_name);
        setOpen(false);
        setResults([]);
        onSelect(zone);
    };

    return (
        <div className="tum-zone-search" ref={ref} style={{ flex: 1 }}>
            <input
                className="tum-input"
                value={q}
                onChange={(e) => search(e.target.value)}
                placeholder={placeholder}
                style={{ fontSize: '1rem' }}
            />
            {open && results.length > 0 && (
                <div className="tum-zone-dropdown">
                    {results.map((z) => (
                        <div key={z.id} className="tum-zone-option" onClick={() => pick(z)}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{z.area_name}</div>
                                <div className="tum-zone-label">{z.zone_name}</div>
                            </div>
                            <span className="tum-zone-price">KES {parseFloat(z.price_kes).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Main Page ─── */
export default function TumansiPricing() {
    const [allZones, setAllZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Calculator state
    const [pickup, setPickup] = useState(null);
    const [dropoff, setDropoff] = useState(null);

    // Table: group expand state
    const [collapsed, setCollapsed] = useState({});

    useEffect(() => {
        tumansiApi.listZones().then(res => {
            setAllZones(res.data || []);
        }).catch(() => {
            setAllZones([]);
        }).finally(() => setLoading(false));
    }, []);

    const toggleGroup = (name) => setCollapsed(p => ({ ...p, [name]: !p[name] }));

    // Filter and group zones
    const filtered = allZones.filter(z =>
        !search ||
        z.area_name.toLowerCase().includes(search.toLowerCase()) ||
        z.zone_name.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = filtered.reduce((acc, z) => {
        (acc[z.zone_name] = acc[z.zone_name] || []).push(z);
        return acc;
    }, {});

    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

    // Estimated price comes from dropoff zone only
    const estimatedPrice = dropoff?.price_kes ? parseFloat(dropoff.price_kes) : null;

    // Stats
    const minPrice = allZones.length ? Math.min(...allZones.map(z => parseFloat(z.price_kes))) : 0;
    const maxPrice = allZones.length ? Math.max(...allZones.map(z => parseFloat(z.price_kes))) : 0;
    const uniqueZones = [...new Set(allZones.map(z => z.zone_name))].length;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
            <SEO
                title="Tumanasi Delivery Prices - Transparent Pricing Across Nairobi"
                description="View Tumanasi's transparent, flat-rate delivery pricing across 200+ Nairobi locations. Starting from KES 100. No hidden fees. Use our price calculator for instant quotes."
                image="/og-images/tumanasi-pricing.png"
                imageAlt="Tumanasi Delivery Prices & Area List"
                keywords="Tumanasi pricing, delivery prices Nairobi, Nairobi delivery cost, parcel delivery rates, transparent pricing, delivery quote calculator, Nairobi delivery areas"
                type="website"
            />

            {/* ── Hero ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f62a8 60%, #f97316 100%)',
                padding: '4rem 1.5rem 3rem',
                textAlign: 'center',
                color: '#fff',
            }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', borderRadius: 99, padding: '6px 18px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                    <Truck size={15} /> Tumanasi Delivery · Nairobi
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, margin: '0 0 .75rem', lineHeight: 1.15 }}>
                    Delivery Prices &amp; Area List
                </h1>
                <p style={{ fontSize: '1.1rem', opacity: .85, maxWidth: 520, margin: '0 auto 2.5rem' }}>
                    Transparent, flat-rate pricing across 200+ Nairobi locations.<br />
                    Use the calculator below to get an instant quote.
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Starting from', value: `KES ${minPrice}` },
                        { label: 'Up to', value: `KES ${maxPrice}` },
                        { label: 'Areas covered', value: `${allZones.length}+` },
                        { label: 'Corridors', value: uniqueZones },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value}</div>
                            <div style={{ fontSize: '0.78rem', opacity: .75, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Price Estimator Card ── */}
            <div style={{ maxWidth: 760, margin: '-2rem auto 2.5rem', padding: '0 1.25rem' }}>
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    boxShadow: '0 8px 40px rgba(0,0,0,.12)',
                    padding: '2rem',
                    border: '1px solid #e2e8f0',
                }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e3a5f', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={18} color="#f97316" /> Instant Price Estimator
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Pickup */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                                📍 Pickup Area
                            </label>
                            <ZoneInput
                                placeholder="e.g. CBD, Westlands…"
                                value={pickup}
                                onSelect={setPickup}
                                onClear={() => setPickup(null)}
                            />
                        </div>

                        <div style={{ fontSize: '1.5rem', color: '#cbd5e1', marginTop: 20, flexShrink: 0 }}>→</div>

                        {/* Dropoff */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                                🏁 Dropoff Area <span style={{ color: '#f97316' }}>*</span>
                            </label>
                            <ZoneInput
                                placeholder="e.g. Karen, Kiambu…"
                                value={dropoff}
                                onSelect={setDropoff}
                                onClear={() => setDropoff(null)}
                            />
                        </div>
                    </div>

                    {/* Price result */}
                    {estimatedPrice ? (
                        <div style={{
                            marginTop: '1.5rem',
                            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                            border: '2px solid #fed7aa',
                            borderRadius: 14,
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}>
                            <div>
                                <div style={{ fontSize: '0.82rem', color: '#9a3412', fontWeight: 600, marginBottom: 4 }}>
                                    Estimated Delivery Fee
                                </div>
                                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ea580c', lineHeight: 1 }}>
                                    KES {estimatedPrice.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#c2410c', marginTop: 6 }}>
                                    {pickup && <span>From <strong>{pickup.area_name}</strong> → </span>}
                                    <span>To <strong>{dropoff.area_name}</strong> ({dropoff.zone_name})</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                                    * Price is based on dropoff location. Cash or MPesa accepted on delivery.
                                </div>
                            </div>
                            <Link
                                to={`/tumanasi/book`}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: '#f97316', color: '#fff', padding: '12px 22px',
                                    borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
                                    textDecoration: 'none', boxShadow: '0 4px 14px rgba(249,115,22,.35)',
                                    transition: 'background .2s',
                                    flexShrink: 0,
                                }}
                            >
                                Book Now <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div style={{ marginTop: '1.25rem', fontSize: '0.83rem', color: '#94a3b8', textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
                            Search and select a <strong>Dropoff Area</strong> above to see the price
                        </div>
                    )}
                </div>
            </div>

            {/* ── Full Price List ── */}
            <div style={{ maxWidth: 900, margin: '0 auto 4rem', padding: '0 1.25rem' }}>

                {/* Table header + search */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                        <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e293b', margin: 0 }}>
                            Full Area Price List
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
                            {allZones.length} areas across {uniqueZones} corridors
                        </p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search area or corridor…"
                            style={{
                                padding: '10px 14px 10px 36px',
                                borderRadius: 10,
                                border: '1.5px solid #e2e8f0',
                                fontSize: '0.9rem',
                                outline: 'none',
                                width: 240,
                                fontFamily: 'Poppins, sans-serif',
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>⏳</div>
                        Loading price list…
                    </div>
                ) : sortedGroups.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No areas match your search.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sortedGroups.map(([groupName, zones]) => {
                            const isOpen = !collapsed[groupName];
                            const minP = Math.min(...zones.map(z => parseFloat(z.price_kes)));
                            const maxP = Math.max(...zones.map(z => parseFloat(z.price_kes)));
                            return (
                                <div key={groupName} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                                    {/* Group header */}
                                    <button
                                        onClick={() => toggleGroup(groupName)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', padding: '14px 18px',
                                            background: '#f8fafc', border: 'none', cursor: 'pointer',
                                            borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #1e3a5f, #0f62a8)',
                                                color: '#fff', borderRadius: 8, padding: '4px 10px',
                                                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                            }}>
                                                {zones.length} areas
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{groupName}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                            <span style={{ fontSize: '0.83rem', color: '#f97316', fontWeight: 700 }}>
                                                KES {minP.toLocaleString()}{minP !== maxP ? ` – ${maxP.toLocaleString()}` : ''}
                                            </span>
                                            {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                                        </div>
                                    </button>

                                    {/* Zone rows */}
                                    {isOpen && (
                                        <div>
                                            {zones
                                                .sort((a, b) => parseFloat(a.price_kes) - parseFloat(b.price_kes))
                                                .map((z, i) => (
                                                    <div
                                                        key={z.id}
                                                        style={{
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '11px 18px',
                                                            borderBottom: i < zones.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                            gap: 8,
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <MapPin size={13} color="#94a3b8" />
                                                            <span style={{ fontSize: '0.9rem', color: '#334155' }}>{z.area_name}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                            <span style={{
                                                                fontWeight: 800, fontSize: '0.95rem',
                                                                color: '#ea580c',
                                                                minWidth: 90, textAlign: 'right',
                                                            }}>
                                                                KES {parseFloat(z.price_kes).toLocaleString()}
                                                            </span>
                                                            <Link
                                                                to="/tumanasi/book"
                                                                style={{
                                                                    fontSize: '0.75rem', color: '#0f62a8',
                                                                    fontWeight: 600, textDecoration: 'none',
                                                                    background: '#eff6ff', borderRadius: 6,
                                                                    padding: '4px 10px', whiteSpace: 'nowrap',
                                                                    transition: 'background .15s',
                                                                }}
                                                            >
                                                                Book →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer note */}
                <div style={{
                    marginTop: '2rem',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: 12,
                    padding: '1rem 1.25rem',
                    fontSize: '0.83rem',
                    color: '#0369a1',
                    lineHeight: 1.6,
                }}>
                    <strong>ℹ️ Pricing notes:</strong> Prices are per delivery, based on the <strong>dropoff location</strong>. All prices are in Kenyan Shillings (KES).
                    Payment accepted via <strong>Cash on Delivery</strong> or <strong>MPesa</strong>. Prices may vary for items requiring special handling or fragile goods.
                    For bulk or corporate deliveries, <a href="tel:0118687088" style={{ color: '#0284c7', fontWeight: 700 }}>call us</a>.
                </div>
            </div>

            {/* ── Bottom CTA ── */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f62a8)', padding: '3rem 1.5rem', textAlign: 'center', color: '#fff' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.6rem', margin: '0 0 .75rem' }}>Ready to send something?</h2>
                <p style={{ opacity: .8, marginBottom: '1.5rem' }}>Book a rider in under 2 minutes. No app download required.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/tumanasi/book" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: '#f97316', color: '#fff', padding: '13px 28px',
                        borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                        boxShadow: '0 4px 18px rgba(249,115,22,.4)',
                    }}>
                        📦 Book a Delivery <ArrowRight size={18} />
                    </Link>
                    <Link to="/tumanasi" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(255,255,255,.1)', color: '#fff', padding: '13px 28px',
                        borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                        border: '1px solid rgba(255,255,255,.25)',
                    }}>
                        Learn More
                    </Link>
                </div>
            </div>
        </div>
    );
}
