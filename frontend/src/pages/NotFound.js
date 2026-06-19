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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a237e, #1565c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🛡️</div>
        <h1 style={{ fontSize: 80, fontWeight: 900, margin: 0, opacity: 0.3 }}>404</h1>
        <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 28 }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to={home} className="btn btn-lg" style={{ background: '#fff', color: '#1a237e', fontWeight: 700, borderRadius: 10, padding: '12px 28px' }}>
          <i className="bi bi-house me-2" />Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
