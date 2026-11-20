import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ResQFood Simple & Professional Vector Emblem
 * Clean, iconic geometry: Matte Charcoal Squircle with minimalist Food Cloche & Rescue Heart.
 * 100% vector SVG: razor-sharp on all screens, zero raster pixelation, zero heavy blurs.
 */
export const ResQEmblem = ({ size = 32, isDark = false, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`resq-emblem-vector ${className}`}
    style={{
      flexShrink: 0,
      display: 'block',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))',
      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    }}
  >
    {/* Base Squircle Tile */}
    <rect width="48" height="48" rx="12" fill="url(#resqEmblemTileGrad)" />
    <rect
      x="0.75"
      y="0.75"
      width="46.5"
      height="46.5"
      rx="11.25"
      stroke="rgba(255, 255, 255, 0.14)"
      strokeWidth="1"
    />

    {/* Cloche Top Handle Knob */}
    <circle cx="24" cy="13.5" r="2.2" stroke="#ffffff" strokeWidth="2" fill="none" />

    {/* Food Cloche Dome Arc */}
    <path
      d="M12 28.5C12 20.5 17 16.5 24 16.5C31 16.5 36 20.5 36 28.5"
      stroke="#ffffff"
      strokeWidth="2.8"
      strokeLinecap="round"
    />

    {/* Serving Plate Horizon Bar */}
    <path
      d="M10 31.5H38"
      stroke="#ffffff"
      strokeWidth="2.8"
      strokeLinecap="round"
    />

    {/* Rescue Heart at Center of Cloche */}
    <path
      d="M24 27.2C24 27.2 19.8 23.8 19.8 21.6C19.8 20.2 20.9 19 22.3 19C23.1 19 23.7 19.4 24 19.9C24.3 19.4 24.9 19 25.7 19C27.1 19 28.2 20.2 28.2 21.6C28.2 23.8 24 27.2 24 27.2Z"
      fill="#ffffff"
    />

    {/* Supporting Rescue Care Arc */}
    <path
      d="M16 36.5C20.5 40 27.5 40 32 36.5"
      stroke="#a1a1aa"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <defs>
      <linearGradient id="resqEmblemTileGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#27272a" />
        <stop offset="50%" stopColor="#18181b" />
        <stop offset="100%" stopColor="#09090b" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * ResQFood Official Simple & Professional Brand Logo
 */
const BrandLogo = ({
  size = 'md',
  variant = 'hybrid', // 'hybrid' | 'emblem'
  theme = 'light', // 'light' | 'dark'
  subtitle = 'SMART FOOD RESCUE NETWORK',
  showTagline = true,
  to = '/',
  className = '',
  style = {},
}) => {
  // Proportional, balanced typography & emblem dimensions
  const sizeMap = {
    xs: { emblemSize: 24, textMain: '0.88rem', subText: '0.46rem', gap: '0.45rem' },
    sm: { emblemSize: 28, textMain: '0.98rem', subText: '0.50rem', gap: '0.5rem' },
    md: { emblemSize: 32, textMain: '1.08rem', subText: '0.52rem', gap: '0.55rem' },
    lg: { emblemSize: 40, textMain: '1.30rem', subText: '0.60rem', gap: '0.65rem' },
    xl: { emblemSize: 52, textMain: '1.65rem', subText: '0.70rem', gap: '0.8rem' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDark = theme === 'dark';

  // Emblem Only
  if (variant === 'emblem') {
    const emblem = <ResQEmblem size={currentSize.emblemSize} isDark={isDark} className={className} />;
    if (to) {
      return (
        <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', ...style }} title="ResQFood Home">
          {emblem}
        </Link>
      );
    }
    return emblem;
  }

  // Hybrid: Vector Emblem + Clean Modern Wordmark
  const content = (
    <div
      className={`brand-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentSize.gap,
        textDecoration: 'none',
        ...style,
      }}
    >
      <ResQEmblem size={currentSize.emblemSize} isDark={isDark} />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          className="brand-name-text"
          style={{
            fontSize: currentSize.textMain,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <span style={{ color: isDark ? '#ffffff' : '#09090b', fontWeight: 800 }}>ResQ</span>
          <span style={{ color: isDark ? '#a1a1aa' : '#52525b', fontWeight: 600, marginLeft: '2px' }}>Food</span>
        </div>

        {showTagline && (
          <div
            className="brand-tagline-text"
            style={{
              fontSize: currentSize.subText,
              color: isDark ? '#94a3b8' : '#71717a',
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              marginTop: '1.5px',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-block' }} title="ResQFood Platform Home">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
