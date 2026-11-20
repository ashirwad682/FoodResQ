import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Package,
  Layers,
  Thermometer,
} from 'lucide-react';

export const NgoProfile = () => {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.organization?.address || user?.address || '',
    name: user?.organization?.name || '',
    registration_number: user?.organization?.registration_number || '',
    capacity_kg: user?.organization?.max_capacity_kg || user?.organization?.capacity_kg || 250,
    accepts_cooked: user?.organization?.accepts_cooked ?? true,
    accepts_raw: user?.organization?.accepts_raw ?? true,
    accepts_packaged: user?.organization?.accepts_packaged ?? true,
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
        organization: {
          name: formData.name,
          registration_number: formData.registration_number,
          capacity_kg: parseFloat(formData.capacity_kg) || 250,
          accepts_cooked: formData.accepts_cooked,
          accepts_raw: formData.accepts_raw,
          accepts_packaged: formData.accepts_packaged,
        },
      });
      await refreshProfile();
      setFeedback({ type: 'success', message: 'Shelter organization profile updated in MongoDB Atlas!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to update organization profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Shelter Organization Profile
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Manage your NGO registry details, daily storage intake capacity, and accepted food types.
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
        {/* NGO Identity Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--brand-rose-gradient)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.6rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
              flexShrink: 0,
            }}
          >
            {(formData.name?.[0] || user?.username?.[0] || 'N').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formData.name || user?.username}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--brand-rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <ShieldCheck size={16} />
              <span>
                {user?.organization?.is_verified ? 'Verified Non-Profit Shelter' : 'Pending Administrative Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Organization Information */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Shelter & Registration Details
          </h3>
          <div className="resq-responsive-grid-2">
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Organization Name *
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. FeedHope Community Foundation"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Government Registration / 80G Number
              </label>
              <input
                type="text"
                name="registration_number"
                className="form-control"
                placeholder="e.g. NGO-KA-2023-88214"
                value={formData.registration_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Daily Food Intake Capacity (kg) *
              </label>
              <input
                type="number"
                name="capacity_kg"
                className="form-control"
                placeholder="e.g. 250"
                value={formData.capacity_kg}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Used by the priority matching engine to prevent over-allocation.
              </span>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Primary Shelter Phone
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
          </div>
        </div>

        {/* Facility Address */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Delivery Drop-off Facility Address
          </h3>
          <div>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
              Full Street Address
            </label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="e.g. 45 Shelter Road, Near City Hospital, Bangalore"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Food Acceptance Capabilities */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Accepted Food Categories
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {[
              { name: 'accepts_cooked', label: 'Prepared Cooked Meals' },
              { name: 'accepts_raw', label: 'Raw Produce & Ingredients' },
              { name: 'accepts_packaged', label: 'Packaged & Bakery Goods' },
            ].map((cat) => (
              <label
                key={cat.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: formData[cat.name] ? 'rgba(24, 24, 27, 0.08)' : 'var(--bg-alt)',
                  border: `1px solid ${formData[cat.name] ? 'var(--brand-rose)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  name={cat.name}
                  checked={formData[cat.name]}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--brand-rose)' }}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
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
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
            }}
          >
            {loading ? 'Saving...' : 'Save Organization Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
