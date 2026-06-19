import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: '🔒', title: 'Anonymous Reporting', desc: 'Submit complaints without revealing your identity. Track using a unique reference number.' },
  { icon: '📊', title: 'Real-Time Tracking', desc: 'Monitor complaint status updates in real time from submission to resolution.' },
  { icon: '⚡', title: 'Fast Resolution', desc: 'Complaints routed directly to assigned proctors for prompt action.' },
  { icon: '📧', title: 'Email Notifications', desc: 'Automatic email alerts at every stage keep you informed.' },
  { icon: '🗂️', title: 'Evidence Upload', desc: 'Attach photos, videos, or documents to support your complaint.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Administrators gain full visibility with charts and statistics.' },
];

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="page-enter" style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--bg-surface)', opacity: 0.95, backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--glass-border)', padding: '14px 0' }}>
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 26 }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 17, lineHeight: 1 }}>HU Campus Guard</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Hazara University</div>
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center">
       
            <Link to="/track" className="btn btn-outline-primary btn-sm" style={{ borderRadius: 8 }}>
              <i className="bi bi-search me-1" />Track Complaint
            </Link>
            <Link to="/login" className="btn btn-cg-primary btn-sm" style={{ borderRadius: 8 }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-sm btn-outline-secondary d-none d-md-inline-flex" style={{ borderRadius: 8 }}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="fade-in stagger-1" style={{ background: 'linear-gradient(135deg, var(--violet) 0%, var(--indigo) 100%)', padding: '80px 0 100px', color: '#fff' }}>
        <div className="container text-center">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🛡️</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, marginBottom: 18, lineHeight: 1.2 }}>
            Campus Safety Starts Here
          </h1>
          <p style={{ fontSize: 'clamp(15px,2.5vw,20px)', color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto 36px' }}>
            Report campus issues confidentially. Hazara University's official platform for student complaint management and resolution.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--violet)', fontWeight: 700, borderRadius: 10, padding: '12px 28px' }}>
              <i className="bi bi-person-plus me-2" />Get Started
            </Link>
            <Link to="/track" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, borderRadius: 10, padding: '12px 28px', border: '2px solid rgba(255,255,255,0.4)' }}>
              <i className="bi bi-search me-2" />Track Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="fade-in stagger-2" style={{ background: 'var(--bg-surface)', padding: '28px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div className="row text-center g-3">
            {[['500+', 'Students Protected'], ['50+', 'Issues Resolved'], ['3', 'User Roles'], ['24/7', 'Available']].map(([val, lab]) => (
              <div className="col-6 col-md-3" key={lab}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--violet)' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lab}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="fade-in stagger-3" style={{ padding: '72px 0', background: 'var(--bg-base)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Everything You Need</h2>
            <p style={{ color: 'var(--text-secondary)' }}>A complete platform designed for the Hazara University community</p>
          </div>
          <div className="row g-4">
            {features.map((f) => (
              <div className="col-md-6 col-lg-4" key={f.title}>
                <div className="cg-card h-100">
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                  <h5 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '72px 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>How It Works</h2>
          </div>
          <div className="row g-4 text-center">
            {[
              { step: '1', icon: '📝', title: 'Submit', desc: 'File a complaint — named or anonymous' },
              { step: '2', icon: '🔍', title: 'Review', desc: 'Chief Proctor assigns to a Proctor' },
              { step: '3', icon: '⚙️', title: 'Action', desc: 'Proctor investigates and acts' },
              { step: '4', icon: '✅', title: 'Resolved', desc: 'You receive confirmation & resolution' },
            ].map((s) => (
              <div className="col-6 col-md-3" key={s.step}>
                <div style={{ background: 'var(--bg-card)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px', border: '1px solid var(--glass-border)' }}>
                  {s.icon}
                </div>
                <div style={{ background: 'var(--violet)', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, margin: '-42px 0 12px 50px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{s.step}</div>
                <h6 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</h6>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--violet), var(--indigo))', padding: '60px 0', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Your Voice Matters</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28 }}>Join hundreds of students making Hazara University safer.</p>
          <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--violet)', fontWeight: 700, borderRadius: 10, padding: '12px 32px' }}>
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--glass-border)', padding: '24px 0', textAlign: 'center', fontSize: 13 }}>
        <div className="container">
          <div style={{ color: 'var(--text-secondary)' }}>🛡️ <strong style={{ color: 'var(--text-primary)' }}>HU Campus Guard</strong> — Hazara University, Mansehra, KPK, Pakistan</div>
          <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} All rights reserved. Built with MERN Stack.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
