import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  User,
  Building,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  UtensilsCrossed,
  Clock,
} from 'lucide-react';

export const DonorProfile = () => {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.donor_profile?.address || user?.address || '',
    business_name: user?.donor_profile?.organization_name || user?.donor_profile?.business_name || '',
    food_license_number: user?.donor_profile?.fssai_license || user?.donor_profile?.food_license_number || '',
    pickup_instructions: user?.donor_profile?.pickup_instructions || '',
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        donor_profile: {
          business_name: formData.business_name,
          food_license_number: formData.food_license_number,
          pickup_instructions: formData.pickup_instructions,
        },
      });
      await refreshProfile();
      setFeedback({ type: 'success', message: 'Kitchen credentials and dispatch profile updated in MongoDB Atlas!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to update kitchen profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Kitchen & Donor Profile
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Manage your commercial donor credentials, FSSAI certification, and dispatch instructions for couriers.
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
        {/* Donor Identity Header */}
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
            {(formData.business_name?.[0] || user?.username?.[0] || 'D').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formData.business_name || user?.username}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--brand-rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <ShieldCheck size={16} />
              <span>Verified Food Donor Kitchen • {user?.is_verified ? 'FSSAI License Active' : 'Standard Partner'}</span>
            </div>
          </div>
        </div>

        {/* Business Credentials */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Commercial Establishment Details
          </h3>
          <div className="resq-responsive-grid-2">
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Restaurant / Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                className="form-control"
                placeholder="e.g. Spice Garden Fine Dining"
                value={formData.business_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                FSSAI / Food Safety License Number
              </label>
              <input
                type="text"
                name="food_license_number"
                className="form-control"
                placeholder="e.g. FSSAI-2024-BLR-8891"
                value={formData.food_license_number}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Primary Contact Person */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Kitchen Manager Contact
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
                placeholder="Manager first name"
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
                placeholder="Manager last name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Phone Number
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
                Kitchen Email
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

        {/* Dispatch Location & Instructions */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Default Pickup Bay & Courier Instructions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Default Kitchen Street Address
              </label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Commercial street address for courier dispatch"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Courier Access Instructions
              </label>
              <textarea
                name="pickup_instructions"
                className="form-control"
                rows="3"
                placeholder="e.g. Couriers should enter through the rear loading bay next to parking lot A. Mention ResQFood pickup at the reception."
                value={formData.pickup_instructions}
                onChange={handleChange}
              />
            </div>
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
            {loading ? 'Saving...' : 'Save Kitchen Credentials'}
          </button>
        </div>
      </form>
    </div>
  );
};
