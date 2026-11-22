import React from 'react';
import { HeartHandshake, Award, Shield, Target } from 'lucide-react';

export const About = () => {
  return (
    <div style={{ padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-AVAILABLE" style={{ marginBottom: '0.75rem' }}>Our Mission</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.85rem' }}>
            Zero Food Waste. Zero Hunger.
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            ResQFood is a community-driven technology platform dedicated to preventing wholesome food from entering landfills while feeding vulnerable populations.
          </p>
        </div>

        {/* Mission Showcase Visual Banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
            marginBottom: '3.5rem',
            border: '1px solid var(--border)',
            height: '320px',
          }}
        >
          <img
            src="/images/about_mission.jpg"
            alt="ResQFood Mission - Community Food Rescue Team"
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
              Solidarity & Community Care
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              Bridging Commercial Surplus with Community Nourishment
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '4rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#b91c1c' }}>The Food Paradox</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              More than 40% of all food produced globally goes to waste, while millions of children and families face acute nutritional deficits every single day. A major portion of this waste consists of pristine, unserved banquet and catering food that simply lacks distribution logistics.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>The Technology Solution</h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              ResQFood solves the critical timing problem. By combining real-time geo-location, perishable expiration urgency decay, and automated volunteer dispatch, we enable food transfers within hours of preparation before any degradation occurs.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', background: '#ffffff', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>
            Core Values & Pillars
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Shield size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Food Safety First</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Strict adherence to thermal preservation guidelines and hygiene standards.</p>
            </div>
            <div>
              <Target size={24} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Transparency & Audit</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Every kilogram logged and tracked end-to-end with immutable status records.</p>
            </div>
            <div>
              <HeartHandshake size={24} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Community Empowerment</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Connecting local donors with shelters in their immediate neighborhoods.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
