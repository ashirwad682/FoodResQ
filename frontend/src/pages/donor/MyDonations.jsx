import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { DonationCard } from '../../components/cards/DonationCard';
import { PlusCircle, Search, Filter, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export const MyDonations = () => {
  const location = useLocation();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerMessage, setBannerMessage] = useState(location.state?.message || '');

  const loadDonations = async () => {
    try {
      const data = await donationService.getDonations();
      setDonations(data.results || data || []);
    } catch (err) {
      console.error('Failed to load donations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel the donation "${title}"?`)) return;
    try {
      await donationService.deleteDonation(id);
      setDonations((prev) => prev.filter((d) => d.id !== id));
      setBannerMessage(`Donation "${title}" cancelled successfully.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel donation.');
    }
  };

  const filtered = donations.filter((d) => {
    const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
    const matchesSearch = d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.food_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>My Food Donations</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Track and manage all surplus food items posted from your commercial kitchen.
          </p>
        </div>
        <Link to="/donor/donate" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>New Surplus Batch</span>
        </Link>
      </div>

      {bannerMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by food name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          {['ALL', 'AVAILABLE', 'REQUESTED', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="btn btn-sm"
              style={{
                background: filterStatus === status ? 'var(--primary)' : 'var(--bg-alt)',
                color: filterStatus === status ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Donations List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your donations from live MongoDB Atlas database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <AlertCircle size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No donations matching your filter</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Try adjusting your search criteria or register a new batch.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((d) => (
            <div key={d.id} style={{ position: 'relative' }}>
              <DonationCard
                donation={d}
                actionLabel="Details & Matching"
                actionTo={`/donor/donations/${d.id}`}
              />
              {d.status === 'AVAILABLE' && (
                <button
                  onClick={() => handleDelete(d.id, d.title)}
                  title="Cancel this donation"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.5rem',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={13} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
