import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/common/StatCard';
import { DonationCard } from '../../components/cards/DonationCard';
import { ShoppingBag, Sparkles, Inbox, Truck, CheckCircle2, ArrowRight, HeartHandshake } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export const NgoDashboard = () => {
  const { user } = useAuth();
  const [availableFood, setAvailableFood] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNgoData = async () => {
      try {
        const [foodData, reqData, assignData, statData] = await Promise.all([
          donationService.getDonations({ status: 'AVAILABLE' }),
          pickupService.getRequests(),
          pickupService.getAssignments(),
          analyticsService.getDashboard(),
        ]);
        setAvailableFood(foodData.results || foodData || []);
        setMyRequests(reqData.results || reqData || []);
        setActiveDeliveries((assignData.results || assignData || []).filter((a) => ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(a.status)));
        setAnalytics(statData);
      } catch (err) {
        console.error('Failed to load NGO dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadNgoData();
  }, []);

  const pendingRequests = myRequests.filter((r) => r.status === 'PENDING');
  const orgName = user?.organization?.name || user?.username;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: 700 }}>
            Verified Shelter & NGO Hub
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem', color: '#fff' }}>
            Welcome back, {orgName}!
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '600px' }}>
            Claim surplus food from local restaurants and bakeries. Our volunteer fleet will deliver directly to your doorstep.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/ngo/available-food" className="btn btn-primary" style={{ background: '#fff', color: '#1e3a8a', fontWeight: 700, padding: '0.85rem 1.4rem' }}>
            <ShoppingBag size={20} color="#1e3a8a" />
            <span>Browse Surplus Food</span>
          </Link>
          <Link to="/ngo/priority-donations" className="btn" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)', fontWeight: 600 }}>
            <Sparkles size={18} />
            <span>Priority Matches</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Available Surplus Batches"
          value={availableFood.length}
          icon={ShoppingBag}
          color="#3b82f6"
          subtext="Ready for claiming across the city"
        />
        <StatCard
          label="My Active Requests"
          value={pendingRequests.length}
          icon={Inbox}
          color="#f59e0b"
          subtext="Waiting for donor approval"
        />
        <StatCard
          label="In-Transit Deliveries"
          value={activeDeliveries.filter((d) => d.status === 'IN_TRANSIT').length}
          icon={Truck}
          color="#10b981"
          subtext="En route by volunteer riders"
        />
        <StatCard
          label="Total Food Rescued (kg)"
          value={formatNumber(analytics?.impact_metrics?.total_food_saved_kg || 0)}
          icon={CheckCircle2}
          color="#8b5cf6"
          subtext="Total platform volume preserved"
        />
      </div>

      {/* Active Deliveries Alert Bar */}
      {activeDeliveries.length > 0 && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Truck size={22} color="var(--primary)" />
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  You have {activeDeliveries.length} active delivery mission{activeDeliveries.length > 1 ? 's' : ''}!
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Track your rescue rider in real time and confirm delivery upon food inspection.
                </div>
              </div>
            </div>
            <Link to="/ngo/active-deliveries" className="btn btn-sm btn-primary">
              <span>Track Deliveries</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Available Food Catalog Preview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Available Surplus Food</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Fresh surplus batches registered by commercial donors ready for rescue
            </p>
          </div>
          <Link to="/ngo/available-food" className="btn btn-secondary btn-sm">
            <span>View All ({availableFood.length})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Checking live available food batches...
          </div>
        ) : availableFood.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Available Food Batches Right Now</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.25rem auto 0' }}>
              All registered donations have currently been claimed. You will be notified the instant donors post new surplus.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {availableFood.slice(0, 6).map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                actionLabel="Claim This Food"
                actionTo={`/ngo/available-food?claim=${donation.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
