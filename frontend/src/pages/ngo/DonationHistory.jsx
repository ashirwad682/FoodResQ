import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { CheckCircle2, Package, Clock, ShieldCheck, Download, Award } from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await pickupService.getAssignments();
        const list = data.results || data || [];
        setHistory(list.filter((a) => a.status === 'COMPLETED'));
      } catch (err) {
        console.error('Failed to load completed donation history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalKg = history.reduce((sum, item) => sum + (parseFloat(item.donation_quantity) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Completed Rescue History</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Verified record of surplus food batches successfully delivered and inspected at your shelter.
          </p>
        </div>

        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <Award size={28} color="#059669" />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>
              {formatKg(totalKg)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>Total Rescued by Shelter</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading completed rescue records...
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <CheckCircle2 size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Completed Deliveries Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            When active deliveries arrive and are confirmed, they will be archived here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                borderLeft: '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-completed">COMPLETED</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Delivered & Verified {formatDate(item.updated_at || item.assigned_at)}
                  </span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.donation_title || `Food Batch #${item.donation?.slice(-6)}`}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div>Volunteer: <strong>{item.volunteer_name || 'Volunteer Rider'}</strong></div>
                  <div>Quantity: <strong>{formatKg(item.donation_quantity)}</strong> (~{Math.round((parseFloat(item.donation_quantity) || 0) * 2.5)} meals)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                <ShieldCheck size={18} />
                <span>Verified Impact</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
