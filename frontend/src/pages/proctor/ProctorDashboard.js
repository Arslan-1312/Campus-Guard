import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/shared/Layout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

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

const StatCard = ({ icon, value, label, gradient, delay = 0 }) => {
  const animated = useCounter(value);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        y: -5,
        borderColor: 'rgba(225, 29, 72, 0.3)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)'
      }}
      className="cg-stat-card"
    >
      <div className="cg-stat-icon" style={{ background: gradient, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div>
        <div className="cg-stat-value" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {animated}
        </div>
        <div className="cg-stat-label">{label}</div>
      </div>
    </motion.div>
  );
};

const PriorityTag = ({ priority }) => {
  const config = {
    urgent: { bg: 'rgba(244,63,94,0.15)', color: '#fb7185', label: '🔴 Urgent' },
    high:   { bg: 'rgba(249,115,22,0.15)', color: '#fb923c', label: '🟠 High' },
    medium: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: '🟡 Medium' },
    low:    { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: '🟢 Low' },
  };
  const c = config[priority] || config.medium;
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      {c.label}
    </span>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const ProctorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/proctor').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Proctor Dashboard">
      <div className="row g-3 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="col-12 col-md-4">
            <div className="skeleton skeleton-card" style={{ height: 96, marginBottom: 0 }} />
          </div>
        ))}
      </div>
      <div className="skeleton skeleton-card" style={{ height: 240 }} />
    </Layout>
  );

  const stats = data?.stats || {};
  const urgentComplaints = data?.recentComplaints?.filter(c => c.priority === 'urgent' || c.priority === 'high') || [];

  return (
    <Layout title="Proctor Dashboard">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Banner */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 }
          }}
          className="cg-welcome-banner" 
          style={{ marginBottom: 24 }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, fontSize: 22 }}>
              Proctor Panel 👮 — {user?.name}
            </h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
              Manage and resolve assigned student complaints in real-time
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { icon: '📋', value: stats.assigned   || 0, label: 'Active Assigned', gradient: 'linear-gradient(135deg,#e11d48,#dc2626)', delay: 0 },
            { icon: '⚙️', value: stats.inProgress || 0, label: 'In Progress',     gradient: 'linear-gradient(135deg,#dc2626,#b91c1c)', delay: 0.1 },
            { icon: '✅', value: stats.resolved   || 0, label: 'Resolved',         gradient: 'linear-gradient(135deg,#16a34a,#15803d)', delay: 0.2 },
          ].map((s) => (
            <div key={s.label} className="col-4">
              <StatCard {...s} />
            </div>
          ))}
        </div>

        {/* Urgent Alert */}
        {urgentComplaints.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              borderColor: ['rgba(244,63,94,0.3)', 'rgba(244,63,94,0.6)', 'rgba(244,63,94,0.3)']
            }}
            transition={{
              scale: { duration: 0.3 },
              borderColor: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
            }}
            className="cg-urgent-alert" 
            style={{
              background: 'linear-gradient(135deg,rgba(244,63,94,0.15),rgba(249,115,22,0.1))',
              border: '1px solid rgba(244,63,94,0.3)', borderRadius: 14,
              padding: '16px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <div style={{ color: '#fb7185', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                {urgentComplaints.length} Urgent / High Priority Complaint{urgentComplaints.length > 1 ? 's' : ''} Need Attention
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Please review these complaints immediately
              </div>
            </div>
            <Link to="/proctor/complaints" className="btn-cg-primary btn-glow cg-urgent-alert-btn" style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: 13 }}>
              View Now
            </Link>
          </motion.div>
        )}

        {/* Assigned Complaints Table */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 }
          }}
          className="cg-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h6 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: 15 }}>
              Assigned Complaints
            </h6>
            <Link to="/proctor/complaints" style={{ fontSize: 13, color: '#fb7185', textDecoration: 'none' }}>
              View all <i className="bi bi-arrow-right" />
            </Link>
          </div>

          {!data?.recentComplaints?.length ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 14 }}>No complaints assigned yet</div>
            </div>
          ) : (
            <div className="cg-table-mobile-wrap table-responsive">
              <table className="cg-table">
                <thead>
                  <tr><th>Ref #</th><th>Title</th><th>Student</th><th>Priority</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {data.recentComplaints.map((c) => (
                    <motion.tr 
                      key={c._id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                      <td data-label="Ref"><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fb7185' }}>{c.referenceNumber}</span></td>
                      <td data-label="Title" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{c.title}</td>
                      <td data-label="Student" style={{ fontSize: 13 }}>
                        {c.isAnonymous
                          ? <span style={{ color: '#fb923c' }}><i className="bi bi-incognito me-1" />Anonymous</span>
                          : <span style={{ color: 'var(--text-secondary)' }}>{c.submittedBy?.name}</span>}
                      </td>
                      <td data-label="Priority"><PriorityTag priority={c.priority} /></td>
                      <td data-label="Status"><StatusBadge status={c.status} /></td>
                      <td data-label="">
                        <Link to={`/proctor/complaints/${c._id}`} className="btn btn-outline-primary btn-sm btn-glow" style={{ borderRadius: 8, fontSize: 12 }}>
                          Manage
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default ProctorDashboard;
