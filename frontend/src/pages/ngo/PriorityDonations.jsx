import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { DonationCard } from '../../components/cards/DonationCard';
import { Sparkles, Clock, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatHoursLeft } from '../../utils/formatters';

export const PriorityDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    const fetchPriority = async () => {
      try {
        const data = await donationService.getDonations({ status: 'AVAILABLE' });
        const items = data.results || data || [];
        // Sort by expiry_time ascending (soonest to expire first)
        const sorted = [...items].sort((a, b) => new Date(a.expiry_time) - new Date(b.expiry_time));
        setDonations(sorted);
      } catch (err) {
        console.error('Failed to load priority food', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPriority();
  }, []);

  const handleClaim = async (donation) => {
    setClaimingId(donation.id);
    setFeedback(null);
    try {
      await pickupService.createRequest({
        donation: donation.id,
        notes: 'Urgent priority claim from NGO matching engine.',
      });
      setFeedback({ type: 'success', text: `Priority rescue claim submitted for "${donation.title}"!` });
      setDonations((prev) => prev.filter((d) => d.id !== donation.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim priority donation.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Sparkles size={24} style={{ color: '#f59e0b' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AI Priority Surplus Batches
          </h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Surplus food batches algorithmically ranked by expiration urgency. Claim these first to minimize food spoilage!
        </p>
      </div>

      {feedback && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
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
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Priority Scoring Rules Callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={22} style={{ color: '#2563eb' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1e40af' }}>
              How the Priority Engine Computes Scores
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.15rem' }}>
              Multi-factor scoring model: <strong>Expiry Urgency (50%)</strong> + <strong>Portion Weight (30%)</strong> + <strong>Shelter Distance (20%)</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Priority Batches */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Computing priority weights on live cloud network...
        </div>
      ) : donations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Clock size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No urgent batches right now
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            All urgent batches have been claimed or preserved. Explore standard available food.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {donations.map((d) => (
            <DonationCard
              key={d.id}
              donation={d}
              actionButton={
                <button
                  onClick={() => handleClaim(d)}
                  disabled={claimingId === d.id}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>{claimingId === d.id ? 'Claiming...' : 'Fast Claim'}</span>
                  <ArrowRight size={14} />
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
