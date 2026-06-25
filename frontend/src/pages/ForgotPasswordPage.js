import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-auth-page">
      <div className="cg-auth-card">
        <div className="cg-auth-logo">
          <div style={{ fontSize: 44 }}>🔐</div>
          <h2>Forgot Password</h2>
          <p>We'll send a reset link to your email</p>
        </div>
        {sent ? (
          <div className="text-center">
            <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
            <h5 style={{ color: 'var(--cyan)' }}>Email Sent!</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Check your inbox for password reset instructions. The link expires in 1 hour.</p>
            <Link to="/login" className="btn btn-cg-primary mt-2" style={{ justifyContent: 'center' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: 14 }}>Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope" /></span>
                <input type="email" className="form-control" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn w-100 btn-cg-primary" disabled={loading} style={{ justifyContent: 'center', padding: 11 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : 'Send Reset Link'}
            </button>
            <div className="text-center mt-3">
              <Link to="/login" style={{ fontSize: 13, color: 'var(--violet)' }}><i className="bi bi-arrow-left me-1" />Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
