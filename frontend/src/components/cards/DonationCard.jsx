import React from 'react';
import { Clock, MapPin, Users, Utensils, AlertTriangle, ShieldCheck, Flame, ArrowRight } from 'lucide-react';
import { formatHoursLeft } from '../../utils/formatters';

export const DonationCard = ({ donation, actionButton, actionLabel, onAction }) => {
  const isUrgent = donation.hours_until_expiry != null && donation.hours_until_expiry <= 4;
  const isExpired = donation.status === 'EXPIRED' || donation.is_expired;

  const priorityLevel =
    typeof donation.priority === 'object'
      ? donation.priority?.priority_level
      : donation.priority || null;

  const getPriorityStyle = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
      case 'HIGH':
        return { bg: '#fffbeb', border: '#fde68a', text: '#d97706' };
      case 'MEDIUM':
        return { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' };
      default:
        return { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' };
    }
  };

  const priorityStyle = getPriorityStyle(priorityLevel);

  return (
    <div
      className="card"
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-lg)',
        background: '#ffffff',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
    >
      <div>
        {/* Top Badges & Urgency */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background:
                  donation.status === 'AVAILABLE'
                    ? '#ecfdf5'
                    : donation.status === 'COMPLETED'
                    ? '#f1f5f9'
                    : donation.status === 'REQUESTED'
                    ? '#fffbeb'
                    : '#eff6ff',
                color:
                  donation.status === 'AVAILABLE'
                    ? '#059669'
                    : donation.status === 'COMPLETED'
                    ? '#475569'
                    : donation.status === 'REQUESTED'
                    ? '#d97706'
                    : '#2563eb',
                border: `1px solid ${
                  donation.status === 'AVAILABLE'
                    ? '#a7f3d0'
                    : donation.status === 'COMPLETED'
                    ? '#cbd5e1'
                    : donation.status === 'REQUESTED'
                    ? '#fde68a'
                    : '#bfdbfe'
                }`,
              }}
            >
              {donation.status?.replace('_', ' ')}
            </span>

            {priorityLevel && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: priorityStyle.bg,
                  color: priorityStyle.text,
                  border: `1px solid ${priorityStyle.border}`,
                }}
              >
                {priorityLevel}
              </span>
            )}
          </div>

          {donation.hours_until_expiry != null && !isExpired && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: isUrgent ? '#b45309' : '#047857',
                background: isUrgent ? '#fffbeb' : '#ecfdf5',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: isUrgent ? '1px solid #fde68a' : '1px solid #a7f3d0',
              }}
            >
              <Clock size={12} />
              <span>{formatHoursLeft(donation.hours_until_expiry)}</span>
            </span>
          )}
        </div>

        {/* Title & Food Category */}
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            marginBottom: '0.4rem',
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            fontFamily: 'var(--font-heading)',
          }}
        >
          {donation.title}
        </h3>

        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {donation.description || 'Verified commercial food surplus available for immediate shelter rescue and community distribution.'}
        </p>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.6rem',
            marginBottom: '1rem',
            background: 'var(--bg-alt)',
            padding: '0.75rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Utensils size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {donation.quantity_kg} kg
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantity</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Users size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ~{donation.serves_count || Math.round(donation.quantity_kg * 2.5)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Meals</div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.1rem' }}>
          <MapPin size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {donation.pickup_address || 'Kitchen Pickup Address on file'}
          </span>
        </div>
      </div>

      {/* Action Footer & Dietary Tags */}
      <div
        style={{
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {donation.food_type && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                background: '#f1f5f9',
                color: '#475569',
              }}
            >
              {donation.food_type.replace('_', ' ')}
            </span>
          )}
          {donation.dietary_flags &&
            donation.dietary_flags.slice(0, 2).map((flag) => (
              <span
                key={flag}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f1f5f9',
                  color: '#475569',
                }}
              >
                {flag}
              </span>
            ))}
        </div>
        <div>
          {actionButton || (
            onAction && (
              <button
                onClick={() => onAction(donation)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
              >
                <span>{actionLabel || 'View Details'}</span>
                <ArrowRight size={14} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
