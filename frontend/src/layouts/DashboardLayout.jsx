import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import BrandLogo from '../components/common/BrandLogo';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Inbox,
  Bell,
  User,
  ShoppingBag,
  Sparkles,
  Truck,
  CheckCircle2,
  Building2,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Search,
  ShieldCheck,
  ChevronDown,
  Activity,
  History,
  FileCheck,
  Sliders,
  Database,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (role === 'DONOR') {
      navigate(`/donor/donations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (role === 'NGO') {
      navigate(`/ngo/available-food?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (role === 'VOLUNTEER') {
      navigate(`/volunteer/pickups?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/admin`);
    }
  };

  // Role Configuration: Colors, Labels, and Segmented Navigation Items
  const getRoleConfig = () => {
    switch (role) {
      case 'DONOR':
        return {
          title: 'Commercial Kitchen Console',
          accent: '#10b981',
          glow: 'rgba(16, 185, 129, 0.4)',
          quickAction: { label: '+ Post Surplus Food', path: '/donor/donate', icon: PlusCircle },
          navItems: [
            { label: 'Overview', path: '/donor/dashboard', icon: LayoutDashboard },
            { label: 'Post Food', path: '/donor/donate', icon: PlusCircle },
            { label: 'Surplus Inventory', path: '/donor/donations', icon: Package },
            { label: 'Pickup Requests', path: '/donor/requests', icon: Inbox },
            { label: 'Kitchen Profile', path: '/donor/profile', icon: User },
          ],
        };
      case 'NGO':
        return {
          title: 'Shelter Food Bank Console',
          accent: '#0284c7',
          glow: 'rgba(2, 132, 199, 0.4)',
          quickAction: { label: 'Browse Surplus', path: '/ngo/available-food', icon: ShoppingBag },
          navItems: [
            { label: 'Shelter Hub', path: '/ngo/dashboard', icon: LayoutDashboard },
            { label: 'Surplus Marketplace', path: '/ngo/available-food', icon: ShoppingBag },
            { label: 'AI Urgent Matches', path: '/ngo/priority-donations', icon: Sparkles },
            { label: 'My Requests', path: '/ngo/my-requests', icon: Inbox },
            { label: 'Active Inbound', path: '/ngo/active-deliveries', icon: Truck },
            { label: 'Rescue History', path: '/ngo/history', icon: CheckCircle2 },
            { label: 'Shelter Profile', path: '/ngo/profile', icon: Building2 },
          ],
        };
      case 'VOLUNTEER':
        return {
          title: 'Courier Dispatch Cockpit',
          accent: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.4)',
          quickAction: { label: 'Find Pickups', path: '/volunteer/pickups', icon: Package },
          navItems: [
            { label: 'Courier Cockpit', path: '/volunteer/dashboard', icon: LayoutDashboard },
            { label: 'Open Missions', path: '/volunteer/pickups', icon: Package },
            { label: 'In-Flight Mission', path: '/volunteer/active-delivery', icon: Truck },
            { label: 'Completed Deliveries', path: '/volunteer/completed', icon: CheckCircle2 },
            { label: 'Courier Profile', path: '/volunteer/profile', icon: User },
          ],
        };
      case 'ADMIN':
        return {
          title: 'Platform Governance & Command',
          accent: '#8b5cf6',
          glow: 'rgba(139, 92, 246, 0.4)',
          quickAction: { label: 'API Swagger Docs', path: '/api/docs/', external: true, icon: ExternalLink },
          navItems: [
            { label: 'Mission Control', path: '/admin', icon: LayoutDashboard },
            { label: 'Surplus Batches', path: '/donor/donations', icon: Package },
            { label: 'Marketplace View', path: '/ngo/available-food', icon: ShoppingBag },
            { label: 'Open Pickups Feed', path: '/volunteer/pickups', icon: Truck },
          ],
        };
      default:
        return {
          title: 'ResQFood Console',
          accent: '#fb7185',
          glow: 'rgba(244, 63, 94, 0.4)',
          quickAction: null,
          navItems: [],
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="resq-console-root">
      {/* 1. Executive Top Glass Navigation Bar */}
      <header className="resq-console-header">
        {/* Left: Brand Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="resq-mobile-menu-trigger btn btn-secondary btn-sm"
            aria-label="Open portal navigation"
          >
            <Menu size={20} />
          </button>

          <BrandLogo
            variant="hybrid"
            theme="light"
            size="md"
            subtitle={config.title.toUpperCase()}
            to="/"
          />
        </div>

        {/* Center: Omnibar Universal Quick Search */}
        <form onSubmit={handleSearchSubmit} className="resq-omnibar-box">
          <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            type="text"
            className="resq-omnibar-input"
            placeholder={`Search ${role.toLowerCase()} operations, batches, or locations...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="resq-kbd-hint">⌘K</span>
        </form>

        {/* Right: Quick Action, Notification Bell, User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Quick Action Button */}
          {config.quickAction && (
            config.quickAction.external ? (
              <a
                href={config.quickAction.path}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <span>{config.quickAction.label}</span>
                <ExternalLink size={13} />
              </a>
            ) : (
              <Link
                to={config.quickAction.path}
                className="btn btn-sm resq-header-quick-action"
                style={{
                  background: 'var(--brand-rose-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1.05rem',
                  boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                }}
              >
                <config.quickAction.icon size={14} />
                <span className="resq-quick-action-label">{config.quickAction.label}</span>
              </Link>
            )
          )}

          {/* Notifications Center Bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-xs)',
              }}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.66rem',
                    fontWeight: 900,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: 'min(360px, calc(100vw - 2rem))',
                  maxWidth: 'calc(100vw - 2rem)',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                  zIndex: 80,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '0.9rem 1.1rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                    Notifications ({unreadCount} new)
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                      No notifications right now
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        style={{
                          padding: '0.85rem 1.1rem',
                          borderBottom: '1px solid #f1f5f9',
                          background: notif.is_read ? 'transparent' : 'rgba(251, 113, 133, 0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.84rem', fontWeight: notif.is_read ? 600 : 800, color: '#0f172a' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                          {notif.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <Link
                    to={role === 'DONOR' ? '/donor/notifications' : role === 'NGO' ? '/ngo/notifications' : role === 'VOLUNTEER' ? '/volunteer/notifications' : '/admin'}
                    onClick={() => setShowNotifDropdown(false)}
                    style={{ fontSize: '0.78rem', color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }} ref={userRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.75rem 0.35rem 0.45rem',
                cursor: 'pointer',
                color: '#0f172a',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
                  border: `1.5px solid rgba(251, 237, 228, 0.4)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}
              >
                {user?.first_name ? user.first_name[0] : (user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <span className="desktop-username" style={{ fontSize: '0.84rem', fontWeight: 700, maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name || user?.username}
              </span>
              <ChevronDown size={14} style={{ color: '#94a3b8' }} />
            </button>

            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '250px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                  zIndex: 80,
                  padding: '0.5rem',
                }}
              >
                <div style={{ padding: '0.75rem 0.85rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {user?.email || `${user?.username}@resqfood.org`}
                  </div>
                  <div style={{ marginTop: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#e11d48', fontSize: '0.72rem', fontWeight: 800 }}>
                    <ShieldCheck size={13} />
                    <span>{role} Verified Partner</span>
                  </div>
                </div>

                <Link
                  to={role === 'DONOR' ? '/donor/profile' : role === 'NGO' ? '/ngo/profile' : role === 'VOLUNTEER' ? '/volunteer/profile' : '/admin'}
                  onClick={() => setShowUserDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#334155',
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <User size={15} />
                  <span>Profile & Compliance</span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#ef4444',
                    fontSize: '0.84rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Fluid Horizontal Segmented Command Rail */}
      <nav className="resq-command-rail">
        <div className="resq-command-rail-inner">
          {config.navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`resq-nav-tab ${active ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="resq-nav-tab-badge">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. Mobile Slide-Out Drawer Navigation */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 99,
          }}
        />
      )}

      <div className={`resq-mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <BrandLogo variant="hybrid" theme="light" size="sm" subtitle={config.title.toUpperCase()} to="/" />
          <button
            onClick={() => setMobileDrawerOpen(false)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            aria-label="Close navigation drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
          {config.navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`resq-nav-tab ${active ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge > 0 && <span className="resq-nav-tab-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: '#ef4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 4. Console Main Content Area */}
      <main className="resq-console-body">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* 5. Mobile Bottom Tab Bar */}
      <div className="dashboard-mobile-bottom-bar">
        {config.navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                color: active ? '#09090b' : '#94a3b8',
                fontWeight: active ? 800 : 500,
                fontSize: '0.68rem',
                textDecoration: 'none',
              }}
            >
              <Icon size={20} color={active ? config.accent : '#94a3b8'} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
