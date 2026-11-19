import React from 'react';
import { Clock, MapPin, Users, Utensils, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { formatHoursLeft } from '../../utils/formatters';

export const DonationCard = ({ donation, actionButton }) => {
  const isUrgent = donation.hours_until_expiry != null && donation.hours_until_expiry <= 4;
  const isExpired = donation.status === 'EXPIRED' || donation.is_expired;

  const priorityLevel = typeof donation.priority === 'object'
    ? donation.priority?.priority_level
    : (donation.priority || null);

  const getPriorityBadgeClass = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'badge-CRITICAL';
      case 'HIGH':
        return 'badge-HIGH';
      case 'MEDIUM':
        return 'badge-MEDIUM';
      default:
        return 'badge-NORMAL';
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: isUrgent && !isExpired ? '4px solid #f59e0b' : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: '#ffffff',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
    >
      <div>
        {/* Top Badges & Urgency */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${donation.status}`}>
              {donation.status?.replace('_', ' ')}
            </span>
            {priorityLevel && (
              <span className={`badge ${getPriorityBadgeClass(priorityLevel)}`}>
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
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
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
            fontWeight: 700,
            marginBottom: '0.4rem',
            color: 'var(--text-primary)',
            lineHeight: 1.3,
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
          {donation.description || 'Fresh surplus food available for immediate rescue and distribution to verified shelters.'}
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
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Utensils size={14} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{donation.quantity_kg} kg</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantity</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Users size={14} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ~{donation.serves_count || Math.round(donation.quantity_kg * 2.5)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Servings</div>
            </div>
          </div>
        </div>

        {/* Location / Donor address */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          <MapPin size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {donation.pickup_address}
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
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
              {donation.food_type.replace('_', ' ')}
            </span>
          )}
          {donation.dietary_flags && donation.dietary_flags.slice(0, 2).map((flag) => (
            <span key={flag} style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
              {flag}
            </span>
          ))}
        </div>
        <div>
          {actionButton}
        </div>
      </div>
    </div>
  );
};
