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
  const [searchExpanded, setSearchExpanded] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K to trigger search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchExpanded((prev) => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
          accent: '#27272a',
          glow: 'rgba(0, 0, 0, 0.2)',
          quickAction: null,
          navItems: [],
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="resq-console-root">
      {/* Executive Unified Single-Row Dashboard Header */}
      <header className="resq-console-header">
        {/* Left: Mobile Trigger + Clean Brand Identity */}
        <div className="resq-header-left">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="resq-mobile-menu-trigger btn btn-secondary btn-sm"
            aria-label="Open portal navigation"
          >
            <Menu size={18} />
          </button>

          <BrandLogo
            variant="hybrid"
            theme="light"
            size="sm"
            showTagline={false}
            to="/"
          />
        </div>

        {/* Center: Integrated Segmented Navigation Tabs */}
        <nav className="resq-header-nav-segmented">
          {config.navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`resq-segmented-tab ${active ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="resq-nav-tab-badge">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Omnibar Search, Quick Action CTA, Notifications, User Menu */}
        <div className="resq-header-right">
          {/* Search: Compact Icon Button (Expands on click / ⌘K) */}
          {searchExpanded ? (
            <form onSubmit={handleSearchSubmit} className="resq-omnibar-box expanded" ref={searchBoxRef}>
              <Search size={14} style={{ color: '#71717a', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                className="resq-omnibar-input"
                placeholder={`Search ${role.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchExpanded(false);
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchExpanded(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                title="Close (Esc)"
              >
                <X size={14} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchExpanded(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="resq-search-icon-btn"
              title="Search (⌘K)"
              aria-label="Quick Search"
            >
              <Search size={16} />
            </button>
          )}

          {/* Quick Action Button */}
          {config.quickAction && (
            config.quickAction.external ? (
              <a
                href={config.quickAction.path}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm resq-header-quick-action"
                style={{
                  background: '#ffffff',
                  color: '#09090b',
                  border: '1px solid #e4e4e7',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.80rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 0.95rem',
                  boxShadow: 'var(--shadow-xs)',
                  whiteSpace: 'nowrap',
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
                  background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.80rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 1rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.16)',
                  whiteSpace: 'nowrap',
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
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f4f4f5',
                border: '1px solid #e4e4e7',
                color: '#3f3f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    width: '17px',
                    height: '17px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
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
                  top: '46px',
                  right: 0,
                  width: 'min(360px, calc(100vw - 2rem))',
                  maxWidth: 'calc(100vw - 2rem)',
                  background: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                  zIndex: 80,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#09090b' }}>
                    Notifications ({unreadCount} new)
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ background: 'none', border: 'none', color: '#27272a', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
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
                          background: notif.is_read ? 'transparent' : 'rgba(0, 0, 0, 0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.84rem', fontWeight: notif.is_read ? 600 : 800, color: '#09090b' }}>
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
                    style={{ fontSize: '0.78rem', color: '#18181b', fontWeight: 700, textDecoration: 'none' }}
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
                gap: '0.5rem',
                background: '#f4f4f5',
                border: '1px solid #e4e4e7',
                borderRadius: 'var(--radius-full)',
                padding: '0.28rem 0.65rem 0.28rem 0.35rem',
                cursor: 'pointer',
                color: '#09090b',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                }}
              >
                {user?.first_name ? user.first_name[0] : (user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <span className="desktop-username" style={{ fontSize: '0.82rem', fontWeight: 700, maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name || user?.username}
              </span>
              <ChevronDown size={13} style={{ color: '#71717a' }} />
            </button>

            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '250px',
                  background: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                  zIndex: 80,
                  padding: '0.5rem',
                }}
              >
                <div style={{ padding: '0.75rem 0.85rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b' }}>
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {user?.email || `${user?.username}@resqfood.org`}
                  </div>
                  <div style={{ marginTop: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#18181b', fontSize: '0.72rem', fontWeight: 800 }}>
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
