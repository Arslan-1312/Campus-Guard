import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import Layout from '../../components/shared/Layout';
import { StatusBadge, PriorityBadge } from '../../components/shared/StatusBadge';
import api from '../../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
  const animated = useCounter(value ?? 0);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        y: -4,
        borderColor: 'rgba(225, 29, 72, 0.3)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)'
      }}
      className="cg-stat-card"
    >
      <div className="cg-stat-icon" style={{ background: gradient, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div>
        <div className="cg-stat-value" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: 26 }}>
          {animated}
        </div>
        <div className="cg-stat-label">{label}</div>
      </div>
    </motion.div>
  );
};

const chartColors = {
  text: '#94a3b8',
  grid: 'rgba(255,255,255,0.06)',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const ChiefDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/chief').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Chief Proctor Dashboard">
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="col-6 col-md-3">
            <div className="skeleton skeleton-card" style={{ height: 88, marginBottom: 0 }} />
          </div>
        ))}
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="skeleton skeleton-card" style={{ height: 260, marginBottom: 0 }} />
        </div>
        <div className="col-md-8">
          <div className="skeleton skeleton-card" style={{ height: 260, marginBottom: 0 }} />
        </div>
      </div>
    </Layout>
  );

  const stats = data?.stats || {};

  /* ── Chart configs ── */
  const doughnutData = {
    labels: ['Pending','Under Review','In Progress','Resolved','Rejected'],
    datasets: [{
      data: [stats.pendingComplaints, stats.underReview, stats.inProgress, stats.resolved, stats.rejected],
      backgroundColor: ['#f59e0b','#e11d48','#dc2626','#16a34a','#f43f5e'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: data?.categoryStats?.map(c => c._id?.charAt(0).toUpperCase() + c._id?.slice(1)) || [],
    datasets: [{
      label: 'Complaints',
      data: data?.categoryStats?.map(c => c.count) || [],
      backgroundColor: 'rgba(225,29,72,0.6)',
      hoverBackgroundColor: 'rgba(225,29,72,0.9)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const lineData = {
    labels: data?.monthlyTrend?.map(m => `${MONTHS[m._id.month - 1]} ${m._id.year}`) || [],
    datasets: [{
      label: 'Complaints',
      data: data?.monthlyTrend?.map(m => m.count) || [],
      borderColor: '#e11d48',
      backgroundColor: 'rgba(225,29,72,0.15)',
      tension: 0.4, fill: true,
      pointBackgroundColor: '#fb7185',
      pointRadius: 4,
    }],
  };

  const darkChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartColors.text, font: { size: 12 }, boxWidth: 12 } },
    },
    scales: {
      x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
      y: { ticks: { color: chartColors.text, precision: 0 }, grid: { color: chartColors.grid }, beginAtZero: true },
    },
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: chartColors.text, boxWidth: 12, font: { size: 11 } } } },
  };

  const statCards = [
    { icon:'📋', value:stats.totalComplaints,  label:'Total',        gradient:'linear-gradient(135deg,#e11d48,#dc2626)' },
    { icon:'⏳', value:stats.pendingComplaints, label:'Pending',      gradient:'linear-gradient(135deg,#f59e0b,#fb923c)' },
    { icon:'🔍', value:stats.underReview,       label:'Under Review', gradient:'linear-gradient(135deg,#dc2626,#b91c1c)' },
    { icon:'⚙️', value:stats.inProgress,        label:'In Progress',  gradient:'linear-gradient(135deg,#be123c,#e11d48)' },
    { icon:'✅', value:stats.resolved,           label:'Resolved',     gradient:'linear-gradient(135deg,#16a34a,#15803d)' },
    { icon:'❌', value:stats.rejected,           label:'Rejected',     gradient:'linear-gradient(135deg,#f43f5e,#f59e0b)' },
    { icon:'👨‍🎓',value:stats.totalStudents,      label:'Students',     gradient:'linear-gradient(135deg,#16a34a,#15803d)' },
    { icon:'👮', value:stats.totalProctors,      label:'Proctors',     gradient:'linear-gradient(135deg,#e11d48,#dc2626)' },
  ];

  return (
    <Layout title="Chief Proctor Dashboard">
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
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:16, alignItems:'center', position:'relative', zIndex:1 }}>
            <div>
              <h4 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, color:'var(--text-primary)', marginBottom:6, fontSize:22 }}>
                Chief Proctor Dashboard 🏛️
              </h4>
              <p style={{ color:'var(--text-secondary)', margin:0, fontSize:14 }}>
                Real-time overview of all campus complaint activity
              </p>
            </div>
            <div className="cg-banner-actions" style={{ display:'flex', gap:10 }}>
              <Link to="/chief/complaints" className="btn-cg-primary btn-glow" style={{ fontSize:13 }}>
                <i className="bi bi-files" /> All Complaints
              </Link>
              <Link to="/chief/admin-db" className="btn-cg-primary btn-glow" style={{ fontSize:13, background:'linear-gradient(135deg,#16a34a,#15803d)' }}>
                <i className="bi bi-database-gear" /> DB Panel
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="row g-3 mb-4">
          {statCards.map((s, i) => (
            <div key={s.label} className="col-6 col-md-3">
              <StatCard {...s} delay={i * 0.05} />
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="row g-3 mb-4">
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 }
            }}
            className="col-md-4"
          >
            <div className="cg-card h-100">
              <h6 style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:16, fontSize:14 }}>Status Distribution</h6>
              <div className="cg-chart-container" style={{ height:220 }}>
                <Doughnut data={doughnutData} options={doughnutOpts} />
              </div>
            </div>
          </motion.div>
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 }
            }}
            className="col-md-8"
          >
            <div className="cg-card h-100">
              <h6 style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:16, fontSize:14 }}>Monthly Trend</h6>
              <div className="cg-chart-container" style={{ height:220 }}>
                <Line data={lineData} options={{ ...darkChartOpts, plugins:{ legend:{ display:false } } }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="row g-3 mb-4">
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 }
            }}
            className="col-md-6"
          >
            <div className="cg-card h-100">
              <h6 style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:16, fontSize:14 }}>Complaints by Category</h6>
              <div className="cg-chart-container" style={{ height:200 }}>
                <Bar data={barData} options={{ ...darkChartOpts, plugins:{ legend:{ display:false } } }} />
              </div>
            </div>
          </motion.div>
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 }
            }}
            className="col-md-6"
          >
            <div className="cg-card h-100">
              <h6 style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:14, fontSize:14 }}>Proctor Performance</h6>
              {!data?.proctorStats?.length ? (
                <p style={{ color:'var(--text-secondary)', fontSize:14 }}>No proctor data yet</p>
              ) : (
                <div style={{ overflow:'auto', maxHeight:200 }}>
                  {data.proctorStats.map((p) => (
                    <div key={p._id} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#e11d48,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:12, flexShrink:0 }}>
                          {p.name?.charAt(0)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{p.assigned} assigned · {p.resolved} resolved</div>
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color: p.resolutionRate >= 70 ? '#34d399' : '#fb923c', flexShrink:0 }}>
                          {Math.round(p.resolutionRate)}%
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
                        <div style={{ height:'100%', width:`${Math.min(p.resolutionRate,100)}%`, background: p.resolutionRate >= 70 ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'linear-gradient(90deg,#f59e0b,#e11d48)', borderRadius:2, transition:'width 1s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Complaints */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 }
          }}
          className="cg-card"
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h6 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:'var(--text-primary)', margin:0, fontSize:15 }}>
              Recent Complaints
            </h6>
            <Link to="/chief/complaints" style={{ fontSize:13, color:'#fb7185', textDecoration: 'none' }}>
              View all <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="cg-table-mobile-wrap table-responsive">
            <table className="cg-table">
              <thead>
                <tr><th>Ref #</th><th>Title</th><th>Student</th><th>Priority</th><th>Status</th><th>Assigned To</th><th></th></tr>
              </thead>
              <tbody>
                {data?.recentComplaints?.map((c) => (
                  <motion.tr 
                    key={c._id}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    <td data-label="Ref"><span style={{ fontFamily:'monospace', fontSize:11, color:'#fb7185' }}>{c.referenceNumber}</span></td>
                    <td data-label="Title" style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-primary)', fontSize:13 }}>{c.title}</td>
                    <td data-label="Student" style={{ fontSize:13 }}>{c.isAnonymous ? <span style={{ color:'#fb923c' }}><i className="bi bi-incognito" /></span> : <span style={{ color:'var(--text-secondary)' }}>{c.submittedBy?.name}</span>}</td>
                    <td data-label="Priority"><PriorityBadge priority={c.priority} /></td>
                    <td data-label="Status"><StatusBadge status={c.status} /></td>
                    <td data-label="Assigned" style={{ fontSize:13, color:'var(--text-secondary)' }}>{c.assignedTo?.name || <span style={{ color:'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td data-label=""><Link to={`/chief/complaints/${c._id}`} className="btn btn-outline-primary btn-sm btn-glow" style={{ borderRadius:8, fontSize:12 }}>View</Link></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default ChiefDashboard;
