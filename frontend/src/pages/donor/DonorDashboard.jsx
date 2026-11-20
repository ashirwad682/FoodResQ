import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/common/StatCard';
import { DonationCard } from '../../components/cards/DonationCard';
import {
  PlusCircle,
  Package,
  HeartHandshake,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  Building2,
  Leaf,
  Utensils,
  Award,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import { formatKg, formatNumber, formatDate } from '../../utils/formatters';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [donationsData, requestsData, analyticsData] = await Promise.all([
        donationService.getDonations({ my_donations: true, page_size: 30 }),
        pickupService.getRequests(),
        analyticsService.getDashboard(),
      ]);
      setDonations(donationsData.results || donationsData || []);
      setRequests(requestsData.results || requestsData || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load donor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApproveRequest = async (id) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await pickupService.approveRequest(id);
      setFeedback({ type: 'success', message: 'Pickup request approved! Rescue courier dispatch has been initiated.' });
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to approve request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (id) => {
    if (!window.confirm('Are you sure you want to decline this shelter request?')) return;
    setActionLoading(id);
    setFeedback(null);
    try {
      await pickupService.rejectRequest(id);
      setFeedback({ type: 'info', message: 'Request declined. Surplus batch remains open for other verified shelters.' });
      loadDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to decline request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const activeDonations = donations.filter((d) =>
    ['AVAILABLE', 'REQUESTED', 'ASSIGNED', 'IN_TRANSIT', 'PICKED_UP'].includes(d.status)
  );

  const completedDonations = donations.filter((d) => d.status === 'COMPLETED');
  const totalSavedKg = completedDonations.reduce(
    (acc, curr) => acc + parseFloat(curr.quantity_kg || 0),
    0
  );
  const mealsProvided = Math.round(totalSavedKg * 2.5);
  const co2Avoided = Math.round(totalSavedKg * 2.5);

  // Compute live Kitchen Diversion Rate dynamically from database records
  const expiredCount = donations.filter((d) => d.status === 'EXPIRED' || d.is_expired).length;
  const totalDonations = donations.length;
  const diversionRate = totalDonations > 0 ? Math.round(((totalDonations - expiredCount) / totalDonations) * 100) : 100;
  const certificationLabel = diversionRate >= 95 ? 'Zero Food Waste Certified' : diversionRate >= 75 ? 'Gold Food Recovery Tier' : 'Active Waste Diversion';

  // Filter & Search Donations
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.food_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.pickup_address || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'ACTIVE')
      return ['AVAILABLE', 'REQUESTED', 'ASSIGNED', 'IN_TRANSIT'].includes(d.status);
    if (selectedCategory === 'COOKED') return d.food_type === 'COOKED_MEAL';
    if (selectedCategory === 'BAKERY') return d.food_type === 'BAKERY';
    if (selectedCategory === 'COMPLETED') return d.status === 'COMPLETED';
    if (selectedCategory === 'EXPIRED') return d.status === 'EXPIRED' || d.is_expired;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* A. ResQ Executive Hero Panel (Luminous Light Porcelain & Rose Silk Duo) */}
      <section className="resq-hero-panel resq-hero-donor">
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
                padding: '0.35rem 1rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#18181b',
                marginBottom: '1rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ShieldCheck size={15} style={{ color: '#27272a' }} />
              <span>Verified Commercial Donor • {user?.is_verified ? 'FSSAI Certified Partner' : 'Kitchen Member'}</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 3.4vw, 2.6rem)',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '0.85rem',
              }}
            >
              Welcome back,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {user?.first_name || user?.username}
              </span>
            </h1>

            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              Your commercial kitchen is currently managing <strong style={{ color: '#0f172a' }}>{activeDonations.length} active surplus batches</strong> on the ResQFood network. Real-time routing directs excess dishes to nearby verified food banks.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link
                to="/donor/donate"
                className="btn btn-primary"
                style={{
                  background: 'var(--brand-rose-gradient)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                }}
              >
                <PlusCircle size={18} />
                <span>Post Surplus Food</span>
              </Link>

              <Link
                to="/donor/requests"
                className="btn btn-secondary"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.85rem 1.5rem',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <span>Shelter Requests</span>
                {pendingRequests.length > 0 && (
                  <span
                    style={{
                      background: 'rgba(24, 24, 27, 0.08)',
                      color: '#18181b',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(24, 24, 27, 0.16)',
                    }}
                  >
                    {pendingRequests.length}
                  </span>
                )}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Interactive Progress Visualizer Tile (Luminous Light Card) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(24, 24, 27, 0.12)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              minWidth: 'min(260px, 100%)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800 }}>
                  Kitchen Diversion Rate
                </div>
                <div
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    marginTop: '0.2rem',
                    background: 'linear-gradient(135deg, #27272a 0%, #18181b 60%, #09090b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {diversionRate}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {certificationLabel}
                </div>
              </div>

              {/* Progress Ring with Brand Duo Gradient */}
              <svg width="68" height="68" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="donorRoseRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#27272a" />
                  </linearGradient>
                </defs>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#donorRoseRing)"
                  strokeWidth="3.5"
                  strokeDasharray={`${diversionRate}, 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ color: '#64748b' }}>Pending Claims:</span>
              <span style={{ fontWeight: 800, color: pendingRequests.length > 0 ? '#18181b' : '#059669' }}>
                {pendingRequests.length} Waiting
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Toast */}
      {feedback && (
        <div
          style={{
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#065f46' : 'var(--danger)',
            padding: '0.9rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: 600 }}>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* B. Live Kitchen Impact Metrics (5 Core Cards Connected to MongoDB) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Kitchen Impact & Environmental Telemetry
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Calculated in real time across verified MongoDB Atlas rescue completions.
            </p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid #a7f3d0' }}>
            <TrendingUp size={14} />
            <span>{completedDonations.length > 0 ? `${completedDonations.length} Rescues Logged` : 'Active Telemetry'}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.15rem' }}>
          <StatCard
            title="Surplus Food Saved"
            value={formatKg(totalSavedKg)}
            subtext="Diverted from city landfills"
            icon={Utensils}
            color="#10b981"
            background="rgba(16, 185, 129, 0.12)"
          />
          <StatCard
            title="Meals Provided"
            value={formatNumber(mealsProvided)}
            subtext="Served at verified shelters"
            icon={HeartHandshake}
            color="#0284c7"
            background="rgba(2, 132, 199, 0.12)"
          />
          <StatCard
            title="CO₂ Avoided"
            value={`${formatNumber(co2Avoided)} kg`}
            subtext="Mitigated greenhouse gas"
            icon={Leaf}
            color="#059669"
            background="rgba(5, 150, 105, 0.12)"
          />
          <StatCard
            title="Successful Rescues"
            value={completedDonations.length}
            subtext="Completed courier missions"
            icon={Award}
            color="#27272a"
            background="rgba(24, 24, 27, 0.08)"
          />
          <StatCard
            title="Active Batches"
            value={activeDonations.length}
            subtext="Open or en route right now"
            icon={Package}
            color="#f59e0b"
            background="rgba(245, 158, 11, 0.12)"
          />
        </div>
      </section>

      {/* C. Pending Requests Action Alert Card */}
      {pendingRequests.length > 0 && (
        <section
          style={{
            background: 'linear-gradient(135deg, #fffdf5 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.16)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                <Clock size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400e' }}>
                  {pendingRequests.length} Shelter Rescue {pendingRequests.length === 1 ? 'Request' : 'Requests'} Awaiting Approval
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#b45309' }}>
                  Approve shelter claims to initiate automated courier dispatch and ensure safe 4-hour delivery.
                </p>
              </div>
            </div>
            <Link to="/donor/requests" className="btn btn-sm" style={{ background: '#d97706', color: '#fff', borderRadius: 'var(--radius-full)', fontWeight: 800, padding: '0.45rem 1.1rem' }}>
              Manage All Requests →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pendingRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid #fde68a',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {req.organization_details?.name || 'Verified Shelter'}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Requested: <strong>{req.requested_quantity_kg || req.donation_details?.quantity_kg} kg</strong> of "{req.donation_details?.title}" • {formatDate(req.requested_at)}
                  </div>
                  {req.notes && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                      "{req.notes}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.55rem' }}>
                  <button
                    onClick={() => handleApproveRequest(req.id)}
                    disabled={actionLoading === req.id}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'var(--brand-rose-gradient)', borderColor: 'transparent', borderRadius: 'var(--radius-full)', fontWeight: 800, boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve & Dispatch</span>
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    disabled={actionLoading === req.id}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    <XCircle size={15} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* D. Surplus Food Inventory with Interactive Category Filters & Search */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Surplus Food Inventory
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Live inventory of commercial food batches logged on the ResQFood network.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter by dish name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', paddingRight: '0.85rem', height: '36px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>

            <div className="filter-pills-row">
              {[
                { id: 'ALL', label: 'All Batches' },
                { id: 'ACTIVE', label: 'Active Surplus' },
                { id: 'COOKED', label: 'Cooked Meals' },
                { id: 'BAKERY', label: 'Bakery' },
                { id: 'COMPLETED', label: 'Rescued' },
                { id: 'EXPIRED', label: 'Expired' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`filter-pill ${selectedCategory === pill.id ? 'active' : ''}`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading kitchen inventory from MongoDB Atlas...
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
            <Package size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              No surplus batches in this view
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.25rem' }}>
              Whenever you have leftover cooked dishes, baked goods, or ingredients, post them here to route them to charities.
            </p>
            <Link to="/donor/donate" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              <PlusCircle size={16} />
              <span>Post New Batch</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.35rem' }}>
            {filteredDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                actionButton={
                  <Link
                    to={`/donor/donations/${donation.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                  >
                    <span>Inspect</span>
                    <ArrowRight size={14} />
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
