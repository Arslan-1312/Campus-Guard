import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

/* ── Animated counter hook ── */
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

/* ── Stat card with animated counter ── */
const StatCard = ({ icon, value, label, gradient, delay = 0 }) => {
  const animated = useCounter(value);
  return (
    <div className="cg-stat-card" style={{ animation: `fadeUp 0.5s ease ${delay}s both` }}>
      <div className="cg-stat-icon" style={{ background: gradient, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div>
        <div className="cg-stat-value" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {animated}
        </div>
        <div className="cg-stat-label">{label}</div>
      </div>
    </div>
  );
};

/* ── Quick Action Button ── */
const QuickBtn = ({ to, icon, label, gradient }) => (
  <Link to={to} style={{ textDecoration: 'none', flex: '1 1 auto' }}>
    <div style={{
      background: gradient, borderRadius: 12, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', transition: 'all 0.25s',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      height: '100%',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'; }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{label}</span>
    </div>
  </Link>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Student Dashboard">
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-6 col-lg-3">
            <div className="skeleton skeleton-card" style={{ height: 96, marginBottom: 0 }} />
          </div>
        ))}
      </div>
      <div className="skeleton skeleton-card" style={{ height: 200 }} />
    </Layout>
  );

  const stats = data?.stats || {};

  return (
    <Layout title="Student Dashboard">

      {/* Welcome Banner */}
      <div className="cg-welcome-banner" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
          <div>
            <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, fontSize: 22 }}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
              {user?.rollNumber && <><i className="bi bi-person-badge me-1" />{user.rollNumber} · </>}
              {user?.department}{user?.semester && ` · ${user.semester} Semester`}
            </p>
          </div>
          <div className="cg-banner-actions">
            <Link to="/student/submit" className="btn-cg-primary">
              <i className="bi bi-plus-circle" /> New Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { icon: '📋', value: stats.total || 0,    label: 'Total Complaints', gradient: 'linear-gradient(135deg,#7c3aed,#6366f1)', delay: 0 },
          { icon: '⏳', value: stats.pending || 0,   label: 'Pending',          gradient: 'linear-gradient(135deg,#f59e0b,#fb923c)', delay: 0.08 },
          { icon: '🔄', value: stats.inProgress || 0,label: 'In Progress',      gradient: 'linear-gradient(135deg,#06b6d4,#6366f1)', delay: 0.16 },
          { icon: '✅', value: stats.resolved || 0,  label: 'Resolved',         gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', delay: 0.24 },
        ].map((s) => (
          <div key={s.label} className="col-6 col-lg-3">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="cg-card mb-4">
        <h6 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontSize: 15 }}>
          Quick Actions
        </h6>
        <div className="cg-quick-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <QuickBtn to="/student/submit"     icon="✏️" label="Submit Complaint" gradient="linear-gradient(135deg,rgba(124,58,237,0.4),rgba(99,102,241,0.3))" />
          <QuickBtn to="/student/complaints" icon="📋" label="My Complaints"   gradient="linear-gradient(135deg,rgba(6,182,212,0.3),rgba(99,102,241,0.2))" />
          <QuickBtn to="/track"              icon="🔍" label="Track Anonymous"  gradient="linear-gradient(135deg,rgba(16,185,129,0.3),rgba(6,182,212,0.2))" />
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="cg-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h6 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: 15 }}>
            Recent Complaints
          </h6>
          <Link to="/student/complaints" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none' }}>
            View all <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {!data?.recentComplaints?.length ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📬</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No complaints yet.</div>
            <Link to="/student/submit" style={{ color: '#a78bfa', fontSize: 13 }}>Submit your first complaint →</Link>
          </div>
        ) : (
          <div className="cg-table-mobile-wrap table-responsive">
            <table className="cg-table">
              <thead>
                <tr>
                  <th>Reference</th><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {data.recentComplaints.map((c) => (
                  <tr key={c._id}>
                    <td data-label="Ref"><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#a78bfa' }}>{c.referenceNumber}</span></td>
                    <td data-label="Title" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{c.title}</td>
                    <td data-label="Category" style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{c.category}</td>
                    <td data-label="Status"><StatusBadge status={c.status} /></td>
                    <td data-label="Date" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td data-label="">
                      <Link to={`/student/complaints/${c._id}`} className="btn btn-outline-primary btn-sm" style={{ borderRadius: 8, fontSize: 12 }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
