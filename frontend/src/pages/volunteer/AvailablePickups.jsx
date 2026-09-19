import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickupService } from '../../services/pickupService';
import { Truck, MapPin, Building2, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const AvailablePickups = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState(null);

  const loadAssignments = async () => {
    try {
      const data = await pickupService.getAssignments();
      const list = data.results || data || [];
      // Filter missions that are ASSIGNED without an active rider or available to claim
      setAssignments(list.filter((a) => a.status === 'ASSIGNED' || !a.volunteer));
    } catch (err) {
      console.error('Failed to load assignments', err);
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
      setError(err.response?.data?.error || 'Failed to claim this mission. It may already have been taken.');
      setAcceptingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Available Rescue Missions</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Commercial kitchens with surplus food approved for NGO pickup. Claim a route to deliver meals.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: 'var(--danger)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Finding available rescue routes near you...
        </div>
      ) : assignments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Truck size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Open Missions Right Now</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            All approved food pickups are currently handled. Keep your status on "Available" to get notified when donors approve requests.
          </p>
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
                borderLeft: '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-warning">READY FOR PICKUP</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Posted {formatDate(mission.assigned_at || mission.created_at)}
                  </span>
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {mission.donation_title || `Surplus Food Batch #${mission.id}`}
                </div>

                {/* Routing Waypoints */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--danger)" />
                    <span><strong>Pickup from:</strong> {mission.pickup_address || 'Commercial Kitchen'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Building2 size={16} color="var(--info)" />
                    <span><strong>Deliver to:</strong> {mission.organization_name || 'Verified Shelter'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <div>Weight: <strong>{formatKg(mission.donation_quantity)}</strong></div>
                  <div>Category: <strong>{mission.donation_food_type}</strong></div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleAccept(mission.id)}
                  disabled={acceptingId === mission.id}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 1.75rem' }}
                >
                  <CheckCircle2 size={18} />
                  <span>{acceptingId === mission.id ? 'Claiming Mission...' : 'Accept Mission'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
