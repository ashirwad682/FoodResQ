import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { DonationCard } from '../../components/cards/DonationCard';
import { Search, Filter, ShoppingBag, AlertCircle, CheckCircle2, X, Send } from 'lucide-react';
import { formatKg } from '../../utils/formatters';

export const AvailableFood = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);

  const loadAvailableFood = async () => {
    try {
      const data = await donationService.getDonations({ status: 'AVAILABLE' });
      const items = data.results || data || [];
      setDonations(items);

      // Check if URL has ?claim=id
      const claimId = searchParams.get('claim');
      if (claimId) {
        const target = items.find((item) => String(item.id) === String(claimId));
        if (target) setSelectedDonation(target);
      }
    } catch (err) {
      console.error('Failed to load available food', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableFood();
  }, [searchParams]);

  const handleClaimClick = (donation) => {
    setSelectedDonation(donation);
    setRequestNotes('');
  };

  const handleConfirmRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    setSubmitting(true);
    try {
      await pickupService.createRequest({
        donation: selectedDonation.id,
        notes: requestNotes || 'Standard shelter pickup request.',
      });
      setBannerMessage({
        type: 'success',
        text: `Pickup request sent for "${selectedDonation.title}"! Waiting for donor confirmation.`,
      });
      setSelectedDonation(null);
      // Clean query params
      setSearchParams({});
      loadAvailableFood();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.detail || 'Failed to submit pickup request.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = donations.filter((d) => {
    const matchesCat = categoryFilter === 'ALL' || d.food_type === categoryFilter;
    const matchesSearch =
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Available Food Marketplace</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Browse verified surplus food available for immediate rescue. Claim a batch to dispatch volunteer riders.
        </p>
      </div>

      {bannerMessage && (
        <div style={{
          background: bannerMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${bannerMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: bannerMessage.type === 'success' ? '#065f46' : 'var(--danger)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{bannerMessage.text}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by meal name or pickup area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          {['ALL', 'COOKED_MEAL', 'BAKED_GOODS', 'RAW_INGREDIENTS', 'PACKAGED'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="btn btn-sm"
              style={{
                background: categoryFilter === cat ? 'var(--primary)' : 'var(--bg-alt)',
                color: categoryFilter === cat ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Fetching available surplus batches...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <ShoppingBag size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Food Batches Available</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            There are currently no unclaimed food donations matching this criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((d) => (
            <DonationCard
              key={d.id}
              donation={d}
              actionLabel="Claim This Food"
              onAction={handleClaimClick}
            />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedDonation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 100,
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setSelectedDonation(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                {selectedDonation.food_type}
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Request Pickup: {selectedDonation.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Weight: <strong>{formatKg(selectedDonation.quantity_kg)}</strong> (~{selectedDonation.servings || Math.round(selectedDonation.quantity_kg * 2.5)} meals)
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Pickup: {selectedDonation.pickup_address}
              </p>
            </div>

            <form onSubmit={handleConfirmRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Notes for Donor & Volunteer (Optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Shelter is open 24/7. Our gatekeeper will accept the boxes..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  <Send size={16} />
                  <span>{submitting ? 'Submitting...' : 'Confirm Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
