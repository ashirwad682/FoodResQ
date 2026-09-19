import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartHandshake, LogIn, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Demo Logins
  const demoUsers = [
    { role: 'DONOR', name: 'Spice Garden (Donor)', user: 'donor_spice', pass: 'Donor@12345', color: '#10b981' },
    { role: 'NGO', name: 'Feed Hope Foundation', user: 'ngo_feedhope', pass: 'Ngo@12345', color: '#3b82f6' },
    { role: 'VOLUNTEER', name: 'Arun Kumar (Rider)', user: 'vol_arun', pass: 'Volunteer@12345', color: '#8b5cf6' },
    { role: 'ADMIN', name: 'Platform Admin', user: 'admin', pass: 'Admin@12345', color: '#f59e0b' },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      // Route based on role
      const role = data.user.role;
      const destination = location.state?.from?.pathname || (
        role === 'DONOR' ? '/donor/dashboard' :
        role === 'NGO' ? '/ngo/dashboard' :
        role === 'VOLUNTEER' ? '/volunteer/dashboard' : '/'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Invalid credentials. Please verify username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    login(user, pass)
      .then((data) => {
        const role = data.user.role;
        const destination =
          role === 'DONOR' ? '/donor/dashboard' :
          role === 'NGO' ? '/ngo/dashboard' :
          role === 'VOLUNTEER' ? '/volunteer/dashboard' : '/';
        navigate(destination, { replace: true });
      })
      .catch((err) => {
        setError('Demo authentication failed. Please try typing manually.');
      });
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem', background: 'var(--bg-alt)' }}>
      <div style={{ maxWidth: '460px', width: '100%' }}>
        {/* Card */}
        <div className="card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '1rem',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
            }}>
              <HeartHandshake size={28} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Welcome to FoodResQ
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Sign in to rescue meals and transform communities
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div style={{
            background: 'var(--bg-alt)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                1-Click Instant Demo Login
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {demoUsers.map((d) => (
                <button
                  key={d.user}
                  type="button"
                  onClick={() => handleDemoLogin(d.user, d.pass)}
                  className="btn btn-sm"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    fontSize: '0.75rem',
                    justifyContent: 'flex-start',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, display: 'inline-block', marginRight: '0.4rem' }}></span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.role}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username or Email</label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="e.g. donor_spice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <span>FSSAI Compliant & JWT 256-bit Encrypted Platform</span>
        </div>
      </div>
    </div>
  );
};
