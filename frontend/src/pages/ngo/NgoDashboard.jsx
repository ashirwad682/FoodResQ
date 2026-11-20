import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/common/StatCard';
import { DonationCard } from '../../components/cards/DonationCard';
import {
  ShoppingBag,
  Sparkles,
  Inbox,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  X,
  Send,
  Search,
  TrendingUp,
} from 'lucide-react';
import { formatNumber, formatKg } from '../../utils/formatters';

export const NgoDashboard = () => {
  const { user } = useAuth();
  const [availableFood, setAvailableFood] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Claim Modal State
  const [claimDonation, setClaimDonation] = useState(null);
  const [claimNotes, setClaimNotes] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadNgoData = async () => {
    try {
      const [foodData, reqData, assignData, statData] = await Promise.all([
        donationService.getDonations({ status: 'AVAILABLE', page_size: 30 }),
        pickupService.getRequests(),
        pickupService.getAssignments(),
        analyticsService.getDashboard(),
      ]);
      setAvailableFood(foodData.results || foodData || []);
      setMyRequests(reqData.results || reqData || []);
      setActiveDeliveries(
        (assignData.results || assignData || []).filter((a) =>
          ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'PICKED_UP'].includes(a.status)
        )
      );
      setAnalytics(statData);
    } catch (err) {
      console.error('Failed to load NGO dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNgoData();
  }, []);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimDonation) return;
    setClaiming(true);
    try {
      await pickupService.createRequest({
        donation: claimDonation.id,
        notes: claimNotes || 'Standard community shelter distribution.',
      });
      setFeedback({
        type: 'success',
        message: `Claim request submitted for "${claimDonation.title}"! Waiting for donor approval.`,
      });
      setClaimDonation(null);
      setClaimNotes('');
      loadNgoData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit claim request.');
    } finally {
      setClaiming(false);
    }
  };

  const pendingRequests = myRequests.filter((r) => r.status === 'PENDING');
  const completedRequests = myRequests.filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED');
  const totalMealsClaimed = completedRequests.reduce(
    (acc, curr) => acc + Math.round((parseFloat(curr.requested_quantity_kg || curr.donation_details?.quantity_kg || 0)) * 2.5),
    0
  );
  const totalCommunityMeals = analytics?.impact_metrics?.total_meals_served ?? totalMealsClaimed;
  const orgName = user?.organization?.name || user?.username;
  const maxCapacity = user?.organization?.max_capacity_kg || user?.organization?.capacity_kg || 250;
  const currentClaimedKg = activeDeliveries.reduce(
    (acc, curr) => acc + (parseFloat(curr.request?.requested_quantity_kg || curr.request?.donation_details?.quantity_kg || 0)),
    0
  );
  const capacityPct = maxCapacity > 0 ? Math.min(100, Math.round((currentClaimedKg / maxCapacity) * 100)) : 0;

  // Filter & Search Food Batches
  const filteredFood = availableFood.filter((d) => {
    const matchesSearch =
      (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.food_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.pickup_address || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'COOKED') return d.food_type === 'COOKED_MEAL';
    if (selectedFilter === 'BAKERY') return d.food_type === 'BAKERY';
    if (selectedFilter === 'CRITICAL') {
      const p = typeof d.priority === 'object' ? d.priority?.priority_level : d.priority;
      return p === 'CRITICAL' || p === 'HIGH';
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* A. ResQ Executive Hero Panel (Luminous Light Porcelain & Rose Silk Duo) */}
      <section className="resq-hero-panel resq-hero-ngo">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(251, 113, 133, 0.08)',
                border: '1px solid rgba(251, 113, 133, 0.28)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 1rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#e11d48',
                marginBottom: '1rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ShieldCheck size={15} style={{ color: '#f43f5e' }} />
              <span>Verified Shelter Intake • {user?.organization?.is_verified ? '80G Registered Partner' : 'Community Food Bank'}</span>
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
              Shelter Command,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {orgName}
              </span>
            </h1>

            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              Currently tracking <strong style={{ color: '#0f172a' }}>{availableFood.length} verified surplus food batches</strong> nearby. Claim batches immediately to dispatch courier riders and feed community beneficiaries.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link
                to="/ngo/available-food"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 8px 24px rgba(244, 63, 94, 0.35)',
                  padding: '0.85rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                }}
              >
                <ShoppingBag size={18} />
                <span>Browse Surplus Food</span>
              </Link>

              <Link
                to="/ngo/priority-donations"
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
                <Sparkles size={16} style={{ color: '#f43f5e' }} />
                <span>AI Urgent Matches</span>
              </Link>
            </div>
          </div>

          {/* Shelter Intake Capacity Visualizer (Luminous Light Card) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(251, 113, 133, 0.25)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              minWidth: 'min(260px, 100%)',
              boxShadow: '0 10px 30px -5px rgba(244, 63, 94, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800 }}>
                  Intake Capacity
                </div>
                <div
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    marginTop: '0.2rem',
                    background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 60%, #e11d48 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {maxCapacity} kg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {currentClaimedKg > 0 ? `${currentClaimedKg} kg reserved today (${capacityPct}%)` : 'Daily Intake Capacity'}
                </div>
              </div>

              {/* Capacity Ring with Brand Rose Gradient */}
              <svg width="68" height="68" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="ngoRoseRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#f43f5e" />
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
                  stroke="url(#ngoRoseRing)"
                  strokeWidth="3.5"
                  strokeDasharray={`${capacityPct}, 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ color: '#64748b' }}>Inbound Couriers:</span>
              <span style={{ fontWeight: 800, color: activeDeliveries.length > 0 ? '#059669' : '#64748b' }}>
                {activeDeliveries.length} En Route
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

      {/* B. Active Inbound Deliveries Alert Card */}
      {activeDeliveries.length > 0 && (
        <section
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.14)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                <Truck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>
                  {activeDeliveries.length} In-Transit Rescue Delivery Inbound
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#047857' }}>
                  Volunteer couriers are en route. Prepare intake temperature check upon arrival.
                </p>
              </div>
            </div>
            <Link to="/ngo/active-deliveries" className="btn btn-sm" style={{ background: 'var(--brand-rose-gradient)', color: '#fff', borderRadius: 'var(--radius-full)', fontWeight: 800, padding: '0.45rem 1.1rem', border: 'none', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)' }}>
              Live Courier Tracking →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activeDeliveries.slice(0, 2).map((del) => (
              <div
                key={del.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid #a7f3d0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {del.donation_title || `Rescue Batch #${del.id}`}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Courier: <strong>{del.volunteer_name || 'Assigned Courier'}</strong> ({del.volunteer_vehicle || 'Thermal Carrier'}) • Status: <strong>{del.status}</strong>
                  </div>
                </div>
                <Link
                  to="/ngo/active-deliveries"
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)', fontWeight: 700 }}
                >
                  Verify Receipt & Confirm
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* C. 4 Core Shelter Metrics */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.15rem' }}>
          <StatCard
            title="Available Food"
            value={availableFood.length}
            subtext="Surplus batches ready to claim"
            icon={ShoppingBag}
            color="#0284c7"
            background="rgba(2, 132, 199, 0.12)"
          />
          <StatCard
            title="Pending Claims"
            value={pendingRequests.length}
            subtext="Awaiting donor approval"
            icon={Inbox}
            color="#f59e0b"
            background="rgba(245, 158, 11, 0.12)"
          />
          <StatCard
            title="In-Flight Couriers"
            value={activeDeliveries.length}
            subtext="En route to your shelter"
            icon={Truck}
            color="#10b981"
            background="rgba(16, 185, 129, 0.12)"
          />
          <StatCard
            title="Total Community Meals"
            value={formatNumber(totalCommunityMeals)}
            subtext="Dignified servings provided"
            icon={CheckCircle2}
            color="#fb7185"
            background="rgba(244, 63, 94, 0.14)"
          />
        </div>
      </section>

      {/* D. Surplus Food Discovery Marketplace with Filter Pills & Search */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Surplus Food Discovery Marketplace
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Verified commercial food ready for shelter intake. Claim batches to feed your beneficiaries.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search food by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', paddingRight: '0.85rem', height: '36px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>

            <div className="filter-pills-row">
              {[
                { id: 'ALL', label: 'All Available' },
                { id: 'COOKED', label: 'Cooked Meals' },
                { id: 'BAKERY', label: 'Bakery' },
                { id: 'CRITICAL', label: 'Critical Urgency' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id)}
                  className={`filter-pill ${selectedFilter === pill.id ? 'active' : ''}`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading available surplus food marketplace from MongoDB...
          </div>
        ) : filteredFood.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
            <ShoppingBag size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              No available food batches in this category
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Check back soon or switch categories to explore other surplus donations.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.35rem' }}>
            {filteredFood.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                actionButton={
                  <button
                    onClick={() => setClaimDonation(donation)}
                    className="btn btn-primary btn-sm"
                    style={{
                      background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Claim Batch</span>
                    <ArrowRight size={14} />
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Claim Modal Dialog */}
      {claimDonation && (
        <div className="modal-backdrop-dark" onClick={() => setClaimDonation(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Claim Surplus Food Batch
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  "{claimDonation.title}" • {claimDonation.quantity_kg} kg
                </span>
              </div>
              <button
                onClick={() => setClaimDonation(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Distribution Plan & Notes for Donor
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. FeedHope Shelter will distribute these portions during our evening community meal drive."
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setClaimDonation(null)}
                  className="btn btn-secondary"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.75rem 1.6rem',
                    fontWeight: 700,
                  }}
                >
                  <Send size={15} />
                  <span>{claiming ? 'Submitting Claim...' : 'Send Claim Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
