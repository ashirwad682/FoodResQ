import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import {
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  UtensilsCrossed,
  Calendar,
  MapPin,
  Thermometer,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const DonateFood = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDefaultExpiry = (hours = 6) => {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_type: 'COOKED_MEAL',
    quantity_kg: '',
    servings: '',
    expiry_time: getDefaultExpiry(6),
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
      () => setLocating(false),
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

  const setPresetHours = (hours) => {
    setFormData((prev) => ({
      ...prev,
      expiry_time: getDefaultExpiry(hours),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      const safeLat = !isNaN(latVal) && latVal >= -90 && latVal <= 90 ? latVal : 12.9716;
      const safeLng = !isNaN(lngVal) && lngVal >= -180 && lngVal <= 180 ? lngVal : 77.5946;
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
      navigate('/donor/donations', {
        state: { message: 'Surplus food batch successfully registered! AI matching engine is notifying nearby shelters.' },
      });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Header (Luminous Light Porcelain & Rose Silk Duo) */}
      <section className="resq-hero-panel resq-hero-donor">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(24, 24, 27, 0.06)',
              border: '1px solid rgba(24, 24, 27, 0.15)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.95rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#18181b',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem',
            }}
          >
            <Sparkles size={14} style={{ color: '#27272a' }} />
            <span>FSSAI Safe Surplus Intake Engine</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Post Surplus{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Food Batch
            </span>
          </h1>
          <p style={{ fontSize: '0.94rem', color: '#475569', maxWidth: '640px', lineHeight: 1.6 }}>
            Log excess prepared meals, bakery items, or raw ingredients. Our algorithmic matching system routes food to verified shelters before quality degrades.
          </p>
        </div>
      </section>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: 'var(--danger)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Form on Left, Live Preview Card on Right */}
      <div className="resq-form-layout-grid">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Section 1: Food Details */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UtensilsCrossed size={18} color="var(--brand-rose)" />
              <span>1. Food Specifications</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Food Batch Title *
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. Gourmet Vegetable Biryani & Raita (50 portions)"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="resq-responsive-grid-2">
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                    Category *
                  </label>
                  <select name="food_type" className="form-control" value={formData.food_type} onChange={handleChange}>
                    <option value="COOKED_MEAL">Cooked Meal (Ready to Eat)</option>
                    <option value="BAKERY">Bakery & Breads</option>
                    <option value="RAW_INGREDIENTS">Fresh Produce & Raw Ingredients</option>
                    <option value="PACKAGED_FOOD">Packaged / Canned Goods</option>
                    <option value="DAIRY">Dairy & Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                    Weight in Kilograms *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="quantity_kg"
                    className="form-control"
                    placeholder="e.g. 25.0"
                    value={formData.quantity_kg}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Estimated Meals / Servings
                </label>
                <input
                  type="number"
                  name="servings"
                  className="form-control"
                  placeholder={formData.quantity_kg ? `Auto-calculated: ~${Math.round(parseFloat(formData.quantity_kg) * 2.5)}` : 'e.g. 50'}
                  value={formData.servings}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Leave blank to auto-calculate at 2.5 meals per kg.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Description & Preparation Notes
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="List main ingredients, packaging details, and reheat guidelines..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Safe Expiry & Storage */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#0284c7" />
              <span>2. Preservation & Expiry Window</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', margin: 0 }}>
                    Safe Consumption Expiry Time *
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[2, 4, 6, 12, 24].map((h) => (
                      <button
                        type="button"
                        key={h}
                        onClick={() => setPresetHours(h)}
                        style={{
                          background: 'var(--bg-alt)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        +{h}h
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="datetime-local"
                  name="expiry_time"
                  className="form-control"
                  value={formData.expiry_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Current Holding Temperature *
                </label>
                <select name="storage_temp" className="form-control" value={formData.storage_temp} onChange={handleChange}>
                  <option value="HOT_HOLDING">Hot Holding (≥ 63°C / 145°F)</option>
                  <option value="REFRIGERATED">Refrigerated (≤ 4°C / 40°F)</option>
                  <option value="ROOM_TEMP">Ambient / Room Temperature</option>
                  <option value="FROZEN">Frozen (≤ -18°C / 0°F)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Dietary Tags */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#8b5cf6" />
              <span>3. Dietary & Allergen Declarations</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {[
                { name: 'is_vegetarian', label: 'Vegetarian' },
                { name: 'is_vegan', label: '100% Vegan' },
                { name: 'is_halal', label: 'Halal Certified' },
                { name: 'contains_nuts', label: 'Contains Tree Nuts / Peanuts' },
                { name: 'contains_gluten', label: 'Contains Gluten / Wheat' },
                { name: 'contains_dairy', label: 'Contains Dairy / Milk' },
              ].map((item) => (
                <label
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: formData[item.name] ? 'rgba(24, 24, 27, 0.08)' : 'var(--bg-alt)',
                    border: `1px solid ${formData[item.name] ? 'var(--brand-rose)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={formData[item.name]}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--brand-rose)' }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Pickup Logistics */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#f59e0b" />
              <span>4. Kitchen Pickup Location</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', margin: 0 }}>
                    Pickup Street Address *
                  </label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-rose)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Compass size={14} />
                    <span>{locating ? 'Detecting GPS...' : 'Auto-detect GPS'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  name="pickup_address"
                  className="form-control"
                  placeholder="e.g. 104 MG Road, Commercial Kitchen Dispatch Bay 3, Bangalore"
                  value={formData.pickup_address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Dispatch Instructions for Courier Rider
                </label>
                <textarea
                  name="special_instructions"
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Ring the rear kitchen bell; ask for Head Chef Suresh. Thermal bags required."
                  value={formData.special_instructions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Link to="/donor/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                background: 'var(--brand-rose-gradient)',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                fontSize: '0.98rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <PlusCircle size={18} />
              <span>{loading ? 'Registering on Ledger...' : 'Publish Surplus Batch'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Live Marketplace Preview
          </div>

          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: '#ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(24, 24, 27, 0.08)',
                  color: 'var(--brand-rose)',
                  border: '1px solid rgba(24, 24, 27, 0.15)',
                }}
              >
                AVAILABLE
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={12} />
                <span>Expires ~6h</span>
              </span>
            </div>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>
              {formData.title || 'Untitled Surplus Food Batch'}
            </h4>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              {formData.description || 'Description will appear here once entered...'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'var(--bg-alt)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formData.quantity_kg ? `${formData.quantity_kg} kg` : '0 kg'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantity</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ~{formData.servings || (formData.quantity_kg ? Math.round(parseFloat(formData.quantity_kg) * 2.5) : 0)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Meals</div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formData.pickup_address || 'Enter pickup location'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
