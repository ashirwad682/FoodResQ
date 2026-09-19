import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartHandshake, Building2, Truck, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('DONOR');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    // Donor
    business_name: '',
    food_license_number: '',
    pickup_instructions: '',
    // NGO
    org_name: '',
    registration_number: '',
    capacity_kg: 200,
    accepts_cooked: true,
    accepts_raw: true,
    accepts_packaged: true,
    // Volunteer
    vehicle_type: 'BIKE',
    max_distance_km: 15,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: role,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        address: formData.address,
      };

      if (role === 'DONOR') {
        payload.donor_profile = {
          business_name: formData.business_name || `${formData.first_name}'s Kitchen`,
          food_license_number: formData.food_license_number,
          pickup_instructions: formData.pickup_instructions,
        };
      } else if (role === 'NGO') {
        payload.organization = {
          name: formData.org_name || `${formData.first_name} Relief`,
          registration_number: formData.registration_number,
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
      const msg = err.response?.data?.error || err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed. Please check your inputs.';
      setError(typeof msg === 'string' ? msg : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem', background: 'var(--bg-alt)' }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div className="card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Join the Rescue Network
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Choose your role and start making an immediate impact today
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="role-selector-grid" style={{ marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => setRole('DONOR')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${role === 'DONOR' ? 'var(--primary)' : 'var(--border)'}`,
                background: role === 'DONOR' ? '#ecfdf5' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <HeartHandshake size={24} color={role === 'DONOR' ? '#10b981' : '#64748b'} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'DONOR' ? '#047857' : 'var(--text-primary)' }}>
                Food Donor
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('NGO')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${role === 'NGO' ? 'var(--info)' : 'var(--border)'}`,
                background: role === 'NGO' ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Building2 size={24} color={role === 'NGO' ? '#3b82f6' : '#64748b'} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'NGO' ? '#1d4ed8' : 'var(--text-primary)' }}>
                NGO / Shelter
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('VOLUNTEER')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${role === 'VOLUNTEER' ? 'var(--warning)' : 'var(--border)'}`,
                background: role === 'VOLUNTEER' ? '#fefce8' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Truck size={24} color={role === 'VOLUNTEER' ? '#f59e0b' : '#64748b'} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: role === 'VOLUNTEER' ? '#b45309' : 'var(--text-primary)' }}>
                Rescue Rider
              </span>
            </button>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-control"
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
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  required
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phone_number"
                  className="form-control"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Complete Street Address *</label>
              <input
                type="text"
                name="address"
                className="form-control"
                required
                placeholder="Shop/Apartment, Street, Landmark, City"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Role Specific Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                {role === 'DONOR' ? 'Kitchen & Business Details' :
                 role === 'NGO' ? 'NGO Capacity & Preferences' : 'Volunteer Fleet Details'}
              </div>

              {role === 'DONOR' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Restaurant / Enterprise Name</label>
                    <input
                      type="text"
                      name="business_name"
                      className="form-control"
                      placeholder="e.g. Grand Palace Hotel"
                      value={formData.business_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">FSSAI / Safety License Number</label>
                    <input
                      type="text"
                      name="food_license_number"
                      className="form-control"
                      placeholder="14-digit FSSAI License"
                      value={formData.food_license_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {role === 'NGO' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label className="form-label">Organization Name *</label>
                      <input
                        type="text"
                        name="org_name"
                        className="form-control"
                        placeholder="e.g. Hope Shelter Foundation"
                        value={formData.org_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Storage Capacity (kg) *</label>
                      <input
                        type="number"
                        name="capacity_kg"
                        className="form-control"
                        value={formData.capacity_kg}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'VOLUNTEER' && (
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select
                      name="vehicle_type"
                      className="form-control"
                      value={formData.vehicle_type}
                      onChange={handleChange}
                    >
                      <option value="BIKE">Motorcycle / Scooter</option>
                      <option value="CAR">Car / SUV</option>
                      <option value="VAN">Delivery Van</option>
                      <option value="BICYCLE">Bicycle</option>
                      <option value="WALK">On Foot / Walk</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Travel Radius (km)</label>
                    <input
                      type="number"
                      name="max_distance_km"
                      className="form-control"
                      value={formData.max_distance_km}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            >
              <CheckCircle2 size={18} />
              <span>{loading ? 'Creating Your Account...' : `Register as ${role}`}</span>
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
