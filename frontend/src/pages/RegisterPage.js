import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const departments = ['Computer Science', 'Information Technology', 'Software Engineering', 'Business Administration', 'Education', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Other'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', rollNumber: '', department: '', semester: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) return toast.error('Please fill all required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, rollNumber: form.rollNumber, department: form.department, semester: form.semester, phone: form.phone });
      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-auth-page page-enter">
      <div className="cg-auth-card fade-in stagger-1" style={{ maxWidth: 480 }}>
        <div className="cg-auth-logo">
          <div style={{ fontSize: 44 }}>🛡️</div>
          <h2>Create Account</h2>
          <p>Join HU Campus Guard — Hazara University</p>
        </div>

        {/* Step indicator */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s ? 'var(--violet)' : 'var(--glass-border)',
                color: step >= s ? '#fff' : 'var(--text-secondary)', fontWeight: 700, fontSize: 13,
              }}>{s}</div>
              {s === 1 && <div style={{ flex: 1, height: 2, background: step > 1 ? 'var(--violet)' : 'var(--glass-border)', maxWidth: 40 }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={nextStep}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Full Name *</label>
              <input type="text" name="name" className="form-control" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Email Address *</label>
              <input type="email" name="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Password *</label>
              <div className="input-group">
                <input type={showPass ? 'text' : 'password'} name="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                <button type="button" className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setShowPass(!showPass)}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Confirm Password *</label>
              <input type="password" name="confirmPassword" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn w-100 btn-cg-primary" style={{ justifyContent: 'center', padding: 11 }}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Roll Number</label>
              <input type="text" name="rollNumber" className="form-control" placeholder="e.g. HU-CS-2021-01" value={form.rollNumber} onChange={handleChange} />
            </div>
            <div className="row g-2 mb-3">
              <div className="col-7">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Department</label>
                <select name="department" className="form-select" value={form.department} onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-5">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Semester</label>
                <select name="semester" className="form-select" value={form.semester} onChange={handleChange}>
                  <option value="">Semester</option>
                  {semesters.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Phone Number</label>
              <input type="tel" name="phone" className="form-control" placeholder="03XX-XXXXXXX" value={form.phone} onChange={handleChange} />
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary flex-shrink-0" onClick={() => setStep(1)}>
                <i className="bi bi-arrow-left" />
              </button>
              <button type="submit" className="btn btn-cg-primary flex-grow-1" disabled={loading} style={{ justifyContent: 'center', padding: 11 }}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-3">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontSize: 13, color: 'var(--violet)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
