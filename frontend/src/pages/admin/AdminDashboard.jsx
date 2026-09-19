import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import {
  ShieldCheck,
  Building2,
  Truck,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Users,
  Activity,
  HeartHandshake,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDate, formatKg, formatNumber } from '../../utils/formatters';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadAdminData = async () => {
    try {
      const [adminMetrics, ngosData, donData] = await Promise.all([
        adminService.getAdminMetrics(),
        adminService.getNgos(),
        adminService.getAllDonations(),
      ]);
      setData(adminMetrics);
      setNgos(ngosData.results || ngosData || []);
      setDonations(donData.results || donData || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (id, action) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await adminService.verifyNgo(id, action);
      setFeedback({
        type: 'success',
        text: `NGO ${action === 'approve' ? 'approved & verified' : 'unverified/declined'}. Automated notification dispatched.`,
      });
      loadAdminData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.error || 'Failed to update verification status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const metrics = data?.metrics || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        className="admin-header-banner"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={22} color="#10b981" />
            <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981', fontWeight: 700 }}>
              System Command & Administrative Governance
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            FoodResQ Platform Administration
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', maxWidth: '620px', marginTop: '0.3rem' }}>
            Govern NGO verifications, supervise active rescue missions, monitor the priority engine, and track city-wide food rescue metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="http://127.0.0.1:8000/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
            }}
          >
            <span>Swagger API Docs</span>
            <ExternalLink size={16} />
          </a>

          <a
            href="http://127.0.0.1:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
            }}
          >
            <span>Django Database Console</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {feedback && (
        <div style={{
          background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#065f46' : 'var(--danger)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Platform Metrics & Overview', icon: Activity },
          { id: 'ngos', label: `NGO Verification (${metrics.pending_ngos || 0} Pending)`, icon: Building2 },
          { id: 'donations', label: `All Surplus Donations (${metrics.total_donations || 0})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab: The 9 Required Key Metrics */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <StatCard
              label="Total Donations"
              value={metrics.total_donations ?? '-'}
              icon={Package}
              color="#3b82f6"
              subtext="All batches registered"
            />
            <StatCard
              label="Active Donations"
              value={metrics.active_donations ?? '-'}
              icon={Activity}
              color="#10b981"
              subtext="Available or in rescue transit"
            />
            <StatCard
              label="Completed Donations"
              value={metrics.completed_donations ?? '-'}
              icon={CheckCircle2}
              color="#059669"
              subtext="Safely delivered to shelters"
            />
            <StatCard
              label="Expired Donations"
              value={metrics.expired_donations ?? 0}
              icon={Clock}
              color="#ef4444"
              subtext="Unclaimed before expiry cutoff"
            />
            <StatCard
              label="Verified NGOs"
              value={metrics.verified_ngos ?? '-'}
              icon={Building2}
              color="#8b5cf6"
              subtext={`Out of ${metrics.total_ngos ?? 0} registered shelters`}
            />
            <StatCard
              label="Active Volunteers"
              value={metrics.active_volunteers ?? '-'}
              icon={Truck}
              color="#f59e0b"
              subtext="Available for rescue dispatches"
            />
            <StatCard
              label="Meals Redistributed"
              value={formatNumber(metrics.meals_redistributed || 0)}
              icon={HeartHandshake}
              color="#ec4899"
              subtext="Direct hunger alleviation"
            />
            <StatCard
              label="Food Saved (kg)"
              value={formatKg(metrics.food_saved_kg || 0)}
              icon={Sparkles}
              color="#14b8a6"
              subtext="Diverted from urban landfills"
            />
            <StatCard
              label="Successful Pickups"
              value={metrics.successful_pickups ?? '-'}
              icon={ShieldCheck}
              color="#6366f1"
              subtext="Completed by volunteer fleet"
            />
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
              Recent Surplus Activity Stream
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(data?.recent_donations || []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Donor: <strong>{item.donor}</strong> • Weight: {formatKg(item.quantity_kg)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NGO Verification Tab */}
      {activeTab === 'ngos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>NGO Verification Governance Queue</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Enforce rule: <em>Only verified NGOs can participate in the food-request workflow.</em> Approve or revoke access below.
            </p>
          </div>

          {ngos.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No registered organizations found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ngos.map((ngo) => (
                <div
                  key={ngo.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    borderLeft: `4px solid ${ngo.is_verified ? 'var(--primary)' : 'var(--warning)'}`,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 'min(280px, 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${ngo.is_verified ? 'badge-completed' : 'badge-warning'}`}>
                        {ngo.is_verified ? '✓ VERIFIED NGO' : '⏳ PENDING REVIEW'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Reg: {ngo.registration_number || 'Standard Trust'}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {ngo.name}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      📍 {ngo.address || 'Address not configured'} • Email: {ngo.contact_email} • Phone: {ngo.phone}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Storage Capacity: <strong>{ngo.max_capacity_kg} kg</strong> • Daily Beneficiaries: <strong>{ngo.beneficiary_count}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {!ngo.is_verified ? (
                      <button
                        onClick={() => handleVerify(ngo.id, 'approve')}
                        disabled={actionLoading === ngo.id}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={16} />
                        <span>{actionLoading === ngo.id ? 'Verifying...' : 'Approve & Verify NGO'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(ngo.id, 'reject')}
                        disabled={actionLoading === ngo.id}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
                      >
                        <XCircle size={16} />
                        <span>{actionLoading === ngo.id ? 'Revoking...' : 'Revoke Verification'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Donations Tab with Priority Engine Breakdown */}
      {activeTab === 'donations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Platform Donations & Priority Engine</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Live surplus batches evaluated by the Priority Engine (50% Expiry, 30% Quantity, 20% Distance).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {donations.map((don) => {
              const priority = don.priority || {};
              const pLevel = priority.priority_level || 'NORMAL';
              const pScore = priority.priority_score || 45;

              return (
                <div
                  key={don.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    borderLeft: `4px solid ${
                      pLevel === 'CRITICAL' ? 'var(--danger)' :
                      pLevel === 'HIGH' ? 'var(--warning)' :
                      pLevel === 'MEDIUM' ? 'var(--info)' : 'var(--primary)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 'min(280px, 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={`badge ${
                        pLevel === 'CRITICAL' ? 'badge-cancelled' :
                        pLevel === 'HIGH' ? 'badge-warning' : 'badge-info'
                      }`}>
                        PRIORITY: {pLevel} ({pScore}/100)
                      </span>
                      <span className={`badge badge-${don.status.toLowerCase()}`}>
                        {don.status.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(don.created_at)}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {don.title}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Donor: <strong>{don.donor_details?.name}</strong> • Quantity: <strong>{formatKg(don.quantity_kg)}</strong> • Category: {don.food_type}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>Remaining: <strong>{don.hours_until_expiry?.toFixed(1)} hrs</strong></span>
                      <span>Safe until: {formatDate(don.expiry_time)}</span>
                      <span>Location: {don.pickup_address}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pLevel === 'CRITICAL' ? 'var(--danger)' : 'var(--primary)' }}>
                      {pScore}%
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Priority Score</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
