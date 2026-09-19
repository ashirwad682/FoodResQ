import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  HeartHandshake,
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
  MapPin,
  Clock,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => !prev);
    }
  };

  const getRoleMenuItems = () => {
    if (role === 'DONOR') {
      return [
        { label: 'Donor Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
        { label: 'Donate Food', path: '/donor/donate', icon: PlusCircle },
        { label: 'My Donations', path: '/donor/donations', icon: Package },
        { label: 'Pickup Requests', path: '/donor/requests', icon: Inbox },
        { label: 'Notifications', path: '/donor/notifications', icon: Bell },
        { label: 'Kitchen Profile', path: '/donor/profile', icon: User },
      ];
    } else if (role === 'NGO') {
      return [
        { label: 'NGO Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
        { label: 'Available Food', path: '/ngo/available-food', icon: ShoppingBag },
        { label: 'Priority Matches', path: '/ngo/priority-donations', icon: Sparkles },
        { label: 'My Requests', path: '/ngo/my-requests', icon: Inbox },
        { label: 'Active Deliveries', path: '/ngo/active-deliveries', icon: Truck },
        { label: 'Donation History', path: '/ngo/history', icon: CheckCircle2 },
        { label: 'Organization Profile', path: '/ngo/profile', icon: Building2 },
      ];
    } else if (role === 'VOLUNTEER') {
      return [
        { label: 'Volunteer Hub', path: '/volunteer/dashboard', icon: LayoutDashboard },
        { label: 'Available Pickups', path: '/volunteer/pickups', icon: Package },
        { label: 'Active Delivery', path: '/volunteer/active-delivery', icon: Truck },
        { label: 'Completed Tasks', path: '/volunteer/completed', icon: CheckCircle2 },
        { label: 'Volunteer Profile', path: '/volunteer/profile', icon: User },
      ];
    } else if (role === 'ADMIN') {
      return [
        { label: 'Admin Command', path: '/admin', icon: LayoutDashboard },
        { label: 'All Donations', path: '/donor/donations', icon: Package },
        { label: 'Available Food', path: '/ngo/available-food', icon: ShoppingBag },
      ];
    }
    return [];
  };

  const menuItems = getRoleMenuItems();

  return (
    <div className="dashboard-container">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${desktopCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
      >
        {/* Logo / Brand Header */}
        <div
          className="sidebar-logo-box"
          style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              overflow: 'hidden',
            }}
            title="FoodResQ Platform Home"
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                flexShrink: 0,
              }}
            >
              <HeartHandshake size={22} />
            </div>
            <div className="sidebar-text-hide">
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                Food<span style={{ color: 'var(--primary)' }}>ResQ</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                {role} Portal
              </div>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{ display: 'none', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            className="mobile-close-btn"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card with Live Indicator */}
        <div
          className="sidebar-user-box"
          style={{
            padding: '1.1rem 1.25rem',
            background: '#1e293b',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
          title={user?.first_name ? `${user.first_name} ${user.last_name || ''} (${role})` : `${user?.username} (${role})`}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#3b82f6',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.92rem',
              }}
            >
              {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #1e293b',
              }}
            />
          </div>
          <div className="sidebar-text-hide" style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
              <span>● {role}</span>
              {user?.is_verified && <span style={{ color: '#38bdf8' }}>✓ Verified</span>}
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="sidebar-item-link"
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#ffffff' : '#94a3b8',
                  background: active ? 'var(--primary-gradient)' : 'transparent',
                  textDecoration: 'none',
                  boxShadow: active ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={18} style={{ color: active ? '#fff' : '#94a3b8', flexShrink: 0 }} />
                <span className="sidebar-text-hide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1.1rem 1.25rem', borderTop: '1px solid #1e293b' }}>
          <Link
            to="/"
            className="sidebar-item-link"
            title="Return to Public Website"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#94a3b8',
              fontSize: '0.82rem',
              marginBottom: '0.85rem',
              textDecoration: 'none',
              padding: '0.4rem 0',
            }}
          >
            <span className="sidebar-text-hide">Public Website</span>
            <ExternalLink size={15} style={{ flexShrink: 0 }} />
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm sidebar-item-link"
            title="Sign Out"
            style={{ width: '100%', background: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '0.6rem' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            <span className="sidebar-text-hide">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger Toggle Button (Works on Desktop Collapse & Mobile Slide) */}
            <button
              onClick={toggleSidebar}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={desktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Portal</span>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {menuItems.find((m) => m.path === location.pathname)?.label || 'Overview'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{
                  position: 'relative',
                  background: 'var(--bg-alt)',
                  border: '1px solid var(--border)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                }}
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      background: 'var(--danger)',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: 'min(350px, calc(100vw - 2rem))',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border)',
                    zIndex: 60,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '0.9rem 1.1rem',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-alt)',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      Rescue Alerts & Updates
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No new notifications.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          style={{
                            padding: '0.85rem 1.1rem',
                            borderBottom: '1px solid var(--border)',
                            background: n.is_read ? '#fff' : '#f0fdf4',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                        >
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--bg-alt)',
                padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                {(user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.username}
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
