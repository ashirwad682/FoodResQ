import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Utensils,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  Leaf,
  Activity,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  Award,
  DollarSign,
  Info,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { donationService } from '../../services/donationService';
import { DonationCard } from '../../components/cards/DonationCard';

export const Home = () => {
  const [metrics, setMetrics] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedBatchModal, setSelectedBatchModal] = useState(null);

  // Waste Calculator State
  const [weeklyWasteKg, setWeeklyWasteKg] = useState(80);

  // Workflow Step Tabs
  const [activeStepTab, setActiveStepTab] = useState(1);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, donationsData] = await Promise.all([
          analyticsService.getDashboard(),
          donationService.getDonations({ status: 'AVAILABLE' }),
        ]);
        setMetrics(dashData);
        const list = Array.isArray(donationsData) ? donationsData : donationsData.results || [];
        setDonations(list);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter donations by category
  const filteredDonations = donations.filter((d) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'COOKED' && d.food_type === 'COOKED_MEAL') return true;
    if (activeCategory === 'BAKERY' && (d.food_type === 'BAKERY' || d.title.toLowerCase().includes('bread') || d.title.toLowerCase().includes('bake'))) return true;
    if (activeCategory === 'GROCERY' && (d.food_type === 'RAW_INGREDIENTS' || d.food_type === 'PACKAGED_FOOD')) return true;
    const pLevel = typeof d.priority === 'object' ? d.priority?.priority_level : d.priority;
    if (activeCategory === 'CRITICAL' && (pLevel === 'CRITICAL' || pLevel === 'HIGH')) return true;
    return true;
  });

  // Calculate carbon savings
  const annualKg = weeklyWasteKg * 52;
  const annualMeals = Math.round(annualKg * 2.5);
  const annualCO2 = Math.round(annualKg * 2.5); // 2.5kg CO2 per kg food saved
  const annualSavingsINR = Math.round(annualKg * 120);

  const stepDetails = {
    1: {
      title: 'Commercial Donor Dispatch',
      sub: 'Restaurants, hotels, & caterers post excess meals in under 60 seconds.',
      points: [
        'Log weight, meal count, preparation timestamp, and dietary certifications.',
        'Automated FSSAI-compliant safe storage countdown timer begins.',
        'Zero logistical hassle: volunteer couriers handle transportation.',
      ],
      tag: 'Step 1 • Surplus Intake',
      color: '#09090b',
      image: '/images/chef_donor_logging.jpg',
    },
    2: {
      title: 'Real-Time AI Priority Engine',
      sub: 'Algorithmic scoring routes surplus to verified NGOs with exact demand.',
      points: [
        'Distance computation with live radius filtering ensures prompt pickups.',
        'Priority scoring factors remaining shelf-life, portion size, and shelter capacity.',
        'Automated dispatch alerts sent to pre-verified nearby food banks.',
      ],
      tag: 'Step 2 • Smart Matching',
      color: '#27272a',
      image: '/images/hero_food_rescue.jpg',
    },
    3: {
      title: 'Volunteer Logistics Fleet',
      sub: 'On-demand verified drivers accept route assignments via mobile.',
      points: [
        'Secure chain-of-custody OTP verification at pickup and dropoff.',
        'Thermal transit protocols ensure hot meals remain above 63°C / cold below 5°C.',
        'Live turn-by-turn routing minimizes transit time to under 30 minutes.',
      ],
      tag: 'Step 3 • Chain-of-Custody Delivery',
      color: '#09090b',
      image: '/images/volunteer_transit.jpg',
    },
    4: {
      title: 'Dignified Community Distribution',
      sub: 'Charities distribute fresh meals directly to families in need.',
      points: [
        'Immediate meal logging and nutritional verification by shelter staff.',
        'Full ESG audit trails generated for corporate donor tax benefits.',
        'Closed-loop status update confirms delivery to donor within seconds.',
      ],
      tag: 'Step 4 • Community Impact',
      color: '#27272a',
      image: '/images/food_bank_distribution.jpg',
    },
  };

  const faqs = [
    {
      q: 'Who can donate food through FoodResQ?',
      a: 'Any commercial food establishment—including restaurants, hotels, banquet halls, corporate cafeterias, supermarkets, and certified event caterers—can register as a Donor Kitchen. All donors adhere to basic hygiene and preparation timestamp logging.',
    },
    {
      q: 'How does the AI Priority Matching Engine work?',
      a: 'When a donation is posted, our backend engine scores nearby verified NGOs based on distance (20%), remaining shelf life (50%), and portion capacity (30%). Batches with shorter shelf lives are escalated to "CRITICAL" priority for accelerated dispatch.',
    },
    {
      q: 'Are food donors legally protected when giving surplus food?',
      a: 'Yes. Donors are covered under Good Samaritan Food Donation provisions and FSSAI safe surplus food guidelines, provided the food was prepared under standard hygiene standards and logged with truthful timestamps.',
    },
    {
      q: 'How do NGOs get verified to receive food?',
      a: 'NGOs must submit their 12A/80G registration, government certificate, storage capacity, and refrigeration capabilities during onboarding. Our team verifies credentials within 24 hours to ensure food safety.',
    },
    {
      q: 'Can volunteers use personal vehicles for deliveries?',
      a: 'Yes. Volunteers can sign up with two-wheelers or cars. FoodResQ provides insulated thermal bags to ensure hot and cold food items maintain safe storage temperatures during rapid local transit.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.84) 0%, rgba(15, 23, 42, 0.72) 50%, rgba(15, 23, 42, 0.94) 100%), url('/images/hero_food_rescue.jpg') center/cover no-repeat",
          position: 'relative',
          color: '#ffffff',
          padding: '5rem 0 6.5rem',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="grid grid-cols-2 gap-8 items-center">
            {/* Left Column: Headline & Value Prop */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.4rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  marginBottom: '1.5rem',
                }}
              >
                <Sparkles size={16} />
                <span>Priority Smart Matching Engine Active</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.12,
                  marginBottom: '1.5rem',
                }}
              >
                Bridge Commercial Surplus Food To{' '}
                <span className="text-gradient-emerald">Those in Need.</span>
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#cbd5e1',
                  lineHeight: 1.65,
                  marginBottom: '2.5rem',
                  maxWidth: '560px',
                }}
              >
                Every day, quality surplus meals are wasted while community shelters face shortages. FoodResQ instantly routes fresh, safe food to nearby verified charities in minutes.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg"
                  style={{
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                    padding: '0.9rem 2rem',
                    fontSize: '1.05rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <span>Donate Surplus Food</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/register"
                  className="btn btn-secondary btn-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.9rem 1.8rem',
                  }}
                >
                  <Building2 size={18} />
                  <span>Join as NGO or Volunteer</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.75rem',
                  marginTop: '2.5rem',
                  paddingTop: '1.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={18} style={{ color: '#34d399' }} />
                  <span>FSSAI Compliant</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Leaf size={18} style={{ color: '#38bdf8' }} />
                  <span>Zero Food Landfill</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Activity size={18} style={{ color: '#f59e0b' }} />
                  <span>Verified NGO Network</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Radar Telemetry Preview Card */}
            <div>
              <div
                className="glass-panel-dark float-animation"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  position: 'relative',
                }}
              >
                {/* Header of Telemetry Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="live-pulse" />
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Live Radar Telemetry
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                        Surplus Rescue Stream
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Flame size={13} />
                    <span>CRITICAL MATCH</span>
                  </span>
                </div>

                {/* Simulated Batch Showcase */}
                <div
                  style={{
                    background: 'rgba(24, 24, 27, 0.95)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                    <img
                      src="/images/chef_donor_logging.jpg"
                      alt="Chef logging surplus food"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(24, 24, 27, 0.95) 0%, rgba(24, 24, 27, 0.2) 60%, transparent 100%)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        color: '#ffffff',
                      }}
                    >
                      <Utensils size={12} />
                      <span>Live Commercial Kitchen Dispatch</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
                        Royal Orchid Caterers — Fresh Buffet Trays
                      </h4>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                      Surplus steamed basmati rice, paneer butter masala & whole wheat rotis. Cooked 2 hours ago.
                    </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>35 kg</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Portion Size</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>~90</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Servings</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.6rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>2h 45m</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Window Left</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} style={{ color: '#34d399' }} />
                      <span>Indiranagar Central (2.1 km away)</span>
                    </div>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>3 NGOs In Radius</span>
                  </div>
                </div>
                </div>

                {/* Simulated Real-Time Dispatch Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(14, 165, 233, 0.2)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Activity size={16} className="radar-spinner" />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      Pinging nearby verified shelters...
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
                  >
                    <span>Claim Surplus</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counters Bar (Connected to Live Database) */}
      <section style={{ transform: 'translateY(-2.5rem)', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div
            className="glass-panel impact-hero-banner"
            style={{
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.9)',
            }}
          >
            <div className="grid grid-cols-4 gap-6" style={{ textAlign: 'center' }}>
              <div style={{ padding: '0.5rem' }}>
                <div
                  style={{
                    fontSize: '2.6rem',
                    fontWeight: 900,
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-heading)',
                    lineHeight: 1.1,
                  }}
                >
                  {metrics?.impact_metrics?.total_food_saved_kg || 0}
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, marginLeft: '0.2rem' }}>kg</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                  Surplus Food Rescued
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Weight Saved</div>
              </div>

              <div className="stat-col-border" style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)' }}>
                <div
                  style={{
                    fontSize: '2.6rem',
                    fontWeight: 900,
                    color: '#3b82f6',
                    fontFamily: 'var(--font-heading)',
                    lineHeight: 1.1,
                  }}
                >
                  {metrics?.impact_metrics?.total_meals_served?.toLocaleString() || 0}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                  Nutritious Meals Served
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Direct Hunger Relief</div>
              </div>

              <div className="stat-col-border" style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)' }}>
                <div
                  style={{
                    fontSize: '2.6rem',
                    fontWeight: 900,
                    color: '#10b981',
                    fontFamily: 'var(--font-heading)',
                    lineHeight: 1.1,
                  }}
                >
                  {metrics?.impact_metrics?.co2_emissions_prevented_kg || 0}
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, marginLeft: '0.2rem' }}>kg</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                  CO₂ Emissions Diverted
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Methane Prevention</div>
              </div>

              <div className="stat-col-border" style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)' }}>
                <div
                  style={{
                    fontSize: '2.6rem',
                    fontWeight: 900,
                    color: '#f59e0b',
                    fontFamily: 'var(--font-heading)',
                    lineHeight: 1.1,
                  }}
                >
                  {metrics?.impact_metrics?.total_rescues_completed || 0}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                  Completed Missions
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>100% Chain-of-Custody</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Available Surplus Food Feed (100% Real Database Data) */}
      <section style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="live-pulse" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Real-Time Database Feed
                </span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                Live Surplus Marketplace
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Live surplus batches ready for claiming by verified non-profits and food shelters.
              </p>
            </div>

            {/* Filter Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.3rem', borderRadius: 'var(--radius-full)', flexWrap: 'wrap' }}>
              {[
                { key: 'ALL', label: 'All Surplus' },
                { key: 'CRITICAL', label: 'Critical Urgency' },
                { key: 'COOKED', label: 'Cooked Meals' },
                { key: 'BAKERY', label: 'Bakery & Bread' },
                { key: 'GROCERY', label: 'Packaged & Raw' },
              ].map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setActiveCategory(chip.key)}
                  style={{
                    border: 'none',
                    background: activeCategory === chip.key ? '#ffffff' : 'transparent',
                    color: activeCategory === chip.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeCategory === chip.key ? 700 : 600,
                    fontSize: '0.82rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    boxShadow: activeCategory === chip.key ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>Querying live database batches...</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Connecting to MongoDB Atlas</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                All Available Surplus Batches Rescued!
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
                Local restaurants and caterers post excess food throughout breakfast, lunch, and dinner cycles. Check back shortly or register your kitchen to donate.
              </p>
              <Link to="/register" className="btn btn-primary btn-sm">
                <span>Donate Food Now</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredDonations.slice(0, 6).map((d) => (
                <DonationCard
                  key={d.id}
                  donation={d}
                  actionButton={
                    <button
                      onClick={() => setSelectedBatchModal(d)}
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
                    >
                      <span>Claim Batch</span>
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive 4-Step Ecosystem Tabs */}
      <section style={{ background: '#f1f5f9', padding: '5.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}
            >
              <span>Closed-Loop Architecture</span>
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              How the Smart Rescue Network Operates
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              From commercial surplus to community tables: every rescue mission is tracked end-to-end with mathematical precision and food-safety compliance.
            </p>
          </div>

          {/* Interactive Step Selector */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { step: 1, label: '1. Donor Intake', icon: Utensils },
              { step: 2, label: '2. AI Smart Match', icon: Sparkles },
              { step: 3, label: '3. Volunteer Dispatch', icon: Truck },
              { step: 4, label: '4. NGO Distribution', icon: Building2 },
            ].map((s) => {
              const Icon = s.icon;
              const active = activeStepTab === s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStepTab(s.step)}
                  className={`interactive-tab-btn ${active ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Tab Content Display */}
          <div
            className="glass-panel how-it-operates-card"
            style={{
              borderRadius: 'var(--radius-xl)',
              maxWidth: '960px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-lg)',
              background: '#ffffff',
            }}
          >
            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: stepDetails[activeStepTab].color,
                    background: `${stepDetails[activeStepTab].color}15`,
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-block',
                    marginBottom: '1rem',
                  }}
                >
                  {stepDetails[activeStepTab].tag}
                </span>

                <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  {stepDetails[activeStepTab].title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {stepDetails[activeStepTab].sub}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stepDetails[activeStepTab].points.map((pt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${stepDetails[activeStepTab].color}20`, color: stepDetails[activeStepTab].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircle2 size={13} />
                      </div>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphic / Visual Box for Step */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', height: '230px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={stepDetails[activeStepTab].image}
                    alt={stepDetails[activeStepTab].title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      background: 'rgba(9, 9, 11, 0.88)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {stepDetails[activeStepTab].tag}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-primary)' }}>System Benchmark</span>
                    <span style={{ color: '#09090b', background: '#f4f4f5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      Real-Time Validated
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <div style={{ background: '#f4f4f5', padding: '0.65rem 0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match Speed</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>&lt; 90s</div>
                    </div>
                    <div style={{ background: '#f4f4f5', padding: '0.65rem 0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cold-Chain</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09090b' }}>99.4%</div>
                    </div>
                    <div style={{ background: '#f4f4f5', padding: '0.65rem 0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Charity Cost</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹0 (Free)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Kitchen Waste & Carbon Savings Calculator */}
      <section style={{ padding: '5.5rem 0' }}>
        <div className="container">
          <div
            className="glass-panel esg-calculator-panel"
            style={{
              background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="grid grid-cols-2 gap-10 items-center">
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    color: '#34d399',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  <Leaf size={15} />
                  <span>Commercial Kitchen ESG Calculator</span>
                </div>

                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                  Calculate Your Environmental & Social Dividends
                </h2>

                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Adjust the slider to simulate how much surplus food your hotel, restaurant, or cafeteria produces weekly. See the real meals rescued and carbon avoided.
                </p>

                {/* Slider Component */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#cbd5e1' }}>
                      Estimated Surplus Food Per Week:
                    </span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                      {weeklyWasteKg} kg
                    </span>
                  </div>

                  <input
                    type="range"
                    min="15"
                    max="500"
                    step="5"
                    value={weeklyWasteKg}
                    onChange={(e) => setWeeklyWasteKg(Number(e.target.value))}
                    aria-label="Surplus Food Per Week in kg"
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    <span>15 kg (Small Café)</span>
                    <span>100 kg (Restaurant)</span>
                    <span>500 kg (Banquet / Hotel)</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.75rem' }}
                >
                  <span>Enroll Your Kitchen</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Live Calculated Stats Display */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.2rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>
                  Your Annual ESG & Community Projection
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Utensils size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Surplus Food Diverted</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                          {annualKg.toLocaleString()} kg / yr
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Annual Meals Provided</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa' }}>
                          ~{annualMeals.toLocaleString()} Meals
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Leaf size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Greenhouse Gas Avoided</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24' }}>
                          {annualCO2.toLocaleString()} kg CO₂e
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>CSR & Tax Benefit Audit</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c084fc' }}>
                          100% Tax Deductible
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Safety & Cold-Chain Standards */}
      <section style={{ background: '#ffffff', padding: '5.5rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Safety First Philosophy
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', marginTop: '0.35rem', marginBottom: '1rem' }}>
              Rigorous Safety & Cold-Chain Standards
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Rescuing food never compromises human health. FoodResQ enforces strict FSSAI safety criteria on all food transfers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                4-Hour Consumption Rule
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Hot cooked meals must be delivered and served within 4 hours of culinary preparation to prevent microbial multiplication.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Sensory & Temperature Audit
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Volunteer drivers inspect containers for smell, texture, and packaging integrity before accepting custodial possession.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Tamper-Evident Packaging
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All surplus food is sealed in food-grade, food-safe containers with digital batch receipts ensuring trace integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section style={{ background: '#f8fafc', padding: '5.5rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Everything You Need To Know
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', marginTop: '0.35rem' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="faq-card">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="faq-question-btn"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} style={{ color: 'var(--primary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, borderTop: '1px solid #f1f5f9' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Conversion Bottom CTA Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          color: '#ffffff',
          padding: '5rem 0',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Ready to Transform Surplus into Sustenance?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#a7f3d0', lineHeight: 1.6, marginBottom: '2.25rem' }}>
            Whether you are a commercial kitchen with extra trays, a charity serving local families, or a volunteer with a vehicle—you are essential to the mission.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              className="btn btn-secondary btn-lg"
              style={{
                background: '#ffffff',
                color: '#064e3b',
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                padding: '0.9rem 2rem',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              }}
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/how-it-works"
              className="btn btn-outline btn-lg"
              style={{
                borderColor: '#ffffff',
                color: '#ffffff',
                borderRadius: 'var(--radius-full)',
                padding: '0.9rem 1.8rem',
              }}
            >
              <span>Learn How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Batch Claim / Quick View Modal */}
      {selectedBatchModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setSelectedBatchModal(null)}
        >
          <div
            className="glass-panel"
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: '540px',
              width: '100%',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className={`badge badge-${selectedBatchModal.status}`} style={{ marginBottom: '0.4rem' }}>
                  {selectedBatchModal.status}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedBatchModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatchModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {selectedBatchModal.description || 'Fresh surplus food available for immediate rescue and distribution to verified shelters.'}
            </p>

            <div style={{ background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Quantity: </span>
                  <strong>{selectedBatchModal.quantity_kg} kg</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Servings: </span>
                  <strong>~{selectedBatchModal.serves_count || Math.round(selectedBatchModal.quantity_kg * 2.5)} meals</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Pickup Location: </span>
                  <strong>{selectedBatchModal.pickup_address}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Priority Level: </span>
                  <strong style={{ color: 'var(--primary)' }}>
                    {typeof selectedBatchModal.priority === 'object'
                      ? (selectedBatchModal.priority?.priority_level || 'NORMAL')
                      : (selectedBatchModal.priority || 'NORMAL')}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedBatchModal(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
              <Link
                to="/login"
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <span>Login as NGO to Claim</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
