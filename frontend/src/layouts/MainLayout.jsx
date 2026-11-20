import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import {
  HeartHandshake,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const MainLayout = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const isAdmin = Boolean(user && (String(user.role).toUpperCase() === 'ADMIN' || user.is_superuser));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (role === 'DONOR') return '/donor/dashboard';
    if (role === 'NGO') return '/ngo/dashboard';
    if (role === 'VOLUNTEER') return '/volunteer/dashboard';
    if (role === 'ADMIN') return '/admin';
    return '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Impact', path: '/impact' },
    { name: 'Food Safety', path: '/food-safety' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Floating Transparent Glass Island Navbar */}
      <div className="floating-glass-header-wrapper">
        <header className={`floating-glass-header ${scrolled ? 'is-scrolled' : ''}`}>
          {/* Brand Logo */}
          <BrandLogo
            variant="hybrid"
            theme="light"
            size="md"
            subtitle="SMART FOOD RESCUE NETWORK"
            to="/"
          />

          {/* Desktop Navigation Links (Frosted Glass Pill) */}
          <nav className="desktop-nav floating-glass-nav-pill">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`floating-glass-nav-link ${active ? 'is-active' : ''}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Status / Action Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="floating-glass-btn-join"
                  style={{ textDecoration: 'none' }}
                >
                  <LayoutDashboard size={15} />
                  <span>{role} Portal</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="floating-glass-btn-login"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="floating-glass-btn-login"
                >
                  <LogIn size={15} />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="floating-glass-btn-join nav-join-btn"
                >
                  <UserPlus size={15} />
                  <span>Join Platform</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn btn-secondary btn-sm mobile-menu-btn"
              style={{
                borderRadius: 'var(--radius-full)',
                width: '40px',
                height: '40px',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: 'var(--shadow-xs)',
              }}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <BrandLogo
            variant="hybrid"
            theme="light"
            size="sm"
            subtitle="SMART FOOD RESCUE"
            to="/"
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem' }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  color: active ? '#ffffff' : '#334155',
                  background: active
                    ? 'linear-gradient(135deg, #fb7185 0%, #f43f5e 55%, #e11d48 100%)'
                    : 'transparent',
                  fontWeight: active ? 800 : 600,
                  textDecoration: 'none',
                  boxShadow: active ? '0 4px 14px rgba(244, 63, 94, 0.35)' : 'none',
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <LayoutDashboard size={16} />
                <span>Go to {role} Portal</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary"
                style={{ width: '100%', background: '#1e293b', color: '#fff', borderColor: '#334155' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%', background: '#1e293b', color: '#fff', borderColor: '#334155' }}
              >
                <LogIn size={16} />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <UserPlus size={16} />
                <span>Join Platform</span>
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Main Page Body */}
      <main className={`main-public-content ${isLandingPage ? 'has-hero-landing' : ''}`}>
        <Outlet />
      </main>

      {/* Modern High-End Footer */}
      <footer
        style={{
          background: '#090d16',
          color: '#94a3b8',
          borderTop: '1px solid #1e293b',
          padding: '4rem 0 2rem',
          position: 'relative',
        }}
      >
        <div className="container">
          <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '3.5rem' }}>
            {/* Column 1: Brand & Purpose */}
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <BrandLogo
                  variant="hybrid"
                  theme="dark"
                  size="md"
                  subtitle="SMART FOOD RESCUE NETWORK"
                  to="/"
                />
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: '#94a3b8', marginBottom: '1.25rem' }}>
                Autonomous, closed-loop food recovery infrastructure uniting commercial kitchens, certified NGOs, and volunteer logistics networks in real-time.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', border: '1px solid #1e293b', fontSize: '0.78rem' }}>
                <span className="live-pulse" />
                <span style={{ color: '#fb7185', fontWeight: 600 }}>MongoDB Atlas Active</span>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div>
              <h4
                style={{
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Platform
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem' }}>
                <li><Link to="/how-it-works" style={{ color: '#94a3b8' }}>How Food Rescue Works</Link></li>
                <li><Link to="/impact" style={{ color: '#94a3b8' }}>Live Impact Dashboard</Link></li>
                <li><Link to="/food-safety" style={{ color: '#94a3b8' }}>Food Safety & Cold-Chain</Link></li>
                <li><Link to="/about" style={{ color: '#94a3b8' }}>Our Zero Waste Mission</Link></li>
                {isAdmin && (
                  <li>
                    <a
                      href="/api/docs/"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      Swagger API Docs <ExternalLink size={12} />
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 3: Stakeholder Portals */}
            <div>
              <h4
                style={{
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Ecosystem Portals
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem' }}>
                <li><Link to="/login" style={{ color: '#94a3b8' }}>Donor Kitchen Portal</Link></li>
                <li><Link to="/login" style={{ color: '#94a3b8' }}>NGO Food Bank Portal</Link></li>
                <li><Link to="/login" style={{ color: '#94a3b8' }}>Volunteer Driver Hub</Link></li>
                <li><Link to="/register" style={{ color: '#94a3b8' }}>Register Restaurant / NGO</Link></li>
                <li><Link to="/contact" style={{ color: '#94a3b8' }}>Community Support</Link></li>
              </ul>
            </div>

            {/* Column 4: Verification & Safety */}
            <div>
              <h4
                style={{
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Verification & Hotline
              </h4>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <ShieldCheck size={16} />
                  <span>FSSAI Compliant Operations</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                  All donations are temperature-screened, batch-logged, and delivered strictly under the 4-Hour Food Safety window.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Emergency Surplus Helpline</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>+91 (800) 456-RESQ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Simple & Professional Attribution Bar */}
          <div
            style={{
              borderTop: '1px solid #1e293b',
              paddingTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.86rem',
              color: '#94a3b8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>
                Backend & System Architecture by{' '}
                <strong style={{ color: '#34d399', fontWeight: 700 }}>Ashirwad Kumar</strong>
              </span>
              <span style={{ color: '#334155' }}>•</span>
              <span>
                UI & Frontend Design by{' '}
                <strong style={{ color: '#38bdf8', fontWeight: 700 }}>Ayush Kumar</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span>Django 5.x</span>
              <span>•</span>
              <span>React 18</span>
              <span>•</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>MongoDB Atlas Active</span>
            </div>
          </div>

          {/* Copyright & Legal Row */}
          <div
            style={{
              paddingTop: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.78rem',
              color: '#64748b',
            }}
          >
            <p>© {new Date().getFullYear()} ResQFood Network. All rights reserved.</p>
            <p>Certified FSSAI Surplus Redistribution Protocol</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
