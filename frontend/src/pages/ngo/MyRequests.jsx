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
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
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
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Shelter Rescue Claims
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Track the status of surplus food batches requested by your shelter organization.
          </p>
        </div>

        <Link
          to="/ngo/available-food"
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <ShoppingBag size={16} />
          <span>Browse Available Food</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="filter-pills-row">
        {[
          { id: 'ALL', label: `All Claims (${requests.length})` },
          { id: 'PENDING', label: 'Pending Donor Approval' },
          { id: 'APPROVED', label: 'Approved & Dispatched' },
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
          Loading your shelter claims from MongoDB Atlas...
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
                    isApproved ? '#059669' : isPending ? '#f59e0b' : isRejected ? '#dc2626' : '#cbd5e1'
                  }`,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 'min(280px, 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : '#fef2f2',
                        color: isApproved ? '#059669' : isPending ? '#d97706' : '#dc2626',
                        border: `1px solid ${isApproved ? '#a7f3d0' : isPending ? '#fde68a' : '#fecaca'}`,
                      }}
                    >
                      {req.status}
                    </span>
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

                <div style={{ textAlign: 'right' }}>
                  {isApproved && (
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
                      <span>Track Inbound Delivery</span>
                    </Link>
                  )}
                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Clock size={16} />
                      <span>Awaiting Donor Approval</span>
                    </div>
                  )}
                  {isRejected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>
                      <XCircle size={16} />
                      <span>Declined by Donor</span>
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
