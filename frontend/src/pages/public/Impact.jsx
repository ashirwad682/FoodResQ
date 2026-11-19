import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Award, Leaf, Users, Utensils, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export const Impact = () => {
  const [metrics, setMetrics] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [m, l] = await Promise.all([
          analyticsService.getDashboard(),
          analyticsService.getLeaderboard(),
        ]);
        setMetrics(m);
        setLeaderboard(l);
      } catch (err) {
        console.error('Failed to load impact analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading live community impact metrics...</p>
      </div>
    );
  }

  const impact = metrics?.impact_metrics || {};

  return (
    <div style={{ padding: '4rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-COMPLETED" style={{ marginBottom: '0.75rem' }}>Live Impact Report</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Measurable Environmental & Social Change
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            All statistics are computed from verified delivery records stored securely in MongoDB Atlas.
          </p>
        </div>

        {/* Community Distribution Impact Banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            marginBottom: '3.5rem',
            border: '1px solid var(--border)',
            height: '280px',
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
              background: 'linear-gradient(to top, rgba(9, 9, 11, 0.92) 0%, rgba(9, 9, 11, 0.3) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2rem',
              color: '#ffffff',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d4d4d8' }}>
              Direct Community Impact
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              Over 100,000+ Nutritious Meals Delivered to Local Families & Shelters
            </h2>
          </div>
        </div>

        {/* Top 4 Impact Stat Cards */}
        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '3.5rem' }}>
          <StatCard
            title="Total Food Saved"
            value={`${impact.total_food_saved_kg || 0} kg`}
            subtext="Diverted from landfills"
            icon={Utensils}
            color="#10b981"
          />
          <StatCard
            title="Meals Distributed"
            value={(impact.total_meals_served || 0).toLocaleString()}
            subtext="Fed to hungry families"
            icon={Users}
            color="#3b82f6"
            background="rgba(59, 130, 246, 0.1)"
          />
          <StatCard
            title="Carbon Prevented"
            value={`${impact.co2_emissions_prevented_kg || 0} kg`}
            subtext="CO₂ emissions avoided"
            icon={Leaf}
            color="#059669"
            background="rgba(5, 150, 105, 0.1)"
          />
          <StatCard
            title="Rescues Completed"
            value={impact.total_rescues_completed || 0}
            subtext="Full delivery verified"
            icon={Award}
            color="#f59e0b"
            background="rgba(245, 158, 11, 0.1)"
          />
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-2 gap-8">
          {/* Top Donors */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Top Food Donors</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(leaderboard?.top_donors || []).map((donor, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: idx === 0 ? '#f59e0b' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{donor.organization_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{donor.donor_type}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.92rem' }}>
                      {donor.total_donations_kg} kg
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ~{donor.meals_provided} meals
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top NGOs */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Top NGO Distribution Centers</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(leaderboard?.top_ngos || []).map((ngo, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-alt)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: idx === 0 ? '#3b82f6' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        {ngo.name} {ngo.is_verified && <span style={{ color: '#10b981' }}>✓</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Serves ~{ngo.beneficiary_count} people
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.92rem' }}>
                      {ngo.total_rescued_kg} kg
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {ngo.pickups_completed} rescues
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
