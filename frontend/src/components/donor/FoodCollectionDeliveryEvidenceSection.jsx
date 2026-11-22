import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  User,
  Truck,
  ExternalLink,
  Camera,
  Calendar,
  Eye,
  X,
  FileCheck2,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const FoodCollectionDeliveryEvidenceSection = ({ donations = [], requests = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Find requests with assignments and verification data
  const trackedItems = requests.filter((r) => {
    return r.assignment && ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CONFIRMED_BY_NGO'].includes(r.assignment.status || r.donation_details?.status);
  });

  return (
    <div
      className="card"
      style={{
        padding: '1.75rem',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                background: '#f0fdf4',
                color: '#059669',
                border: '1px solid #bbf7d0',
              }}
            >
              VERIFIED CHAIN OF CUSTODY
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              • Two-Stage Photographic Records
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Food Collection & Delivery Evidence
          </h2>
        </div>
      </div>

      {trackedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#fafafa', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
          <FileCheck2 size={36} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
            No Active In-Transit Delivery Evidence Yet
          </h4>
          <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '420px', margin: '0.25rem auto 0' }}>
            When a volunteer courier accepts and collects your approved surplus food donation, real-time photographic collection and shelter handover records will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {trackedItems.map((item) => {
            const assign = item.assignment || {};
            const ver = assign.verification || {};
            const donation = item.donation_details || {};
            const isCompleted = assign.status === 'DELIVERED' || assign.status === 'CONFIRMED_BY_NGO' || donation.status === 'COMPLETED';
            const isPickedUp = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED_BY_NGO', 'COMPLETED'].includes(assign.status || donation.status);
            const hasCollectionPhoto = Boolean(ver.collection_photo_url || assign.proof_image_url);
            const hasHandoverPhoto = Boolean(ver.handover_photo_url);

            return (
              <div
                key={item.id}
                style={{
                  border: `1.5px solid ${isCompleted ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: '0.85rem',
                  padding: '1.5rem',
                  background: isCompleted ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>
                      Donation #{donation.id?.slice(-8)} • NGO: <strong>{item.organization_details?.name || 'Partner Shelter'}</strong>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {donation.title || 'Surplus Food Batch'}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      background: isCompleted ? '#dcfce7' : isPickedUp ? '#e0f2fe' : '#fef3c7',
                      color: isCompleted ? '#059669' : isPickedUp ? '#0369a1' : '#b45309',
                      border: `1px solid ${isCompleted ? '#86efac' : isPickedUp ? '#7dd3fc' : '#fde68a'}`,
                    }}
                  >
                    {isCompleted ? '✓ VERIFIED & DELIVERED' : isPickedUp ? '🚚 IN TRANSIT TO SHELTER' : 'COURIER ASSIGNED'}
                  </span>
                </div>

                {/* Courier & Delivery Progress Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800 }}>
                      Assigned Courier
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} style={{ color: '#2563eb' }} />
                      <span>{assign.volunteer_name || 'Volunteer Courier'}</span>
                    </div>
                    {assign.volunteer_vehicle && (
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Gear: {assign.volunteer_vehicle}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800 }}>
                      Payload Transferred
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                      {formatKg(item.requested_quantity_kg || donation.quantity_kg)} ({donation.food_type})
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800 }}>
                      Receiving NGO Shelter
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={14} style={{ color: '#059669' }} />
                      <span>{item.organization_details?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Photos Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {/* Stage 1: Collection Photo from Donor */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: hasCollectionPhoto ? '#059669' : '#94a3b8' }}>
                        Stage 1: Collection from Your Kitchen
                      </span>
                      {hasCollectionPhoto && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          ✓ Confirmed
                        </span>
                      )}
                    </div>

                    {hasCollectionPhoto ? (
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        <div
                          onClick={() => setSelectedImage(ver.collection_photo_url || assign.proof_image_url)}
                          style={{ position: 'relative', cursor: 'pointer', borderRadius: '0.5rem', overflow: 'hidden' }}
                        >
                          <img
                            src={ver.collection_photo_url || assign.proof_image_url}
                            alt="Collection Evidence"
                            style={{ width: '85px', height: '85px', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, hover: { opacity: 1 } }}>
                            <Eye size={16} color="#fff" />
                          </div>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Food Verified on Premises</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} />
                            <span>
                              {ver.collection_timestamp
                                ? new Date(ver.collection_timestamp).toLocaleString()
                                : assign.collected_at
                                ? new Date(assign.collected_at).toLocaleString()
                                : 'Timestamp logged'}
                            </span>
                          </div>
                          {ver.collection_location?.lat && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.72rem' }}>
                              <MapPin size={12} />
                              <span>GPS: {ver.collection_location.lat.toFixed(4)}°N, {ver.collection_location.lng.toFixed(4)}°E</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.25rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                        Courier en route to collect food batch
                      </div>
                    )}
                  </div>

                  {/* Stage 2: Handover Photo at NGO */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: hasHandoverPhoto ? '#2563eb' : '#94a3b8' }}>
                        Stage 2: Handover to NGO Shelter
                      </span>
                      {isCompleted && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          ✓ OTP Verified
                        </span>
                      )}
                    </div>

                    {hasHandoverPhoto ? (
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        <div
                          onClick={() => setSelectedImage(ver.handover_photo_url)}
                          style={{ position: 'relative', cursor: 'pointer', borderRadius: '0.5rem', overflow: 'hidden' }}
                        >
                          <img
                            src={ver.handover_photo_url}
                            alt="Handover Evidence"
                            style={{ width: '85px', height: '85px', objectFit: 'cover' }}
                          />
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Handed Over at Shelter</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} />
                            <span>
                              {ver.handover_timestamp ? new Date(ver.handover_timestamp).toLocaleString() : 'Timestamp logged'}
                            </span>
                          </div>
                          {isCompleted ? (
                            <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>
                              ✓ Confirmed received via secure 60s OTP
                            </div>
                          ) : (
                            <div style={{ color: '#2563eb', fontSize: '0.75rem' }}>
                              Awaiting NGO OTP verification
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.25rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                        {hasCollectionPhoto ? 'Courier transporting to shelter facility' : 'Awaiting Stage 1 pickup'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '680px', width: '100%' }}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-36px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Evidence Full View"
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '0.75rem' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
