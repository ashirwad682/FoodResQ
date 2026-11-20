import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  User,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Compass,
  Star,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const VolunteerProfile = () => {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.volunteer_profile?.address || user?.address || '',
    vehicle_type: user?.volunteer_profile?.vehicle_type || 'BIKE',
    max_distance_km: user?.volunteer_profile?.max_distance_km || 15,
    is_available: user?.volunteer_profile?.is_available ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await authService.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        address: formData.address,
        volunteer_profile: {
          vehicle_type: formData.vehicle_type,
          max_distance_km: parseFloat(formData.max_distance_km) || 15,
          is_available: formData.is_available,
        },
      });
      await refreshProfile();
      setFeedback({ type: 'success', message: 'Courier preferences and vehicle credentials updated in MongoDB Atlas!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const rating = user?.volunteer_profile?.rating || 5.0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Courier Rider Profile
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Manage your contact credentials, delivery vehicle, and dispatch radius.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#065f46' : 'var(--danger)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Courier Identity Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.6rem',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              flexShrink: 0,
            }}
          >
            <Truck size={30} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formData.first_name ? `${formData.first_name} ${formData.last_name || ''}` : user?.username}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <ShieldCheck size={16} />
              <span>Verified Rescue Courier • Rating: {rating} ★</span>
            </div>
          </div>
        </div>

        {/* Courier Contact */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Personal & Contact Information
          </h3>
          <div className="resq-responsive-grid-2">
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Contact Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Courier Email
              </label>
              <input
                type="email"
                disabled
                className="form-control"
                value={user?.email || `${user?.username}@resqfood.org`}
                style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)' }}
              />
            </div>
          </div>
        </div>

        {/* Vehicle & Dispatch Preferences */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Transportation Vehicle & Dispatch Radius
          </h3>
          <div className="resq-responsive-grid-2">
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Delivery Vehicle *
              </label>
              <select name="vehicle_type" className="form-control" value={formData.vehicle_type} onChange={handleChange}>
                <option value="BIKE">Bicycle / Cycle</option>
                <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                <option value="CAR">Car / Hatchback</option>
                <option value="VAN">Van / Utility Cargo</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Maximum Dispatch Radius (km)
              </label>
              <input
                type="number"
                name="max_distance_km"
                className="form-control"
                min="2"
                max="50"
                value={formData.max_distance_km}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Operating Address */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Home Base / Starting Location
          </h3>
          <div>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
              Base Street Address
            </label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="e.g. Indiranagar, Bangalore"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Duty Toggle in Form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              On-Duty Dispatch Availability
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              When enabled, our priority engine routes nearby rescue missions to your phone.
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
            />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Available</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              background: 'var(--brand-rose-gradient)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '0.8rem 2rem',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
            }}
          >
            {loading ? 'Saving...' : 'Save Courier Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
