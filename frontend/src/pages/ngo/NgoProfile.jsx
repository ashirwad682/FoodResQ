import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Building2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const NgoProfile = () => {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    name: user?.organization?.name || '',
    registration_number: user?.organization?.registration_number || '',
    capacity_kg: user?.organization?.capacity_kg || 250,
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
      setFeedback({ type: 'success', message: 'Organization profile updated successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to update organization profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Organization Profile</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Manage your NGO registry details, daily storage capacity, and accepted food types.
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
            background: '#3b82f6',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.5rem',
          }}>
            <Building2 size={30} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {formData.name || user?.username}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--info)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={16} />
              <span>Certified Non-Profit / Shelter Partner</span>
            </div>
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Organization Legal Name</label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">NGO Registration / Trust Number</label>
            <input type="text" name="registration_number" className="form-control" value={formData.registration_number} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Contact Person Name</label>
            <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input type="text" name="phone_number" className="form-control" value={formData.phone_number} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Shelter Street Address</label>
          <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Daily Cold/Dry Storage Capacity (kg)</label>
          <input type="number" name="capacity_kg" className="form-control" value={formData.capacity_kg} onChange={handleChange} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <span className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Accepted Food Types</span>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input type="checkbox" name="accepts_cooked" checked={formData.accepts_cooked} onChange={handleChange} />
              <span>Cooked & Hot Meals</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input type="checkbox" name="accepts_raw" checked={formData.accepts_raw} onChange={handleChange} />
              <span>Raw Produce & Grains</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input type="checkbox" name="accepts_packaged" checked={formData.accepts_packaged} onChange={handleChange} />
              <span>Packaged & Canned Goods</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem' }}>
          <CheckCircle2 size={18} />
          <span>{loading ? 'Saving Changes...' : 'Save Organization Profile'}</span>
        </button>
      </form>
    </div>
  );
};
