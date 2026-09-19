import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { volunteerService } from '../../services/volunteerService';
import { User, Truck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const VolunteerProfile = () => {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
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
      setFeedback({ type: 'success', message: 'Volunteer profile and vehicle preferences updated!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Rescue Rider Profile</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Manage your contact credentials, transportation vehicle, and dispatch radius.
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
            background: '#ea580c',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.5rem',
          }}>
            <Truck size={30} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {formData.first_name ? `${formData.first_name} ${formData.last_name || ''}` : user?.username}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={16} />
              <span>Verified Rescue Volunteer Rider</span>
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
            <label className="form-label">Phone Number</label>
            <input type="text" name="phone_number" className="form-control" value={formData.phone_number} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Operating City / Address</label>
            <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Vehicle & Dispatch Preferences
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select name="vehicle_type" className="form-control" value={formData.vehicle_type} onChange={handleChange}>
                <option value="BIKE">Motorcycle / Scooter</option>
                <option value="CAR">Car / SUV</option>
                <option value="VAN">Delivery Van</option>
                <option value="BICYCLE">Bicycle</option>
                <option value="WALK">On Foot / Walk</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Travel Radius (km)</label>
              <input type="number" name="max_distance_km" className="form-control" value={formData.max_distance_km} onChange={handleChange} />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} />
              <span style={{ fontWeight: 600 }}>Active & Available to accept food rescue calls</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem' }}>
          <CheckCircle2 size={18} />
          <span>{loading ? 'Saving Changes...' : 'Save Volunteer Profile'}</span>
        </button>
      </form>
    </div>
  );
};
