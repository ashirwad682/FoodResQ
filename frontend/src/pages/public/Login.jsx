import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';
import {
  HeartHandshake,
  LogIn,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Building2,
  Truck,
  Award,
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0' ||
      window.location.hostname.endsWith('.localhost'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  // Pre-configured Demo Accounts
  const demoUsers = [
    {
      role: 'DONOR',
      label: 'The Spice Garden',
      user: 'donor_spice',
      pass: 'Donor@12345',
      icon: Building2,
      tag: 'Restaurant',
      color: '#27272a',
      bg: 'rgba(24, 24, 27, 0.08)',
    },
    {
      role: 'NGO',
      label: 'FeedHope Foundation',
      user: 'ngo_feedhope',
      pass: 'Ngo@12345',
      icon: HeartHandshake,
      tag: 'Food Bank',
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      role: 'VOLUNTEER',
      label: 'Arun Kumar',
      user: 'vol_arun',
      pass: 'Volunteer@12345',
      icon: Truck,
      tag: 'Rescue Rider',
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      role: 'ADMIN',
      label: 'Platform Admin',
      user: 'admin',
      pass: 'Admin@12345',
      icon: ShieldCheck,
      tag: 'Superuser',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await login(username.trim(), password);
      const role = data.user.role;
      const destination = location.state?.from?.pathname || (
        role === 'DONOR' ? '/donor/dashboard' :
        role === 'NGO' ? '/ngo/dashboard' :
        role === 'VOLUNTEER' ? '/volunteer/dashboard' :
        role === 'ADMIN' ? '/admin' : '/'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      const apiMsg = err.response?.data?.detail || err.response?.data?.error;
      setError(apiMsg || 'Invalid credentials. Please verify your username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demo) => {
    if (!isLocalhost) return;
    setSelectedDemo(demo.role);
    setUsername(demo.user);
    setPassword(demo.pass);
    setError('');
    setLoading(true);

    try {
      const data = await login(demo.user, demo.pass);
      const role = data.user.role;
      const destination =
        role === 'DONOR' ? '/donor/dashboard' :
        role === 'NGO' ? '/ngo/dashboard' :
        role === 'VOLUNTEER' ? '/volunteer/dashboard' :
        role === 'ADMIN' ? '/admin' : '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError('Local demo account authentication failed. Verify pre-seeded database records.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        background: 'linear-gradient(135deg, #fbfbfd 0%, #fffbfb 45%, #fdf5f2 80%, #ffffff 100%)',
        color: 'var(--text-primary)',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1040px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(24, 24, 27, 0.12)',
          background: '#ffffff',
        }}
      >
        {/* Left Hero Column - Illustration */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #fffbfb 0%, #fdf5f2 100%)',
            padding: '1.5rem',
            minHeight: '480px',
          }}
        >
          {/* Ambient blurred backdrop so the container feels unified */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: "url('/images/login_hero.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(28px) brightness(0.95) opacity(0.35)',
              transform: 'scale(1.25)',
              pointerEvents: 'none',
            }}
          />

          <img
            src="/images/login_hero.jpg"
            alt="ResQFood • Rescue Surplus, Nourish Lives"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: '100%',
              maxHeight: '560px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(24, 24, 27, 0.12)',
              display: 'block',
            }}
          />
        </div>

        {/* Right Form Column */}
        <div
          style={{
            padding: '3rem 2.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#ffffff',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <BrandLogo
                variant="hybrid"
                theme="light"
                size="md"
                subtitle="SMART FOOD RESCUE NETWORK"
                to="/"
              />
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#18181b',
                background: 'rgba(24, 24, 27, 0.06)',
                border: '1px solid rgba(24, 24, 27, 0.15)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Secure Stakeholder Access
            </span>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '0.35rem',
              }}
            >
              Sign In to Your Account
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isLocalhost
                ? 'Enter your registered credentials or select a pre-seeded local role below.'
                : 'Enter your registered account credentials to authenticate against the database.'}
            </p>
          </div>

          {/* Quick Demo Selector — Enabled ONLY on Localhost for Development */}
          {isLocalhost && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={15} color="var(--primary)" />
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    1-Click Role Switcher (Pre-Seeded)
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: 'rgba(24, 24, 27, 0.08)',
                      color: 'var(--brand-rose)',
                      border: '1px solid rgba(24, 24, 27, 0.15)',
                      padding: '0.12rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Localhost Only
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-logs in</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                }}
              >
                {demoUsers.map((d) => {
                  const Icon = d.icon;
                  const isSelected = selectedDemo === d.role;
                  return (
                    <button
                      key={d.role}
                      type="button"
                      onClick={() => handleDemoSelect(d)}
                      style={{
                        background: isSelected ? d.bg : '#ffffff',
                        border: `1.5px solid ${isSelected ? d.color : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '0.6rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      }}
                      title={`Login as ${d.role}`}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: d.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: d.color,
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} />
                      </div>
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {d.role}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {d.tag}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: 'var(--danger)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.25rem',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="username"
                style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Username or Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <User size={17} />
                </div>
                <input
                  id="username"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem', height: '46px', fontSize: '0.92rem' }}
                  placeholder="e.g. donor_spice, vol_arun"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label
                  className="form-label"
                  htmlFor="password"
                  style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Password
                </label>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => alert('Demo passwords follow the standard pattern: Donor@12345, Ngo@12345, Volunteer@12345, Admin@12345.')}
                >
                  Default credentials?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={17} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem', height: '46px', fontSize: '0.92rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '48px',
                marginTop: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            Don't have an enterprise account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Register here
            </Link>
          </div>

          {/* Security footnote */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <ShieldCheck size={14} color="var(--primary)" />
            <span>256-bit JWT Encryption • MongoDB Atlas Cloud Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
