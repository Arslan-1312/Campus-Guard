import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Topbar = ({ title, onMenuToggle }) => {
  const { unreadCount } = useSocket();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="cg-topbar">
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button
          className="d-lg-none"
          style={{ background:'none', border:'none', fontSize:22, color:'var(--text-secondary)', cursor:'pointer', padding:4 }}
          onClick={onMenuToggle}
        >
          <i className="bi bi-list" />
        </button>
        <span className="cg-topbar-title">{title}</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>

        {/* Notification bell */}
        <button
          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', transition:'all 0.2s' }}
          onClick={() => navigate('/notifications')}
          onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
        >
          <i className="bi bi-bell" style={{ color:'#94a3b8', fontSize:17 }} />
          {unreadCount > 0 && (
            <span className="badge-pulse" style={{
              position:'absolute', top:-4, right:-4,
              background:'linear-gradient(135deg,#f43f5e,#f59e0b)',
              color:'#fff', borderRadius:'50%', width:18, height:18,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10, fontWeight:700, border:'2px solid #0d0d1a',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User chip */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:10, padding:'6px 12px',
        }}>
          <div style={{
            width:28, height:28, borderRadius:'50%',
            background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:12, fontWeight:700, color:'#fff',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="d-none d-sm-inline" style={{ fontSize:13, color:'#94a3b8', fontWeight:500, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
