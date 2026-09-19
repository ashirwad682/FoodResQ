import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { DonationCard } from '../../components/cards/DonationCard';
import { Sparkles, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const PriorityDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

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
    try {
      await pickupService.createRequest({
        donation: donation.id,
        notes: 'Priority claim from NGO matching engine.',
      });
      setFeedback({ type: 'success', text: `Priority request submitted for "${donation.title}"!` });
      setDonations((prev) => prev.filter((d) => d.id !== donation.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim priority donation.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={22} color="var(--warning)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Priority Surplus Batches</h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Surplus food batches ranked by expiration urgency. Claim these first to minimize food spoilage!
        </p>
      </div>

      {feedback && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{feedback.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Analyzing urgent surplus batches...
        </div>
      ) : donations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Clock size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Urgent Batches Right Now</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            All urgent donations have been claimed or preserved. Check standard available food.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {donations.map((d) => (
            <DonationCard
              key={d.id}
              donation={d}
              actionLabel="Fast Claim"
              onAction={handleClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
};
