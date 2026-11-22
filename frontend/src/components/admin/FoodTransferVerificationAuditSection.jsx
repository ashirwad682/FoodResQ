import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { resolveMediaUrl } from '../common/DeliveryPhotoEvidenceCard';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  User,
  Truck,
  Camera,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  FileText,
  KeyRound,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const FoodTransferVerificationAuditSection = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [auditModalItem, setAuditModalItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const data = await pickupService.getAuditVerifications();
      setVerifications(data.results || data || []);
    } catch (err) {
      console.error('Failed to load audit verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleOpenAuditTrail = async (item) => {
    setAuditModalItem(item);
    setLoadingLogs(true);
    try {
      const data = await pickupService.getVerification(item.assignment);
      setAuditLogs(data.audit_logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setAuditLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Filtered list
  const filtered = verifications.filter((v) => {
    const query = search.toLowerCase();
    const matchSearch =
      (v.donation_title || '').toLowerCase().includes(query) ||
      (v.donor_name || '').toLowerCase().includes(query) ||
      (v.ngo_name || '').toLowerCase().includes(query) ||
      (v.volunteer_name || '').toLowerCase().includes(query) ||
      String(v.assignment || '').toLowerCase().includes(query);

    if (!matchSearch) return false;

    if (statusFilter === 'COMPLETED') return v.verification_status === 'DELIVERED';
    if (statusFilter === 'PENDING') return v.verification_status !== 'DELIVERED';
    if (statusFilter === 'SUSPICIOUS') return (v.otp_attempts && v.otp_attempts > 1) || (!v.collection_photo_url && v.handover_photo_url);

    return true;
  });

  const totalDelivered = verifications.filter((v) => v.verification_status === 'DELIVERED').length;
  const totalWithBothPhotos = verifications.filter((v) => v.collection_photo_url && v.handover_photo_url).length;
  const suspiciousCount = verifications.filter((v) => (v.otp_attempts && v.otp_attempts > 1)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header and Telemetry Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
                background: '#f1f5f9',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
              }}
            >
              GOVERNANCE AUDIT SYSTEM
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              • Cryptographic OTP & Photographic Ledger
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Food Transfer Verification & Audit Trail
          </h2>
        </div>

        <button
          onClick={loadVerifications}
          className="btn btn-outline btn-sm"
          style={{ borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Audit Records</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b' }}>
            Verified Delivered Rescues
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#059669', marginTop: '0.2rem' }}>
            {totalDelivered}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
            Verified via 60s Single-Use OTP
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b' }}>
            Dual-Photograph Chain of Custody
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
            {totalWithBothPhotos}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
            Both Donor & NGO photos preserved
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${suspiciousCount > 0 ? '#ef4444' : '#10b981'}` }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b' }}>
            Multiple OTP Attempt Alerts
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: suspiciousCount > 0 ? '#dc2626' : '#059669', marginTop: '0.2rem' }}>
            {suspiciousCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
            {suspiciousCount > 0 ? 'Handovers requiring supervision' : 'All handovers passed seamlessly'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by food dish, donor, courier, shelter or mission ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.4rem',
              paddingRight: '0.85rem',
              height: '38px',
              borderRadius: '999px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Transfers' },
            { id: 'COMPLETED', label: 'Delivered' },
            { id: 'PENDING', label: 'In Transit / Pending' },
            { id: 'SUSPICIOUS', label: 'Retried / Flagged' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`filter-pill ${statusFilter === pill.id ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Records List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 0.75rem' }} />
          <div>Querying immutable verification ledger from cloud database...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#fafafa', border: '1px dashed #cbd5e1' }}>
          <ShieldAlert size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
            No Matching Verification Records Found
          </h4>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.25rem' }}>
            Try clearing your search query or switching filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((item) => {
            const isCompleted = item.verification_status === 'DELIVERED';
            const hasBothPhotos = item.collection_photo_url && item.handover_photo_url;
            const hasMultipleAttempts = item.otp_attempts > 1;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderRadius: '1rem',
                  border: `1.5px solid ${hasMultipleAttempts ? '#fca5a5' : isCompleted ? '#bbf7d0' : '#e2e8f0'}`,
                  background: hasMultipleAttempts ? '#fffafb' : isCompleted ? '#ffffff' : '#fafafa',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                        Mission #{item.assignment} • Recorded: {new Date(item.created_at).toLocaleString()}
                      </span>
                      {hasMultipleAttempts && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                          ⚠️ {item.otp_attempts} OTP Verification Attempts
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      {item.donation_title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        background: isCompleted ? '#dcfce7' : '#eff6ff',
                        color: isCompleted ? '#059669' : '#2563eb',
                        border: `1px solid ${isCompleted ? '#86efac' : '#bfdbfe'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={13} /> : null}
                      <span>{isCompleted ? 'DELIVERED & VERIFIED' : item.verification_status}</span>
                    </span>

                    <button
                      onClick={() => handleOpenAuditTrail(item)}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: '999px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FileText size={14} />
                      <span>Audit Logs</span>
                    </button>
                  </div>
                </div>

                {/* Stakeholder Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>Donor Source</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{item.donor_name || 'Donor'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.pickup_address}</div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>Courier Rider</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{item.volunteer_name || 'Volunteer Courier'}</div>
                    {item.volunteer_phone && <div style={{ color: '#64748b', fontSize: '0.75rem' }}>📞 {item.volunteer_phone}</div>}
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>Receiving Shelter</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{item.ngo_name}</div>
                    <div style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>
                      {item.otp_verified_at ? `Verified at ${new Date(item.otp_verified_at).toLocaleTimeString()}` : 'Awaiting OTP'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800 }}>Payload Weight</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.15rem', fontSize: '1rem' }}>
                      {formatKg(item.donation_quantity)}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.donation_food_type}</div>
                  </div>
                </div>

                {/* Side-by-Side Photographic Inspection */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.65rem' }}>
                    Photographic Custody Inspection (Click image to zoom)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Stage 1 Collection Photo */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', background: '#ffffff', display: 'flex', gap: '0.85rem' }}>
                      {item.collection_photo_url ? (
                        <>
                          <img
                            src={resolveMediaUrl(item.collection_photo_url)}
                            alt="Collection Evidence"
                            onClick={() => setSelectedPhoto(resolveMediaUrl(item.collection_photo_url))}
                            style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '0.5rem', cursor: 'pointer', flexShrink: 0 }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'; }}
                          />
                          <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ fontWeight: 800, color: '#059669' }}>Stage 1: Donor Collection</div>
                            <div>
                              Time:{' '}
                              <strong>
                                {item.collection_timestamp ? new Date(item.collection_timestamp).toLocaleString() : 'Logged'}
                              </strong>
                            </div>
                            {item.collection_location?.lat && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                GPS: {item.collection_location.lat.toFixed(4)}°N, {item.collection_location.lng.toFixed(4)}°E (±{item.collection_location.accuracy}m)
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ width: '100%', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                          Collection photo not yet submitted
                        </div>
                      )}
                    </div>

                    {/* Stage 2 Handover Photo */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', background: '#ffffff', display: 'flex', gap: '0.85rem' }}>
                      {item.handover_photo_url ? (
                        <>
                          <img
                            src={resolveMediaUrl(item.handover_photo_url)}
                            alt="Handover Evidence"
                            onClick={() => setSelectedPhoto(resolveMediaUrl(item.handover_photo_url))}
                            style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '0.5rem', cursor: 'pointer', flexShrink: 0 }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'; }}
                          />
                          <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ fontWeight: 800, color: '#2563eb' }}>Stage 2: NGO Handover</div>
                            <div>
                              Time:{' '}
                              <strong>
                                {item.handover_timestamp ? new Date(item.handover_timestamp).toLocaleString() : 'Logged'}
                              </strong>
                            </div>
                            {item.handover_location?.lat && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                GPS: {item.handover_location.lat.toFixed(4)}°N, {item.handover_location.lng.toFixed(4)}°E
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ width: '100%', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                          Handover photo not yet submitted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '720px', width: '100%' }}>
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{ position: 'absolute', top: '-38px', right: 0, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={26} />
            </button>
            <img
              src={selectedPhoto}
              alt="Full Resolution Evidence"
              style={{ width: '100%', maxHeight: '82vh', objectFit: 'contain', borderRadius: '0.75rem' }}
            />
          </div>
        </div>
      )}

      {/* Audit Trail Drawer Modal */}
      {auditModalItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '85vh',
              borderRadius: '1rem',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Immutable Delivery Audit Logs
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                  Mission #{auditModalItem.assignment} • {auditModalItem.donation_title}
                </div>
              </div>
              <button
                onClick={() => setAuditModalItem(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {loadingLogs ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Loading audit trail entries...
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No explicit audit entries recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      borderLeft: '3px solid #2563eb',
                      paddingLeft: '1rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                        {log.performed_by_role || 'SYSTEM'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
                      By: {log.performed_by_name} • {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <pre style={{ fontSize: '0.72rem', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px', marginTop: '0.35rem', overflowX: 'auto', border: '1px solid #e2e8f0' }}>
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
