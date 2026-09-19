import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { pickupService } from '../../services/pickupService';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/common/StatCard';
import { DonationCard } from '../../components/cards/DonationCard';
import { PlusCircle, Package, HeartHandshake, Clock, AlertTriangle, ArrowRight, Truck } from 'lucide-react';
import { formatKg, formatNumber } from '../../utils/formatters';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [donationsData, requestsData, analyticsData] = await Promise.all([
          donationService.getDonations({ page_size: 6 }),
          pickupService.getRequests(),
          analyticsService.getDashboard(),
        ]);
        setDonations(donationsData.results || donationsData || []);
        setRequests(requestsData.results || requestsData || []);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to load donor dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const activeDonations = donations.filter((d) => ['AVAILABLE', 'REQUESTED', 'ASSIGNED', 'IN_TRANSIT'].includes(d.status));

  // Compute donor's own metrics
  const totalSavedKg = donations
    .filter((d) => d.status === 'COMPLETED')
    .reduce((acc, curr) => acc + parseFloat(curr.quantity_kg || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
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
            Commercial Kitchen & Food Donor Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem', color: '#fff' }}>
            Hello, {user?.first_name || user?.username}!
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '600px' }}>
            Your surplus food feeds vulnerable families across the city instead of ending up in landfills.
          </p>
        </div>
        <Link to="/donor/donate" className="btn btn-primary" style={{ background: '#fff', color: '#047857', fontWeight: 700, padding: '0.85rem 1.4rem' }}>
          <PlusCircle size={20} color="#047857" />
          <span>Post Surplus Food</span>
        </Link>
      </div>

      {/* Pending Requests Notification Banner */}
      {pendingRequests.length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="var(--warning)" />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#92400e' }}>
                You have {pendingRequests.length} pending pickup request{pendingRequests.length > 1 ? 's' : ''} from verified NGOs!
              </span>
              <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Please review and approve the request to dispatch volunteer rescue riders.
              </div>
            </div>
          </div>
          <Link to="/donor/requests" className="btn btn-sm btn-primary">
            <span>Review Requests</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Active Donations"
          value={activeDonations.length}
          icon={Package}
          color="#10b981"
          subtext="Available or in rescue transit"
        />
        <StatCard
          label="Pending NGO Requests"
          value={pendingRequests.length}
          icon={Clock}
          color="#f59e0b"
          subtext="Waiting for your confirmation"
        />
        <StatCard
          label="Completed Rescues"
          value={donations.filter((d) => d.status === 'COMPLETED').length}
          icon={Truck}
          color="#3b82f6"
          subtext="Safely delivered to shelters"
        />
        <StatCard
          label="Platform Meals Served"
          value={formatNumber(analytics?.impact_metrics?.total_meals_served || 0)}
          icon={HeartHandshake}
          color="#8b5cf6"
          subtext="Total city-wide impact"
        />
      </div>

      {/* Recent Donations Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Recent Surplus Batches</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Monitor your active batches and track delivery progression
            </p>
          </div>
          <Link to="/donor/donations" className="btn btn-secondary btn-sm">
            <span>View All ({donations.length})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading your surplus batches from live database...
          </div>
        ) : donations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Food Donations Yet</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Whenever your kitchen has extra prepared meals, bakery batches, or raw ingredients, register them here.
            </p>
            <Link to="/donor/donate" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Create First Donation</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {donations.slice(0, 6).map((donation) => (
              <DonationCard key={donation.id} donation={donation} showAction={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
