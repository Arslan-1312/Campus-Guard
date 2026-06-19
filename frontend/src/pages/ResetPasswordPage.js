import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-auth-page">
      <div className="cg-auth-card">
        <div className="cg-auth-logo">
          <div style={{ fontSize: 44 }}>🔒</div>
          <h2>Reset Password</h2>
          <p>Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 14 }}>New Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ fontSize: 14 }}>Confirm Password</label>
            <input type="password" className="form-control" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn w-100 btn-cg-primary" disabled={loading} style={{ justifyContent: 'center', padding: 11 }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Resetting...</> : 'Reset Password'}
          </button>
          <div className="text-center mt-3">
            <Link to="/login" style={{ fontSize: 13, color: '#1a237e' }}><i className="bi bi-arrow-left me-1" />Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
