import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pickupService } from '../../services/pickupService';
import { EvidenceCameraModal } from '../common/EvidenceCameraModal';
import {
  Camera,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  Truck,
  ArrowRight,
  Send,
  RefreshCw,
  ExternalLink,
  KeyRound,
  FileText,
  User,
  Info,
} from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const PickupHandoverVerificationSection = ({ activeMission, onRefresh }) => {
  const [mission, setMission] = useState(activeMission || null);
  const [volunteerOtpInput, setVolunteerOtpInput] = useState('');
  const [cameraModal, setCameraModal] = useState({ open: false, stage: 'COLLECTION' });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [otpSentMsg, setOtpSentMsg] = useState(null);

  // Sync with prop
  useEffect(() => {
    setMission(activeMission || null);
  }, [activeMission]);

  // Periodic poll to check if NGO verified the OTP
  useEffect(() => {
    if (!mission?.id) return;
    const interval = setInterval(async () => {
      try {
        const assignments = await pickupService.getAssignments({ filter: 'mine' });
        const list = Array.isArray(assignments) ? assignments : assignments.results || [];
        const current = list.find((a) => a.id === mission.id);
        if (current) {
          setMission(current);
          if (current.status === 'DELIVERED' || current.status === 'CONFIRMED_BY_NGO') {
            if (onRefresh) onRefresh();
          }
        }
      } catch (err) {
        // silent poll
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [mission?.id, onRefresh]);

  const handleOpenCollectionCamera = () => {
    setCameraModal({
      open: true,
      stage: 'COLLECTION',
      title: 'Stage 1: Capture Food Collection Photograph',
      subtitle: 'Mandatory proof showing the food batch collected from donor kitchen premises.',
    });
  };

  const handleOpenHandoverCamera = () => {
    setCameraModal({
      open: true,
      stage: 'HANDOVER',
      title: 'Stage 2: Capture NGO Handover Photograph',
      subtitle: 'Mandatory proof showing food containers being handed over to NGO representative.',
    });
  };

  const handleCaptureSubmit = async (captureData) => {
    if (!mission?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      if (cameraModal.stage === 'COLLECTION') {
        const updated = await pickupService.submitCollectionEvidence(mission.id, {
          photo_data: captureData.photo_data,
          location: captureData.location,
          notes: captureData.notes,
          confirm_pickup: true,
        });
        setMission(updated);
        setFeedback({
          type: 'success',
          text: 'Collection photo uploaded & verified! Food status marked PICKED_UP. Proceed to destination shelter.',
        });
      } else {
        const updated = await pickupService.submitHandoverEvidence(mission.id, {
          photo_data: captureData.photo_data,
          location: captureData.location,
          notes: captureData.notes,
        });
        setMission(updated);
        setFeedback({
          type: 'success',
          text: 'Handover photo uploaded! 6-digit OTP sent to NGO notification center. Awaiting NGO verification.',
        });
        setOtpSentMsg('A single-use 6-digit OTP (valid for 60 seconds) was sent to the NGO shelter account.');
      }
      setCameraModal({ open: false, stage: 'COLLECTION' });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit evidence photograph.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransitionStatus = async (targetStatus) => {
    if (!mission?.id) return;
    setActionLoading(targetStatus);
    setError(null);
    try {
      const updated = await pickupService.updateStatus(mission.id, targetStatus);
      setMission(updated);
      setFeedback({
        type: 'success',
        text: `Status updated to ${targetStatus.replace(/_/g, ' ')}.`,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update courier status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateOrResendOtp = async () => {
    if (!mission?.id) return;
    setActionLoading('otp');
    setError(null);
    setOtpSentMsg(null);
    try {
      const resp = await pickupService.generateOtp(mission.id);
      setOtpSentMsg(resp.message || 'New 60s OTP generated and delivered to NGO Notification Center.');
      setFeedback({
        type: 'success',
        text: 'Handover OTP dispatched to NGO shelter account with 60-second expiration.',
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate/resend OTP.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyOtp = async () => {
    if (!mission?.id || volunteerOtpInput.trim().length !== 6) return;
    setActionLoading('verify');
    setError(null);
    try {
      const resp = await pickupService.verifyOtp(mission.id, {
        otp: volunteerOtpInput.trim(),
      });
      setMission((prev) => ({
        ...prev,
        status: 'DELIVERED',
        verification: {
          ...(prev?.verification || {}),
          verification_status: 'DELIVERED',
        },
      }));
      setFeedback({
        type: 'success',
        text: 'Handover OTP successfully verified! Delivery marked DELIVERED and complete.',
      });
      setVolunteerOtpInput('');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect or expired OTP. Please verify the code or click Resend.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!mission || !mission.id) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#fafafa', border: '1px dashed #cbd5e1' }}>
        <ShieldCheck size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
          Pickup & Handover Verification Inactive
        </h4>
        <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '440px', margin: '0.25rem auto 1.25rem' }}>
          When you accept a rescue mission, the two-stage cryptographic verification system activates here to record chain-of-custody photo proof.
        </p>
        <Link to="/volunteer/pickups" className="btn btn-primary btn-sm" style={{ borderRadius: '999px' }}>
          Browse Open Pickup Routes
        </Link>
      </div>
    );
  }

  const status = mission.status;
  const isAssigned = status === 'ASSIGNED' || status === 'ARRIVED_AT_DONOR';
  const isCollectionSubmitted = status === 'COLLECTION_EVIDENCE_SUBMITTED';
  const isPickedUp = status === 'PICKED_UP' || status === 'IN_TRANSIT' || status === 'ARRIVED_AT_NGO';
  const isHandoverSubmitted = status === 'HANDOVER_EVIDENCE_SUBMITTED';
  const isDelivered = status === 'DELIVERED' || status === 'CONFIRMED_BY_NGO' || status === 'COMPLETED';

  const verification = mission.verification || {};
  const hasCollectionPhoto = Boolean(verification.collection_photo_url || mission.proof_image_url);
  const hasHandoverPhoto = Boolean(verification.handover_photo_url);

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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                background: isDelivered ? '#ecfdf5' : '#fffbeb',
                color: isDelivered ? '#059669' : '#d97706',
                border: `1px solid ${isDelivered ? '#a7f3d0' : '#fde68a'}`,
              }}
            >
              {isDelivered ? '✓ VERIFIED & DELIVERED' : 'CHAIN OF CUSTODY ACTIVE'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Mission #{mission.id?.slice(-8)}
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Pickup & Handover Verification
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/volunteer/active-delivery"
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '999px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>Open Courier Cockpit</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '0.65rem',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
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
            padding: '0.75rem 1rem',
            borderRadius: '0.65rem',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Stepper Tracker */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.85rem',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
        }}
      >
        {[
          { label: 'Assigned', done: true },
          { label: 'Arrived at Donor', done: status !== 'ASSIGNED' },
          { label: 'Collection Photo', done: hasCollectionPhoto || isPickedUp || isHandoverSubmitted || isDelivered },
          { label: 'Food Picked Up', done: isPickedUp || isHandoverSubmitted || isDelivered },
          { label: 'Arrived at NGO', done: status === 'ARRIVED_AT_NGO' || isHandoverSubmitted || isDelivered },
          { label: 'Handover Photo', done: hasHandoverPhoto || isDelivered },
          { label: 'NGO OTP Verified', done: isDelivered },
        ].map((step, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.35rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step.done ? '#10b981' : '#e2e8f0',
                color: step.done ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {step.done ? '✓' : idx + 1}
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: step.done ? '#0f172a' : '#94a3b8' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Two Verification Stages Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* STAGE ONE: Food Collection from Donor */}
        <div
          style={{
            border: `2px solid ${hasCollectionPhoto ? '#10b981' : '#f59e0b'}`,
            borderRadius: '0.85rem',
            padding: '1.25rem',
            background: hasCollectionPhoto ? '#f0fdf4' : '#fffbeb',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: hasCollectionPhoto ? '#059669' : '#d97706',
                }}
              >
                Stage 1: Food Collection from Donor
              </span>
              {hasCollectionPhoto ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  ✓ Evidence Verified
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  ● Action Required
                </span>
              )}
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              {mission.donation_title}
            </h4>

            <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div>
                <strong>Donor:</strong> {mission.donor_name || 'Donor'}
              </div>
              {mission.donor_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={13} />
                  <span>{mission.donor_phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{mission.pickup_address}</span>
              </div>
              <div>
                <strong>Payload:</strong> {formatKg(mission.donation_quantity)} ({mission.donation_food_type})
              </div>
              {mission.pickup_instructions && (
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontStyle: 'italic', fontSize: '0.78rem' }}>
                  "{mission.pickup_instructions}"
                </div>
              )}
            </div>

            {/* Collection Photo Proof */}
            {hasCollectionPhoto && (
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                <img
                  src={verification.collection_photo_url || mission.proof_image_url}
                  alt="Collection Evidence"
                  style={{ width: '56px', height: '56px', borderRadius: '0.35rem', objectFit: 'cover' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                  <div style={{ fontWeight: 700, color: '#059669' }}>Collection Photograph Uploaded</div>
                  <div>
                    {verification.collection_timestamp
                      ? new Date(verification.collection_timestamp).toLocaleTimeString()
                      : mission.collected_at
                      ? new Date(mission.collected_at).toLocaleTimeString()
                      : 'Verified'}
                  </div>
                  {verification.collection_location?.lat && (
                    <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                      GPS: {verification.collection_location.lat.toFixed(4)}°N, {verification.collection_location.lng.toFixed(4)}°E
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!hasCollectionPhoto ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {status === 'ASSIGNED' && (
                <button
                  type="button"
                  onClick={() => handleTransitionStatus('ARRIVED_AT_DONOR')}
                  disabled={actionLoading === 'ARRIVED_AT_DONOR'}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '999px', fontSize: '0.8rem' }}
                >
                  {actionLoading === 'ARRIVED_AT_DONOR' ? 'Updating...' : 'I Have Arrived at Donor Location'}
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenCollectionCamera}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                <Camera size={16} />
                <span>Start Food Collection</span>
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} />
              <span>Collection Evidence Validated by Backend</span>
            </div>
          )}
        </div>

        {/* STAGE TWO: Handover & NGO OTP Verification */}
        <div
          style={{
            border: `2px solid ${isDelivered ? '#10b981' : hasHandoverPhoto ? '#3b82f6' : '#cbd5e1'}`,
            borderRadius: '0.85rem',
            padding: '1.25rem',
            background: isDelivered ? '#f0fdf4' : hasHandoverPhoto ? '#eff6ff' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: isDelivered ? '#059669' : hasHandoverPhoto ? '#2563eb' : '#64748b',
                }}
              >
                Stage 2: NGO Handover & OTP
              </span>
              {isDelivered ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  ✓ Delivery Complete
                </span>
              ) : hasHandoverPhoto ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  ⏳ Awaiting NGO OTP
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {hasCollectionPhoto ? '● Ready for Handover' : 'Pending Step 1'}
                </span>
              )}
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              {mission.organization_name || 'Designated NGO Shelter'}
            </h4>

            <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={13} />
                <span>Receiving Shelter Facility</span>
              </div>
              <div>
                <strong>Handover Photo Evidence:</strong>{' '}
                <span style={{ color: hasHandoverPhoto ? '#2563eb' : '#64748b', fontWeight: 700 }}>
                  {hasHandoverPhoto ? 'Uploaded & Logged ✓' : 'Mandatory prior to OTP verification'}
                </span>
              </div>
              <div>
                <strong>NGO OTP Verification:</strong>{' '}
                <span style={{ color: isDelivered ? '#059669' : '#d97706', fontWeight: 700 }}>
                  {isDelivered ? 'Verified by Shelter Supervisor ✓' : 'Pending 60-Second OTP Entry'}
                </span>
              </div>
            </div>

            {/* Handover Photo Proof */}
            {hasHandoverPhoto && (
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                <img
                  src={verification.handover_photo_url}
                  alt="Handover Evidence"
                  style={{ width: '56px', height: '56px', borderRadius: '0.35rem', objectFit: 'cover' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                  <div style={{ fontWeight: 700, color: '#2563eb' }}>Handover Photograph Uploaded</div>
                  <div>
                    {verification.handover_timestamp
                      ? new Date(verification.handover_timestamp).toLocaleTimeString()
                      : 'Logged'}
                  </div>
                  {verification.handover_location?.lat && (
                    <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                      GPS: {verification.handover_location.lat.toFixed(4)}°N, {verification.handover_location.lng.toFixed(4)}°E
                    </div>
                  )}
                </div>
              </div>
            )}

            {otpSentMsg && (
              <div style={{ marginTop: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '0.45rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                ℹ️ {otpSentMsg}
              </div>
            )}
          </div>

          {/* Handover Action Buttons */}
          {!hasCollectionPhoto ? (
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Complete Stage 1 food collection first to unlock handover verification.
            </div>
          ) : !hasHandoverPhoto ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {status === 'PICKED_UP' && (
                <button
                  type="button"
                  onClick={() => handleTransitionStatus('IN_TRANSIT')}
                  disabled={actionLoading === 'IN_TRANSIT'}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '999px', fontSize: '0.8rem' }}
                >
                  {actionLoading === 'IN_TRANSIT' ? 'Updating...' : 'Start Transit to NGO Shelter'}
                </button>
              )}
              {status === 'IN_TRANSIT' && (
                <button
                  type="button"
                  onClick={() => handleTransitionStatus('ARRIVED_AT_NGO')}
                  disabled={actionLoading === 'ARRIVED_AT_NGO'}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '999px', fontSize: '0.8rem' }}
                >
                  {actionLoading === 'ARRIVED_AT_NGO' ? 'Updating...' : 'I Have Arrived at NGO Shelter'}
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenHandoverCamera}
                className="btn btn-primary"
                style={{
                  background: 'var(--brand-rose-gradient, linear-gradient(135deg, #f43f5e 0%, #e11d48 100%))',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  color: '#fff',
                }}
              >
                <Camera size={16} />
                <span>Capture Handover Photo</span>
              </button>
            </div>
          ) : !isDelivered ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#eff6ff', padding: '0.75rem 0.95rem', borderRadius: '0.65rem', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                  <KeyRound size={15} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e40af' }}>
                    Enter 6-Digit Handover Verification OTP
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#2563eb', margin: 0, lineHeight: 1.4 }}>
                  Ask the NGO representative for the 6-digit verification code received in their notification center to complete delivery handover.
                </p>
              </div>

              {/* 6-Digit OTP Entry Input & Submit Button */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={volunteerOtpInput}
                  onChange={(e) => setVolunteerOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{
                    flex: '1 1 140px',
                    minWidth: '130px',
                    letterSpacing: '0.3em',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid #2563eb',
                    background: '#ffffff',
                    outline: 'none',
                    color: '#0f172a',
                  }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={volunteerOtpInput.length !== 6 || actionLoading === 'verify'}
                  className="btn btn-primary"
                  style={{
                    background: '#059669',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 1.15rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: volunteerOtpInput.length !== 6 || actionLoading === 'verify' ? 'not-allowed' : 'pointer',
                    opacity: volunteerOtpInput.length !== 6 ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{actionLoading === 'verify' ? 'Verifying...' : 'Verify OTP & Mark Delivered'}</span>
                </button>
              </div>

              {/* Resend Handover OTP to NGO */}
              <button
                type="button"
                onClick={handleGenerateOrResendOtp}
                disabled={actionLoading === 'otp'}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '999px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', alignSelf: 'flex-start' }}
              >
                <RefreshCw size={13} className={actionLoading === 'otp' ? 'spin' : ''} />
                <span>Resend New 60s OTP to NGO</span>
              </button>
            </div>
          ) : (
            <div style={{ background: '#dcfce7', color: '#065f46', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} />
              <span>Delivery Verified by NGO Supervisor via OTP! Mission Complete.</span>
            </div>
          )}
        </div>
      </div>

      {/* Camera Capture Modal */}
      <EvidenceCameraModal
        isOpen={cameraModal.open}
        stage={cameraModal.stage}
        title={cameraModal.title}
        subtitle={cameraModal.subtitle}
        onClose={() => setCameraModal({ open: false, stage: 'COLLECTION' })}
        onCapture={handleCaptureSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
};
