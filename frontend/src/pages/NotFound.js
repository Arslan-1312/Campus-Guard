import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();
  const home = user
    ? user.role === 'chief_proctor' ? '/chief/dashboard'
    : user.role === 'proctor' ? '/proctor/dashboard'
    : '/student/dashboard'
    : '/';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🛡️</div>
        <h1 style={{ fontSize: 80, fontWeight: 900, margin: 0, opacity: 0.3 }}>404</h1>
        <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to={home} className="btn btn-cg-primary btn-glow" style={{ borderRadius: 10, padding: '12px 28px' }}>
          <i className="bi bi-house me-2" />Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
