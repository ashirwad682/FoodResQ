import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * ResQFood Official Animated Brand Logo Component
 * Matches the website's signature Rose Coral (#fb7185 / #f43f5e) & Warm Silk Cream (#fdf5ee / #fbede4) color scheme.
 * Features continuous GIF-like animations: rotating aura, diagonal sheen sweep, floating pulse, and star twinkle.
 */
const BrandLogo = ({
  size = 'md',
  variant = 'hybrid', // 'hybrid' | 'image' | 'emblem'
  theme = 'light', // 'light' | 'dark'
  subtitle = 'SMART FOOD RESCUE NETWORK',
  showTagline = true,
  animated = true,
  to = '/',
  className = '',
  style = {},
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Size configurations
  const sizeMap = {
    xs: { emblemSize: 30, textMain: '1rem', subText: '0.54rem', sparkleSize: 10, imgHeight: 28 },
    sm: { emblemSize: 36, textMain: '1.18rem', subText: '0.58rem', sparkleSize: 12, imgHeight: 34 },
    md: { emblemSize: 44, textMain: '1.38rem', subText: '0.64rem', sparkleSize: 14, imgHeight: 42 },
    lg: { emblemSize: 56, textMain: '1.75rem', subText: '0.72rem', sparkleSize: 17, imgHeight: 54 },
    xl: { emblemSize: 76, textMain: '2.4rem', subText: '0.82rem', sparkleSize: 22, imgHeight: 74 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDark = theme === 'dark';

  // Render the Animated GIF-like Emblem Badge
  const renderEmblem = (customClass = '') => (
    <div
      className={`brand-emblem-aura-container ${animated ? 'is-animated' : ''} ${customClass}`}
      style={{
        width: `${currentSize.emblemSize}px`,
        height: `${currentSize.emblemSize}px`,
        borderRadius: `${Math.round(currentSize.emblemSize * 0.28)}px`,
      }}
    >
      {/* 1. Animated Conic Gradient Aura Ring */}
      <div
        className="brand-emblem-aura-ring"
        style={{
          borderRadius: `${Math.round(currentSize.emblemSize * 0.32)}px`,
        }}
      />

      {/* 2. The Core Jewel Badge with Rose Coral & Silk Cream Gradient */}
      <div
        className="brand-emblem-badge"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: `${Math.round(currentSize.emblemSize * 0.28)}px`,
          background: isDark
            ? 'linear-gradient(135deg, #e11d48 0%, #be123c 55%, #881337 100%)'
            : 'linear-gradient(135deg, #fb7185 0%, #f43f5e 55%, #e11d48 100%)',
          border: '1.5px solid rgba(253, 245, 238, 0.75)',
        }}
      >
        {/* 3. Animated Diagonal Glass Sheen Sweep */}
        <div className="brand-emblem-sheen-sweep" />

        {/* 4. Twinkling Diamond Star Sparkle */}
        <svg
          className="brand-emblem-sparkle"
          style={{
            width: `${currentSize.sparkleSize}px`,
            height: `${currentSize.sparkleSize}px`,
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
            fill="url(#sparkleGradientRoseSilk)"
          />
          <defs>
            <linearGradient id="sparkleGradientRoseSilk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fdf5ee" />
              <stop offset="100%" stopColor="#fbede4" />
            </linearGradient>
          </defs>
        </svg>

        {/* 5. Official RQ Emblem (Luminous White & Warm Silk Cream Metallic) */}
        <img
          src="/images/resqfood_emblem_white_silk.png"
          alt="ResQFood"
          className="brand-emblem-img"
          onError={(e) => {
            // Fallback to rose silk emblem if white silk not accessible
            e.currentTarget.src = '/images/resqfood_emblem_rose_silk.png';
          }}
        />
      </div>
    </div>
  );

  // If variant === 'emblem'
  if (variant === 'emblem') {
    const emblemOnly = renderEmblem(className);
    if (to) {
      return (
        <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', ...style }} title="ResQFood Home">
          {emblemOnly}
        </Link>
      );
    }
    return emblemOnly;
  }

  // If variant === 'image'
  if (variant === 'image' && !imageFailed) {
    const imageContent = (
      <div
        className={`brand-logo-wrap ${className}`}
        style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      >
        <img
          src={isDark ? '/images/resqfood_logo_transparent.png' : '/images/resqfood_logo_tight.png'}
          alt="ResQFood — Smart Food Rescue Network"
          style={{
            height: `${currentSize.imgHeight}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 14px rgba(244, 63, 94, 0.35))',
            transition: 'transform 0.25s ease',
          }}
          onError={() => setImageFailed(true)}
        />
      </div>
    );

    if (to) {
      return (
        <Link to={to} style={{ textDecoration: 'none', display: 'inline-block' }} title="ResQFood Home">
          {imageContent}
        </Link>
      );
    }
    return imageContent;
  }

  // Hybrid variant (Emblem Badge + High-Precision Wordmark & Animated Gradient Tagline)
  const hybridContent = (
    <div
      className={`brand-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'xs' ? '0.5rem' : size === 'sm' ? '0.65rem' : '0.8rem',
        ...style,
      }}
    >
      {/* Animated Emblem Badge */}
      {renderEmblem()}

      {/* Brand Wordmark & Dynamic Tagline */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          className="brand-name-text"
          style={{
            fontSize: currentSize.textMain,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: isDark ? '#ffffff' : '#0f172a',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <span>ResQ</span>
          <span
            className="brand-text-animated-gradient"
            style={{
              marginLeft: '2px',
              fontWeight: 900,
            }}
          >
            Food
          </span>
        </div>

        {showTagline && (
          <div
            className="brand-tagline-text"
            style={{
              fontSize: currentSize.subText,
              color: isDark ? '#cbd5e1' : '#64748b',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '2px',
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
        {hybridContent}
      </Link>
    );
  }

  return hybridContent;
};

export default BrandLogo;
