import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-APPROVED" style={{ marginBottom: '0.75rem' }}>Get in Touch</span>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '1rem' }}>
            We're Here to Support Your Rescue Operations
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
            Have questions about integrating with ResQFood or need emergency dispatch assistance? Reach out.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Direct Channels</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 113, 133, 0.12)', color: 'var(--brand-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency Surplus Hotline</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>+91 (800) 456-RESQ (7377)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-rose)' }}>24/7 Priority Emergency Support</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Operations & Inquiries</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>support@resqfood.org</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response within 2 hours</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Central Innovation Hub</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Indiranagar, Bengaluru, India</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coordinates: 12.9719° N, 77.6412° E</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Send Us a Message</h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--brand-rose)', margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Thank You!</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Your inquiry has been logged with our dispatch center. A coordinator will reach out shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Chef Vikram Mehta"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="vikram@kitchen.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Surplus Pickup Inquiry / Corporate Partner"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    required
                    className="form-control"
                    placeholder="Details about your kitchen, average daily excess, or inquiry..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={16} />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
