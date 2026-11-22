import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Award, Leaf, Users, Utensils, TrendingUp, RefreshCw, Bike, Database, ShieldCheck, Heart } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export const Impact = () => {
  const [metrics, setMetrics] = useState(null);
  const [leaderboard, setLeaderboard] = useState({ top_donors: [], top_ngos: [], top_volunteers: [] });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [m, l] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getLeaderboard(),
      ]);
      if (m) setMetrics(m);
      if (l) setLeaderboard(l);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Real-time database sync notice:', err);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  // Initial fetch + Live auto-refresh from live cloud telemetry every 20 seconds
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading && !metrics) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <RefreshCw className="animate-spin" size={20} />
          <span>Connecting to live impact ledger...</span>
        </div>
      </div>
    );
  }

  const impact = metrics?.impact_metrics || {
    total_food_saved_kg: 0,
    total_meals_served: 0,
    co2_emissions_prevented_kg: 0,
    total_rescues_completed: 0,
    total_donations_registered: 0,
  };

  const community = metrics?.community_network || {
    active_donors: 0,
    registered_ngos: 0,
    active_volunteers: 0,
  };

  const foodTypes = metrics?.food_type_breakdown || {};

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(24, 24, 27, 0.06)',
                border: '1px solid rgba(24, 24, 27, 0.15)',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#18181b',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Database size={13} style={{ color: '#27272a' }} />
              Live Verified Impact Ledger
            </span>

            {/* Live Pulsing Sync Indicator */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#047857',
              }}
              title="Continuous live cloud telemetry polling"
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
                  display: 'inline-block',
                }}
              />
              Live Sync
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.85rem, 3.4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Real-Time Community Impact
          </h1>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.55 }}>
            Every statistic and ranking below is computed dynamically in real-time from verified surplus rescue dispatches.
          </p>

          {/* Sync status & Manual refresh button */}
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
            {lastUpdated && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Last synced with database: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={isRefreshing}
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.76rem',
                padding: '0.28rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                gap: '0.35rem',
              }}
              title="Refresh live data right now"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Community Distribution Banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            marginBottom: '3rem',
            border: '1px solid var(--border)',
            height: '270px',
          }}
        >
          <img
            src="/images/food_bank_distribution.jpg"
            alt="Food Bank Community Distribution"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(9, 9, 11, 0.94) 0%, rgba(9, 9, 11, 0.35) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2.25rem',
              color: '#ffffff',
            }}
          >
            <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e4e4e7' }}>
              Direct verified rescue deliveries
            </span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {impact.total_meals_served > 0
                ? `${impact.total_meals_served.toLocaleString()} Meals Rescued & Delivered to Local Shelter Beneficiaries`
                : 'Smart Food Rescue Network Serving Verified Shelters and Families'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.65rem', flexWrap: 'wrap', fontSize: '0.84rem', color: '#d4d4d8' }}>
              <span>✓ <strong>{impact.total_rescues_completed || 0}</strong> missions verified</span>
              <span>✓ <strong>{community.active_donors || 0}</strong> commercial kitchens participating</span>
              <span>✓ <strong>{community.registered_ngos || 0}</strong> shelter centers supplied</span>
            </div>
          </div>
        </div>

        {/* Top 4 Impact Stat Cards */}
        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '3rem' }}>
          <StatCard
            title="Total Food Saved"
            value={`${impact.total_food_saved_kg || 0} kg`}
            subtext="Diverted from urban landfills"
            icon={Utensils}
            color="#18181b"
            background="rgba(24, 24, 27, 0.08)"
          />
          <StatCard
            title="Meals Distributed"
            value={(impact.total_meals_served || 0).toLocaleString()}
            subtext="Nutritious portions delivered"
            icon={Users}
            color="#27272a"
            background="rgba(39, 39, 42, 0.08)"
          />
          <StatCard
            title="Carbon Prevented"
            value={`${impact.co2_emissions_prevented_kg || 0} kg`}
            subtext="CO₂ greenhouse gas avoided"
            icon={Leaf}
            color="#059669"
            background="rgba(16, 185, 129, 0.1)"
          />
          <StatCard
            title="Completed Rescues"
            value={impact.total_rescues_completed || 0}
            subtext="Safe thermal transfer verified"
            icon={Award}
            color="#d97706"
            background="rgba(245, 158, 11, 0.1)"
          />
        </div>

        {/* Food Type Breakdown from Database */}
        {Object.keys(foodTypes).length > 0 && (
          <div
            className="glass-card"
            style={{
              padding: '1.75rem 2rem',
              marginBottom: '3rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Food Category Distribution
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Breakdown of food inventory rescued across commercial donors in the database.
                </p>
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-alt)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
                {impact.total_donations_registered || 0} Total Batches Logged
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(foodTypes).map(([type, count]) => {
                const label = type.replace(/_/g, ' ');
                const pct = impact.total_donations_registered > 0
                  ? Math.round((count / impact.total_donations_registered) * 100)
                  : 0;
                return (
                  <div
                    key={type}
                    style={{
                      background: 'var(--bg-alt)',
                      padding: '1rem 1.2rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {label.toLowerCase()}
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {count} batches
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #27272a 0%, #18181b 100%)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'inline-block' }}>
                      {pct}% of recorded rescue supply
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Real-Time Database Leaderboards: 3 Columns (Donors, NGOs, Volunteers) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {/* 1. Top Donors */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(24, 24, 27, 0.08)',
                  color: '#18181b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 800 }}>Top Food Donors</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ranked by total kg rescued</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(leaderboard?.top_donors || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No donor records found yet. Register as a donor to join the leaderboard!
                </div>
              ) : (
                (leaderboard.top_donors || []).map((donor, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      background: 'var(--bg-alt)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: idx === 0 ? '#d97706' : 'var(--text-muted)',
                          width: '24px',
                          textAlign: 'center',
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {donor.organization_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {donor.donor_type ? donor.donor_type.toLowerCase() : 'Commercial Donor'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                        {donor.total_donations_kg} kg
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        ~{donor.meals_provided} meals
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Top NGOs */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(39, 39, 42, 0.08)',
                  color: '#27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 800 }}>Top Shelter Centers</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ranked by redistribution volume</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(leaderboard?.top_ngos || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No shelter distributions recorded yet. Claim batches to appear here!
                </div>
              ) : (
                (leaderboard.top_ngos || []).map((ngo, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      background: 'var(--bg-alt)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: idx === 0 ? '#2563eb' : 'var(--text-muted)',
                          width: '24px',
                          textAlign: 'center',
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{ngo.name}</span>
                          {ngo.is_verified && <ShieldCheck size={14} style={{ color: '#059669' }} title="Verified Non-Profit" />}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Serves ~{ngo.beneficiary_count || 0} individuals
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#18181b', fontSize: '0.9rem' }}>
                        {ngo.total_rescued_kg} kg
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {ngo.pickups_completed} rescues
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Top Volunteer Couriers */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bike size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 800 }}>Top Volunteer Couriers</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ranked by verified delivery runs</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(leaderboard?.top_volunteers || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No volunteer runs logged yet. Volunteer for active dispatches!
                </div>
              ) : (
                (leaderboard.top_volunteers || []).map((vol, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      background: 'var(--bg-alt)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: idx === 0 ? '#059669' : 'var(--text-muted)',
                          width: '24px',
                          textAlign: 'center',
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {vol.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {vol.vehicle_type ? `${vol.vehicle_type.toLowerCase()} courier` : 'Courier'} • {vol.rating} ★
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>
                        {vol.pickups_completed} runs
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Completed
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
