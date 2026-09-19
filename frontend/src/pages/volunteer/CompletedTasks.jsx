import React, { useState, useEffect } from 'react';
import { pickupService } from '../../services/pickupService';
import { CheckCircle2, Award, Truck, MapPin, Building2, ShieldCheck } from 'lucide-react';
import { formatDate, formatKg } from '../../utils/formatters';

export const CompletedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const data = await pickupService.getAssignments();
        const list = data.results || data || [];
        setTasks(list.filter((a) => a.status === 'COMPLETED'));
      } catch (err) {
        console.error('Failed to load completed tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompleted();
  }, []);

  const totalKg = tasks.reduce((sum, item) => sum + (parseFloat(item.donation_quantity) || 0), 0);
  const totalMeals = Math.round(totalKg * 2.5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Completed Rescue Missions</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Every mission you complete rescues high-quality meals and directly prevents landfill methane emissions.
          </p>
        </div>

        <div className="card" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <Award size={32} color="#059669" />
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#065f46' }}>
              {totalMeals} Meals ({formatKg(totalKg)})
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Your Lifetime Delivery Impact</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your mission records...
        </div>
      ) : tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <CheckCircle2 size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Completed Missions Yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Check the Available Pickups tab to accept your first mission!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                borderLeft: '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-completed">RESCUE COMPLETED</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Delivered on {formatDate(task.updated_at || task.assigned_at)}
                  </span>
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {task.donation_title || `Mission #${task.id}`}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--danger)" />
                    <span>From: {task.pickup_address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={14} color="var(--info)" />
                    <span>To: {task.organization_name || 'Shelter'}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  +{Math.round((parseFloat(task.donation_quantity) || 0) * 2.5)} Meals
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {formatKg(task.donation_quantity)} rescued
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
