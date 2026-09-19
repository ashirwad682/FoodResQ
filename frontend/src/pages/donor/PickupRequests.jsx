import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { CheckCircle2, XCircle, Clock, Building2, MapPin, Package, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const PickupRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);

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
      setFeedback({ type: 'success', message: 'Pickup request approved! Rescue mission dispatched to nearby volunteers.' });
      loadRequests();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to approve request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this NGO pickup request?')) return;
    setActionLoading(id);
    setFeedback(null);
    try {
      await pickupService.rejectRequest(id);
      setFeedback({ type: 'info', message: 'Pickup request rejected. The food batch remains open for other NGOs.' });
      loadRequests();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to reject request.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Incoming Pickup Requests</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Verified NGOs and shelters request to claim your surplus food batches here. Approve to dispatch rescue volunteers.
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
          Loading pending NGO requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Clock size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Pickup Requests</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            When an NGO claims your surplus food batch, you will receive an alert to approve it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((req) => {
            const isPending = req.status === 'PENDING';
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
                  gap: '1.5rem',
                  borderLeft: `4px solid ${
                    req.status === 'APPROVED' ? 'var(--primary)' :
                    req.status === 'REJECTED' ? 'var(--danger)' :
                    req.status === 'COMPLETED' ? '#3b82f6' : 'var(--warning)'
                  }`
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Building2 size={12} />
                      <span>{req.organization_name || 'Verified Shelter'}</span>
                    </span>
                    <span className={`badge badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Requested {formatDate(req.created_at)}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {req.donation_title || `Donation #${req.donation?.slice(-6)}`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Package size={14} />
                      <span>{req.donation_quantity || 'Batch'} kg</span>
                    </div>
                    {req.organization_contact && (
                      <div>
                        <span>Contact: <strong>{req.organization_contact}</strong></span>
                      </div>
                    )}
                  </div>

                  {req.notes && (
                    <div style={{ fontSize: '0.82rem', fontStyle: 'italic', background: 'var(--bg-alt)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                      "{req.notes}"
                    </div>
                  )}
                </div>

                {isPending ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={16} />
                      <span>{actionLoading === req.id ? 'Approving...' : 'Approve & Dispatch'}</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: req.status === 'APPROVED' ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {req.status === 'APPROVED' ? '✓ Approved & Processing' : req.status}
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
