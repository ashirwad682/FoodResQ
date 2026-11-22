import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { volunteerService } from '../../services/volunteerService';
import { pickupService } from '../../services/pickupService';
import { PickupHandoverVerificationSection } from '../../components/volunteer/PickupHandoverVerificationSection';
import {
  Truck,
  MapPin,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Navigation,
  CheckSquare,
  ArrowRight,
  Thermometer,
  Layers,
  Send,
  Package,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const ActiveDelivery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get('id');

  const [mission, setMission] = useState(null);
  const [allActiveMissions, setAllActiveMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActiveMission = async () => {
    try {
      const [activeResp, myAssignmentsResp] = await Promise.all([
        volunteerService.getActiveAssignment().catch(() => null),
        pickupService.getAssignments({ filter: 'mine' }).catch(() => []),
      ]);

      const myAssignments = Array.isArray(myAssignmentsResp)
        ? myAssignmentsResp
        : myAssignmentsResp?.results || [];

      const activeStatuses = [
        'ASSIGNED',
        'ARRIVED_AT_DONOR',
        'COLLECTION_EVIDENCE_SUBMITTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'ARRIVED_AT_NGO',
        'HANDOVER_EVIDENCE_SUBMITTED',
        'OTP_VERIFIED',
        'EN_ROUTE_PICKUP',
        'COLLECTED',
        'EN_ROUTE_DELIVERY',
      ];

      const inFlightList = myAssignments.filter((a) => activeStatuses.includes(a.status));
      setAllActiveMissions(inFlightList);

      let chosen = null;
      if (requestedId) {
        chosen = inFlightList.find((a) => a.id === requestedId) || myAssignments.find((a) => a.id === requestedId);
      }
      if (!chosen) {
        chosen = activeResp?.active_assignment || inFlightList[0] || (activeResp?.id ? activeResp : null);
      }

      setMission(chosen);
    } catch (err) {
      console.error('Failed to load active mission', err);
      setMission(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveMission();
  }, [requestedId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <Truck size={32} className="spin" style={{ margin: '0 auto 0.75rem' }} />
        <div>Querying live rescue courier dispatch telemetry...</div>
      </div>
    );
  }

  if (!mission || !mission.id) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '580px', margin: '2rem auto' }}>
        <Truck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          No Active Rescue Mission
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
          You do not have an active in-flight pickup. Claim an approved rescue batch to begin dispatch!
        </p>
        <Link
          to="/volunteer/pickups"
          className="btn btn-primary"
          style={{
            background: 'var(--brand-rose-gradient)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '0.75rem 1.75rem',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Package size={16} />
          <span>Browse Open Missions</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Multi-mission switcher if volunteer claimed more than 1 in-flight batch */}
      {allActiveMissions.length > 1 && (
        <div
          style={{
            background: '#f8fafc',
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
            <Truck size={16} color="var(--primary)" />
            <span>Active Missions In-Flight ({allActiveMissions.length}):</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {allActiveMissions.map((m) => {
              const isCurrent = m.id === mission.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMission(m);
                    setSearchParams({ id: m.id });
                  }}
                  className={`btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {m.donation_title || `Mission #${m.id.slice(-6)}`} • <span style={{ opacity: 0.85 }}>{m.status.replace(/_/g, ' ')}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
            }}
          >
            ACTIVE FLIGHT DECK
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Mission ID #{mission.id?.slice(-8)}
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {mission.donation_title || 'Surplus Food Rescue Mission'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Donation ID: <strong>#{mission.donation || mission.id}</strong> • Payload: <strong>{formatKg(mission.donation_quantity)}</strong> • Category: <strong>{mission.donation_food_type}</strong>
        </p>
      </div>

      {/* Dedicated Section: Food Pickup & NGO Handover Verification */}
      <PickupHandoverVerificationSection activeMission={mission} onRefresh={loadActiveMission} />

      {/* Route Navigation Legs: Donor & Shelter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Donor Pickup Bay Card */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            borderTop: '4px solid #dc2626',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626' }}>
                Step 1: Origin Donor Bay
              </span>
              <MapPin size={18} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {mission.donor_name || 'Donor Location'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {mission.pickup_address}
            </p>

            {mission.donor_phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#475569', marginBottom: '0.35rem' }}>
                <Phone size={14} />
                <span>{mission.donor_phone}</span>
              </div>
            )}

            {mission.pickup_instructions && (
              <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#475569', borderLeft: '3px solid #dc2626' }}>
                <strong>Pickup Instructions:</strong> {mission.pickup_instructions}
              </div>
            )}
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(mission.pickup_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
          >
            <Navigation size={14} />
            <span>Open Pickup Navigation in Google Maps</span>
          </a>
        </div>

        {/* Shelter Dropoff Card */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            borderTop: '4px solid #0284c7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7' }}>
                Step 2: Destination Shelter
              </span>
              <Building2 size={18} color="#0284c7" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {mission.organization_name || 'Designated Shelter'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Shelter intake drop-off station
            </p>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(mission.organization_name || 'Food Bank Shelter')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}
          >
            <Navigation size={14} />
            <span>Open Dropoff Navigation in Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};
