import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import {
  ShieldCheck,
  Building2,
  Truck,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Activity,
  HeartHandshake,
  Clock,
  Sparkles,
  Database,
  FileCode,
  Sliders,
  Scale,
  Users,
  Award,
  Layers,
  MapPin,
  Check,
  X,
  Search,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { formatDate, formatKg, formatNumber } from '../../utils/formatters';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Search & Filter States
  const [ngoSearch, setNgoSearch] = useState('');
  const [ngoFilter, setNgoFilter] = useState('all'); // all, pending, verified
  const [donationSearch, setDonationSearch] = useState('');
  const [donationFilter, setDonationFilter] = useState('all'); // all, available, assigned, in_transit, completed

  // NGO Action Confirmation Modal
  const [confirmModal, setConfirmModal] = useState(null);

  // Priority Engine Interactive Simulator State
  const [simHours, setSimHours] = useState(3);
  const [simQty, setSimQty] = useState(35);
  const [simDistance, setSimDistance] = useState(4);

  const loadAdminData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [adminMetrics, ngosData, donData] = await Promise.all([
        adminService.getAdminMetrics(),
        adminService.getNgos(),
        adminService.getAllDonations(),
      ]);
      setData(adminMetrics);
      setNgos(ngosData.results || ngosData || []);
      setDonations(donData.results || donData || []);
      if (isManual) {
        setFeedback({
          type: 'success',
          text: 'Telemetry & database synchronizations refreshed successfully from MongoDB Atlas.',
        });
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
      setFeedback({
        type: 'error',
        text: 'Failed to synchronize with MongoDB Atlas backend.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (id, action) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await adminService.verifyNgo(id, action);
      setFeedback({
        type: 'success',
        text: `Shelter ${action === 'approve' ? 'approved & verified' : 'verification revoked'}. Real-time permissions updated in MongoDB.`,
      });
      setConfirmModal(null);
      loadAdminData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Failed to update verification status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const metrics = data?.metrics || {};

  // Compute Priority Engine Simulation Score according to backend formula:
  // Expiry (50%): <=1.5h: 100, <=3h: 85, <=6h: 70, <=12h: 50, <=24h: 30, else: 15
  let expRaw = 15;
  if (simHours <= 1.5) expRaw = 100;
  else if (simHours <= 3) expRaw = 85;
  else if (simHours <= 6) expRaw = 70;
  else if (simHours <= 12) expRaw = 50;
  else if (simHours <= 24) expRaw = 30;
  const expScore = expRaw * 0.5;

  // Quantity (30%): >=50kg: 100, >=25kg: 80, >=10kg: 60, >=5kg: 40, else: 20
  let qtyRaw = 20;
  if (simQty >= 50) qtyRaw = 100;
  else if (simQty >= 25) qtyRaw = 80;
  else if (simQty >= 10) qtyRaw = 60;
  else if (simQty >= 5) qtyRaw = 40;
  const qtyScore = qtyRaw * 0.3;

  // Distance (20%): <=2km: 100, <=5km: 80, <=10km: 60, <=20km: 40, else: 20
  let distRaw = 20;
  if (simDistance <= 2) distRaw = 100;
  else if (simDistance <= 5) distRaw = 80;
  else if (simDistance <= 10) distRaw = 60;
  else if (simDistance <= 20) distRaw = 40;
  const distScore = distRaw * 0.2;

  const simTotalScore = Math.round((expScore + qtyScore + distScore) * 10) / 10;
  let simPriorityLevel = 'NORMAL';
  if (simTotalScore >= 80) simPriorityLevel = 'CRITICAL';
  else if (simTotalScore >= 60) simPriorityLevel = 'HIGH';
  else if (simTotalScore >= 40) simPriorityLevel = 'MEDIUM';

  // Filtered NGOs
  const filteredNgos = ngos.filter((n) => {
    const matchesSearch =
      (n.name || '').toLowerCase().includes(ngoSearch.toLowerCase()) ||
      (n.registration_number || '').toLowerCase().includes(ngoSearch.toLowerCase()) ||
      (n.contact_email || '').toLowerCase().includes(ngoSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (ngoFilter === 'pending') return !n.is_verified;
    if (ngoFilter === 'verified') return n.is_verified;
    return true;
  });

  // Filtered Donations
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      (d.title || '').toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.donor_details?.name || '').toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.food_type || '').toLowerCase().includes(donationSearch.toLowerCase()) ||
      (d.pickup_address || '').toLowerCase().includes(donationSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (donationFilter === 'available') return d.status === 'AVAILABLE';
    if (donationFilter === 'assigned') return d.status === 'ASSIGNED';
    if (donationFilter === 'in_transit') return d.status === 'IN_TRANSIT';
    if (donationFilter === 'completed') return d.status === 'COMPLETED';
    return true;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-muted)' }}>
        <Activity size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Synchronizing ResQ Governance Telemetry
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Querying MongoDB Atlas collections and active system nodes...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Atmospheric Executive Hero Panel (Luminous Light Porcelain & Rose Silk Duo) */}
      <section className="resq-hero-panel resq-hero-admin">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(24, 24, 27, 0.06)',
                border: '1px solid rgba(24, 24, 27, 0.15)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.95rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#18181b',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={15} style={{ color: '#27272a' }} />
              <span>ResQ Governance • Platform Mission Control</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 3.4vw, 2.7rem)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                marginBottom: '0.85rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              ResQFood{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Governance
              </span>{' '}
              & Command
            </h1>

            <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Govern shelter accreditation, monitor the AI Smart Priority Engine, supervise food rescue courier dispatches, and oversee real-time MongoDB Atlas operations.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="/api/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.75rem 1.4rem',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                }}
              >
                <FileCode size={16} />
                <span>OpenAPI Swagger</span>
                <ExternalLink size={14} />
              </a>

              <a
                href="/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.75rem 1.4rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <Database size={16} style={{ color: '#64748b' }} />
                <span>Django Admin</span>
                <ExternalLink size={14} />
              </a>

              <button
                onClick={() => loadAdminData(true)}
                disabled={refreshing}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.75rem 1.1rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
                <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
              </button>
            </div>
          </div>

          {/* Executive Telemetry Health Box (Luminous Light Card) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(24, 24, 27, 0.12)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.65rem 1.85rem',
              minWidth: 'min(290px, 100%)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800 }}>
                Live Network Pulse
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#065f46',
                  background: '#ecfdf5',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #bbf7d0',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                OPERATIONAL
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                  {metrics.active_donations ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 600 }}>Active Batches</div>
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                  {metrics.pending_ngos ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 600 }}>Pending NGOs</div>
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                  {metrics.active_volunteers ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 600 }}>Active Couriers</div>
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#18181b', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                  {metrics.verified_ngos ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 600 }}>Verified Shelters</div>
              </div>
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.95rem',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.76rem',
                color: '#64748b',
              }}
            >
              <Activity size={15} style={{ color: '#059669' }} />
              <span>MongoDB Atlas Cluster Online • Latency: &lt;24ms</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feedback Alert */}
      {feedback && (
        <div
          style={{
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
            padding: '1rem 1.4rem',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={19} color="#10b981" /> : <AlertTriangle size={19} color="#ef4444" />}
            <span style={{ fontWeight: 600 }}>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 800, fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Executive Tabs Navigation */}
      <div className="filter-pills-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'overview', label: 'Platform Telemetry & Ledger', icon: Activity },
          { id: 'ngos', label: `NGO Verification Queue (${metrics.pending_ngos || 0} Pending)`, icon: Building2 },
          { id: 'engine', label: 'Priority Engine Simulator', icon: SlidersHorizontal },
          { id: 'donations', label: `Surplus Batches Ledger (${metrics.total_donations || 0})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`filter-pill ${active ? 'active' : ''}`}
              style={{
                padding: '0.65rem 1.35rem',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Platform Telemetry & Live Activity Ledger */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.3rem', fontFamily: 'var(--font-heading)' }}>
              Core Platform Governance & Impact Metrics
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Aggregated across all MongoDB Atlas collections: donors, organizations, surplus inventory, and dispatch deliveries.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <StatCard
              title="Total Food Batches"
              value={metrics.total_donations ?? '-'}
              icon={Package}
              color="#0ea5e9"
              background="rgba(14, 165, 233, 0.12)"
              subtext="All batches registered on network"
            />
            <StatCard
              title="Active Pickups"
              value={metrics.active_donations ?? '-'}
              icon={Activity}
              color="#10b981"
              background="rgba(16, 185, 129, 0.12)"
              subtext="Available or in rescue transit"
            />
            <StatCard
              title="Completed Rescues"
              value={metrics.completed_donations ?? '-'}
              icon={CheckCircle2}
              color="#059669"
              background="rgba(5, 150, 105, 0.12)"
              subtext="Safely delivered to shelters"
            />
            <StatCard
              title="Expired Food Batches"
              value={metrics.expired_donations ?? 0}
              icon={Clock}
              color="#ef4444"
              background="rgba(239, 68, 68, 0.12)"
              subtext="Unclaimed before safe cutoff"
            />
            <StatCard
              title="Verified NGOs"
              value={metrics.verified_ngos ?? '-'}
              icon={Building2}
              color="#8b5cf6"
              background="rgba(139, 92, 246, 0.12)"
              subtext={`Out of ${metrics.total_ngos ?? 0} registered shelters`}
            />
            <StatCard
              title="Active Couriers"
              value={metrics.active_volunteers ?? '-'}
              icon={Truck}
              color="#f59e0b"
              background="rgba(245, 158, 11, 0.12)"
              subtext="Available for rapid dispatch"
            />
            <StatCard
              title="Meals Provided"
              value={formatNumber(metrics.meals_redistributed || 0)}
              icon={HeartHandshake}
              color="#27272a"
              background="rgba(24, 24, 27, 0.08)"
              subtext="Direct hunger alleviation impact"
            />
            <StatCard
              title="Total Food Saved"
              value={formatKg(metrics.food_saved_kg || 0)}
              icon={Sparkles}
              color="#10b981"
              background="rgba(16, 185, 129, 0.12)"
              subtext="Diverted from urban landfills"
            />
            <StatCard
              title="Pending Verifications"
              value={metrics.pending_ngos ?? 0}
              icon={ShieldCheck}
              color="#6366f1"
              background="rgba(99, 102, 241, 0.12)"
              subtext="Awaiting admin accreditation"
            />
          </div>

          {/* Recent Live Activity Ledger */}
          <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Live Platform Activity Ledger
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Real-time events broadcasted from active kitchen donations across the network.
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-alt)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                }}
              >
                {(data?.recent_donations || []).length} Recent Transactions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(data?.recent_donations || []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1.1rem 1.35rem',
                    background: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(24, 24, 27, 0.06)',
                        border: '1px solid rgba(24, 24, 27, 0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#27272a',
                        flexShrink: 0,
                      }}
                    >
                      <Package size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Donor: <strong style={{ color: 'var(--text-primary)' }}>{item.donor}</strong> • Weight: <strong>{formatKg(item.quantity_kg)}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        background:
                          item.status === 'COMPLETED'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : item.status === 'IN_TRANSIT'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(14, 165, 233, 0.12)',
                        color:
                          item.status === 'COMPLETED'
                            ? '#059669'
                            : item.status === 'IN_TRANSIT'
                            ? '#d97706'
                            : '#0284c7',
                        border: `1px solid ${
                          item.status === 'COMPLETED'
                            ? 'rgba(16, 185, 129, 0.25)'
                            : item.status === 'IN_TRANSIT'
                            ? 'rgba(245, 158, 11, 0.25)'
                            : 'rgba(14, 165, 233, 0.25)'
                        }`,
                      }}
                    >
                      {item.status?.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NGO Verification Governance Queue */}
      {activeTab === 'ngos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                NGO Shelter Verification Governance Queue
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Compliance & legal trust enforcement: Only certified NGOs can claim food and receive automated dispatch matches.
              </p>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setNgoFilter('all')}
                className={`filter-pill ${ngoFilter === 'all' ? 'active' : ''}`}
              >
                All Organizations ({ngos.length})
              </button>
              <button
                onClick={() => setNgoFilter('pending')}
                className={`filter-pill ${ngoFilter === 'pending' ? 'active' : ''}`}
              >
                Pending Review ({ngos.filter((n) => !n.is_verified).length})
              </button>
              <button
                onClick={() => setNgoFilter('verified')}
                className={`filter-pill ${ngoFilter === 'verified' ? 'active' : ''}`}
              >
                Verified Certified ({ngos.filter((n) => n.is_verified).length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="resq-omnibar-box" style={{ maxWidth: '100%', minWidth: '100%' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search organizations by name, registration number, or email..."
              value={ngoSearch}
              onChange={(e) => setNgoSearch(e.target.value)}
              className="resq-omnibar-input"
            />
            {ngoSearch && (
              <button onClick={() => setNgoSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            )}
          </div>

          {filteredNgos.length === 0 ? (
            <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Building2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                No Organizations Found
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                No organizations match your current search and filter criteria.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {filteredNgos.map((ngo) => (
                <div
                  key={ngo.id}
                  className="card"
                  style={{
                    padding: '1.75rem',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    borderLeft: `5px solid ${ngo.is_verified ? '#10b981' : '#f59e0b'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: 'min(300px, 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          background: ngo.is_verified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: ngo.is_verified ? '#059669' : '#d97706',
                          border: `1px solid ${ngo.is_verified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {ngo.is_verified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        <span>{ngo.is_verified ? 'VERIFIED ACCREDITED' : 'PENDING COMPLIANCE REVIEW'}</span>
                      </span>

                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Gov Registration No: <strong style={{ color: 'var(--text-primary)' }}>{ngo.registration_number || 'Standard Trust Reg'}</strong>
                      </span>
                    </div>

                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                      {ngo.name}
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      📍 {ngo.address || 'Address registered on file'} • Email: {ngo.contact_email} • Phone: {ngo.phone}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <span>Storage Capacity: <strong style={{ color: 'var(--text-primary)' }}>{ngo.max_capacity_kg} kg</strong></span>
                      <span>Beneficiary Reach: <strong style={{ color: 'var(--text-primary)' }}>{ngo.beneficiary_count} individuals</strong></span>
                      <span>MongoDB ID: <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ngo.id}</code></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {!ngo.is_verified ? (
                      <button
                        onClick={() => setConfirmModal({ ngo, action: 'approve' })}
                        disabled={actionLoading === ngo.id}
                        className="btn btn-primary"
                        style={{
                          background: 'var(--brand-rose-gradient)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.7rem 1.5rem',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                          cursor: 'pointer',
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Approve & Certify</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmModal({ ngo, action: 'reject' })}
                        disabled={actionLoading === ngo.id}
                        className="btn btn-secondary"
                        style={{
                          color: '#ef4444',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.05)',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.7rem 1.4rem',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          cursor: 'pointer',
                        }}
                      >
                        <XCircle size={16} />
                        <span>Revoke Status</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Priority Engine Live Visualization & Interactive Simulator */}
      {activeTab === 'engine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              AI Smart Priority Matching Engine Architecture
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Inspect and test the mathematical multi-factor scoring model that allocates surplus meals to verified shelters in real time.
            </p>
          </div>

          {/* Model Weights Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.85rem', borderTop: '4px solid #ef4444', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight: 50%</span>
                <Clock size={22} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Expiry Urgency Factor
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Food nearing its safe consumption cutoff is prioritized aggressively. Batches with &lt;1.5 hours remaining receive maximum 100 base score to ensure zero waste.
              </p>
            </div>

            <div className="card" style={{ padding: '1.85rem', borderTop: '4px solid #0284c7', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight: 30%</span>
                <Scale size={22} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Batch Weight & Servings
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Larger bulk shipments (&gt;50kg) feed entire shelter populations in a single trip, optimizing courier fleet logistics and shelter intake queues.
              </p>
            </div>

            <div className="card" style={{ padding: '1.85rem', borderTop: '4px solid #10b981', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight: 20%</span>
                <MapPin size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Transit Distance (Haversine)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Calculated via spherical great-circle coordinates. Nearby facilities (&lt;2km) receive expedited courier dispatches to keep transport under 20 minutes.
              </p>
            </div>
          </div>

          {/* Interactive Live Simulator */}
          <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-heading)' }}>
              <Sliders size={22} color="var(--primary)" />
              <span>Interactive Priority Scoring Simulator</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '2.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: 700 }}>
                    <span>Hours Until Expiry (50% Weight):</span>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>{simHours} hrs remaining</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={simHours}
                    onChange={(e) => setSimHours(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>0.5h (Critical)</span>
                    <span>12h</span>
                    <span>24h (Normal)</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: 700 }}>
                    <span>Food Batch Weight (30% Weight):</span>
                    <span style={{ color: '#0284c7', fontWeight: 800 }}>{simQty} kg</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={simQty}
                    onChange={(e) => setSimQty(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>5 kg</span>
                    <span>50 kg</span>
                    <span>100 kg</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: 700 }}>
                    <span>Shelter Distance (20% Weight):</span>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>{simDistance} km away</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="0.5"
                    value={simDistance}
                    onChange={(e) => setSimDistance(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>1 km</span>
                    <span>10 km</span>
                    <span>25 km</span>
                  </div>
                </div>
              </div>

              {/* Live Output Card */}
              <div
                style={{
                  background: 'var(--bg-alt)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  Algorithmic Priority Score
                </div>

                <div
                  style={{
                    fontSize: '2.6rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    color:
                      simPriorityLevel === 'CRITICAL'
                        ? '#dc2626'
                        : simPriorityLevel === 'HIGH'
                        ? '#d97706'
                        : '#0284c7',
                    marginTop: '0.5rem',
                    lineHeight: 1,
                  }}
                >
                  {simTotalScore}%
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    background:
                      simPriorityLevel === 'CRITICAL'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : simPriorityLevel === 'HIGH'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(14, 165, 233, 0.12)',
                    color:
                      simPriorityLevel === 'CRITICAL'
                        ? '#dc2626'
                        : simPriorityLevel === 'HIGH'
                        ? '#d97706'
                        : '#0284c7',
                    border: `1px solid ${
                      simPriorityLevel === 'CRITICAL'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : simPriorityLevel === 'HIGH'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(14, 165, 233, 0.3)'
                    }`,
                    marginTop: '0.85rem',
                  }}
                >
                  <Sparkles size={14} />
                  <span>{simPriorityLevel} PRIORITY MATCH</span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.5 }}>
                  Formula Breakdown: Expiry ({expScore}%) + Quantity ({qtyScore}%) + Distance ({distScore}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: All Surplus Donations Global Ledger */}
      {activeTab === 'donations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                All Platform Surplus Batches
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Global ledger of all food batches registered across commercial kitchens in MongoDB Atlas.
              </p>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDonationFilter('all')}
                className={`filter-pill ${donationFilter === 'all' ? 'active' : ''}`}
              >
                All Batches ({donations.length})
              </button>
              <button
                onClick={() => setDonationFilter('available')}
                className={`filter-pill ${donationFilter === 'available' ? 'active' : ''}`}
              >
                Available ({donations.filter((d) => d.status === 'AVAILABLE').length})
              </button>
              <button
                onClick={() => setDonationFilter('assigned')}
                className={`filter-pill ${donationFilter === 'assigned' ? 'active' : ''}`}
              >
                Assigned ({donations.filter((d) => d.status === 'ASSIGNED').length})
              </button>
              <button
                onClick={() => setDonationFilter('in_transit')}
                className={`filter-pill ${donationFilter === 'in_transit' ? 'active' : ''}`}
              >
                In Transit ({donations.filter((d) => d.status === 'IN_TRANSIT').length})
              </button>
              <button
                onClick={() => setDonationFilter('completed')}
                className={`filter-pill ${donationFilter === 'completed' ? 'active' : ''}`}
              >
                Completed ({donations.filter((d) => d.status === 'COMPLETED').length})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="resq-omnibar-box" style={{ maxWidth: '100%', minWidth: '100%' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search surplus batches by title, donor kitchen, food category, or pickup address..."
              value={donationSearch}
              onChange={(e) => setDonationSearch(e.target.value)}
              className="resq-omnibar-input"
            />
            {donationSearch && (
              <button onClick={() => setDonationSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            )}
          </div>

          {filteredDonations.length === 0 ? (
            <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                No Surplus Batches Found
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                No batches match your search or filter selection.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {filteredDonations.map((don) => {
                const priority = don.priority || {};
                const pLevel = priority.priority_level || 'NORMAL';
                const pScore = priority.priority_score ?? (pLevel === 'CRITICAL' ? 95 : pLevel === 'HIGH' ? 75 : pLevel === 'MEDIUM' ? 50 : 25);

                return (
                  <div
                    key={don.id}
                    className="card"
                    style={{
                      padding: '1.75rem',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.5rem',
                      borderLeft: `5px solid ${
                        pLevel === 'CRITICAL'
                          ? '#dc2626'
                          : pLevel === 'HIGH'
                          ? '#f59e0b'
                          : pLevel === 'MEDIUM'
                          ? '#0ea5e9'
                          : '#10b981'
                      }`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: 'min(300px, 100%)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            background:
                              pLevel === 'CRITICAL'
                                ? 'rgba(239, 68, 68, 0.12)'
                                : pLevel === 'HIGH'
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(14, 165, 233, 0.12)',
                            color:
                              pLevel === 'CRITICAL'
                                ? '#dc2626'
                                : pLevel === 'HIGH'
                                ? '#d97706'
                                : '#0284c7',
                            border: `1px solid ${
                              pLevel === 'CRITICAL'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : pLevel === 'HIGH'
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(14, 165, 233, 0.3)'
                            }`,
                          }}
                        >
                          PRIORITY: {pLevel} ({pScore}/100)
                        </span>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-alt)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {don.status?.replace('_', ' ')}
                        </span>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {formatDate(don.created_at)}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                        {don.title}
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Donor Kitchen: <strong style={{ color: 'var(--text-primary)' }}>{don.donor_details?.name}</strong> • Quantity: <strong>{formatKg(don.quantity_kg)}</strong> • Type: {don.food_type}
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <span>Remaining: <strong style={{ color: 'var(--text-primary)' }}>{don.hours_until_expiry?.toFixed(1)} hrs</strong></span>
                        <span>Safe Cutoff: {formatDate(don.expiry_time)}</span>
                        <span>Pickup: {don.pickup_address}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 900,
                          color: pLevel === 'CRITICAL' ? '#dc2626' : 'var(--primary)',
                          fontFamily: 'var(--font-heading)',
                          lineHeight: 1,
                        }}
                      >
                        {pScore}%
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                        AI Score
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal Dialog for NGO Verification */}
      {confirmModal && (
        <div className="modal-backdrop-dark" onClick={() => setConfirmModal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '1.4rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Confirm NGO Accreditation Action
                </h3>
              </div>
              <button onClick={() => setConfirmModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to{' '}
                <strong style={{ color: confirmModal.action === 'approve' ? '#059669' : '#dc2626' }}>
                  {confirmModal.action === 'approve' ? 'verify and certify' : 'revoke verification credentials for'}
                </strong>{' '}
                the organization <strong style={{ color: 'var(--text-primary)' }}>"{confirmModal.ngo.name}"</strong>?
              </p>

              <div
                style={{
                  padding: '1rem',
                  background: 'var(--bg-alt)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div>Registration No: <strong>{confirmModal.ngo.registration_number || 'Standard Trust Reg'}</strong></div>
                <div>Contact Email: <strong>{confirmModal.ngo.contact_email}</strong></div>
                <div>Storage Capacity: <strong>{confirmModal.ngo.max_capacity_kg} kg</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setConfirmModal(null)}
                  className="btn btn-secondary"
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.7rem 1.4rem', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify(confirmModal.ngo.id, confirmModal.action)}
                  className="btn btn-primary"
                  style={{
                    background: confirmModal.action === 'approve' ? 'var(--brand-rose-gradient)' : '#dc2626',
                    borderColor: 'transparent',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.7rem 1.6rem',
                    fontWeight: 800,
                    boxShadow: confirmModal.action === 'approve' ? '0 4px 14px rgba(0, 0, 0, 0.18)' : 'none',
                  }}
                >
                  {confirmModal.action === 'approve' ? 'Yes, Certify NGO' : 'Yes, Revoke Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
