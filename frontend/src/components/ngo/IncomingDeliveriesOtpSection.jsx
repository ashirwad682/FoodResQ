import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { useNotifications } from '../../context/NotificationContext';
import { resolveMediaUrl } from '../common/DeliveryPhotoEvidenceCard';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  KeyRound,
  RotateCcw,
  Truck,
  Building2,
  User,
  Star,
  MapPin,
  ExternalLink,
  RefreshCw,
  FileText,
  Package,
  Eye,
  X,
  Camera,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const IncomingDeliveriesOtpSection = ({ onRefresh }) => {
  const { notifications, fetchNotifications } = useNotifications();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  // Countdown timers per delivery: { [id]: remainingSeconds }
  const [countdowns, setCountdowns] = useState({});

  const loadDeliveries = async () => {
    try {
      const data = await pickupService.getAssignments();
      const list = Array.isArray(data) ? data : data.results || [];
      // Filter for active incoming deliveries or recently delivered
      setDeliveries(
        list.filter((a) =>
          [
            'PENDING_VOLUNTEER',
            'ASSIGNED',
            'ARRIVED_AT_DONOR',
            'COLLECTION_EVIDENCE_SUBMITTED',
            'PICKED_UP',
            'IN_TRANSIT',
            'ARRIVED_AT_NGO',
            'HANDOVER_EVIDENCE_SUBMITTED',
            'OTP_VERIFIED',
            'DELIVERED',
            'COLLECTED',
            'EN_ROUTE_PICKUP',
            'EN_ROUTE_DELIVERY',
            'CONFIRMED_BY_NGO',
          ].includes(a.status)
        )
      );
    } catch (err) {
      console.error('Failed to load incoming deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
    const interval = setInterval(loadDeliveries, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) => {
        const next = { ...prev };
        let changed = false;
        deliveries.forEach((d) => {
          const ver = d.verification;
          if (ver && ver.otp_expires_at && ver.verification_status !== 'DELIVERED') {
            const expires = new Date(ver.otp_expires_at).getTime();
            const now = Date.now();
            const rem = Math.max(0, Math.floor((expires - now) / 1000));
            if (next[d.id] !== rem) {
              next[d.id] = rem;
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [deliveries]);

  // Find active OTP from either verification or recent notification
  const getActiveOtpForDelivery = (delivery) => {
    if (delivery.verification?.active_otp) {
      return delivery.verification.active_otp;
    }
    // Check recent OTP notifications
    const notif = notifications?.find(
      (n) =>
        (n.notification_type === 'OTP_GENERATED' || n.notification_type === 'SYSTEM') &&
        (n.related_assignment_id === delivery.id || n.data?.assignment_id === delivery.id)
    );
    return notif?.data?.otp || null;
  };


  const activeInbound = deliveries.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CONFIRMED_BY_NGO');
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED' || d.status === 'CONFIRMED_BY_NGO');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
            >
              TWO-STAGE HANDOVER VERIFICATION
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              • 60s Single-Use OTP Protection
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Incoming Deliveries & OTP Verification
          </h2>
        </div>

        <button
          onClick={loadDeliveries}
          className="btn btn-outline btn-sm"
          style={{ borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
        >
          <RefreshCw size={13} />
          <span>Refresh Live Radar</span>
        </button>
      </div>

      {feedback && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.65rem',
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
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            ✕
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.65rem',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Inbound Deliveries */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <Truck size={28} className="spin" style={{ margin: '0 auto 0.5rem' }} />
          <div>Checking live inbound rescue telemetry...</div>
        </div>
      ) : activeInbound.length === 0 ? (
        <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: '#fafafa', border: '1px dashed #cbd5e1' }}>
          <Truck size={38} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
            No In-Flight Food Courier Deliveries Right Now
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '420px', margin: '0.25rem auto 0' }}>
            When a volunteer courier is dispatched or arrives with food, high-priority verification cards and 60-second OTP controls will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeInbound.map((item) => {
            const ver = item.verification || {};
            const activeOtp = getActiveOtpForDelivery(item);
            const remaining = countdowns[item.id] !== undefined ? countdowns[item.id] : (ver.remaining_seconds || 0);
            const isOtpActive = remaining > 0 && activeOtp;
            const hasHandoverPhoto = Boolean(ver.handover_photo_url);
            const hasCollectionPhoto = Boolean(ver.collection_photo_url || item.proof_image_url);

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderRadius: '1rem',
                  border: '1.5px solid #e2e8f0',
                  overflow: 'hidden',
                  background: '#ffffff',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* High Priority Notification Alert Banner */}
                <div
                  style={{
                    background: hasHandoverPhoto ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : 'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
                    color: '#ffffff',
                    padding: '0.85rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <KeyRound size={20} />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                        Food Delivery Verification Required
                      </div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                        Delivery ID: #{item.id} • Assigned Courier: {item.volunteer_name || 'Volunteer Courier'}
                      </div>
                    </div>
                  </div>

                  {/* 60-second countdown badge */}
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Clock size={15} />
                    <span>
                      {remaining > 0 ? `OTP Expires in 00:${remaining.toString().padStart(2, '0')}` : 'OTP Expired'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar for 60s Expiration */}
                <div style={{ width: '100%', height: '4px', background: '#e2e8f0' }}>
                  <div
                    style={{
                      height: '100%',
                      background: remaining > 15 ? '#10b981' : '#ef4444',
                      width: `${Math.min(100, Math.max(0, (remaining / 60) * 100))}%`,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>

                {/* Content Grid */}
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
                  {/* Left Column: Courier & Food Batch Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                        Food Batch Information
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0.35rem' }}>
                        {item.donation_title}
                      </h3>
                      <div style={{ fontSize: '0.86rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Quantity: <strong>{formatKg(item.donation_quantity)}</strong></span>
                        <span>•</span>
                        <span>Category: <strong>{item.donation_food_type}</strong></span>
                      </div>
                    </div>

                    {/* Courier Details */}
                    <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: '#1e293b' }}>
                        <User size={15} style={{ color: '#2563eb' }} />
                        <span>Courier: {item.volunteer_name || 'Volunteer Courier'}</span>
                      </div>
                      {item.volunteer_phone && (
                        <div style={{ color: '#64748b' }}>
                          Phone: <strong>{item.volunteer_phone}</strong>
                        </div>
                      )}
                      {item.volunteer_vehicle && (
                        <div style={{ color: '#64748b' }}>
                          Vehicle / Gear: <strong>{item.volunteer_vehicle}</strong>
                        </div>
                      )}
                      <div style={{ color: '#64748b' }}>
                        Pickup Bay: {item.pickup_address}
                      </div>
                    </div>

                    {/* Both Verification Photographs Preview */}
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                        Photographic Chain-of-Custody Proof
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {/* Collection Photo */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem', background: '#fafafa', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: hasCollectionPhoto ? '#059669' : '#94a3b8', marginBottom: '0.35rem' }}>
                            {hasCollectionPhoto ? '✓ Stage 1: Donor Collection' : 'Stage 1: Pending'}
                          </div>
                          {hasCollectionPhoto ? (
                            <img
                              src={resolveMediaUrl(ver.collection_photo_url || item.proof_image_url)}
                              alt="Donor Collection"
                              onClick={() => setSelectedPhotoModal({
                                url: resolveMediaUrl(ver.collection_photo_url || item.proof_image_url),
                                title: 'Stage 1: Donor Collection Evidence',
                                timestamp: ver.collection_photo_timestamp || ver.created_at,
                                gps: ver.collection_latitude ? `${ver.collection_latitude}°N, ${ver.collection_longitude}°E` : null
                              })}
                              style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '0.35rem', cursor: 'pointer' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          ) : (
                            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.75rem' }}>
                              Photo pending
                            </div>
                          )}
                        </div>

                        {/* Handover Photo */}
                        <div style={{ border: `1.5px solid ${hasHandoverPhoto ? '#2563eb' : '#e2e8f0'}`, borderRadius: '0.5rem', padding: '0.5rem', background: hasHandoverPhoto ? '#eff6ff' : '#fafafa', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: hasHandoverPhoto ? '#2563eb' : '#94a3b8', marginBottom: '0.35rem' }}>
                            {hasHandoverPhoto ? '✓ Stage 2: NGO Handover' : 'Stage 2: Pending'}
                          </div>
                          {hasHandoverPhoto ? (
                            <img
                              src={resolveMediaUrl(ver.handover_photo_url)}
                              alt="NGO Handover"
                              onClick={() => setSelectedPhotoModal({
                                url: resolveMediaUrl(ver.handover_photo_url),
                                title: 'Stage 2: NGO Handover Evidence',
                                timestamp: ver.handover_photo_timestamp || ver.updated_at,
                                gps: ver.handover_latitude ? `${ver.handover_latitude}°N, ${ver.handover_longitude}°E` : null
                              })}
                              style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '0.35rem', cursor: 'pointer' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          ) : (
                            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                              Awaiting photo from courier
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Six-Digit OTP Verification Box or Pending Dispatch Status */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '0.85rem',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                    }}
                  >
                    {item.status === 'PENDING_VOLUNTEER' ? (
                      <div
                        style={{
                          background: '#ffffff',
                          border: '1.5px dashed #cbd5e1',
                          borderRadius: '0.75rem',
                          padding: '2rem 1.25rem',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <Clock size={36} style={{ color: '#d97706', marginBottom: '0.65rem' }} />
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.35rem' }}>
                          Awaiting Volunteer Rider Claim
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                          This approved rescue batch has been dispatched to open courier channels. Once a rider claims the mission, live status and handover OTP verification will activate.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e293b' }}>
                              Your Handover Verification OTP
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Single-Use (60s)
                            </span>
                          </div>

                          {/* Prominent OTP display card (Visible ONLY to NGO account) */}
                          <div
                            style={{
                              background: '#ffffff',
                              border: '2px solid #2563eb',
                              borderRadius: '0.75rem',
                              padding: '1rem',
                              textAlign: 'center',
                              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
                              marginBottom: '1rem',
                            }}
                          >
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                              ACTIVE 6-DIGIT VERIFICATION CODE
                            </div>
                            <div
                              style={{
                                fontSize: '2.1rem',
                                fontWeight: 900,
                                letterSpacing: '0.25em',
                                color: remaining > 0 ? '#1e3a8a' : '#94a3b8',
                                fontFamily: 'monospace',
                              }}
                            >
                              {remaining > 0 && activeOtp ? activeOtp : remaining <= 0 && activeOtp ? 'EXPIRED' : '------'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: remaining > 0 ? '#059669' : '#b91c1c', marginTop: '0.35rem', fontWeight: 700 }}>
                              {remaining > 0 ? `Valid for ${remaining} seconds` : 'OTP will refresh automatically upon courier arrival.'}
                            </div>
                          </div>

                          {/* Verification Instructions for Shelter Staff */}
                          <div
                            style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '0.65rem',
                              padding: '0.85rem 1rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.65rem',
                            }}
                          >
                            <KeyRound size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '0.78rem', color: '#166534', lineHeight: 1.5 }}>
                              <strong style={{ color: '#065f46', display: 'block', marginBottom: '0.2rem' }}>
                                Handover Protocol
                              </strong>
                              When the courier arrives at your shelter with this food batch, inspect the items and share this 6-digit code with the courier. The courier will enter the code on their mobile device to confirm delivery.
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Received Food History */}
      {completedDeliveries.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
            <span>Verified Received Food History ({completedDeliveries.length})</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
            {completedDeliveries.map((item) => {
              const ver = item.verification || {};
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        ✓ OTP VERIFIED & COMPLETED
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {item.confirmed_at ? new Date(item.confirmed_at).toLocaleDateString() : 'Verified'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                      {item.donation_title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                      Payload: <strong>{formatKg(item.donation_quantity)}</strong> • Courier: {item.volunteer_name || 'Volunteer Courier'}
                    </p>
                  </div>

                  {/* Evidence Thumbnails */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', background: '#fff', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #dcfce7' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', marginBottom: '0.25rem' }}>Stage 1: Collection</div>
                      {ver.collection_photo_url ? (
                        <img
                          src={resolveMediaUrl(ver.collection_photo_url)}
                          alt="Collection Proof"
                          title="Click to zoom: Stage 1 Donor Collection"
                          onClick={() => setSelectedPhotoModal({
                            url: resolveMediaUrl(ver.collection_photo_url),
                            title: `Stage 1: Donor Collection Proof • ${item.donation_title}`,
                            timestamp: ver.collection_photo_timestamp,
                            gps: ver.collection_latitude ? `${ver.collection_latitude}°N, ${ver.collection_longitude}°E` : null
                          })}
                          style={{ width: '100%', height: '70px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }}
                        />
                      ) : (
                        <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '4px' }}>
                          Verified
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.25rem' }}>Stage 2: Handover</div>
                      {ver.handover_photo_url ? (
                        <img
                          src={resolveMediaUrl(ver.handover_photo_url)}
                          alt="Handover Proof"
                          title="Click to zoom: Stage 2 NGO Handover"
                          onClick={() => setSelectedPhotoModal({
                            url: resolveMediaUrl(ver.handover_photo_url),
                            title: `Stage 2: NGO Handover Proof • ${item.donation_title}`,
                            timestamp: ver.handover_photo_timestamp,
                            gps: ver.handover_latitude ? `${ver.handover_latitude}°N, ${ver.handover_longitude}°E` : null
                          })}
                          style={{ width: '100%', height: '70px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #bfdbfe' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }}
                        />
                      ) : (
                        <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '4px' }}>
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhotoModal && (
        <div
          onClick={() => setSelectedPhotoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '1rem',
              maxWidth: '680px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{selectedPhotoModal.title}</h4>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '70vh' }}>
              <img
                src={selectedPhotoModal.url}
                alt={selectedPhotoModal.title}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
            <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
              <span>{selectedPhotoModal.timestamp ? `Captured: ${formatDate(selectedPhotoModal.timestamp)}` : 'Verified on-platform'}</span>
              {selectedPhotoModal.gps && <span>GPS: {selectedPhotoModal.gps}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
