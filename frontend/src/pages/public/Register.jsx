import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';
import {
  HeartHandshake,
  Building2,
  Truck,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  FileText,
  Package,
} from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('DONOR');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    // Donor profile fields
    business_name: '',
    food_license_number: '',
    pickup_instructions: '',
    // NGO profile fields
    org_name: '',
    registration_number: '',
    capacity_kg: 200,
    accepts_cooked: true,
    accepts_raw: true,
    accepts_packaged: true,
    // Volunteer profile fields
    vehicle_type: 'BIKE',
    max_distance_km: 15,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear specific field error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Food Safety & Compliance Guidelines to proceed.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setFieldErrors({ password: 'Password must be at least 8 characters long.' });
      return;
    }
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.password,
        role: role,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        address: formData.address.trim(),
        organization_name: formData.business_name.trim() || formData.org_name.trim() || `${formData.first_name.trim()}'s Kitchen`,
      };

      if (role === 'DONOR') {
        payload.donor_profile = {
          business_name: formData.business_name.trim() || `${formData.first_name.trim()}'s Kitchen`,
          food_license_number: formData.food_license_number.trim(),
          pickup_instructions: formData.pickup_instructions.trim(),
        };
      } else if (role === 'NGO') {
        payload.organization = {
          name: formData.org_name.trim() || `${formData.first_name.trim()} Community Foundation`,
          registration_number: formData.registration_number.trim(),
          capacity_kg: parseFloat(formData.capacity_kg) || 200,
          accepts_cooked: formData.accepts_cooked,
          accepts_raw: formData.accepts_raw,
          accepts_packaged: formData.accepts_packaged,
        };
      } else if (role === 'VOLUNTEER') {
        payload.volunteer_profile = {
          vehicle_type: formData.vehicle_type,
          max_distance_km: parseFloat(formData.max_distance_km) || 15,
        };
      }

      const res = await register(payload);
      if (res.user.role === 'DONOR') navigate('/donor/dashboard');
      else if (res.user.role === 'NGO') navigate('/ngo/dashboard');
      else if (res.user.role === 'VOLUNTEER') navigate('/volunteer/dashboard');
      else navigate('/');
    } catch (err) {
      const resp = err.response?.data;
      let msg = 'Registration failed. Please check your inputs.';
      const newFieldErrors = {};

      if (resp) {
        if (typeof resp === 'string') {
          msg = resp;
        } else if (resp.error) {
          msg = resp.error;
        } else if (resp.detail) {
          msg = resp.detail;
        } else if (typeof resp === 'object') {
          const messages = [];
          Object.entries(resp).forEach(([key, val]) => {
            const text = Array.isArray(val) ? val.join(' ') : String(val);
            newFieldErrors[key] = text;
            const label = key.replace(/_/g, ' ');
            if (key === 'username' && text.toLowerCase().includes('already exists')) {
              messages.push(`Username "${formData.username}" is already taken. Please pick another or log in.`);
            } else if (key === 'email' && text.toLowerCase().includes('already exists')) {
              messages.push(`Email "${formData.email}" is already registered. Please log in or use a different email.`);
            } else if (key === 'password') {
              messages.push(`Password error: ${text}`);
            } else {
              messages.push(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${text}`);
            }
          });
          if (messages.length > 0) {
            msg = messages.join(' • ');
          }
        }
      } else if (err.message) {
        msg = err.message;
      }
      setFieldErrors(newFieldErrors);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'DONOR',
      title: 'Commercial Food Donor',
      subtitle: 'Restaurants, Hotels, Caterers & Supermarkets',
      icon: Building2,
      color: '#09090b',
      badge: 'Enterprise Donor',
      details: 'Post surplus meals in seconds & track carbon impact',
      image: '/images/chef_donor_logging.jpg',
      headline: 'Commercial Kitchen & Surplus Dispatch',
      subtext: 'Log surplus food weight, preparation timestamps, and dietary tags in under 60 seconds with automated FSSAI safety countdowns.',
    },
    {
      id: 'NGO',
      title: 'Charity & Food Bank',
      subtitle: 'Shelters, Orphanages & Relief Foundations',
      icon: HeartHandshake,
      color: '#27272a',
      badge: 'Verified NGO',
      details: 'Receive smart matched food deliveries directly',
      image: '/images/food_bank_distribution.jpg',
      headline: 'Community Distribution & Meal Claims',
      subtext: 'Algorithmic matching routes fresh commercial surplus directly to your verified pantries and shelters based on daily capacity.',
    },
    {
      id: 'VOLUNTEER',
      title: 'Rescue Delivery Hero',
      subtitle: 'Bikes, Scooters, Cars & Vans',
      icon: Truck,
      color: '#09090b',
      badge: 'Courier Fleet',
      details: 'Claim nearby rescue routes & deliver warm meals',
      image: '/images/volunteer_transit.jpg',
      headline: 'Rapid Thermal Courier Logistics',
      subtext: 'Receive instant pickup notifications, turn-by-turn navigation, and chain-of-custody OTP verification at handover.',
    },
  ];

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        background: "linear-gradient(180deg, rgba(9, 9, 11, 0.88) 0%, rgba(9, 9, 11, 0.94) 100%), url('/images/hero_food_rescue.jpg') center/cover fixed no-repeat",
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          width: '100%',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(9, 9, 11, 0.88) 0%, rgba(24, 24, 27, 0.94) 100%), url('/images/about_mission.jpg') center/cover no-repeat",
            color: '#ffffff',
            padding: '2.75rem 2.5rem 2.25rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <BrandLogo
              variant="hybrid"
              theme="dark"
              size="md"
              subtitle="SMART FOOD RESCUE NETWORK"
              to="/"
            />
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.22)',
            }}
          >
            <Sparkles size={14} color="#27272a" />
            <span style={{ color: '#f4f4f5' }}>Join the ResQFood Network</span>
          </div>
          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
              color: '#ffffff',
            }}
          >
            Create Your Enterprise Account
          </h1>
          <p
            style={{
              fontSize: '0.98rem',
              color: '#e4e4e7',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Select your ecosystem role to configure your dedicated dashboard, smart matching engine, and compliance profile.
          </p>
        </div>

        {/* Content Area */}
        <div className="register-card-body" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
          {/* Role Selection Cards */}
          <div style={{ marginBottom: '2.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Step 1: Select Your Role
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    style={{
                      border: `2px solid ${isSelected ? r.color : 'var(--border)'}`,
                      background: isSelected ? `${r.color}0a` : '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem 1.15rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      boxShadow: isSelected ? `0 8px 20px ${r.color}22` : 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: `${r.color}18`,
                          color: r.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: isSelected ? r.color : 'var(--bg-alt)',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {r.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {r.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                      {r.subtitle}
                    </p>
                    <div style={{ fontSize: '0.74rem', color: isSelected ? r.color : 'var(--text-muted)', fontWeight: 600 }}>
                      ● {r.details}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Enterprise Role Context Showcase */}
          {(() => {
            const activeRole = roles.find((r) => r.id === role) || roles[0];
            return (
              <div
                className="register-role-showcase-grid"
                style={{
                  display: 'grid',
                  background: 'var(--bg-alt)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  marginBottom: '2.25rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="register-role-showcase-img" style={{ minHeight: '160px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={activeRole.image}
                    alt={activeRole.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="register-role-showcase-content" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 700, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                    <CheckCircle2 size={14} />
                    <span>Configured for {activeRole.title}</span>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {activeRole.headline}
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {activeRole.subtext}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '1.1rem 1.35rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                marginBottom: '1.75rem',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
                <div style={{ flex: 1, lineHeight: 1.5, fontWeight: 600 }}>
                  {error}
                </div>
              </div>
              {(error.toLowerCase().includes('already') || error.toLowerCase().includes('taken')) && (
                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1.9rem', marginTop: '0.35rem' }}>
                  <Link
                    to="/login"
                    className="btn btn-sm"
                    style={{
                      background: 'var(--brand-rose-gradient)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 1.15rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
                    }}
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Main Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Section 1: Personal / Account Details */}
            <div>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <User size={16} color="var(--primary)" />
                <span>Step 2: Account & Authorized Representative</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    placeholder="e.g. Vikram"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    placeholder="e.g. Mehta"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      style={fieldErrors.username ? { borderColor: '#ef4444', background: '#fff5f5' } : {}}
                      placeholder="e.g. donor_kitchen"
                      required
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.username && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.35rem' }}>
                      {fieldErrors.username}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    style={fieldErrors.email ? { borderColor: '#ef4444', background: '#fff5f5' } : {}}
                    placeholder="name@organization.org"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {fieldErrors.email && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.35rem' }}>
                      {fieldErrors.email}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password * (Min 8 characters)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-control"
                      placeholder="••••••••••••"
                      style={{ paddingRight: '2.5rem', ...(fieldErrors.password ? { borderColor: '#ef4444', background: '#fff5f5' } : {}) }}
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.35rem' }}>
                      {fieldErrors.password}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    required
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Operating Address / GPS Location Base *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="Building name, Street, Landmark, Bengaluru, Karnataka"
                    required
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Role Specific Details */}
            <div>
              <div
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FileText size={16} color="var(--primary)" />
                <span>
                  Step 3: {role === 'DONOR' ? 'Commercial Kitchen & Licensing' :
                           role === 'NGO' ? 'Charity Verification & Capacity' :
                           'Volunteer Fleet & Navigation'}
                </span>
              </div>

              {/* DONOR Fields */}
              {role === 'DONOR' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Restaurant or Enterprise Name</label>
                    <input
                      type="text"
                      name="business_name"
                      className="form-control"
                      placeholder="e.g. The Spice Garden Restaurant (Defaults to First Name Kitchen)"
                      value={formData.business_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">FSSAI License / Certificate Number</label>
                    <input
                      type="text"
                      name="food_license_number"
                      className="form-control"
                      placeholder="14-digit FSSAI License (Optional if in review)"
                      value={formData.food_license_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Pickup & Handover Instructions</label>
                    <input
                      type="text"
                      name="pickup_instructions"
                      className="form-control"
                      placeholder="e.g. Ring rear dispatch bell, bring thermal crates, handover via back gate."
                      value={formData.pickup_instructions}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* NGO Fields */}
              {role === 'NGO' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Registered Organization Name *</label>
                      <input
                        type="text"
                        name="org_name"
                        className="form-control"
                        placeholder="e.g. FeedHope Community Foundation"
                        value={formData.org_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">NGO Registration / 80G Certificate Number *</label>
                      <input
                        type="text"
                        name="registration_number"
                        className="form-control"
                        placeholder="e.g. NGO-BLR-2024-8841"
                        value={formData.registration_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Storage Capacity (kg) *</label>
                      <input
                        type="number"
                        name="capacity_kg"
                        className="form-control"
                        min="10"
                        value={formData.capacity_kg}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Accepted Food Categories</label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" name="accepts_cooked" checked={formData.accepts_cooked} onChange={handleChange} />
                          <span>Cooked Meals</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" name="accepts_raw" checked={formData.accepts_raw} onChange={handleChange} />
                          <span>Raw Groceries</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" name="accepts_packaged" checked={formData.accepts_packaged} onChange={handleChange} />
                          <span>Packaged / Bakery</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VOLUNTEER Fields */}
              {role === 'VOLUNTEER' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Vehicle Type</label>
                    <select
                      name="vehicle_type"
                      className="form-control"
                      value={formData.vehicle_type}
                      onChange={handleChange}
                    >
                      <option value="BIKE">Motorcycle / Scooter (Fast Dispatch)</option>
                      <option value="CAR">Car / SUV (Medium Batch up to 100kg)</option>
                      <option value="VAN">Delivery Van / Small Truck (Bulk Rescues)</option>
                      <option value="BICYCLE">Bicycle (Eco Urban)</option>
                      <option value="WALK">On Foot / Walking</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Travel Radius (km)</label>
                    <input
                      type="number"
                      name="max_distance_km"
                      className="form-control"
                      min="1"
                      max="100"
                      value={formData.max_distance_km}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Checkbox */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <input
                id="termsCheck"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: '0.2rem', cursor: 'pointer' }}
              />
              <label htmlFor="termsCheck" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                I confirm that all surplus food operations will follow <strong>FSSAI safe temperature guidelines</strong>, hygienic packaging, and the ResQFood Verified Rescue Charter.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '50px',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration as {role}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            Already have an enterprise login?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In to Your Dashboard
            </Link>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <ShieldCheck size={14} color="var(--primary)" />
            <span>FSSAI Compliant • MongoDB Atlas Cloud Protected • ISO 27001 Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
