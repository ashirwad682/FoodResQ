import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pickupService } from '../../services/pickupService';
import {
  Inbox,
  Building2,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Truck,
  ShoppingBag,
  ShieldCheck,
  Ban,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchRequests = async () => {
    try {
      const data = await pickupService.getRequests();
      setRequests(data.results || data || []);
    } catch (err) {
      console.error('Failed to load NGO requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelClaim = async (req) => {
    const isApproved = req.status === 'APPROVED';
    const confirmMsg = isApproved
      ? `Are you sure you want to cancel your confirmed reservation for "${req.donation_details?.title || 'this donation'}"? The batch will be released back to the marketplace for other shelters.`
      : `Are you sure you want to withdraw your pending claim for "${req.donation_details?.title || 'this donation'}"?`;

    if (!window.confirm(confirmMsg)) return;

    setCancellingId(req.id);
    setFeedback(null);
    try {
      const res = await pickupService.cancelRequest(req.id);
      setFeedback({
        type: 'success',
        message: res.message || 'Claim cancelled successfully.',
      });
      await fetchRequests();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || err.response?.data?.detail || 'Failed to cancel claim.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'INACTIVE') return r.status === 'REJECTED' || r.status === 'CANCELLED';
    return r.status === filterStatus;
  });

  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Shelter Rescue Claims
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Track your exclusive food reservations and pending requests across donor kitchens.
          </p>
        </div>

        <Link
          to="/ngo/available-food"
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <ShoppingBag size={16} />
          <span>Browse Available Food</span>
        </Link>
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
          { id: 'ALL', label: `All Claims (${requests.length})` },
          { id: 'APPROVED', label: `Reserved For You (${approvedCount})` },
          { id: 'PENDING', label: `Pending Donor Approval (${pendingCount})` },
          { id: 'INACTIVE', label: 'Cancelled / Declined' },
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
          Loading your shelter claims...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Inbox size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No claims in this view
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.5rem' }}>
            Explore the surplus marketplace to claim food batches for your beneficiaries.
          </p>
          <Link to="/ngo/available-food" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
            Explore Surplus Food
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRequests.map((req) => {
            const isApproved = req.status === 'APPROVED';
            const isPending = req.status === 'PENDING';
            const isRejected = req.status === 'REJECTED';
            const isCancelled = req.status === 'CANCELLED';

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
                  borderLeft: `4px solid ${
                    isApproved ? '#059669' : isPending ? '#f59e0b' : isCancelled ? '#94a3b8' : '#dc2626'
                  }`,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 'min(280px, 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : isCancelled ? '#f1f5f9' : '#fef2f2',
                        color: isApproved ? '#059669' : isPending ? '#d97706' : isCancelled ? '#64748b' : '#dc2626',
                        border: `1px solid ${isApproved ? '#a7f3d0' : isPending ? '#fde68a' : isCancelled ? '#cbd5e1' : '#fecaca'}`,
                      }}
                    >
                      {isApproved ? 'CONFIRMED RESERVATION' : req.status}
                    </span>

                    {isApproved && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #bbf7d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <ShieldCheck size={12} />
                        Exclusive Shelter Batch
                      </span>
                    )}

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Requested on {formatDate(req.requested_at || req.created_at)}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {req.donation_details?.title || `Surplus Batch #${req.id}`}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Quantity Claimed: <strong>{req.requested_quantity_kg || req.donation_details?.quantity_kg} kg</strong> • Donor: <strong>{req.donation_details?.donor_details?.name || 'Commercial Donor Kitchen'}</strong>
                  </div>

                  {req.notes && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', background: 'var(--bg-alt)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                      Shelter Plan: "{req.notes}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {isApproved && (
                    <>
                      <Link
                        to="/ngo/active-deliveries"
                        className="btn btn-primary btn-sm"
                        style={{
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Truck size={14} />
                        <span>Track Delivery</span>
                      </Link>

                      <button
                        onClick={() => handleCancelClaim(req)}
                        disabled={cancellingId === req.id}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 'var(--radius-full)', color: '#dc2626', borderColor: '#fecaca' }}
                        title="Cancel reservation before courier picks up"
                      >
                        <Ban size={14} />
                        <span>{cancellingId === req.id ? 'Releasing...' : 'Cancel Reservation'}</span>
                      </button>
                    </>
                  )}

                  {isPending && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontWeight: 700, fontSize: '0.85rem', marginRight: '0.5rem' }}>
                        <Clock size={16} />
                        <span>Awaiting Donor Approval</span>
                      </div>
                      <button
                        onClick={() => handleCancelClaim(req)}
                        disabled={cancellingId === req.id}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        <span>{cancellingId === req.id ? 'Withdrawing...' : 'Withdraw'}</span>
                      </button>
                    </>
                  )}

                  {isRejected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>
                      <XCircle size={16} />
                      <span>Batch Awarded to Another Shelter</span>
                    </div>
                  )}

                  {isCancelled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Ban size={16} />
                      <span>Claim Withdrawn / Cancelled</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};