import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { PlusCircle, AlertCircle, CheckCircle2, UtensilsCrossed, Calendar, MapPin, Thermometer, ShieldAlert } from 'lucide-react';

export const DonateFood = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Expiry min date/time (now + 1 hour in YYYY-MM-DDTHH:MM)
  const getMinExpiry = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  // Default expiry (now + 6 hours)
  const getDefaultExpiry = () => {
    const d = new Date(Date.now() + 6 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_type: 'COOKED_MEAL',
    quantity_kg: '',
    servings: '',
    expiry_time: getDefaultExpiry(),
    storage_temp: 'HOT_HOLDING',
    is_vegetarian: true,
    is_vegan: false,
    is_halal: true,
    contains_nuts: false,
    contains_gluten: false,
    contains_dairy: false,
    pickup_address: user?.address || '',
    pickup_latitude: user?.latitude || 12.9716,
    pickup_longitude: user?.longitude || 77.5946,
    special_instructions: user?.donor_profile?.pickup_instructions || '',
  });

  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          pickup_latitude: parseFloat(pos.coords.latitude.toFixed(4)),
          pickup_longitude: parseFloat(pos.coords.longitude.toFixed(4)),
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

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

    // Validations
    const qty = parseFloat(formData.quantity_kg);
    if (!qty || qty <= 0) {
      setError('Quantity must be greater than 0 kg.');
      return;
    }

    const expiryDate = new Date(formData.expiry_time);
    if (expiryDate <= new Date()) {
      setError('Expiry time must be strictly in the future.');
      return;
    }

    setLoading(true);
    try {
      const latVal = parseFloat(formData.pickup_latitude);
      const lngVal = parseFloat(formData.pickup_longitude);
      const safeLat = (!isNaN(latVal) && latVal >= -90 && latVal <= 90) ? latVal : 12.9716;
      const safeLng = (!isNaN(lngVal) && lngVal >= -180 && lngVal <= 180) ? lngVal : 77.5946;
      const count = parseInt(formData.servings) || Math.round(qty * 2.5);

      const payload = {
        title: formData.title,
        description: formData.description,
        food_type: formData.food_type,
        quantity_kg: qty,
        serves_count: count,
        servings: count,
        expiry_time: expiryDate.toISOString(),
        storage_temp: formData.storage_temp,
        is_vegetarian: formData.is_vegetarian,
        is_vegan: formData.is_vegan,
        is_halal: formData.is_halal,
        contains_nuts: formData.contains_nuts,
        contains_gluten: formData.contains_gluten,
        contains_dairy: formData.contains_dairy,
        pickup_address: formData.pickup_address,
        latitude: safeLat,
        longitude: safeLng,
        pickup_latitude: safeLat,
        pickup_longitude: safeLng,
        special_instructions: formData.special_instructions,
        dietary_flags: [
          formData.is_vegetarian && 'Vegetarian',
          formData.is_vegan && 'Vegan',
          formData.is_halal && 'Halal',
          formData.contains_nuts && 'Contains Nuts',
          formData.contains_gluten && 'Contains Gluten',
          formData.contains_dairy && 'Contains Dairy',
        ].filter(Boolean),
      };

      await donationService.createDonation(payload);
      navigate('/donor/donations', { state: { message: 'Donation created successfully! Matching algorithm is notifying nearby NGOs.' } });
    } catch (err) {
      const resp = err.response?.data;
      let msg = 'Failed to register donation.';
      if (resp) {
        if (resp.error) msg = resp.error;
        else if (resp.detail) msg = resp.detail;
        else if (typeof resp === 'object') {
          const firstKey = Object.keys(resp)[0];
          const val = resp[firstKey];
          msg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : JSON.stringify(resp);
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Donate Surplus Food</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Register available surplus meals or raw items. Our matching engine will instantly pair this with verified shelters nearby.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: 'var(--danger)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UtensilsCrossed size={18} color="var(--primary)" />
            <span>Food Batch Information</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Batch Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g. Prepared Rice & Curry, Fresh Bread Loaves"
              required
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Ingredients</label>
            <textarea
              name="description"
              className="form-control"
              rows={3}
              placeholder="List items, preparation details, or allergen warnings..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Food Category *</label>
              <select name="food_type" className="form-control" value={formData.food_type} onChange={handleChange}>
                <option value="COOKED_MEAL">Cooked Meal</option>
                <option value="RAW_INGREDIENTS">Raw Ingredients / Produce</option>
                <option value="BAKED_GOODS">Bakery & Breads</option>
                <option value="PACKAGED">Packaged / Canned</option>
                <option value="DAIRY">Dairy Products</option>
                <option value="BEVERAGES">Beverages</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Quantity (kg) *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                name="quantity_kg"
                className="form-control"
                placeholder="e.g. 15.0"
                required
                value={formData.quantity_kg}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Approximate Servings</label>
              <input
                type="number"
                min="1"
                name="servings"
                className="form-control"
                placeholder="e.g. 40 people"
                value={formData.servings}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Expiry & Preservation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--warning)" />
            <span>Expiry & Storage Conditions</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Safe Consumption Until *</label>
              <input
                type="datetime-local"
                name="expiry_time"
                min={getMinExpiry()}
                className="form-control"
                required
                value={formData.expiry_time}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Must be consumed before this time for safety compliance.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Storage Temperature Requirement *</label>
              <select name="storage_temp" className="form-control" value={formData.storage_temp} onChange={handleChange}>
                <option value="ROOM_TEMP">Room Temperature (Dry / Ambient)</option>
                <option value="REFRIGERATED">Refrigerated (Below 5°C)</option>
                <option value="FROZEN">Frozen (Below -18°C)</option>
                <option value="HOT_HOLDING">Hot Holding (Above 63°C)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dietary & Allergen Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span className="form-label" style={{ marginBottom: 0 }}>Dietary & Allergen Tags</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" name="is_vegetarian" checked={formData.is_vegetarian} onChange={handleChange} />
              <span>Vegetarian</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" name="is_vegan" checked={formData.is_vegan} onChange={handleChange} />
              <span>Vegan</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" name="is_halal" checked={formData.is_halal} onChange={handleChange} />
              <span>Halal</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" name="contains_nuts" checked={formData.contains_nuts} onChange={handleChange} />
              <span>Contains Nuts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" name="contains_gluten" checked={formData.contains_gluten} onChange={handleChange} />
              <span>Contains Gluten</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" name="contains_dairy" checked={formData.contains_dairy} onChange={handleChange} />
              <span>Contains Dairy</span>
            </label>
          </div>
        </div>

        {/* Pickup Logistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--info)" />
            <span>Pickup Logistics</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Exact Pickup Address *</label>
            <input
              type="text"
              name="pickup_address"
              className="form-control"
              required
              value={formData.pickup_address}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              GPS Coordinates (Used by Priority Engine to find nearest NGOs)
            </span>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
            >
              <MapPin size={13} style={{ color: 'var(--primary)' }} />
              <span>{locating ? 'Detecting GPS...' : '📍 Auto-Detect GPS Location'}</span>
            </button>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label">Pickup Latitude (-90.0 to 90.0)</label>
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                name="pickup_latitude"
                placeholder="e.g. 25.6093 or 12.9716"
                className="form-control"
                value={formData.pickup_latitude}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pickup Longitude (-180.0 to 180.0)</label>
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                name="pickup_longitude"
                placeholder="e.g. 85.1376 or 77.5946"
                className="form-control"
                value={formData.pickup_longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pickup Instructions for Riders & Drivers</label>
            <textarea
              name="special_instructions"
              className="form-control"
              rows={2}
              placeholder="e.g. Park at loading bay 3, call manager upon arrival..."
              value={formData.special_instructions}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={() => navigate('/donor/dashboard')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            <PlusCircle size={18} />
            <span>{loading ? 'Registering...' : 'Register & Broadcast Surplus'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
