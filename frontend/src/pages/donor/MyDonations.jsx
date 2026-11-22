import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { DonationCard } from '../../components/cards/DonationCard';
import {
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Package,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const MyDonations = () => {
  const location = useLocation();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerMessage, setBannerMessage] = useState(location.state?.message || '');

  const loadDonations = async () => {
    try {
      const data = await donationService.getDonations({ my_donations: true });
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
    if (!window.confirm(`Are you sure you want to cancel the surplus donation "${title}"?`)) return;
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
    const matchesSearch =
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.food_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Surplus Food Inventory
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Complete audit log and live management of all surplus batches posted from your kitchen.
          </p>
        </div>
        <Link
          to="/donor/donate"
          className="btn btn-primary"
          style={{
            background: 'var(--brand-rose-gradient)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <PlusCircle size={18} />
          <span>Post New Batch</span>
        </Link>
      </div>

      {bannerMessage && (
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
            <span>{bannerMessage}</span>
          </div>
          <button
            onClick={() => setBannerMessage('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}
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
            placeholder="Search by dish name, food type, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', background: 'transparent' }}
          />
        </div>

        <div className="filter-pills-row">
          {[
            { id: 'ALL', label: 'All Batches' },
            { id: 'AVAILABLE', label: 'Available' },
            { id: 'REQUESTED', label: 'Requested' },
            { id: 'ASSIGNED', label: 'Assigned' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
            { id: 'COMPLETED', label: 'Rescued' },
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
      </div>

      {/* Content Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading kitchen surplus records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No surplus donations found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.5rem' }}>
            {searchTerm || filterStatus !== 'ALL'
              ? 'Try adjusting your search criteria or filter pills.'
              : 'You have not registered any surplus food batches yet. Post excess items to save food.'}
          </p>
          <Link to="/donor/donate" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
            <PlusCircle size={16} />
            <span>Post First Surplus Batch</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
          {filtered.map((d) => (
            <DonationCard
              key={d.id}
              donation={d}
              actionButton={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {['AVAILABLE', 'REQUESTED'].includes(d.status) && (
                    <button
                      onClick={() => handleDelete(d.id, d.title)}
                      className="btn btn-secondary btn-sm"
                      title="Cancel Donation"
                      style={{ padding: '0.45rem', borderRadius: 'var(--radius-full)', color: 'var(--danger)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <Link
                    to={`/donor/donations/${d.id}`}
                    className="btn btn-primary btn-sm"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--primary)',
                    }}
                  >
                    <span>Inspect</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
