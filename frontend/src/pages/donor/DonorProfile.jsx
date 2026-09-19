import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { User, Building, MapPin, Phone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const DonorProfile = () => {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    business_name: user?.donor_profile?.business_name || '',
    food_license_number: user?.donor_profile?.food_license_number || '',
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
      setFeedback({ type: 'success', message: 'Kitchen profile updated successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Kitchen & Donor Profile</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Manage your commercial donor credentials, FSSAI certification, and dispatch instructions.
        </p>
      </div>

      {feedback && (
        <div style={{
          background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#065f46' : 'var(--danger)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#10b981',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.5rem',
          }}>
            {(user?.username?.[0] || 'D').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {formData.business_name || user?.username}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={16} />
              <span>Verified Food Donor • {user?.is_verified ? 'Active FSSAI License' : 'Standard Partner'}</span>
            </div>
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Commercial Name / Restaurant</label>
            <input type="text" name="business_name" className="form-control" value={formData.business_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" name="phone_number" className="form-control" value={formData.phone_number} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">FSSAI / Food License Number</label>
          <input type="text" name="food_license_number" className="form-control" value={formData.food_license_number} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Default Commercial Kitchen Address</label>
          <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Default Driver Pickup Instructions</label>
          <textarea
            name="pickup_instructions"
            className="form-control"
            rows={3}
            value={formData.pickup_instructions}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem' }}>
          <CheckCircle2 size={18} />
          <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
};
