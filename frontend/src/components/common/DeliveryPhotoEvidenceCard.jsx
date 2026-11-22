import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Eye,
  X,
  FileCheck2,
  User,
  Truck,
  Building2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

/**
 * Resolves local media paths or base64 data URLs to browser-accessible URLs.
 */
export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (
    url.startsWith('data:image') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const mediaBase = import.meta.env.VITE_MEDIA_URL || '';
  if (mediaBase.startsWith('http')) {
    const host = mediaBase.replace(/\/+$/, '');
    return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  if (apiBase.startsWith('http')) {
    const host = apiBase.replace(/\/api\/?$/, '');
    return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};

/**
 * Professional, reusable Delivery Photo Evidence Card across all stakeholder portals
 * (Donor, NGO, Volunteer, and Admin).
 */
export const DeliveryPhotoEvidenceCard = ({
  verification = {},
  donationTitle = '',
  donationQuantity = '',
  donationFoodType = '',
  volunteerName = '',
  volunteerPhone = '',
  volunteerVehicle = '',
  ngoName = '',
  donorName = '',
  pickupAddress = '',
  status = '',
  showTitle = true,
  cardStyle = {},
}) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  const ver = verification || {};
  const collectionPhoto = resolveMediaUrl(ver.collection_photo_url);
  const handoverPhoto = resolveMediaUrl(ver.handover_photo_url);

  const hasCollection = Boolean(collectionPhoto);
  const hasHandover = Boolean(handoverPhoto);

  const isCompleted =
    status === 'DELIVERED' ||
    status === 'CONFIRMED_BY_NGO' ||
    status === 'COMPLETED' ||
    ver.verification_status === 'DELIVERED';

  return (
    <div
      style={{
        borderRadius: '0.85rem',
        border: '1.5px solid #e2e8f0',
        background: '#ffffff',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        ...cardStyle,
      }}
    >
      {showTitle && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              <ShieldCheck size={14} style={{ color: '#059669' }} />
              <span>Photographic Chain-of-Custody Proof</span>
            </div>
            {donationTitle && (
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0' }}>
                {donationTitle}
              </h4>
            )}
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              background: isCompleted ? '#dcfce7' : hasHandover ? '#dbeafe' : hasCollection ? '#fef3c7' : '#f1f5f9',
              color: isCompleted ? '#059669' : hasHandover ? '#1d4ed8' : hasCollection ? '#b45309' : '#475569',
              border: `1px solid ${isCompleted ? '#86efac' : hasHandover ? '#bfdbfe' : hasCollection ? '#fde68a' : '#cbd5e1'}`,
            }}
          >
            {isCompleted
              ? '✓ Delivery Completed & Verified'
              : hasHandover
              ? '⏳ Awaiting NGO OTP Verification'
              : hasCollection
              ? '● In-Transit to Shelter'
              : '● Awaiting Volunteer Pickup'}
          </span>
        </div>
      )}

      {/* Side-by-Side Photographic Proof Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Stage 1: Donor Collection Photo */}
        <div
          style={{
            border: `1.5px solid ${hasCollection ? '#a7f3d0' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            padding: '0.85rem',
            background: hasCollection ? '#f0fdf4' : '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: hasCollection ? '#059669' : '#64748b' }}>
              Stage 1: Donor Kitchen Collection
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: hasCollection ? '#dcfce7' : '#e2e8f0',
                color: hasCollection ? '#059669' : '#64748b',
              }}
            >
              {hasCollection ? '✓ Verified on Pickup' : 'Pending Step 1'}
            </span>
          </div>

          {hasCollection ? (
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <div
                onClick={() =>
                  setLightboxImage({
                    url: collectionPhoto,
                    title: 'Stage 1: Donor Kitchen Food Collection Evidence',
                    time: ver.collection_timestamp,
                    location: ver.collection_location,
                  })
                }
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  width: '90px',
                  height: '90px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: '#0f172a',
                }}
                title="Click to view full image"
              >
                <img
                  src={collectionPhoto}
                  alt="Food Collection Evidence"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    display: 'none',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#cbd5e1',
                    fontSize: '0.7rem',
                  }}
                >
                  Image loading
                </div>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <Eye size={18} color="#fff" />
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Batch Screened & Sealed</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} style={{ color: '#059669', flexShrink: 0 }} />
                  <span>
                    {ver.collection_timestamp
                      ? new Date(ver.collection_timestamp).toLocaleString()
                      : 'Timestamp verified'}
                  </span>
                </div>
                {ver.collection_location?.lat && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.72rem' }}>
                    <MapPin size={12} style={{ color: '#059669', flexShrink: 0 }} />
                    <span>
                      {ver.collection_location.lat.toFixed(4)}°N, {ver.collection_location.lng.toFixed(4)}°E
                    </span>
                  </div>
                )}
                {volunteerName && (
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Courier: <strong>{volunteerName}</strong>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: '90px',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '0.78rem',
                padding: '0.5rem',
                textAlign: 'center',
                background: '#ffffff',
              }}
            >
              <Camera size={22} style={{ opacity: 0.5, marginBottom: '0.25rem' }} />
              <span>Awaiting volunteer arrival & collection photograph at donor bay</span>
            </div>
          )}
        </div>

        {/* Stage 2: NGO Handover Photo */}
        <div
          style={{
            border: `1.5px solid ${hasHandover ? '#bfdbfe' : '#e2e8f0'}`,
            borderRadius: '0.75rem',
            padding: '0.85rem',
            background: hasHandover ? '#eff6ff' : '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: hasHandover ? '#2563eb' : '#64748b' }}>
              Stage 2: Shelter Handover Evidence
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: isCompleted ? '#dcfce7' : hasHandover ? '#dbeafe' : '#e2e8f0',
                color: isCompleted ? '#059669' : hasHandover ? '#1d4ed8' : '#64748b',
              }}
            >
              {isCompleted ? '✓ Received & Verified' : hasHandover ? '⏳ OTP Pending' : 'Pending Step 2'}
            </span>
          </div>

          {hasHandover ? (
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <div
                onClick={() =>
                  setLightboxImage({
                    url: handoverPhoto,
                    title: 'Stage 2: Shelter Intake Handover Evidence',
                    time: ver.handover_timestamp,
                    location: ver.handover_location,
                  })
                }
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  width: '90px',
                  height: '90px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  background: '#0f172a',
                }}
                title="Click to view full image"
              >
                <img
                  src={handoverPhoto}
                  alt="Food Handover Evidence"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    display: 'none',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#cbd5e1',
                    fontSize: '0.7rem',
                  }}
                >
                  Image loading
                </div>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <Eye size={18} color="#fff" />
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Handed Over at Shelter</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span>
                    {ver.handover_timestamp
                      ? new Date(ver.handover_timestamp).toLocaleString()
                      : 'Timestamp verified'}
                  </span>
                </div>
                {ver.handover_location?.lat && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.72rem' }}>
                    <MapPin size={12} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <span>
                      {ver.handover_location.lat.toFixed(4)}°N, {ver.handover_location.lng.toFixed(4)}°E
                    </span>
                  </div>
                )}
                {isCompleted ? (
                  <div style={{ color: '#059669', fontWeight: 800, fontSize: '0.74rem' }}>
                    ✓ Confirmed by Shelter Intake Supervisor
                  </div>
                ) : (
                  <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.74rem' }}>
                    Awaiting 60s OTP verification entry
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: '90px',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '0.78rem',
                padding: '0.5rem',
                textAlign: 'center',
                background: '#ffffff',
              }}
            >
              <Camera size={22} style={{ opacity: 0.5, marginBottom: '0.25rem' }} />
              <span>
                {hasCollection ? 'Courier in transit; handover photo pending arrival' : 'Awaiting Stage 1 donor collection first'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Full-Resolution Image Inspection */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '720px',
              width: '100%',
              background: '#090d16',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid #334155',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #1e293b',
                color: '#fff',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  ResQFood Chain-of-Custody Photographic Evidence
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                  {lightboxImage.title}
                </div>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  background: '#1e293b',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div style={{ width: '100%', maxHeight: '65vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={lightboxImage.url}
                alt="Full resolution evidence"
                style={{ width: '100%', height: '100%', maxHeight: '65vh', objectFit: 'contain' }}
              />
            </div>

            {/* Modal Telemetry Bar */}
            <div
              style={{
                padding: '0.85rem 1.25rem',
                background: '#0f172a',
                borderTop: '1px solid #1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                color: '#cbd5e1',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} style={{ color: '#38bdf8' }} />
                <span>Timestamp: <strong>{lightboxImage.time ? new Date(lightboxImage.time).toLocaleString() : 'Logged'}</strong></span>
              </div>
              {lightboxImage.location?.lat && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ color: '#34d399' }} />
                  <span>GPS: <strong>{lightboxImage.location.lat.toFixed(4)}°N, {lightboxImage.location.lng.toFixed(4)}°E (±{lightboxImage.location.accuracy || 10}m)</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
