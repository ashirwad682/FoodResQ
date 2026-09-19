import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pickupService } from '../../services/pickupService';
import { volunteerService } from '../../services/volunteerService';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/common/StatCard';
import { Truck, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [activeMission, setActiveMission] = useState(null);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isAvailable, setIsAvailable] = useState(user?.volunteer_profile?.is_available ?? true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVolunteerData = async () => {
      try {
        const [activeData, assignData] = await Promise.all([
          volunteerService.getActiveAssignment().catch(() => null),
          pickupService.getAssignments().catch(() => []),
        ]);

        setActiveMission(activeData);

        const all = assignData.results || assignData || [];
        // Available assignments = not yet accepted or assigned
        setAvailableAssignments(all.filter((a) => a.status === 'ASSIGNED' && !a.volunteer));
        setCompletedCount(all.filter((a) => a.status === 'COMPLETED').length);
      } catch (err) {
        console.error('Failed to load volunteer data', err);
      } finally {
        setLoading(false);
      }
    };
    loadVolunteerData();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const nextVal = !isAvailable;
      setIsAvailable(nextVal);
      await volunteerService.updateStatus({ is_available: nextVal });
    } catch (err) {
      setIsAvailable(!isAvailable);
      alert('Failed to update availability status.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
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
            Volunteer Rescue Rider Hub
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.5rem', color: '#fff' }}>
            Hello, {user?.first_name || user?.username}!
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '600px' }}>
            You are the frontline lifeline transporting warm meals from restaurant kitchens directly to hungry families.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            style={{
              background: isAvailable ? '#10b981' : '#475569',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            <span>{isAvailable ? 'Status: Available for Pickups' : 'Status: Off Duty'}</span>
          </button>

          <Link to="/volunteer/pickups" className="btn btn-primary" style={{ background: '#fff', color: '#ea580c', fontWeight: 700, padding: '0.75rem 1.25rem' }}>
            <Truck size={18} color="#ea580c" />
            <span>Find Pickups</span>
          </Link>
        </div>
      </div>

      {/* Active Mission Alert */}
      {activeMission && (
        <div style={{
          background: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} />
            </div>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.3rem' }}>ACTIVE MISSION IN PROGRESS</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeMission.donation_title || `Mission #${activeMission.id}`}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Status: <strong>{activeMission.status?.replace('_', ' ')}</strong> • Pickup: {activeMission.pickup_address}
              </div>
            </div>
          </div>
          <Link to="/volunteer/active-delivery" className="btn btn-primary">
            <span>Manage Mission & Update Status</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Available Rescue Missions"
          value={availableAssignments.length}
          icon={Truck}
          color="#ea580c"
          subtext="Ready for dispatch nearby"
        />
        <StatCard
          label="My Active Missions"
          value={activeMission ? 1 : 0}
          icon={Clock}
          color="#3b82f6"
          subtext="Currently assigned to you"
        />
        <StatCard
          label="Completed Missions"
          value={completedCount}
          icon={CheckCircle2}
          color="#10b981"
          subtext="Meals safely delivered"
        />
        <StatCard
          label="Volunteer Rating"
          value={`${user?.volunteer_profile?.rating ? Number(user.volunteer_profile.rating).toFixed(1) : '5.0'} ★`}
          icon={ShieldCheck}
          color="#8b5cf6"
          subtext="Official verified rider rating"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Truck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>Find Open Pickups</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Browse through scheduled pickups from bakeries, events, and restaurants that require a delivery rider.
            </p>
          </div>
          <Link to="/volunteer/pickups" className="btn btn-secondary btn-sm" style={{ marginTop: '1.25rem', width: 'fit-content' }}>
            <span>Browse Available Missions</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>Rescue History & Stats</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Review all completed food drop-offs, NGO sign-off receipts, and your cumulative CO2 prevention contribution.
            </p>
          </div>
          <Link to="/volunteer/completed" className="btn btn-secondary btn-sm" style={{ marginTop: '1.25rem', width: 'fit-content' }}>
            <span>View Completed Tasks</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};
