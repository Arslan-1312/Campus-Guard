import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, ArrowRight, UserPlus, Lock,
  Activity, Zap, Mail, FileUp, BarChart2, CheckCircle2,
  Clock, Sparkles, AlertTriangle, Sun, Moon,
  ChevronRight, Eye, Users, TrendingUp, Bell
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ─── animation variants ─── */
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const fadeIn  = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

/* ─── data ─── */
const STATS = [
  { value: '500+', label: 'Students Protected', icon: <Users size={18}/> },
  { value: '94%',  label: 'Resolution Rate',    icon: <CheckCircle2 size={18}/> },
  { value: '< 2h', label: 'Avg Response Time',  icon: <Clock size={18}/> },
  { value: '24/7', label: 'Active Monitoring',  icon: <Activity size={18}/> },
];

const FEATURES = [
  { icon: <FileUp size={22}/>,      title: 'Submit Anonymously',  desc: 'File reports with privacy-first design — your identity stays protected.',       color: '#e11d48', bg: 'rgba(225,29,72,0.12)' },
  { icon: <Eye size={22}/>,         title: 'Live Tracking',       desc: 'Track your complaint status in real-time through every stage.',                  color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  { icon: <Users size={22}/>,       title: 'Proctor Network',     desc: 'Dedicated proctors assigned instantly across all campus buildings.',             color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { icon: <Bell size={22}/>,        title: 'Instant Alerts',      desc: 'Push notifications the moment your complaint status changes.',                    color: '#e11d48', bg: 'rgba(225,29,72,0.12)' },
  { icon: <Lock size={22}/>,        title: '256-bit Encryption',  desc: 'Every byte of your data is encrypted in transit and at rest.',                   color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  { icon: <BarChart2 size={22}/>,   title: 'Analytics Dashboard', desc: 'Chief proctors gain deep insight into campus trends and resolution metrics.',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
];

const STEPS = [
  { n: '01', icon: <UserPlus size={20}/>, title: 'Register',      desc: 'Create your secure student account in under a minute.',      color: '#e11d48' },
  { n: '02', icon: <FileUp size={20}/>,   title: 'File Report',   desc: 'Submit your complaint with evidence and priority tagging.',   color: '#dc2626' },
  { n: '03', icon: <Search size={20}/>,   title: 'Investigation', desc: 'Assigned proctor reviews and investigates your case.',        color: '#16a34a' },
  { n: '04', icon: <CheckCircle2 size={20}/>, title: 'Resolved',  desc: 'Receive resolution confirmation and closure notification.',   color: '#15803d' },
];

/* ─── floating card configs ─── */
const CARDS = [
  {
    id: 'report',
    top: '8%', right: '2%',
    delay: 0,
    yRange: [-10, 10],
    dur: 3.8,
    rotate: 2,
    content: (
      <div style={{ minWidth: 200 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:'#e11d48', boxShadow:'0 0 8px #e11d48' }} />
          <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600, letterSpacing:1 }}>NEW REPORT</span>
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>#HU-2026-0847</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'#94a3b8' }}>Harassment — Block C</span>
          <span style={{ background:'rgba(225,29,72,0.18)', color:'#fb7185', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, border:'1px solid rgba(225,29,72,0.3)' }}>HIGH</span>
        </div>
        <div style={{ marginTop:10, height:4, borderRadius:4, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
          <motion.div style={{ height:'100%', width:'35%', background:'linear-gradient(90deg,#e11d48,#dc2626)', borderRadius:4 }}
            animate={{ width:['35%','60%','35%'] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }} />
        </div>
        <div style={{ marginTop:6, fontSize:10, color:'#64748b' }}>Under Review…</div>
      </div>
    ),
  },
  {
    id: 'proctors',
    top: '34%', right: '-1%',
    delay: 0.6,
    yRange: [10, -10],
    dur: 4.2,
    rotate: -1,
    content: (
      <div style={{ minWidth: 180 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <Users size={14} color="#16a34a" />
          <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600, letterSpacing:1 }}>PATROL ACTIVE</span>
        </div>
        {[
          { name:'Ahmed R.', zone:'Block A', clr:'#e11d48' },
          { name:'Sara M.',  zone:'Block C', clr:'#16a34a' },
          { name:'Bilal K.', zone:'Block E', clr:'#f59e0b' },
        ].map((p,i)=> (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:p.clr, boxShadow:`0 0 6px ${p.clr}` }} />
            <span style={{ fontSize:12, color:'#f1f5f9', fontWeight:500, flex:1 }}>{p.name}</span>
            <span style={{ fontSize:10, color:'#64748b' }}>{p.zone}</span>
          </div>
        ))}
        <div style={{ marginTop:8, padding:'5px 8px', background:'rgba(22,163,74,0.12)', borderRadius:6, fontSize:11, color:'#4ade80', fontWeight:600, textAlign:'center', border:'1px solid rgba(22,163,74,0.2)' }}>
          3 Online
        </div>
      </div>
    ),
  },
  {
    id: 'stats',
    top: '60%', right: '2%',
    delay: 1.1,
    yRange: [-8, 8],
    dur: 3.5,
    rotate: 1.5,
    content: (
      <div style={{ minWidth: 170 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <TrendingUp size={14} color="#e11d48" />
          <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600, letterSpacing:1 }}>RESOLUTION RATE</span>
        </div>
        <div style={{ fontSize:32, fontWeight:800, color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>94<span style={{ fontSize:18 }}>%</span></div>
        <div style={{ fontSize:11, color:'#4ade80', marginBottom:10, marginTop:2 }}>↑ +12% this semester</div>
        {[['Resolved','bg','#22c55e',70],['In Progress','bg','#e11d48',20],['Pending','bg','#f59e0b',10]].map(([lbl,,clr,pct],i)=>(
          <div key={i} style={{ marginBottom:5 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
              <span style={{ fontSize:10, color:'#64748b' }}>{lbl}</span>
              <span style={{ fontSize:10, color:'#94a3b8', fontWeight:600 }}>{pct}%</span>
            </div>
            <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.07)' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:clr, borderRadius:2 }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'secure',
    top: '5%', left: '2%',
    delay: 0.3,
    yRange: [6, -6],
    dur: 5,
    rotate: -2,
    content: (
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Lock size={16} color="#4ade80" />
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9' }}>256-bit Encrypted</div>
          <div style={{ fontSize:11, color:'#4ade80', display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px #4ade80' }} />
            All traffic secured
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'resolved',
    top: '75%', left: '1%',
    delay: 0.8,
    yRange: [-10, 10],
    dur: 4.5,
    rotate: 1,
    content: (
      <div style={{ minWidth: 185 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <CheckCircle2 size={14} color="#22c55e" />
          <span style={{ fontSize:11, color:'#4ade80', fontWeight:600, letterSpacing:1 }}>RESOLVED</span>
        </div>
        <div style={{ fontSize:12, fontWeight:600, color:'#f1f5f9' }}>#HU-2026-0843</div>
        <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>Resolved in 2h 14min</div>
        <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ flex:1, height:2, background:'linear-gradient(90deg,#e11d48,#22c55e)', borderRadius:1 }} />
          <span style={{ fontSize:10, color:'#94a3b8' }}>closed</span>
        </div>
      </div>
    ),
  },
  {
    id: 'alert',
    top: '45%', left: '3%',
    delay: 1.4,
    yRange: [8, -8],
    dur: 3.2,
    rotate: -1.5,
    content: (
      <div style={{ display:'flex', alignItems:'center', gap:10, minWidth: 160 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <AlertTriangle size={16} color="#fbbf24" />
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'#f1f5f9' }}>Alert Escalated</div>
          <div style={{ fontSize:11, color:'#fbbf24', marginTop:2 }}>Chief Notified</div>
        </div>
      </div>
    ),
  },
];

/* ──────────────────────────────────────────── */
const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#060a08' : '#fafaf9', overflowX: 'hidden', fontFamily: "'Inter',sans-serif" }}>

      {/* ── Live BG ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: isDark
            ? 'linear-gradient(rgba(225,29,72,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(22,163,74,0.04) 1px,transparent 1px)'
            : 'linear-gradient(rgba(225,29,72,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(22,163,74,0.06) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Red blob */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(225,29,72,0.22) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Green blob */}
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: '10%', right: '-5%',
            width: 450, height: 450, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Dark red blob center */}
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute', top: '30%', left: '35%',
            width: 350, height: 350, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ───────── NAVBAR ───────── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'sticky', top: 0, zIndex: 1000,
          background: isDark ? 'rgba(6,10,8,0.85)' : 'rgba(250,250,249,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isDark ? 'rgba(225,29,72,0.15)' : 'rgba(225,29,72,0.1)'}`,
          padding: '0 5%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 66,
        }}
        className="cg-lp-navbar"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #e11d48, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(225,29,72,0.35)',
            }}
          >
            <Shield size={18} color="#fff" />
          </motion.div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 17,
            background: 'linear-gradient(135deg, #e11d48 0%, #16a34a 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            HU Campus Guard
          </span>
        </div>

        {/* Right nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(22,163,74,0.1)',
              border: isDark ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(22,163,74,0.25)',
              borderRadius: 9, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex' }}
              >
                {isDark ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#16a34a" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <Link to="/login" style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            color: isDark ? '#94a3b8' : '#4b5563',
            background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.borderColor='rgba(225,29,72,0.4)'; e.target.style.color='#e11d48'; }}
            onMouseLeave={e => { e.target.style.borderColor=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'; e.target.style.color=isDark?'#94a3b8':'#4b5563'; }}
          >
            Sign In
          </Link>
          <Link to="/register" style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, #e11d48, #dc2626)',
            color: '#fff', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(225,29,72,0.35)',
            display: 'none',
          }}
            className="d-sm-inline-block"
          >
            Register
          </Link>
        </div>
      </motion.nav>

      {/* ───────── HERO ───────── */}
      <section
        className="cg-lp-hero"
        style={{
          minHeight: 'calc(100vh - 66px)',
          padding: '60px 5% 80px',
          display: 'flex', alignItems: 'center',
          position: 'relative', zIndex: 1,
        }}>
        <div style={{ width: '100%', maxWidth: 1300, margin: '0 auto' }}>
          <div className="cg-hero-grid">

            {/* ── Left: Text ── */}
            <motion.div
              variants={stagger} initial="hidden" animate="show"
              style={{ maxWidth: 560 }}
            >
              {/* Badge */}
              <motion.div variants={scaleIn} transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)',
                  borderRadius: 30, padding: '6px 14px', marginBottom: 28,
                }}
              >
                <Sparkles size={13} color="#fb7185" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fb7185', letterSpacing: 0.5 }}>Hazara University · Official Safety System</span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.7 }}
                style={{
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900,
                  fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 1.05,
                  marginBottom: 24, letterSpacing: -1.5,
                  color: isDark ? '#f1f5f9' : '#111827',
                }}
              >
                Campus
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #e11d48 0%, #dc2626 40%, #16a34a 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Safety.
                </span>
                <br />
                <span style={{ fontSize: '0.65em', fontWeight: 700, color: isDark ? '#64748b' : '#9ca3af', letterSpacing: -0.5 }}>
                  Secured & Resolved.
                </span>
              </motion.h1>

              {/* Tagline */}
              <motion.p
                variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
                style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: isDark ? '#64748b' : '#6b7280', marginBottom: 38, lineHeight: 1.7, maxWidth: 480 }}
              >
                A secure, real-time complaint management system built exclusively for Hazara University students and proctors.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
                className="cg-hero-cta"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}
              >
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #e11d48, #dc2626)',
                    color: '#fff', textDecoration: 'none',
                    padding: '14px 28px', borderRadius: 12,
                    fontWeight: 700, fontSize: 15,
                    boxShadow: '0 6px 24px rgba(225,29,72,0.42)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    <UserPlus size={17} />
                    Get Started
                    <ArrowRight size={15} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    color: isDark ? '#f1f5f9' : '#111827', textDecoration: 'none',
                    padding: '14px 28px', borderRadius: 12,
                    fontWeight: 600, fontSize: 15,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                    backdropFilter: 'blur(8px)',
                  }}>
                    Sign In
                    <ChevronRight size={15} />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Mini stats row */}
              <motion.div
                variants={fadeUp} transition={{ duration: 0.5, delay: 0.35 }}
                className="cg-lp-stats"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 28, marginTop: 44 }}
              >
                {[['500+', 'Students'], ['94%', 'Resolved'], ['< 2h', 'Response']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#e11d48', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Right: Floating Cards ── */}
            <div style={{ position: 'relative', height: 520, display: 'none' }} className="d-lg-block">
              {CARDS.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.7, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: card.delay + 0.5, type: 'spring', stiffness: 120 }}
                  style={{
                    position: 'absolute',
                    top: card.top,
                    right: card.right,
                    left: card.left,
                    background: isDark ? 'rgba(12,20,14,0.85)' : 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(20px)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.07)',
                    borderRadius: 16,
                    padding: '14px 18px',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(225,29,72,0.08)'
                      : '0 8px 32px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    rotate: card.rotate,
                  }}
                >
                  <motion.div
                    animate={{ y: card.yRange }}
                    transition={{ duration: card.dur, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  >
                    {card.content}
                  </motion.div>
                </motion.div>
              ))}

              {/* Central shield glow */}
              <div style={{
                position: 'absolute', top: '38%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 120, height: 120,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(225,29,72,0.18) 0%, rgba(22,163,74,0.12) 60%, transparent 80%)',
                filter: 'blur(30px)',
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MOBILE CARDS ROW (visible on small screens) ─── */}
      <section style={{ padding: '0 5% 60px', position: 'relative', zIndex: 1, display: 'block' }} className="d-lg-none">
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {[CARDS[0], CARDS[1], CARDS[2]].map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay }}
              style={{
                minWidth: 200, flexShrink: 0,
                background: isDark ? 'rgba(12,20,14,0.85)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.07)',
                borderRadius: 16, padding: '14px 18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {card.content}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────── STATS STRIP ───────── */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        style={{
          padding: '40px 5%', position: 'relative', zIndex: 1,
          background: isDark ? 'rgba(12,20,14,0.6)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
        }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 32 }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: i % 2 === 0 ? 'rgba(225,29,72,0.12)' : 'rgba(22,163,74,0.12)',
                border: `1px solid ${i % 2 === 0 ? 'rgba(225,29,72,0.25)' : 'rgba(22,163,74,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                color: i % 2 === 0 ? '#fb7185' : '#4ade80',
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: i % 2 === 0 ? '#e11d48' : '#16a34a', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: isDark ? '#64748b' : '#9ca3af', marginTop: 6 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ───────── FEATURES ───────── */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        style={{ padding: '90px 5%', position: 'relative', zIndex: 1 }}
      >
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: 2,
              color: '#e11d48', textTransform: 'uppercase', marginBottom: 12,
            }}>
              — Capabilities —
            </span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900,
              fontSize: 'clamp(28px, 4vw, 44px)', color: isDark ? '#f1f5f9' : '#111827',
              letterSpacing: -1,
            }}>
              Built for{' '}
              <span style={{
                background: 'linear-gradient(135deg, #e11d48, #16a34a)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Campus Safety
              </span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, boxShadow: `0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px ${f.color}22` }}
                style={{
                  background: isDark ? 'rgba(12,20,14,0.7)' : 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(16px)',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 18,
                  padding: '28px 24px',
                  cursor: 'default',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 13,
                  background: f.bg, border: `1px solid ${f.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18, color: f.color,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 16, color: isDark ? '#f1f5f9' : '#111827', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: isDark ? '#64748b' : '#9ca3af', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ───────── HOW IT WORKS ───────── */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        style={{
          padding: '80px 5%',
          background: isDark ? 'rgba(4,9,6,0.8)' : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          position: 'relative', zIndex: 1,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#16a34a', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
              — Process —
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: 'clamp(26px,4vw,42px)', color: isDark ? '#f1f5f9' : '#111827', letterSpacing: -1 }}>
              From Report to Resolution
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: 36, left: '12%', right: '12%', height: 2,
              background: 'linear-gradient(90deg, #e11d48, #dc2626 40%, #16a34a)',
              display: 'none',
            }} className="d-none d-lg-block" />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ scale: 1.04 }}
                style={{ textAlign: 'center', position: 'relative' }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: `${step.color}18`,
                  border: `2px solid ${step.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: step.color,
                  boxShadow: `0 0 24px ${step.color}20`,
                  position: 'relative', zIndex: 1,
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: step.color, letterSpacing: 1, marginBottom: 6 }}>{step.n}</div>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: isDark ? '#f1f5f9' : '#111827', marginBottom: 8 }}>{step.title}</h4>
                <p style={{ fontSize: 13, color: isDark ? '#64748b' : '#9ca3af', lineHeight: 1.6, maxWidth: 200, margin: '0 auto' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ───────── CTA ───────── */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true }}
        variants={stagger}
        style={{ padding: '90px 5%', textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          {/* BG glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />

          <motion.div
            variants={scaleIn}
            style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #e11d48, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(225,29,72,0.4)',
            }}
          >
            <Shield size={32} color="#fff" />
          </motion.div>

          <motion.h2 variants={fadeUp} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: 'clamp(26px,4vw,42px)', color: isDark ? '#f1f5f9' : '#111827', letterSpacing: -1, marginBottom: 16 }}>
            Your Voice.{' '}
            <span style={{ background: 'linear-gradient(135deg, #e11d48, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Our Action.
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} style={{ fontSize: 16, color: isDark ? '#64748b' : '#9ca3af', marginBottom: 36, lineHeight: 1.7 }}>
            Join hundreds of students who trust HU Campus Guard to keep their campus safe.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #e11d48, #dc2626)',
                color: '#fff', textDecoration: 'none',
                padding: '15px 36px', borderRadius: 13,
                fontWeight: 700, fontSize: 15,
                boxShadow: '0 8px 28px rgba(225,29,72,0.45)',
              }}>
                <UserPlus size={17} />
                Create Account
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: isDark ? 'rgba(22,163,74,0.12)' : 'rgba(22,163,74,0.08)',
                border: '1px solid rgba(22,163,74,0.35)',
                color: '#16a34a', textDecoration: 'none',
                padding: '15px 32px', borderRadius: 13,
                fontWeight: 600, fontSize: 15,
              }}>
                Sign In
                <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ───────── FOOTER ───────── */}
      <footer
        className="cg-lp-footer"
        style={{
          padding: '28px 5%',
          background: isDark ? 'rgba(4,9,6,0.9)' : 'rgba(250,250,249,0.95)',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          position: 'relative', zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #e11d48, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280' }}>HU Campus Guard</span>
        </div>
        <div style={{ fontSize: 12, color: isDark ? '#475569' : '#9ca3af' }}>
          © {new Date().getFullYear()} Hazara University · All rights reserved
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Privacy', 'Terms', 'Support'].map(lbl => (
            <span key={lbl} style={{ fontSize: 12, color: isDark ? '#475569' : '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color='#e11d48'}
              onMouseLeave={e => e.target.style.color=isDark?'#475569':'#9ca3af'}
            >{lbl}</span>
          ))}
        </div>
      </footer>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width:991px) {
          .d-lg-block { display:none !important; }
        }
        @media (min-width:992px) {
          .d-lg-block { display:block !important; }
          .d-lg-none  { display:none  !important; }
        }
        @media (min-width:576px) {
          .d-sm-inline-block { display:inline-block !important; }
        }
        /* ── Mobile hero padding ── */
        @media (max-width:640px) {
          .cg-lp-hero {
            padding: 30px 5% 50px !important;
            min-height: auto !important;
          }
          .cg-lp-hero h1 {
            font-size: clamp(30px, 10vw, 48px) !important;
          }
          .cg-lp-hero p {
            font-size: 14px !important;
          }
          .cg-lp-hero .cg-hero-cta {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .cg-lp-hero .cg-hero-cta a {
            justify-content: center !important;
            text-align: center;
          }
          .cg-lp-stats { gap: 14px !important; }
          .cg-lp-footer {
            flex-direction: column !important;
            text-align: center !important;
            gap: 10px !important;
          }
          .cg-lp-footer > div:last-child {
            justify-content: center !important;
          }
          .cg-lp-navbar { padding: 0 4% !important; }
          .cg-lp-navbar span { font-size: 14px !important; }
        }
        @media (max-width:400px) {
          .cg-lp-hero { padding: 20px 4% 40px !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
