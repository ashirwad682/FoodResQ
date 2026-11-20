import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickupService } from '../../services/pickupService';
import {
  Truck,
  MapPin,
  Building2,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const AvailablePickups = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await pickupService.getAssignments({ filter: 'available' });
      const list = data.results || data || [];
      // Filter open missions awaiting volunteer dispatch
      setAssignments(
        list.filter(
          (a) =>
            a.status === 'PENDING_VOLUNTEER' ||
            (!a.volunteer && a.status !== 'CONFIRMED_BY_NGO' && a.status !== 'DELIVERED' && a.status !== 'COLLECTED')
        )
      );
    } catch (err) {
      console.error('Failed to load assignments', err);
      setError('Could not connect to pickup dispatcher. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleAccept = async (id) => {
    setAcceptingId(id);
    setError(null);
    try {
      await pickupService.acceptAssignment(id);
      navigate('/volunteer/active-delivery');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to claim this mission. It may already have been taken by another courier.');
      setAcceptingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Open Rescue Missions
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Surplus food approved by commercial donors awaiting volunteer transportation to shelters.
          </p>
        </div>
        <button
          onClick={loadAssignments}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}
        >
          <RotateCcw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Routes</span>
        </button>
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

      {/* Missions Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Finding available rescue routes on MongoDB Atlas...
        </div>
      ) : assignments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Truck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No open missions right now
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.5rem' }}>
            All approved food pickups are currently handled by the fleet. Keep your duty toggle on to receive notifications!
          </p>
          <button onClick={loadAssignments} className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
            Check Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assignments.map((mission) => (
            <div
              key={mission.id}
              className="card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                borderLeft: '4px solid #f59e0b',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: 'min(300px, 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      background: '#fffbeb',
                      color: '#d97706',
                      border: '1px solid #fde68a',
                    }}
                  >
                    READY FOR PICKUP
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Mission #{mission.id?.slice(-6)}
                  </span>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {mission.donation_title || 'Surplus Food Batch'}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Payload Weight: <strong>{formatKg(mission.donation_quantity)}</strong> (~{Math.round((parseFloat(mission.donation_quantity) || 0) * 2.5)} meals) • Category: <strong>{mission.donation_food_type}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span>Pickup From: <strong>{mission.pickup_address}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Building2 size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                    <span>Deliver To: <strong>{mission.organization_name || 'Designated Shelter'}</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleAccept(mission.id)}
                  disabled={acceptingId === mission.id}
                  className="btn btn-primary"
                  style={{
                    background: 'var(--brand-rose-gradient)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.75rem 1.6rem',
                    fontSize: '0.92rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                  }}
                >
                  <Truck size={16} />
                  <span>{acceptingId === mission.id ? 'Claiming Route...' : 'Accept Rescue Mission'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
