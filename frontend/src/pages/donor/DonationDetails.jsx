import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { matchingService } from '../../services/matchingService';
import { pickupService } from '../../services/pickupService';
import {
  Package,
  Clock,
  MapPin,
  Utensils,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Send,
  ArrowLeft,
  Activity,
  Flame,
} from 'lucide-react';
import { formatDate, formatHoursLeft, formatKg } from '../../utils/formatters';

export const DonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [matchedNgos, setMatchedNgos] = useState([]);
  const [history, setHistory] = useState([]);
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
          setMatchedNgos(
            matchData?.matched_ngos || matchData?.ranked_ngos || (Array.isArray(matchData) ? matchData : [])
          );
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
    setAutoMatchMsg(null);
    try {
      const res = await matchingService.triggerAutoMatch(id);
      setAutoMatchMsg({ type: 'success', message: res.message || 'Auto-matching triggered! Notified top nearby NGOs.' });
    } catch (err) {
      setAutoMatchMsg({ type: 'error', message: err.response?.data?.error || 'Failed to dispatch auto-match.' });
    } finally {
      setMatchingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <Activity size={32} className="spin" style={{ margin: '0 auto 0.75rem' }} />
        <div>Querying live food rescue ledger record #{id}...</div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '500px', margin: '2rem auto' }}>
        <AlertCircle size={44} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Donation not found</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          This surplus food record may have been expired, deleted, or assigned to a different account.
        </p>
        <Link to="/donor/donations" className="btn btn-secondary btn-sm" style={{ marginTop: '1.25rem', borderRadius: 'var(--radius-full)' }}>
          Back to Inventory
        </Link>
      </div>
    );
  }

  const isExpired = donation.status === 'EXPIRED' || donation.is_expired;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <Link
          to="/donor/donations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Surplus Inventory</span>
        </Link>
      </div>

      {/* Hero Header (Luminous Light Porcelain & Rose Silk Duo) */}
      <section className="resq-hero-panel resq-hero-donor">
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(251, 113, 133, 0.1)',
                  color: '#e11d48',
                  border: '1px solid rgba(251, 113, 133, 0.3)',
                }}
              >
                STATUS: {donation.status?.replace('_', ' ')}
              </span>

              {donation.hours_until_expiry != null && !isExpired && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Clock size={12} />
                  <span>{formatHoursLeft(donation.hours_until_expiry)} remaining</span>
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              {donation.title}
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#475569', maxWidth: '600px' }}>
              {donation.description || 'Verified commercial food surplus logged on the ResQFood real-time network.'}
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(251, 113, 133, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              gap: '2rem',
              boxShadow: '0 10px 30px -5px rgba(244, 63, 94, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Total Weight
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#e11d48', fontFamily: 'var(--font-heading)' }}>
                {donation.quantity_kg} kg
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Meals Fed
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-heading)' }}>
                ~{donation.serves_count || Math.round(donation.quantity_kg * 2.5)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Specifications on Left, AI Matching on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.75rem', alignItems: 'start' }}>
        {/* Left Column: Batch Specifications & Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Food Batch Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Category
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {donation.food_type?.replace('_', ' ')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Storage Condition
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {donation.storage_temp?.replace('_', ' ')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Prepared At
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {formatDate(donation.created_at)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Expiry Deadline
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#dc2626', marginTop: '0.2rem' }}>
                  {formatDate(donation.expiry_time)}
                </div>
              </div>
            </div>

            {/* Dietary Tags */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Dietary & Allergen Profile
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {donation.dietary_flags && donation.dietary_flags.length > 0 ? (
                  donation.dietary_flags.map((flag) => (
                    <span
                      key={flag}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      ✓ {flag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Standard Food Hygiene</span>
                )}
              </div>
            </div>

            {/* Pickup Address */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Pickup Location & Instructions
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{donation.pickup_address}</span>
              </div>
              {donation.special_instructions && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  "{donation.special_instructions}"
                </div>
              )}
            </div>
          </div>

          {/* Status Audit Trail Timeline */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--brand-rose)" />
              <span>Lifecycle Audit Trail</span>
            </h3>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No state transitions logged yet. Current status: <strong>{donation.status}</strong>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem' }}>
                <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }} />

                {history.map((h, idx) => (
                  <div key={h.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', position: 'relative' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: idx === history.length - 1 ? 'var(--brand-rose)' : '#94a3b8',
                        border: '3px solid #fff',
                        boxShadow: '0 0 0 2px var(--border)',
                        zIndex: 2,
                        marginTop: '2px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {h.new_status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatDate(h.timestamp)}
                        </span>
                      </div>
                      {h.notes && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {h.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Priority Matching Section */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#0284c7" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Matched Shelters
              </h3>
            </div>
            <button
              onClick={handleTriggerAutoMatch}
              disabled={matchingLoading || isExpired}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
              }}
            >
              <Send size={13} />
              <span>{matchingLoading ? 'Broadcasting...' : 'Broadcast Match'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Algorithmic priority routing evaluated for distance, remaining shelf-life, and shelter capacity:
          </p>

          {autoMatchMsg && (
            <div
              style={{
                background: autoMatchMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: autoMatchMsg.type === 'success' ? '#065f46' : 'var(--danger)',
                border: `1px solid ${autoMatchMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              {autoMatchMsg.message}
            </div>
          )}

          {matchedNgos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No verified shelters currently within matching radius.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {matchedNgos.map((ngo) => (
                <div
                  key={ngo.ngo_id || ngo.organization_id || ngo.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {ngo.ngo_name || ngo.organization_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      📍 {ngo.distance_km} km away • Intake Capacity: {ngo.capacity_kg || ngo.available_capacity_kg} kg
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-heading)' }}>
                      {ngo.match_score ?? ngo.scores?.total_score}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Match Score
                    </span>
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
