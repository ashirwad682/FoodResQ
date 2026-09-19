import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { Truck, MapPin, User, CheckCircle2, AlertCircle, Clock, ShieldCheck, Phone } from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const ActiveDeliveries = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadDeliveries = async () => {
    try {
      const data = await pickupService.getAssignments();
      const list = data.results || data || [];
      // Show active or recently delivered
      setAssignments(list.filter((a) => ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(a.status)));
    } catch (err) {
      console.error('Failed to load deliveries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleConfirmReceipt = async (id) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await pickupService.confirmDelivery(id, { notes: 'Food received and verified safe by NGO staff.' });
      setFeedback({ type: 'success', message: 'Delivery confirmed! Impact metrics have been logged into the global food rescue ledger.' });
      loadDeliveries();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to confirm receipt.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Active Inbound Deliveries</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Track real-time volunteer rescue riders transporting surplus food to your shelter.
        </p>
      </div>

      {feedback && (
        <div style={{
          background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#065f46' : 'var(--danger)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Tracking active rescue deliveries...
        </div>
      ) : assignments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Truck size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No In-Flight Deliveries</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            When an approved food request is assigned to a volunteer, live tracking details will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assignments.map((item) => {
            const isDelivered = item.status === 'DELIVERED';
            const isInTransit = item.status === 'IN_TRANSIT';

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  borderLeft: `4px solid ${
                    isDelivered ? 'var(--primary)' : isInTransit ? '#3b82f6' : 'var(--warning)'
                  }`
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Mission #{item.id}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {item.donation_title || `Food Batch #${item.donation?.slice(-6)}`}
                    </h3>
                  </div>

                  <span className={`badge badge-${item.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Tracking Steps Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'var(--bg-alt)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. Assigned</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>✓ Rider Dispatched</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isInTransit || isDelivered ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      2. Food Collected
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isInTransit || isDelivered ? '#3b82f6' : 'var(--text-muted)' }}>
                      {isInTransit || isDelivered ? '✓ Picked up from kitchen' : 'Pending pickup'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isDelivered ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      3. Arrived at Shelter
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isDelivered ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {isDelivered ? '✓ Arrived, awaiting sign-off' : 'In transit'}
                    </div>
                  </div>
                </div>

                {/* Volunteer & Destination info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Rescue Volunteer</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={16} color="var(--primary)" />
                      <span>{item.volunteer_name || 'Volunteer Rider'}</span>
                    </div>
                    {item.volunteer_phone && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <Phone size={13} />
                        <span>{item.volunteer_phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pickup Origin</span>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={16} color="var(--danger)" />
                      <span>{item.pickup_address || 'Commercial Kitchen'}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Timing</span>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={16} />
                      <span>Assigned {formatDate(item.assigned_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Action Button */}
                {isDelivered && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={20} color="var(--primary)" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#166534' }}>
                        Rider has delivered the food boxes to your shelter! Inspect items and confirm delivery.
                      </span>
                    </div>
                    <button
                      onClick={() => handleConfirmReceipt(item.id)}
                      disabled={actionLoading === item.id}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={16} />
                      <span>{actionLoading === item.id ? 'Confirming...' : 'Confirm Receipt & Inspect'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
