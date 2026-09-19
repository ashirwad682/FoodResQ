import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { matchingService } from '../../services/matchingService';
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [history, setHistory] = useState([]);
  const [matchedNgos, setMatchedNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [autoMatchMsg, setAutoMatchMsg] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [donData, histData] = await Promise.all([
          donationService.getDonation(id),
          pickupService.getHistory(id).catch(() => []),
        ]);
        setDonation(donData);
        setHistory(histData.results || histData || []);

        // Fetch matched NGOs
        try {
          const matchData = await matchingService.getMatchedNGOs(id);
          setMatchedNgos(matchData.matched_ngos || matchData || []);
        } catch (err) {
          console.warn('Matching query failed or no NGOs nearby');
        }
      } catch (err) {
        console.error('Failed to load donation details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleTriggerAutoMatch = async () => {
    setMatchingLoading(true);
    try {
      const res = await matchingService.triggerAutoMatch(id);
      setAutoMatchMsg({ type: 'success', message: res.message || 'Auto-matching triggered! Notified top NGOs.' });
    } catch (err) {
      setAutoMatchMsg({ type: 'error', message: err.response?.data?.error || 'Failed to auto-match.' });
    } finally {
      setMatchingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Fetching live donation record #{id}...
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={44} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Donation not found</h2>
        <Link to="/donor/donations" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to My Donations
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <span className={`badge badge-${donation.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          {donation.status.replace('_', ' ')}
        </span>
      </div>

      {/* Main Info Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', fontWeight: 700 }}>
              Batch ID #{donation.id}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--text-primary)' }}>
              {donation.title}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-info">{donation.food_type?.replace('_', ' ')}</span>
            <span className="badge badge-warning">{donation.storage_temp?.replace('_', ' ')}</span>
          </div>
        </div>

        {donation.description && (
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {donation.description}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Weight / Quantity</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {formatKg(donation.quantity_kg)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>~{donation.servings || Math.round(donation.quantity_kg * 2.5)} meals</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Safe Until</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} />
              <span>{formatDate(donation.expiry_time)}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pickup Location</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="var(--primary)" />
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{donation.pickup_address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Matched NGOs & Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Matched NGOs */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Smart Matched Shelters</h3>
            </div>
            {donation.status === 'AVAILABLE' && (
              <button
                onClick={handleTriggerAutoMatch}
                disabled={matchingLoading}
                className="btn btn-sm btn-primary"
              >
                <Send size={14} />
                <span>{matchingLoading ? 'Matching...' : 'Auto-Match'}</span>
              </button>
            )}
          </div>

          {autoMatchMsg && (
            <div style={{
              background: autoMatchMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: autoMatchMsg.type === 'success' ? '#065f46' : 'var(--danger)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}>
              {autoMatchMsg.message}
            </div>
          )}

          {matchedNgos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No nearby shelters within radius matching requirements yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {matchedNgos.map((ngo) => (
                <div
                  key={ngo.ngo_id || ngo.id}
                  style={{
                    padding: '0.9rem 1rem',
                    background: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {ngo.ngo_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      📍 {ngo.distance_km} km away • Capacity: {ngo.capacity_kg} kg
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {ngo.match_score}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match Score</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Audit Trail Timeline */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="var(--primary)" />
            <span>Lifecycle Audit Trail</span>
          </h3>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No recorded status transitions yet. Current status: <strong>{donation.status}</strong>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem' }}>
              <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }}></div>

              {history.map((h, idx) => (
                <div key={h.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', position: 'relative' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: idx === history.length - 1 ? 'var(--primary)' : '#94a3b8',
                    border: '3px solid #fff',
                    boxShadow: '0 0 0 2px var(--border)',
                    zIndex: 2,
                    marginTop: '2px'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {h.status?.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatDate(h.created_at)}
                      </span>
                    </div>
                    {h.notes && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {h.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
