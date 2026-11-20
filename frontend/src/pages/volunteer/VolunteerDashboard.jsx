import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pickupService } from '../../services/pickupService';
import { volunteerService } from '../../services/volunteerService';
import { StatCard } from '../../components/common/StatCard';
import {
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Award,
  Navigation,
  MapPin,
  Building2,
  Package,
  Star,
  Check,
  Search,
  Activity,
} from 'lucide-react';
import { formatKg, formatNumber } from '../../utils/formatters';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMission, setActiveMission] = useState(null);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalDeliveredMeals, setTotalDeliveredMeals] = useState(0);
  const [isAvailable, setIsAvailable] = useState(user?.volunteer_profile?.is_available ?? true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadVolunteerData = async () => {
    try {
      const [activeData, assignData, completedData] = await Promise.all([
        volunteerService.getActiveAssignment().catch(() => null),
        pickupService.getAssignments({ filter: 'available' }).catch(() => []),
        volunteerService.getTasks('completed').catch(() => []),
      ]);

      const activeObj = activeData?.active_assignment || (activeData?.id ? activeData : null);
      setActiveMission(activeObj);

      const all = assignData.results || assignData || [];
      setAvailableAssignments(
        all.filter(
          (a) =>
            a.status === 'PENDING_VOLUNTEER' ||
            (!a.volunteer && a.status !== 'CONFIRMED_BY_NGO' && a.status !== 'DELIVERED')
        )
      );
      const completedList = completedData?.results || completedData || [];
      const actualCount = completedList.length || user?.volunteer_profile?.total_pickups_completed || 0;
      setCompletedCount(actualCount);
      const calculatedKg = completedList.reduce((sum, item) => sum + (parseFloat(item.donation_quantity) || 0), 0);
      setTotalDeliveredMeals(Math.round(calculatedKg * 2.5) || Math.round(actualCount * 50));
    } catch (err) {
      console.error('Failed to load volunteer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteerData();
  }, [user]);

  const handleToggleAvailability = async () => {
    try {
      const nextVal = !isAvailable;
      setIsAvailable(nextVal);
      await volunteerService.updateStatus({ is_available: nextVal });
    } catch {
      setIsAvailable(!isAvailable);
      alert('Failed to update availability status.');
    }
  };

  const handleAcceptMission = async (id) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await pickupService.acceptAssignment(id);
      setFeedback({ type: 'success', message: 'Mission accepted! Routing instructions loaded.' });
      await loadVolunteerData();
      navigate('/volunteer/active-delivery');
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to accept mission.' });
    } finally {
      setActionLoading(null);
    }
  };

  const vehicleType = user?.volunteer_profile?.vehicle_type || 'Motorcycle / Thermal Bag';
  const rating = user?.volunteer_profile?.rating || 5.0;

  const filteredMissions = availableAssignments.filter((task) => {
    return (
      (task.donation_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.pickup_address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.organization_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* A. ResQ Executive Hero Panel (Luminous Light Porcelain & Rose Silk Duo) */}
      <section className="resq-hero-panel resq-hero-volunteer">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
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
              <span>Verified Courier Rider • Rapid Thermal Food Fleet</span>
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
              Courier Cockpit,{' '}
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
              Your fleet status is currently <strong style={{ color: '#0f172a' }}>{isAvailable ? 'ON DUTY & READY' : 'OFF DUTY'}</strong> with vehicle:{' '}
              <strong style={{ color: '#0f172a' }}>{vehicleType}</strong>. There are <strong style={{ color: '#0f172a' }}>{availableAssignments.length} rescue missions</strong> awaiting pickup.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                to="/volunteer/pickups"
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
                <Package size={18} />
                <span>View Open Pickups ({availableAssignments.length})</span>
              </Link>

              {activeMission && (
                <Link
                  to="/volunteer/active-delivery"
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
                    gap: '0.45rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Navigation size={16} style={{ color: '#27272a' }} />
                  <span>In-Flight Mission Control</span>
                </Link>
              )}
            </div>
          </div>

          {/* Interactive Duty Availability Console (Luminous Light Card) */}
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
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 800 }}>
                Fleet Dispatch Status
              </div>
              <button
                onClick={handleToggleAvailability}
                style={{
                  marginTop: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: isAvailable ? '#ecfdf5' : '#fef2f2',
                  border: `1.5px solid ${isAvailable ? '#10b981' : '#ef4444'}`,
                  color: isAvailable ? '#065f46' : '#991b1b',
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  transition: 'all 0.25s ease',
                  boxShadow: isAvailable ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                }}
              >
                {isAvailable ? <ToggleRight size={24} color="#10b981" /> : <ToggleLeft size={24} color="#ef4444" />}
                <span>{isAvailable ? 'ON DUTY (AVAILABLE)' : 'OFF DUTY'}</span>
              </button>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Courier Rating:</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{rating} / 5.0</span>
              </div>
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

      {/* B. Featured In-Flight Mission Tracking Card */}
      {activeMission && (
        <section
          style={{
            background: 'linear-gradient(135deg, #fffdf5 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.16)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                <Truck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400e' }}>
                  Active Rescue Mission in Progress
                </h3>
                <span style={{ fontSize: '0.84rem', color: '#b45309' }}>
                  Stage: <strong>{activeMission.status?.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>

            <Link
              to="/volunteer/active-delivery"
              className="btn btn-primary"
              style={{
                background: '#d97706',
                borderColor: '#d97706',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 800,
                padding: '0.5rem 1.25rem',
              }}
            >
              <span>Open Mission Controls</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem 1.5rem',
              border: '1px solid #fde68a',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {activeMission.donation_title || `Mission #${activeMission.id}`}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Payload: <strong>{formatKg(activeMission.donation_quantity)}</strong> • Category: <strong>{activeMission.donation_food_type}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.85rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>Pickup: {activeMission.pickup_address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Building2 size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                  <span>Dropoff Shelter: {activeMission.organization_name || 'Designated Shelter'}</span>
                </div>
              </div>
            </div>

            {/* Stage Progress Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.65rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#92400e' }}>
                Delivery Chain-of-Custody Status
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['ASSIGNED', 'COLLECTED', 'DELIVERED'].map((step, idx) => {
                  const isDone =
                    activeMission.status === step ||
                    (step === 'ASSIGNED' && (activeMission.status === 'COLLECTED' || activeMission.status === 'DELIVERED')) ||
                    (step === 'COLLECTED' && activeMission.status === 'DELIVERED');
                  return (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        background: isDone ? '#059669' : '#e2e8f0',
                        color: isDone ? '#fff' : '#64748b',
                      }}
                    >
                      {idx + 1}. {step}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* C. 4 Core Courier StatCards */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.15rem' }}>
          <StatCard
            title="Available Missions"
            value={availableAssignments.length}
            subtext="Nearby approved batches"
            icon={Package}
            color="#f59e0b"
            background="rgba(245, 158, 11, 0.12)"
          />
          <StatCard
            title="Completed Rescues"
            value={completedCount}
            subtext="Safe deliveries made"
            icon={CheckCircle2}
            color="#10b981"
            background="rgba(16, 185, 129, 0.12)"
          />
          <StatCard
            title="Meals Transported"
            value={formatNumber(totalDeliveredMeals)}
            subtext="Direct community impact"
            icon={Award}
            color="#0284c7"
            background="rgba(2, 132, 199, 0.12)"
          />
          <StatCard
            title="Courier Rating"
            value={`${rating} ★`}
            subtext="Shelter satisfaction score"
            icon={Star}
            color="#27272a"
            background="rgba(24, 24, 27, 0.08)"
          />
        </div>
      </section>

      {/* D. Live Actionable Open Rescue Missions Queue */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Open Rescue Missions Nearby
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Approved shelter claims ready for courier pickup. Accept a mission to begin thermal transit.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter missions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', paddingRight: '0.85rem', height: '36px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', border: '1px solid var(--border)', outline: 'none' }}
              />
            </div>
            <Link
              to="/volunteer/pickups"
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 'var(--radius-full)', fontWeight: 700 }}
            >
              <span>View All ({availableAssignments.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            Loading available courier missions from MongoDB...
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
            <CheckCircle2 size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              All Caught Up! No Open Missions
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1rem' }}>
              Nearby surplus batches have all been assigned to couriers. Keep your status ON DUTY to receive instant alerts when donors approve new requests.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.35rem' }}>
            {filteredMissions.map((task) => (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: '1.45rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.15rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '0.22rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: '#fef3c7',
                        color: '#92400e',
                      }}
                    >
                      Batch #{task.id}
                    </span>
                    <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#059669' }}>
                      {task.donation_quantity ? `${task.donation_quantity} kg` : 'Payload Ready'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {task.donation_title || `Mission #${task.id}`}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span>Pickup: {task.pickup_address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Building2 size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                      <span>Destination: {task.organization_name || 'Designated Food Bank'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    FSSAI Thermal Dispatch
                  </span>
                  <button
                    onClick={() => handleAcceptMission(task.id)}
                    disabled={actionLoading === task.id || Boolean(activeMission)}
                    className="btn btn-primary btn-sm"
                    style={{
                      background: 'var(--brand-rose-gradient)',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      padding: '0.5rem 1.25rem',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                    }}
                  >
                    <Check size={14} />
                    <span>{actionLoading === task.id ? 'Accepting...' : 'Accept Mission'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
