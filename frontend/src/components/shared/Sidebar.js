import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const navItems = {
  student: [
    { to: '/student/dashboard', icon: 'bi-speedometer2',   label: 'Dashboard' },
    { to: '/student/submit',    icon: 'bi-plus-circle',    label: 'Submit Complaint' },
    { to: '/student/complaints',icon: 'bi-list-ul',        label: 'My Complaints' },
    { to: '/student/profile',   icon: 'bi-person-circle',  label: 'My Profile' },
    { to: '/notifications',     icon: 'bi-bell',           label: 'Notifications' },
  ],
  proctor: [
    { to: '/proctor/dashboard',   icon: 'bi-speedometer2',     label: 'Dashboard' },
    { to: '/proctor/complaints',  icon: 'bi-clipboard-check',  label: 'Assigned Complaints' },
    { to: '/notifications',       icon: 'bi-bell',             label: 'Notifications' },
  ],
  chief_proctor: [
    { to: '/chief/dashboard',     icon: 'bi-speedometer2',  label: 'Dashboard' },
    { to: '/chief/complaints',    icon: 'bi-files',         label: 'All Complaints' },
    { to: '/chief/users',         icon: 'bi-people',        label: 'Manage Users' },
    { to: '/chief/create-staff',  icon: 'bi-person-plus',   label: 'Add Staff' },
    { to: '/chief/admin-db',      icon: 'bi-database-gear', label: 'DB Admin Panel' },
    { to: '/notifications',       icon: 'bi-bell',          label: 'Notifications' },
  ],
};

const roleLabel = { student: 'Student', proctor: 'Proctor', chief_proctor: 'Chief Proctor' };

const roleGrad = {
  student:      'linear-gradient(135deg,#e11d48,#dc2626)',
  proctor:      'linear-gradient(135deg,#16a34a,#15803d)',
  chief_proctor:'linear-gradient(135deg,#e11d48,#16a34a)',
};

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  const items = navItems[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1999, backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)' }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`cg-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="cg-sidebar-brand">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <motion.div 
              whileHover={{ rotate: 180 }}
              style={{
                width:40, height:40, borderRadius:10,
                background:'linear-gradient(135deg,#e11d48,#16a34a)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20, boxShadow:'0 4px 14px rgba(225,29,72,0.4)',
              }}
            >🛡️</motion.div>
            <div>
              <h5 style={{ marginBottom:2 }}>HU Campus Guard</h5>
              <small>Hazara University</small>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={{
                width:40, height:40, borderRadius:'50%',
                background: roleGrad[user?.role] || 'linear-gradient(135deg,#e11d48,#16a34a)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:17, color:'#fff', fontWeight:700,
                boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                flexShrink:0, position:'relative',
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
              {/* Online dot */}
              <span style={{
                position:'absolute', bottom:1, right:1,
                width:9, height:9, borderRadius:'50%',
                background:'#10b981', border:'2px solid #0f0c29',
              }}/>
            </motion.div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ color:'#f1f5f9', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {user?.name}
              </div>
              <span style={{
                fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10,
                background: user?.role === 'student' ? 'rgba(225,29,72,0.15)' : user?.role === 'proctor' ? 'rgba(22,163,74,0.15)' : 'rgba(225,29,72,0.2)',
                color: user?.role === 'student' ? '#fb7185' : user?.role === 'proctor' ? '#4ade80' : '#fb7185',
                border: user?.role === 'student' ? '1px solid rgba(225,29,72,0.3)' : user?.role === 'proctor' ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(225,29,72,0.4)',
              }}>
                {roleLabel[user?.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="cg-sidebar-nav">
          {items.map((item) => (
            <motion.div
              key={item.to}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) => `cg-nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className={`bi ${item.icon}`} />
                <span style={{ flex:1 }}>{item.label}</span>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="badge-pulse" style={{
                    background:'linear-gradient(135deg,#f43f5e,#f59e0b)',
                    color:'#fff', borderRadius:10, padding:'2px 8px',
                    fontSize:11, fontWeight:700, minWidth:20, textAlign:'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="cg-sidebar-footer">
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleLogout}
            className="cg-nav-link w-100"
            style={{ background:'none', border:'none', cursor:'pointer', width:'100%' }}
          >
            <i className="bi bi-box-arrow-left" style={{ color:'#f43f5e' }} />
            <span style={{ color:'#94a3b8' }}>Logout</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
