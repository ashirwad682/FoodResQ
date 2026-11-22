import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { DonationCard } from '../../components/cards/DonationCard';
import { Search, Filter, ShoppingBag, AlertCircle, CheckCircle2, X, Send, Clock, ArrowRight } from 'lucide-react';
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
  const [requestedQty, setRequestedQty] = useState('');
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
        if (target) {
          setSelectedDonation(target);
          setRequestedQty(target.quantity_kg);
        }
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
    setRequestedQty(donation.quantity_kg);
    setRequestNotes('');
  };

  const handleConfirmRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    setSubmitting(true);
    try {
      await pickupService.createRequest({
        donation: selectedDonation.id,
        requested_quantity_kg: parseFloat(requestedQty) || selectedDonation.quantity_kg,
        notes: requestNotes || 'Standard shelter pickup request.',
      });
      setBannerMessage({
        type: 'success',
        text: `Pickup request sent for "${selectedDonation.title}"! Waiting for donor confirmation.`,
      });
      setSelectedDonation(null);
      setSearchParams({});
      loadAvailableFood();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit pickup request.';
      setBannerMessage({
        type: 'error',
        text: errorMsg,
      });
      setSelectedDonation(null);
      loadAvailableFood();
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = donations.filter((d) => {
    const matchesCat = categoryFilter === 'ALL' || d.food_type === categoryFilter;
    const matchesSearch =
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.food_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Available Food Marketplace
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Browse verified surplus food available for immediate shelter rescue. Claim a batch to dispatch volunteer riders.
        </p>
      </div>

      {bannerMessage && (
        <div
          style={{
            background: bannerMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${bannerMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: bannerMessage.type === 'success' ? '#065f46' : 'var(--danger)',
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
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            flex: 1,
            minWidth: '260px',
            background: 'var(--bg-alt)',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by food name, category, or pickup area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', background: 'transparent' }}
          />
        </div>

        <div className="filter-pills-row">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'COOKED_MEAL', label: 'Cooked Meals' },
            { id: 'BAKERY', label: 'Bakery' },
            { id: 'RAW_INGREDIENTS', label: 'Fresh Produce' },
            { id: 'PACKAGED_FOOD', label: 'Packaged' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setCategoryFilter(pill.id)}
              className={`filter-pill ${categoryFilter === pill.id ? 'active' : ''}`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Available Food */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading available surplus batches...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No surplus food matches your search
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Try clearing search keywords or selecting a different food category.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              actionButton={
                <button
                  onClick={() => handleClaimClick(donation)}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>Claim Batch</span>
                  <ArrowRight size={14} />
                </button>
              }
            />
          ))}
        </div>
      )}

      {/* Claim Modal Dialog */}
      {selectedDonation && (
        <div className="modal-backdrop-dark" onClick={() => setSelectedDonation(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Claim Surplus Food Batch
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  "{selectedDonation.title}" • Total available: {selectedDonation.quantity_kg} kg
                </span>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmRequest} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Requested Quantity (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max={selectedDonation.quantity_kg}
                  className="form-control"
                  value={requestedQty}
                  onChange={(e) => setRequestedQty(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Distribution Plan & Shelter Notes for Donor
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. FeedHope Shelter will distribute these portions during our evening community meal drive."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="btn btn-secondary"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.75rem 1.6rem',
                  }}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Submitting Claim...' : 'Send Claim Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
