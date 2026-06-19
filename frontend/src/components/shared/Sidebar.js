import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  student:      'linear-gradient(135deg,#06b6d4,#6366f1)',
  proctor:      'linear-gradient(135deg,#10b981,#06b6d4)',
  chief_proctor:'linear-gradient(135deg,#7c3aed,#f59e0b)',
};

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  const items = navItems[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {mobileOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1999, backdropFilter:'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside className={`cg-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="cg-sidebar-brand">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:40, height:40, borderRadius:10,
              background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, boxShadow:'0 4px 14px rgba(124,58,237,0.4)',
            }}>🛡️</div>
            <div>
              <h5 style={{ marginBottom:2 }}>HU Campus Guard</h5>
              <small>Hazara University</small>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:40, height:40, borderRadius:'50%',
              background: roleGrad[user?.role] || 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:17, color:'#fff', fontWeight:700,
              boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
              flexShrink:0, position:'relative',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
              {/* Online dot */}
              <span style={{
                position:'absolute', bottom:1, right:1,
                width:9, height:9, borderRadius:'50%',
                background:'#10b981', border:'2px solid #0f0c29',
              }}/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ color:'#f1f5f9', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {user?.name}
              </div>
              <span style={{
                fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10,
                background:'rgba(124,58,237,0.2)', color:'#a78bfa', border:'1px solid rgba(124,58,237,0.3)',
              }}>
                {roleLabel[user?.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="cg-sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
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
          ))}
        </nav>

        {/* Footer */}
        <div className="cg-sidebar-footer">
          <button
            onClick={handleLogout}
            className="cg-nav-link w-100"
            style={{ background:'none', border:'none', cursor:'pointer', width:'100%' }}
          >
            <i className="bi bi-box-arrow-left" style={{ color:'#f43f5e' }} />
            <span style={{ color:'#94a3b8' }}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
