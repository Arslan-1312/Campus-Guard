import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.identifier, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'chief_proctor') navigate('/chief/dashboard');
      else if (user.role === 'proctor') navigate('/proctor/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-auth-page page-enter">
      <div className="cg-auth-card fade-in stagger-1">
        <div className="cg-auth-logo">
          <div style={{ fontSize: 48 }}>🛡️</div>
          <h2>HU Campus Guard</h2>
          <p>Hazara University Safety Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 14 }}>Email or Roll Number</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person" /></span>
              <input
                type="text"
                name="identifier"
                className="form-control"
                placeholder="Roll No or @hu.edu.pk Email"
                value={form.identifier}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold mb-0" style={{ fontSize: 14 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--violet-light)' }}>Forgot password?</Link>
            </div>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock" /></span>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="input-group-text" style={{ cursor: 'pointer', background: 'none' }} onClick={() => setShowPass(!showPass)}>
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn w-100 btn-cg-primary" disabled={loading}
            style={{ padding: '11px', fontSize: 15, justifyContent: 'center' }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-3">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ fontSize: 13, color: 'var(--violet)', fontWeight: 600 }}>Register here</Link>
        </div>

        <div className="text-center mt-3">
          <Link to="/track" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <i className="bi bi-search me-1" />Track anonymous complaint
          </Link>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: 20, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--violet-light)' }}>Demo Accounts</div>
          <div>👨‍🎓 Student: 302-221045 / password123</div>
          <div>👮 Proctor: proctor@hu.edu.pk / password123</div>
          <div>🏛️ Chief: chief@hu.edu.pk / password123</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
