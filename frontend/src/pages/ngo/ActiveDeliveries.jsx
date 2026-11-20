import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import {
  Truck,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Phone,
  Thermometer,
  Star,
  Send,
  X,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const ActiveDeliveries = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Delivery Receipt Confirmation Modal State
  const [confirmModalItem, setConfirmModalItem] = useState(null);
  const [rating, setRating] = useState(5.0);
  const [confirmNotes, setConfirmNotes] = useState('Food inspected and verified safe above 65°C by shelter intake staff.');

  const loadDeliveries = async () => {
    try {
      const data = await pickupService.getAssignments();
      const list = data.results || data || [];
      // Show active or delivered assignments
      setAssignments(
        list.filter((a) => ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COLLECTED'].includes(a.status))
      );
    } catch (err) {
      console.error('Failed to load deliveries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleOpenConfirmModal = (item) => {
    setConfirmModalItem(item);
    setRating(5.0);
    setConfirmNotes('Food inspected and verified safe above 65°C by shelter intake staff.');
  };

  const handleConfirmReceipt = async (e) => {
    e.preventDefault();
    if (!confirmModalItem) return;

    setActionLoading(confirmModalItem.id);
    setFeedback(null);
    try {
      await pickupService.confirmDelivery(confirmModalItem.id, {
        rating: parseFloat(rating),
        notes: confirmNotes,
      });
      setFeedback({
        type: 'success',
        message: 'Delivery confirmed! Digital receipt generated and impact logged into the food rescue ledger.',
      });
      setConfirmModalItem(null);
      loadDeliveries();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to confirm delivery receipt.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Active Inbound Deliveries
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Track real-time volunteer courier riders transporting surplus food to your shelter.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#065f46' : 'var(--danger)',
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
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Deliveries List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Connecting to live delivery dispatch telemetry...
        </div>
      ) : assignments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Truck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No in-flight deliveries currently
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            When an approved food request is picked up by a volunteer courier, live tracking details will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {assignments.map((item) => {
            const isDelivered = item.status === 'DELIVERED';
            const isCollected = item.status === 'COLLECTED';
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
                    isDelivered ? '#059669' : isCollected || isInTransit ? '#0284c7' : '#f59e0b'
                  }`,
                }}
              >
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        background: isDelivered ? '#ecfdf5' : '#eff6ff',
                        color: isDelivered ? '#059669' : '#0284c7',
                        border: `1px solid ${isDelivered ? '#a7f3d0' : '#bfdbfe'}`,
                      }}
                    >
                      {item.status?.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Mission #{item.id?.slice(-6)}
                    </span>
                  </div>

                  {isDelivered && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={16} />
                      <span>Arrived at Facility • Pending Signoff</span>
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {item.donation_title || 'Surplus Food Batch'}
                    </h3>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Quantity: <strong>{formatKg(item.donation_quantity)}</strong> • Category: <strong>{item.donation_food_type}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                      <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>Origin: {item.pickup_address}</span>
                    </div>
                  </div>

                  {/* Courier Card */}
                  <div
                    style={{
                      background: 'var(--bg-alt)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Assigned Courier Rider
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                        {item.volunteer_name || 'Volunteer Courier'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Vehicle: {item.volunteer_vehicle || 'Motorcycle'}
                      </div>
                    </div>

                    {item.volunteer_phone && (
                      <a
                        href={`tel:${item.volunteer_phone}`}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Phone size={13} />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                {isDelivered && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => handleOpenConfirmModal(item)}
                      className="btn btn-primary"
                      style={{
                        background: 'var(--brand-rose-gradient)',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.7rem 1.6rem',
                        fontSize: '0.92rem',
                        boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Confirm Safe Receipt & Rate Courier</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delivery Modal Dialog */}
      {confirmModalItem && (
        <div className="modal-backdrop-dark" onClick={() => setConfirmModalItem(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Confirm Delivery & Digital Receipt
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  "{confirmModalItem.donation_title}" • {confirmModalItem.donation_quantity} kg
                </span>
              </div>
              <button
                onClick={() => setConfirmModalItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmReceipt} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Courier Service Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      style={{
                        background: rating >= s ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${rating >= s ? '#fde68a' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '0.5rem 0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: rating >= s ? '#d97706' : 'var(--text-muted)',
                      }}
                    >
                      <Star size={16} fill={rating >= s ? '#f59e0b' : 'none'} color="#f59e0b" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Intake Quality & Temperature Verification Notes
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setConfirmModalItem(null)}
                  className="btn btn-secondary"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === confirmModalItem.id}
                  className="btn btn-primary"
                  style={{
                    background: 'var(--brand-rose-gradient)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.75rem 1.6rem',
                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{actionLoading === confirmModalItem.id ? 'Signing...' : 'Sign Digital Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
