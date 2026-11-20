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
  Thermometer,
  Layers,
  Send,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const ActiveDelivery = () => {
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [collectNotes, setCollectNotes] = useState('Collected in insulated thermal carrier. Food temperature verified.');
  const [deliverNotes, setDeliverNotes] = useState('Delivered to shelter entrance. Handed over to intake supervisor.');

  const loadActiveMission = async () => {
    try {
      const data = await volunteerService.getActiveAssignment();
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
      await pickupService.collectFood(mission.id, { notes: collectNotes });
      setFeedback({ type: 'success', text: 'Food collected! Proceed to the shelter for delivery.' });
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
      await pickupService.deliverFood(mission.id, { notes: deliverNotes });
      setFeedback({ type: 'success', text: 'Mission completed! Food delivered to shelter for community distribution.' });
      await loadActiveMission();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status to Delivered.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <Truck size={32} className="spin" style={{ margin: '0 auto 0.75rem' }} />
        <div>Querying live rescue courier dispatch on MongoDB Atlas...</div>
      </div>
    );
  }

  if (!mission || !mission.id) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '580px', margin: '2rem auto' }}>
        <Truck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          No Active Rescue Mission
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
          You do not have an active in-flight pickup. Check open routes and claim a mission to start courier transit!
        </p>
        <Link
          to="/volunteer/pickups"
          className="btn btn-primary"
          style={{
            background: 'var(--brand-rose-gradient)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '0.75rem 1.75rem',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Package size={16} />
          <span>Browse Open Missions</span>
        </Link>
      </div>
    );
  }

  const isAssigned = mission.status === 'ASSIGNED' || mission.status === 'PENDING_VOLUNTEER';
  const isCollected = mission.status === 'COLLECTED' || mission.status === 'PICKED_UP';
  const isDelivered = mission.status === 'DELIVERED';
  const isConfirmed = mission.status === 'CONFIRMED_BY_NGO' || mission.status === 'COMPLETED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
            }}
          >
            ACTIVE FLIGHT DECK
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Mission ID #{mission.id?.slice(-8)}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {mission.donation_title || 'Surplus Food Rescue Mission'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Payload: <strong>{formatKg(mission.donation_quantity)}</strong> • Category: <strong>{mission.donation_food_type}</strong>
        </p>
      </div>

      {feedback && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

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
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {[
            { step: 1, label: 'Mission Claimed', done: true },
            { step: 2, label: 'En Route to Kitchen', done: isAssigned || isCollected || isDelivered || isConfirmed },
            { step: 3, label: 'Food Collected', done: isCollected || isDelivered || isConfirmed },
            { step: 4, label: 'Delivered to Shelter', done: isDelivered || isConfirmed },
          ].map((item, idx) => (
            <div key={item.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: item.done ? '#10b981' : '#f1f5f9',
                  border: `2px solid ${item.done ? '#10b981' : '#cbd5e1'}`,
                  color: item.done ? '#fff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  boxShadow: item.done ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                {item.done ? '✓' : item.step}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.done ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Route Legs: Donor & Shelter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Donor Pickup Card */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            borderTop: '4px solid #dc2626',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626' }}>
                Step 1: Origin Kitchen
              </span>
              <MapPin size={18} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Donor Pickup Bay
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {mission.pickup_address}
            </p>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(mission.pickup_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
          >
            <Navigation size={14} />
            <span>Open in Google Maps</span>
          </a>
        </div>

        {/* Shelter Dropoff Card */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            borderTop: '4px solid #0284c7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7' }}>
                Step 2: Destination Shelter
              </span>
              <Building2 size={18} color="#0284c7" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {mission.organization_name || 'Designated Shelter'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Shelter intake drop-off station
            </p>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(mission.organization_name || 'Food Bank Shelter')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
          >
            <Navigation size={14} />
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Flight Control Actions */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Mission Execution Actions
        </h3>

        {isAssigned && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Once you arrive at the donor's kitchen and receive the sealed food containers inside your thermal bag, click below to mark the payload as collected:
            </p>
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                Pickup Verification Notes
              </label>
              <input
                type="text"
                className="form-control"
                value={collectNotes}
                onChange={(e) => setCollectNotes(e.target.value)}
              />
            </div>
            <button
              onClick={handleMarkCollected}
              disabled={actionLoading}
              className="btn btn-primary btn-lg"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{actionLoading ? 'Updating Status...' : '1. Confirm Food Collected from Kitchen'}</span>
            </button>
          </div>
        )}

        {isCollected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              You have collected the food! Proceed directly to the destination shelter. Once handed over to staff, confirm delivery:
            </p>
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                Delivery Drop-off Notes
              </label>
              <input
                type="text"
                className="form-control"
                value={deliverNotes}
                onChange={(e) => setDeliverNotes(e.target.value)}
              />
            </div>
            <button
              onClick={handleMarkDelivered}
              disabled={actionLoading}
              className="btn btn-primary btn-lg"
              style={{
                background: 'var(--brand-rose-gradient)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{actionLoading ? 'Updating Status...' : '2. Confirm Food Delivered to Shelter'}</span>
            </button>
          </div>
        )}

        {isDelivered && (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46' }}>
              Delivered at Shelter!
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.25rem' }}>
              Awaiting digital inspection and receipt confirmation from the shelter intake supervisor.
            </p>
          </div>
        )}

        {isConfirmed && (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46' }}>
              Mission Completed & Confirmed!
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.25rem', marginBottom: '1rem' }}>
              The shelter has verified the food temperature and signed the digital delivery receipt.
            </p>
            <Link to="/volunteer/completed" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              View Delivery History
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
