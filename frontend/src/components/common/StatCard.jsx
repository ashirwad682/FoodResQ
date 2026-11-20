import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  label,
  value,
  subtext,
  icon: Icon,
  color = 'var(--brand-rose, #fb7185)',
  background = 'rgba(251, 113, 133, 0.12)',
  trend = null,
}) => {
  const cardTitle = title || label;

  return (
    <div
      className="card"
      style={{
        padding: '1.4rem 1.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.35rem',
          }}
        >
          {cardTitle}
        </div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {value != null ? value : '—'}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {trend != null && (
              <span
                style={{
                  color: trend >= 0 ? '#10b981' : '#ef4444',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(trend)}%
              </span>
            )}
            <span>{subtext}</span>
          </div>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}20`,
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
