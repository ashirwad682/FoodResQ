import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { Inbox, Building2, Package, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>My Pickup Requests</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Track the approval status of surplus food batches requested by your shelter.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your pickup requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Inbox size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Requests Submitted</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Browse the Available Food marketplace and claim batches to see them tracked here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((req) => (
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Submitted on {formatDate(req.created_at)}
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {req.donation_title || `Donation #${req.donation?.slice(-6)}`}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Package size={14} />
                    <span>{req.donation_quantity || 'Batch'} kg</span>
                  </div>
                </div>

                {req.notes && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-alt)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    Your note: "{req.notes}"
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                {req.status === 'APPROVED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Approved & Dispatched</span>
                  </div>
                )}
                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontWeight: 600, fontSize: '0.88rem' }}>
                    <Clock size={18} />
                    <span>Awaiting Donor Approval</span>
                  </div>
                )}
                {req.status === 'REJECTED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.88rem' }}>
                    <XCircle size={18} />
                    <span>Declined by Donor</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
