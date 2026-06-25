import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell } from 'lucide-react';

const Topbar = ({ title, onMenuToggle }) => {
  const { unreadCount } = useSocket();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="cg-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="d-lg-none"
          style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
          onClick={onMenuToggle}
        >
          <i className="bi bi-list" />
        </button>
        <span className="cg-topbar-title">{title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* ── Theme Toggle ── */}
        <motion.button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(225,29,72,0.15), rgba(22,163,74,0.08))'
              : 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(251,146,60,0.15))',
            border: isDark ? '1px solid rgba(225,29,72,0.25)' : '1px solid rgba(250,204,21,0.4)',
            borderRadius: 10,
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? 'sun' : 'moon'}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isDark
                ? <Sun size={16} color="#fbbf24" strokeWidth={2.2} />
                : <Moon size={16} color="#16a34a" strokeWidth={2.2} />
              }
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* ── Notification Bell ── */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: 10, width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative',
          }}
          onClick={() => navigate('/notifications')}
        >
          <Bell size={17} color="var(--text-secondary)" strokeWidth={2} />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="badge-pulse"
              style={{
                position: 'absolute', top: -4, right: -4,
                background: 'linear-gradient(135deg, #e11d48, #dc2626)',
                color: '#fff', borderRadius: '50%', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, border: '2px solid var(--bg-base)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* ── User Chip ── */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: 10, padding: '6px 12px',
            cursor: 'default',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e11d48, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="d-none d-sm-inline" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name?.split(' ')[0]}
          </span>
        </motion.div>

      </div>
    </header>
  );
};

export default Topbar;
