import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { volunteerService } from '../../services/volunteerService';
import { pickupService } from '../../services/pickupService';
import {
  Truck,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Navigation,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const ActiveDelivery = () => {
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checklist, setChecklist] = useState({
    insulated_bag: true,
    containers_sealed: true,
    hygiene_verified: true,
  });

  const loadActiveMission = async () => {
    try {
      const data = await volunteerService.getActiveAssignment();
      // Backend returns { active_assignment: ... } or direct assignment object
      const active = data?.active_assignment || (data?.id ? data : null);
      setMission(active);
    } catch (err) {
      console.error('Failed to load active mission', err);
      setMission(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveMission();
  }, []);

  const handleMarkCollected = async () => {
    if (!mission?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      await pickupService.collectFood(mission.id, { notes: 'Food collected by volunteer in thermal carrier.' });
      await loadActiveMission();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status to Collected.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!mission?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      await pickupService.deliverFood(mission.id, { notes: 'Food delivered to shelter entrance.' });
      await loadActiveMission();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status to Delivered.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Fetching active mission telemetry...</div>
        <p style={{ fontSize: '0.85rem' }}>Connecting to rescue dispatch system</p>
      </div>
    );
  }

  if (!mission || !mission.id) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          maxWidth: '680px',
          margin: '2rem auto',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <Truck size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Active Rescue Mission
        </h2>
        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            maxWidth: '460px',
            margin: '0 auto 1.75rem',
            lineHeight: 1.6,
          }}
        >
          You do not currently have any active food deliveries in transit. Browse available surplus batches in your area to accept a new delivery route.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/volunteer/pickups" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.4rem' }}>
            <Truck size={17} />
            <span>Browse Available Pickups</span>
          </Link>
          <Link to="/volunteer/dashboard" className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.2rem' }}>
            <span>Volunteer Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = mission.status || 'ASSIGNED';
  const isAssigned = currentStatus === 'ASSIGNED' || currentStatus === 'EN_ROUTE_PICKUP';
  const isInTransit = currentStatus === 'COLLECTED' || currentStatus === 'EN_ROUTE_DELIVERY' || currentStatus === 'IN_TRANSIT';
  const isDelivered = currentStatus === 'DELIVERED';
  const isCompleted = currentStatus === 'CONFIRMED_BY_NGO' || currentStatus === 'COMPLETED';

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', fontWeight: 700 }}>
            Live Rescue Mission #{mission.id}
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {mission.donation_title || `Batch #${mission.id}`}
          </h1>
        </div>
        <span className={`badge badge-${currentStatus.toLowerCase()}`} style={{ fontSize: '0.88rem', padding: '0.45rem 0.9rem' }}>
          {currentStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: 'var(--danger)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', position: 'relative' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#10b981',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.4rem',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mission Accepted</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned to you</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isInTransit || isDelivered || isCompleted ? '#10b981' : isAssigned ? '#f59e0b' : '#e2e8f0',
                color: isInTransit || isDelivered || isCompleted ? '#fff' : isAssigned ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.4rem',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {isInTransit || isDelivered || isCompleted ? '✓' : '2'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Food Collected</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From donor kitchen</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isDelivered || isCompleted ? '#10b981' : isInTransit ? '#3b82f6' : '#e2e8f0',
                color: isDelivered || isCompleted ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.4rem',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {isDelivered || isCompleted ? '✓' : '3'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Delivered to Shelter</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Awaiting shelter inspection</div>
          </div>
        </div>
      </div>

      {/* Action Controller Card */}
      <div className="card" style={{ padding: '2rem', background: '#f8fafc', border: '2px solid var(--border)' }}>
        {isAssigned && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>STEP 1: COLLECT FOOD</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Proceed to Kitchen Pickup Location
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Arrive at the kitchen, verify package sealing, and press "Confirm Food Collection".
              </p>
            </div>

            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Pre-Pickup Safety Checklist
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist.insulated_bag}
                    onChange={(e) => setChecklist({ ...checklist, insulated_bag: e.target.checked })}
                  />
                  <span>Carrying thermal insulated delivery bag</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklist.containers_sealed}
                    onChange={(e) => setChecklist({ ...checklist, containers_sealed: e.target.checked })}
                  />
                  <span>Inspected food containers for secure seals</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleMarkCollected}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            >
              <CheckCircle2 size={20} />
              <span>{actionLoading ? 'Updating Status...' : 'Mark Food Collected from Kitchen'}</span>
            </button>
          </div>
        )}

        {isInTransit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>STEP 2: IN TRANSIT</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Food Collected! Deliver to NGO Shelter
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Drive safely to the shelter drop-off point. Hand over the containers and press "Mark Delivered".
              </p>
            </div>

            <button
              onClick={handleMarkDelivered}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', background: '#3b82f6' }}
            >
              <Truck size={20} />
              <span>{actionLoading ? 'Updating Status...' : 'Mark Delivered at NGO Shelter'}</span>
            </button>
          </div>
        )}

        {isDelivered && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Mission Successfully Handed Over!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0.25rem auto 1.25rem' }}>
              The food is now at the shelter. Once the NGO staff completes their safety inspection, this rescue will officially be logged into your completed record.
            </p>
            <Link to="/volunteer/dashboard" className="btn btn-secondary btn-sm">
              Return to Volunteer Dashboard
            </Link>
          </div>
        )}

        {isCompleted && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rescue Mission Completed & Confirmed!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0.25rem auto 1.25rem' }}>
              The shelter has confirmed receiving the food safely. Thank you for your service!
            </p>
            <Link to="/volunteer/dashboard" className="btn btn-primary btn-sm">
              Back to Volunteer Hub
            </Link>
          </div>
        )}
      </div>

      {/* Locations & Contact Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Pickup Details */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <MapPin size={20} color="var(--danger)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Pickup Location (Donor)</h4>
          </div>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            {mission.pickup_address || 'Address registered with kitchen'}
          </p>
          {mission.pickup_notes && (
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-alt)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginTop: '0.5rem',
              }}
            >
              <strong>Instructions:</strong> {mission.pickup_notes}
            </div>
          )}
        </div>

        {/* Delivery Details */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building2 size={20} color="var(--info)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Drop-Off Shelter (NGO)</h4>
          </div>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            {mission.organization_name || 'Verified Shelter'}
          </p>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Batch: <strong>{formatKg(mission.donation_quantity || 0)}</strong> of {mission.donation_food_type || 'Food'}
          </div>
        </div>
      </div>
    </div>
  );
};
