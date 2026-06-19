import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const departments = ['Computer Science', 'Information Technology', 'Software Engineering', 'Business Administration', 'Education', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Other'];

const CreateStaff = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'proctor', department: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/create-staff', form);
      toast.success(`${form.role === 'proctor' ? 'Proctor' : 'Chief Proctor'} account created!`);
      navigate('/chief/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Staff Member">
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div className="cg-card">
          <h5 style={{ fontWeight: 800, color: '#1a237e', marginBottom: 20 }}>
            <i className="bi bi-person-plus me-2" />Create Staff Account
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Role *</label>
              <div className="d-flex gap-3">
                {['proctor', 'chief_proctor'].map((r) => (
                  <div
                    key={r}
                    onClick={() => setForm({ ...form, role: r })}
                    style={{
                      flex: 1, border: `2px solid ${form.role === r ? '#3949ab' : '#e0e0e0'}`,
                      borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
                      background: form.role === r ? '#e8eaf6' : '#fff', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{r === 'proctor' ? '👮' : '🏛️'}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: form.role === r ? '#1a237e' : '#555', textTransform: 'capitalize' }}>
                      {r.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Full Name *</label>
              <input type="text" name="name" className="form-control" placeholder="Staff member's full name"
                value={form.name} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Email Address *</label>
              <input type="email" name="email" className="form-control" placeholder="official@hu.edu.pk"
                value={form.email} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Password *</label>
              <div className="input-group">
                <input type={showPass ? 'text' : 'password'} name="password" className="form-control"
                  placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} required />
                <button type="button" className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setShowPass(!showPass)}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-sm-7">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Department</label>
                <select name="department" className="form-select" value={form.department} onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-sm-5">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Phone</label>
                <input type="tel" name="phone" className="form-control" placeholder="03XX-XXXXXXX"
                  value={form.phone} onChange={handleChange} />
              </div>
            </div>

            {/* Info box */}
            <div style={{ background: '#e8eaf6', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#3949ab' }}>
              <i className="bi bi-info-circle me-2" />
              A welcome email will be sent to the staff member with their login credentials.
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/chief/users')} style={{ borderRadius: 8 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-cg-primary" disabled={loading} style={{ minWidth: 160, justifyContent: 'center' }}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                  : <><i className="bi bi-person-check me-1" />Create Account</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateStaff;
