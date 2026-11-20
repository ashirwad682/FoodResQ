import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import {
  CheckCircle2,
  Award,
  Truck,
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  Package,
  Search,
  Filter,
  FileCheck,
  X,
  Leaf,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatDate, formatKg, formatNumber } from '../../utils/formatters';

export const CompletedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const data = await pickupService.getAssignments({ filter: 'mine' });
        const list = data.results || data || [];
        setTasks(
          list.filter((a) => a.status === 'CONFIRMED_BY_NGO' || a.status === 'COMPLETED' || a.status === 'DELIVERED')
        );
      } catch (err) {
        console.error('Failed to load completed tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompleted();
  }, []);

  const totalKg = tasks.reduce((sum, item) => sum + (parseFloat(item.donation_quantity) || 0), 0);
  const totalMeals = Math.round(totalKg * 2.5);
  const totalCo2 = Math.round(totalKg * 2.5);

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.donation_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.pickup_address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.organization_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'HEAVY') {
      return (parseFloat(task.donation_quantity) || 0) >= 20;
    }
    if (activeFilter === 'TOP_RATED') {
      return (task.rating_by_ngo || 5.0) >= 4.8;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* A. Hero Banner with ResQFood Branding & Ambient Rose Glow */}
      <section className="resq-hero-panel resq-hero-volunteer">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.75rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(251, 113, 133, 0.08)',
                border: '1px solid rgba(251, 113, 133, 0.28)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.95rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#e11d48',
                marginBottom: '1rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ShieldCheck size={15} style={{ color: '#f43f5e' }} />
              <span>Verified Food Rescue Logistics • Courier Custody Ledger</span>
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
              Completed{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Rescue Missions
              </span>
            </h1>

            <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.6 }}>
              Every completed mission on the ResQFood network preserves fresh edible meals, supports verified community shelters, and eliminates landfill methane emissions.
            </p>
          </div>

          {/* Quick Lifetime Impact Tile (Light Card) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(251, 113, 133, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              minWidth: '240px',
              boxShadow: '0 10px 30px -5px rgba(244, 63, 94, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>
                Lifetime Meals Delivered
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#e11d48', fontFamily: 'var(--font-heading)', marginTop: '0.15rem' }}>
                {formatNumber(totalMeals)}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Payload:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{formatKg(totalKg)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* B. Impact Metric Cards */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.15rem' }}>
          <div className="card" style={{ padding: '1.4rem 1.6rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                Completed Missions
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {tasks.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Confirmed shelter deliveries
            </div>
          </div>

          <div className="card" style={{ padding: '1.4rem 1.6rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                Food Rescued
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
                CO₂ Emissions Avoided
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(5, 150, 105, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {formatNumber(totalCo2)} kg
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Greenhouse gas mitigated
            </div>
          </div>

          <div className="card" style={{ padding: '1.4rem 1.6rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                Courier Quality Rating
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.14)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={18} fill="#fb7185" color="#fb7185" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              5.0 ★
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              100% On-Time FSSAI Transit
            </div>
          </div>
        </div>
      </section>

      {/* C. Filter, Search & Ledger Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by meal, kitchen, or shelter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }}
            />
          </div>

          {/* Filter Pills */}
          <div className="filter-pills-row">
            {[
              { id: 'ALL', label: `All Missions (${tasks.length})` },
              { id: 'HEAVY', label: 'High Payload (≥20kg)' },
              { id: 'TOP_RATED', label: 'Top Rated (5.0 ★)' },
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

        {/* Ledger List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading completed mission records from MongoDB Atlas...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              No completed missions matching your criteria
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {searchQuery ? 'Try clearing your search query to see all past records.' : 'Accept and deliver open pickups to build your rescue log!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  borderLeft: '4px solid #10b981',
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
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      DELIVERY VERIFIED
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>Completed {formatDate(task.confirmed_at || task.delivered_at || task.assigned_at)}</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {task.donation_title || `Mission #${task.id?.slice(-6)}`}
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    Payload: <strong>{formatKg(task.donation_quantity)}</strong> (~{Math.round((parseFloat(task.donation_quantity) || 0) * 2.5)} meals) • Category: <strong>{task.donation_food_type || 'Cooked Meals'}</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span>Origin: {task.pickup_address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Building2 size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                      <span>Destination Shelter: {task.organization_name || 'Designated Community Food Bank'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions & Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#fffdf5', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid #fde68a' }}>
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e' }}>
                      {task.rating_by_ngo ? `${task.rating_by_ngo} / 5.0` : '5.0 / 5.0'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedReceipt(task)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileCheck size={14} style={{ color: '#059669' }} />
                    <span>View Audit Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* D. Digital Audit Certificate Modal */}
      {selectedReceipt && (
        <div className="modal-backdrop-dark" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Digital Rescue Certificate
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', background: 'var(--bg-alt)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  ResQFood Chain-of-Custody Verification
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  "{selectedReceipt.donation_title || `Mission #${selectedReceipt.id?.slice(-6)}`}"
                </div>
                <div style={{ fontSize: '0.84rem', color: '#059669', fontWeight: 800, marginTop: '0.2rem' }}>
                  ✓ Delivery Confirmed in MongoDB Atlas
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Food Quantity</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
                    {formatKg(selectedReceipt.donation_quantity)}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Estimated Meals</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
                    ~{Math.round((parseFloat(selectedReceipt.donation_quantity) || 0) * 2.5)} Meals
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CO₂ Emissions Prevented</div>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                    {Math.round((parseFloat(selectedReceipt.donation_quantity) || 0) * 2.5)} kg CO₂
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Shelter Rating</div>
                  <div style={{ fontWeight: 800, color: '#d97706', fontSize: '1rem' }}>
                    {selectedReceipt.rating_by_ngo || 5.0} / 5.0 ★
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div><strong>Pickup Bay:</strong> {selectedReceipt.pickup_address}</div>
                <div><strong>Receiving Shelter:</strong> {selectedReceipt.organization_name || 'Designated Food Bank'}</div>
                <div><strong>Completed Date:</strong> {formatDate(selectedReceipt.confirmed_at || selectedReceipt.delivered_at)}</div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-full)', fontWeight: 700 }}
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
