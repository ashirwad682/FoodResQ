import React from 'react';
import { ShieldCheck, Thermometer, Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const FoodSafety = () => {
  const guidelines = [
    {
      title: 'Temperature Control Protocols',
      icon: Thermometer,
      color: '#ef4444',
      items: [
        'Hot foods must be held at or above 60°C (140°F) until packaging in insulated thermal carriers.',
        'Chilled and dairy items must remain below 4°C (40°F) throughout pickup and delivery.',
        'Volunteers are equipped with food-grade thermal bags to maintain safe holding temperatures.',
      ],
    },
    {
      title: '4-Hour Perishable Window',
      icon: Clock,
      color: '#f59e0b',
      items: [
        'Cooked perishable buffet food must be claimed and consumed within 4 to 6 hours of preparation.',
        'Donors must provide the exact preparation timestamp during listing.',
        'The priority matching engine prioritizes nearby NGOs to minimize transportation time.',
      ],
    },
    {
      title: 'Packaging & Allergen Labeling',
      icon: AlertOctagon,
      color: '#3b82f6',
      items: [
        'All food batches must be packed in clean, food-grade disposable or sanitized containers.',
        'Dietary tags (Vegetarian, Non-Vegetarian, Vegan, Halal, Gluten-Free) must be declared.',
        'Any potential allergens (nuts, seafood, soy) must be documented in special instructions.',
      ],
    },
    {
      title: 'FSSAI & Regulatory Compliance',
      icon: ShieldCheck,
      color: '#10b981',
      items: [
        'All participating restaurants and caterers maintain active commercial food licenses.',
        'Food safety checklists must be acknowledged prior to handover at donor kitchens.',
        'Receiving NGOs perform visual inspection and temperature verification before serving.',
      ],
    },
  ];

  return (
    <div style={{ padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-AVAILABLE" style={{ marginBottom: '0.75rem' }}>Safety Standards</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '1rem' }}>
            Uncompromising Food Safety
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
            Every meal rescued on FoodResQ follows rigorous public health guidelines to ensure dignity and health for all recipients.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '4rem' }}>
          {guidelines.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${g.color}15`, color: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{g.title}</h3>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {g.items.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <CheckCircle2 size={16} style={{ color: g.color, flexShrink: 0, marginTop: '3px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: '#fff', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Good Samaritan & Food Donation Protections</h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            Food donation legislation and standard Good Samaritan provisions protect food donors from civil liability when donating wholesome food in good faith through certified non-profit distribution channels.
          </p>
        </div>
      </div>
    </div>
  );
};
