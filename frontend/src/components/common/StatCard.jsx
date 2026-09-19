import React from 'react';

export const StatCard = ({
  title,
  label,
  value,
  subtext,
  icon: Icon,
  color = '#10b981',
  background = 'rgba(16, 185, 129, 0.1)',
  trend = null,
}) => {
  const cardTitle = title || label;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.4rem 1.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.35rem',
          }}
        >
          {cardTitle}
        </div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {trend && (
              <span style={{ color: trend.startsWith('+') ? 'var(--primary)' : 'var(--danger)', fontWeight: 700 }}>
                {trend}
              </span>
            )}
            <span>{subtext}</span>
          </div>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            flexShrink: 0,
            boxShadow: `0 4px 12px ${color}20`,
            transition: 'transform 0.2s ease',
          }}
        >
          <Icon size={26} />
        </div>
      )}
    </div>
  );
};
