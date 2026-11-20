import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Sparkles, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Donor Posts Surplus Batch',
      actor: 'Restaurants, Hotels, Caterers',
      desc: 'When kitchen shifts end or banquets conclude, the donor logs into ResQFood and lists the remaining food batch. They specify the quantity in kg, dietary flags (Veg, Non-Veg), time prepared, and exact consumption expiry deadline.',
      icon: Utensils,
      color: '#09090b',
      image: '/images/chef_donor_logging.jpg',
    },
    {
      num: '02',
      title: 'Smart Priority Matching Engine',
      actor: 'ResQFood AI Algorithm',
      desc: 'The backend engine instantly calculates multi-factor compatibility scores across nearby verified NGOs. It weighs remaining hours until expiry (urgency decay), travel distance, recipient storage capacity, and accepted food types.',
      icon: Sparkles,
      color: '#27272a',
      image: '/images/hero_food_rescue.jpg',
    },
    {
      num: '03',
      title: 'NGO Requests & Donor Approves',
      actor: 'Charities & Donors',
      desc: 'Matched NGOs receive real-time notifications and request the food batch. The donor approves the request with a single click, instantly transitioning the donation to APPROVED status and generating a volunteer dispatch task.',
      icon: CheckCircle2,
      color: '#09090b',
    },
    {
      num: '04',
      title: 'Volunteer Safe Transport',
      actor: 'Volunteer Drivers & Couriers',
      desc: 'A nearby volunteer claims the rescue mission. They pick up the food from the donor kitchen, inspect thermal packaging, mark food as COLLECTED, and safely transport it directly to the NGO delivery address.',
      icon: Truck,
      color: '#27272a',
      image: '/images/volunteer_transit.jpg',
    },
    {
      num: '05',
      title: 'Confirmation & Impact Metrics',
      actor: 'NGO & Community',
      desc: 'The NGO inspects the food batch, confirms receipt, and provides feedback rating. The rescue is marked COMPLETED, and the platform updates live metrics: kilograms saved, meals served, and carbon emissions averted.',
      icon: CheckCircle2,
      color: '#09090b',
      image: '/images/food_bank_distribution.jpg',
    },
  ];

  return (
    <div style={{ padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-APPROVED" style={{ marginBottom: '0.75rem' }}>Operational Workflow</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '1rem' }}>
            How ResQFood Works
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
            A streamlined 5-step operational pipeline connecting donors, algorithms, volunteers, and hungry mouths.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem' }}>
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="glass-card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  borderLeft: `4px solid ${s.color}`,
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: `${s.color}15`,
                    color: s.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={26} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>
                      Step {s.num} • {s.actor}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.6rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: s.image ? '1rem' : 0 }}>
                    {s.desc}
                  </p>
                  {s.image && (
                    <div
                      style={{
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        height: '210px',
                        width: '100%',
                        marginTop: '0.85rem',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <img
                        src={s.image}
                        alt={s.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)', padding: '3.5rem 2rem', borderRadius: 'var(--radius-xl)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>Ready to Save Food with Us?</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            Whether you are a commercial kitchen with excess portions or a volunteer with a bike or car, your community needs you.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ background: '#ffffff', color: '#09090b', borderColor: '#ffffff' }}>
            <span>Get Started Today</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};
