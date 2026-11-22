import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  RefreshCw,
} from 'lucide-react';

export const EvidenceCameraModal = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Evidence Photograph',
  subtitle = 'Take a clear photograph of the food batch to document chain of custody.',
  stage = 'COLLECTION', // 'COLLECTION' or 'HANDOVER'
  isSubmitting = false,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('detecting'); // 'detecting', 'success', 'denied'
  const [notes, setNotes] = useState('');

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Direct camera stream requires a secure context (HTTPS) or device permission. You can still take/upload photos with the button below.');
      }

      let mediaStream;
      try {
        // First try rear environment camera (optimal for food batch verification)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
          audio: false,
        });
      } catch (constraintErr) {
        console.warn('FacingMode environment failed, trying standard video constraint:', constraintErr);
        // Fallback to any camera available (laptop webcam, front camera)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video auto-play suppressed:', e));
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera stream failed or permission denied:', err);
      let errorMsg = 'Unable to access live camera stream. Tap the button below to take or choose a photo from your device.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Tap the button below to take or select a photo.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found. Tap the button below to upload an evidence photo.';
      }
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Detect GPS Location
  const captureLocation = () => {
    setLocationStatus('detecting');
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp,
        });
        setLocationStatus('success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(null);
      setTimestamp(null);
      setNotes('');
      captureLocation();
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Capture Snapshot from Video
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    // Optimized 0.82 JPEG gives high quality evidence at under 250KB payload
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setPreviewUrl(dataUrl);
    setTimestamp(new Date().toISOString());
    stopCamera();
  };

  // File Upload / Mobile Native Camera Fallback with Client-Side Canvas Compression
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const maxDimension = 1280;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPreviewUrl(compressedDataUrl);
        setTimestamp(new Date().toISOString());
        stopCamera();
      };
      img.onerror = () => {
        setPreviewUrl(event.target.result);
        setTimestamp(new Date().toISOString());
        stopCamera();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Retake
  const handleRetake = () => {
    setPreviewUrl(null);
    setTimestamp(null);
    startCamera();
  };

  // Confirm and Submit
  const handleConfirm = () => {
    if (!previewUrl) return;
    onCapture({
      photo_data: previewUrl,
      timestamp: timestamp || new Date().toISOString(),
      location: location || {},
      notes: notes.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #fafafa, #ffffff)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  background: stage === 'COLLECTION' ? '#ecfdf5' : '#eff6ff',
                  color: stage === 'COLLECTION' ? '#059669' : '#2563eb',
                  border: `1px solid ${stage === 'COLLECTION' ? '#a7f3d0' : '#bfdbfe'}`,
                }}
              >
                {stage === 'COLLECTION' ? 'Stage 1: Collection Evidence' : 'Stage 2: Handover Evidence'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>• Mandatory Photo</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: '#475569',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
            {subtitle}
          </p>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              background: '#090d16',
              borderRadius: '0.85rem',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {/* Live Video */}
            {!previewUrl && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: cameraActive ? 'block' : 'none',
                  }}
                />
                {!cameraActive && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#cbd5e1' }}>
                    <Camera size={42} style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {cameraError ? 'Camera Stream Unavailable' : 'Initializing Camera...'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem', maxWidth: '320px', margin: '0.25rem auto 1rem' }}>
                      {cameraError || 'Allow camera permission or tap upload to choose a photo from your device.'}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn"
                      style={{
                        background: '#334155',
                        color: '#f8fafc',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                      }}
                    >
                      <UploadCloud size={16} />
                      <span>Select Photo from Device</span>
                    </button>
                  </div>
                )}

                {/* Viewfinder Target Overlay */}
                {cameraActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '20px',
                      border: '2px dashed rgba(255, 255, 255, 0.45)',
                      borderRadius: '0.5rem',
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.15rem 0.6rem', borderRadius: '4px' }}>
                      Align food batch inside frame
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                      Ready to capture
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Photo Preview */}
            {previewUrl && (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={previewUrl}
                  alt="Evidence Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                  <span>Evidence Photo Frozen</span>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Telemetry Stamps (GPS + Automatic Timestamp) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                <Clock size={14} style={{ color: '#64748b' }} />
                <span>Timestamp:</span>
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                {timestamp ? new Date(timestamp).toLocaleString() : 'Captured automatically on shutter'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                <MapPin size={14} style={{ color: locationStatus === 'success' ? '#059669' : '#d97706' }} />
                <span>GPS Location:</span>
              </div>
              <span style={{ fontWeight: 700, color: locationStatus === 'success' ? '#059669' : '#64748b' }}>
                {locationStatus === 'success' && location
                  ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E (±${location.accuracy}m)`
                  : locationStatus === 'detecting'
                  ? 'Acquiring satellite lock...'
                  : 'Location not granted (optional)'}
              </span>
            </div>
          </div>

          {/* Verification Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Verification Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                stage === 'COLLECTION'
                  ? 'e.g. 4 thermal containers, seal intact, verified with donor'
                  : 'e.g. Received by shelter intake manager, thermal check 68°C'
              }
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {!previewUrl ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline"
                style={{
                  borderRadius: '999px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                }}
              >
                <UploadCloud size={16} />
                <span>Upload Photo</span>
              </button>

              {cameraActive ? (
                <button
                  type="button"
                  onClick={handleSnap}
                  className="btn btn-primary"
                  style={{
                    background: 'var(--brand-rose-gradient, linear-gradient(135deg, #f43f5e 0%, #e11d48 100%))',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.65rem 1.75rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={18} />
                  <span>Capture Photo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                  style={{
                    background: 'var(--brand-rose-gradient, linear-gradient(135deg, #f43f5e 0%, #e11d48 100%))',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.65rem 1.75rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={18} />
                  <span>Take / Select Photo</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                disabled={isSubmitting}
                className="btn btn-outline"
                style={{
                  borderRadius: '999px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                }}
              >
                <RotateCcw size={15} />
                <span>Retake Photograph</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  background: '#059669',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.65rem 1.75rem',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Uploading Evidence...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Confirm & Upload Evidence</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
