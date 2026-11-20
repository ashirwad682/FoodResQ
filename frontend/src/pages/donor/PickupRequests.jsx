import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { CheckCircle2, XCircle, Clock, Building2, MapPin, Package, AlertCircle, Sparkles } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const PickupRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadRequests = async () => {
    try {
      const data = await pickupService.getRequests();
      setRequests(data.results || data || []);
    } catch (err) {
      console.error('Failed to load pickup requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await pickupService.approveRequest(id);
      setFeedback({ type: 'success', message: 'Pickup request approved! Rescue courier assignment dispatched.' });
      loadRequests();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to approve request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this shelter pickup request?')) return;
    setActionLoading(id);
    setFeedback(null);
    try {
      await pickupService.rejectRequest(id);
      setFeedback({ type: 'info', message: 'Pickup request declined. Food batch remains open for other shelters.' });
      loadRequests();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to decline request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Shelter Pickup Requests
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Verified NGOs request to claim your surplus food batches here. Approve to dispatch courier riders.
          </p>
        </div>

        {pendingCount > 0 && (
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Clock size={14} />
            <span>{pendingCount} Pending Approvals</span>
          </span>
        )}
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
            gap: '0.5rem',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-pills-row">
        {[
          { id: 'ALL', label: `All Requests (${requests.length})` },
          { id: 'PENDING', label: `Pending Approval (${pendingCount})` },
          { id: 'APPROVED', label: 'Approved' },
          { id: 'REJECTED', label: 'Declined' },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setFilterStatus(pill.id)}
            className={`filter-pill ${filterStatus === pill.id ? 'active' : ''}`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading shelter rescue requests from MongoDB...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Clock size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No requests in this view
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            When a local charity or shelter requests to claim your surplus food, it will appear here for one-click approval.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';

            return (
              <div
                key={req.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  borderLeft: `4px solid ${isPending ? '#f59e0b' : isApproved ? '#10b981' : '#cbd5e1'}`,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 'min(100%, 260px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        background: isPending ? '#fffbeb' : isApproved ? '#ecfdf5' : '#f1f5f9',
                        color: isPending ? '#d97706' : isApproved ? '#059669' : '#64748b',
                        border: `1px solid ${isPending ? '#fde68a' : isApproved ? '#a7f3d0' : '#cbd5e1'}`,
                      }}
                    >
                      {req.status}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Submitted {formatDate(req.requested_at)}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {req.organization_details?.name || 'Verified Shelter Organization'}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Food Batch: <strong>"{req.donation_details?.title}"</strong> • Requested:{' '}
                    <strong>{req.requested_quantity_kg || req.donation_details?.quantity_kg} kg</strong>
                  </div>

                  {req.notes && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', background: 'var(--bg-alt)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                      Distribution Plan: "{req.notes}"
                    </div>
                  )}
                </div>

                {isPending && (
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id}
                      className="btn btn-primary"
                      style={{
                        background: 'var(--brand-rose-gradient)',
                        borderColor: 'transparent',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.65rem 1.4rem',
                        fontSize: '0.88rem',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{actionLoading === req.id ? 'Approving...' : 'Approve & Dispatch'}</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                      className="btn btn-secondary"
                      style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.1rem', fontSize: '0.88rem' }}
                    >
                      <XCircle size={16} />
                      <span>Decline</span>
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
