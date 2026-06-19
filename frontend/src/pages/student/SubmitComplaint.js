import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const categories = [
  { value: 'harassment', label: '😔 Harassment', desc: 'Personal harassment, intimidation' },
  { value: 'bullying', label: '👊 Bullying', desc: 'Physical or verbal bullying' },
  { value: 'ragging', label: '⚠️ Ragging', desc: 'Senior student ragging' },
  { value: 'smoking', label: '🚬 Smoking', desc: 'Smoking on campus' },
  { value: 'violence', label: '🔴 Violence', desc: 'Physical violence or threats' },
  { value: 'theft', label: '🔒 Theft', desc: 'Theft or property damage' },
  { value: 'academic', label: '📚 Academic', desc: 'Academic misconduct, cheating' },
  { value: 'misconduct', label: '⛔ Misconduct', desc: 'General misconduct' },
  { value: 'other', label: '📝 Other', desc: 'Any other campus issue' },
];

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'medium',
    isAnonymous: false, location: '', incidentDate: '', anonymousEmail: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) return toast.error('Please fill all required fields');
    if (form.description.length < 20) return toast.error('Description must be at least 20 characters');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach((f) => formData.append('evidence', f));

      const { data } = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmitted(data.complaint);
      toast.success('Complaint submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout title="Complaint Submitted">
        <div style={{ maxWidth: 520, margin: '40px auto' }}>
          <div className="cg-card text-center">
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <h4 style={{ color: '#2e7d32', fontWeight: 800 }}>Submitted Successfully!</h4>
            <p style={{ color: '#555' }}>Your complaint has been received. Please save your reference number.</p>
            <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '14px 20px', margin: '16px 0' }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Reference Number</div>
              <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: '#1a237e', letterSpacing: 2 }}>
                {submitted.referenceNumber}
              </div>
            </div>
            {submitted.isAnonymous && (
              <div style={{ background: '#fff3e0', borderRadius: 8, padding: 12, fontSize: 13, color: '#e65100', marginBottom: 12 }}>
                <i className="bi bi-incognito me-1" />This was submitted anonymously. Use your reference number to track it.
              </div>
            )}
            <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
              <button className="btn btn-cg-primary" onClick={() => navigate('/student/complaints')}>
                <i className="bi bi-list-ul me-1" />My Complaints
              </button>
              <button className="btn btn-outline-primary" onClick={() => { setSubmitted(null); setForm({ title: '', description: '', category: '', priority: 'medium', isAnonymous: false, location: '', incidentDate: '', anonymousEmail: '' }); setFiles([]); }}
                style={{ borderRadius: 8 }}>
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Submit Complaint">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Anonymous toggle banner */}
        <div className={`cg-card mb-4 ${form.isAnonymous ? 'border-warning' : ''}`}
          style={{ borderColor: form.isAnonymous ? '#ff8f00' : undefined }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <div style={{ fontWeight: 700, color: form.isAnonymous ? '#e65100' : '#1a237e' }}>
                <i className={`bi ${form.isAnonymous ? 'bi-incognito' : 'bi-person-check'} me-2`} />
                {form.isAnonymous ? 'Anonymous Mode: ON' : 'Identified Mode'}
              </div>
              <div style={{ fontSize: 13, color: '#757575', marginTop: 3 }}>
                {form.isAnonymous ? 'Your identity will be hidden from all staff' : 'Your name will be visible to proctors'}
              </div>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" role="switch" name="isAnonymous"
                id="anonSwitch" checked={form.isAnonymous} onChange={handleChange}
                style={{ width: 48, height: 24, cursor: 'pointer' }} />
              <label className="form-check-label" htmlFor="anonSwitch" style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Submit Anonymously
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Category grid */}
          <div className="cg-card mb-3">
            <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 14 }}>Select Category *</h6>
            <div className="row g-2">
              {categories.map((cat) => (
                <div key={cat.value} className="col-6 col-md-4">
                  <div
                    onClick={() => setForm({ ...form, category: cat.value })}
                    style={{
                      border: `2px solid ${form.category === cat.value ? 'var(--violet)' : 'var(--glass-border)'}`,
                      borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                      background: form.category === cat.value ? 'rgba(124,58,237,0.1)' : 'var(--bg-card)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.category === cat.value ? 'var(--violet-light)' : 'var(--text-primary)' }}>{cat.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{cat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cg-card mb-3">
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 14 }}>Complaint Title *</label>
              <input type="text" name="title" className="form-control" placeholder="Brief title describing the issue"
                value={form.title} onChange={handleChange} maxLength={150} required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
                Description * <span style={{ fontSize: 12, color: '#9e9e9e' }}>({form.description.length}/3000)</span>
              </label>
              <textarea name="description" className="form-control" rows={5}
                placeholder="Describe the incident in detail. Include who, what, when, where, and how it affected you..."
                value={form.description} onChange={handleChange} maxLength={3000} required style={{ resize: 'vertical' }} />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 14 }}>Priority</label>
                <select name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: 14 }}>Incident Date</label>
                <input type="date" name="incidentDate" className="form-control" value={form.incidentDate} onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 14 }}>Location</label>
                <input type="text" name="location" className="form-control" placeholder="e.g. Library Block, Canteen, Block-C Room 202"
                  value={form.location} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Anonymous email */}
          {form.isAnonymous && (
            <div className="cg-card mb-3" style={{ borderColor: '#ff8f00', border: '2px solid #ff8f00' }}>
              <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
                <i className="bi bi-envelope me-1" />Anonymous Email (Optional)
              </label>
              <input type="email" name="anonymousEmail" className="form-control"
                placeholder="Get email updates without revealing your identity"
                value={form.anonymousEmail} onChange={handleChange} />
              <div style={{ fontSize: 12, color: '#9e9e9e', marginTop: 6 }}>
                If provided, you'll receive status updates. This email is encrypted and not shared with staff.
              </div>
            </div>
          )}

          {/* Evidence upload */}
          <div className="cg-card mb-4">
            <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 4 }}>Evidence (Optional)</h6>
            <p style={{ fontSize: 13, color: '#757575', marginBottom: 12 }}>Upload photos, screenshots, documents or videos (max 5 files, 10MB each)</p>
            <input type="file" className="form-control" multiple accept="image/*,application/pdf,video/*"
              onChange={handleFiles} />
            {files.length > 0 && (
              <div className="mt-2 d-flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} style={{ background: '#e8eaf6', borderRadius: 6, padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`bi ${f.type.startsWith('image') ? 'bi-image' : f.type === 'application/pdf' ? 'bi-file-pdf' : 'bi-camera-video'}`} />
                    {f.name.length > 20 ? f.name.slice(0, 20) + '...' : f.name}
                    <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', padding: 0, fontSize: 13 }}>
                      <i className="bi bi-x" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)} style={{ borderRadius: 8 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-cg-primary" disabled={loading} style={{ minWidth: 160, justifyContent: 'center' }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                : <><i className="bi bi-send me-2" />Submit Complaint</>}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SubmitComplaint;
