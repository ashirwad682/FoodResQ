import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import {
  CheckCircle2,
  Calendar,
  Building2,
  Package,
  Award,
  Star,
  MapPin,
  Utensils,
  Leaf,
  ShieldCheck,
  Search,
  FileCheck,
  X,
  Clock,
} from 'lucide-react';
import { formatDate, formatKg, formatNumber } from '../../utils/formatters';

export const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await pickupService.getAssignments();
        const list = data.results || data || [];
        setHistory(
          list.filter((a) => a.status === 'CONFIRMED_BY_NGO' || a.status === 'COMPLETED' || a.status === 'DELIVERED')
        );
      } catch (err) {
        console.error('Failed to load donation history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalKg = history.reduce((sum, item) => sum + (parseFloat(item.donation_quantity) || 0), 0);
  const totalMeals = Math.round(totalKg * 2.5);
  const totalCo2 = Math.round(totalKg * 2.5);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.donation_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pickup_address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.volunteer_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'COOKED') {
      return (item.donation_food_type || '').includes('COOKED');
    }
    if (activeFilter === 'HEAVY') {
      return (parseFloat(item.donation_quantity) || 0) >= 20;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* A. Hero Banner with ResQFood Branding & Ambient Rose Glow */}
      <section className="resq-hero-panel resq-hero-ngo">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.75rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(24, 24, 27, 0.06)',
                border: '1px solid rgba(24, 24, 27, 0.15)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.95rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#18181b',
                marginBottom: '1rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ShieldCheck size={15} style={{ color: '#27272a' }} />
              <span>Verified Shelter Intake • Permanent MongoDB Audit Ledger</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.85rem, 3.2vw, 2.45rem)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                marginBottom: '0.75rem',
              }}
            >
              Shelter{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Rescue History
              </span>
            </h1>

            <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.6 }}>
              Permanent closed-loop verification records for all commercial food donations safely received, inspected, and distributed by your shelter.
            </p>
          </div>

          {/* Impact Snapshot Tile (Light Card) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(24, 24, 27, 0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              minWidth: '240px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>
                Total Beneficiaries Fed
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#18181b', fontFamily: 'var(--font-heading)', marginTop: '0.15rem' }}>
                {formatNumber(totalMeals)}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Surplus Saved:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{formatKg(totalKg)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* B. Core Shelter Metrics Cards */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.15rem' }}>
          <div className="card" style={{ padding: '1.4rem 1.6rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                Rescued Food (kg)
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {formatKg(totalKg)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Diverted from city waste
            </div>
          </div>

          <div className="card" style={{ padding: '1.4rem 1.6rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                Community Meals Fed
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Utensils size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {formatNumber(totalMeals)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Distributed with dignity
            </div>
          </div>

          <div className="card" style={{ padding: '1.4rem 1.6rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                CO₂ Emissions Prevented
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {formatNumber(totalCo2)} kg
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Landfill greenhouse gas saved
            </div>
          </div>

          <div className="card" style={{ padding: '1.4rem 1.6rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                Successful Intakes
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(24, 24, 27, 0.08)', color: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {history.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Fully audited drop-offs
            </div>
          </div>
        </div>
      </section>

      {/* C. History Search & Filter Bar */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by meal, kitchen, or courier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }}
            />
          </div>

          <div className="filter-pills-row">
            {[
              { id: 'ALL', label: `All Intakes (${history.length})` },
              { id: 'COOKED', label: 'Cooked Meals' },
              { id: 'HEAVY', label: 'Bulk Batches (≥20kg)' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id)}
                className={`filter-pill ${activeFilter === pill.id ? 'active' : ''}`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading shelter rescue history ledger from MongoDB...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              No intake records matching your criteria
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {searchQuery ? 'Try clearing your search query to see all past records.' : 'Once you confirm incoming deliveries, their receipts will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredHistory.map((record) => (
              <div
                key={record.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  borderLeft: '4px solid #0284c7',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: 'min(280px, 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.22rem 0.7rem',
                        borderRadius: 'var(--radius-full)',
                        background: '#eff6ff',
                        color: '#0284c7',
                        border: '1px solid #bfdbfe',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      INTAKE VERIFIED
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>{formatDate(record.confirmed_at || record.delivered_at || record.updated_at)}</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {record.donation_title || `Rescue Batch #${record.id?.slice(-6)}`}
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    Quantity: <strong>{formatKg(record.donation_quantity)}</strong> (~{Math.round((parseFloat(record.donation_quantity) || 0) * 2.5)} meals) • Category: <strong>{record.donation_food_type || 'Cooked Meals'}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <MapPin size={14} style={{ color: '#dc2626', flexShrink: 0 }} />
                    <span>Donor Origin: {record.pickup_address}</span>
                  </div>

                  {record.delivery_notes && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', background: 'var(--bg-alt)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                      Intake Notes: "{record.delivery_notes}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  {record.rating_by_ngo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#fffdf5', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid #fde68a' }}>
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e' }}>
                        {record.rating_by_ngo} / 5.0
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedCertificate(record)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileCheck size={14} style={{ color: '#0284c7' }} />
                    <span>View Intake Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* D. Digital Intake Certificate Modal */}
      {selectedCertificate && (
        <div className="modal-backdrop-dark" onClick={() => setSelectedCertificate(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#0284c7" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Digital Shelter Intake Receipt
                </h3>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', background: 'var(--bg-alt)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  ResQFood Verified Redistribution Certificate
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  "{selectedCertificate.donation_title || `Batch #${selectedCertificate.id?.slice(-6)}`}"
                </div>
                <div style={{ fontSize: '0.84rem', color: '#0284c7', fontWeight: 800, marginTop: '0.2rem' }}>
                  ✓ Intake Confirmed & Logged in MongoDB Atlas
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Received Quantity</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
                    {formatKg(selectedCertificate.donation_quantity)}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Servings Provided</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
                    ~{Math.round((parseFloat(selectedCertificate.donation_quantity) || 0) * 2.5)} Meals
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CO₂ Prevented</div>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                    {Math.round((parseFloat(selectedCertificate.donation_quantity) || 0) * 2.5)} kg CO₂
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Assigned Courier</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {selectedCertificate.volunteer_name || 'Verified Courier'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div><strong>Donor Origin:</strong> {selectedCertificate.pickup_address}</div>
                <div><strong>Received Timestamp:</strong> {formatDate(selectedCertificate.confirmed_at || selectedCertificate.delivered_at)}</div>
              </div>

              <button
                onClick={() => setSelectedCertificate(null)}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-full)', fontWeight: 700 }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
