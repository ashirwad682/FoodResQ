import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MATCH_FOUND':
        return <Sparkles size={20} style={{ color: '#0ea5e9' }} />;
      case 'REQUEST_RECEIVED':
      case 'REQUEST_APPROVED':
        return <Inbox size={20} style={{ color: '#f59e0b' }} />;
      case 'PICKUP_ASSIGNED':
      case 'PICKUP_IN_TRANSIT':
      case 'DELIVERY_COMPLETED':
        return <Truck size={20} style={{ color: 'var(--brand-rose)' }} />;
      default:
        return <Bell size={20} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Bell size={24} style={{ color: '#fb7185' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Notifications & Rescue Alerts
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Real-time updates regarding surplus food requests, volunteer couriers, and mission completions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}
          >
            <CheckCheck size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-pills-row">
        <button
          onClick={() => setFilter('ALL')}
          className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`filter-pill ${filter === 'UNREAD' ? 'active' : ''}`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications Feed */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Bell size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {filter === 'UNREAD' ? 'No unread alerts' : 'No notifications yet'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            When surplus food matches occur or courier status changes, notifications will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
                background: n.is_read ? '#ffffff' : '#fff5f6',
                borderLeft: `4px solid ${n.is_read ? 'var(--border)' : '#fb7185'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: n.is_read ? 'var(--bg-alt)' : 'rgba(244, 63, 94, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {getNotificationIcon(n.notification_type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {n.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!n.is_read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#fb7185',
                          display: 'inline-block',
                        }}
                      />
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
