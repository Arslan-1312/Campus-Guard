import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const typeIcon = {
  complaint_submitted: 'bi-plus-circle text-success',
  complaint_assigned:  'bi-person-check text-primary',
  status_update:       'bi-arrow-repeat text-warning',
  comment_added:       'bi-chat text-info',
  complaint_resolved:  'bi-check-circle text-success',
  system:              'bi-bell text-secondary',
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);

  const fetchNotifications = async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/notifications?page=${pg}&limit=20`);
      if (pg === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setTotal(data.total);
      setUnread(data.unreadCount);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(1); }, []);

  const markRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications((prev) => prev.map((n) => n._id === notifId ? { ...n, isRead: true } : n));
      setUnread((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const deleteNotif = async (notifId) => {
    try {
      await api.delete(`/notifications/${notifId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      setTotal((t) => t - 1);
    } catch { toast.error('Failed to delete'); }
  };

  const handleClick = (n) => {
    if (!n.isRead) markRead(n._id);
    if (n.link) navigate(n.link);
    else if (n.complaint) {
      const base = user?.role === 'student' ? '/student' : user?.role === 'proctor' ? '/proctor' : '/chief';
      navigate(`${base}/complaints/${n.complaint._id || n.complaint}`);
    }
  };

  return (
    <Layout title="Notifications">
      <div className="cg-notif-page-wrap" style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div className="cg-notif-header d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Notifications
            {unread > 0 && (
              <span style={{
                background: 'var(--violet)', color: '#fff',
                borderRadius: 20, padding: '2px 8px',
                fontSize: 12, fontWeight: 700, marginLeft: 8,
              }}>
                {unread} new
              </span>
            )}
          </h5>
          {unread > 0 && (
            <button className="btn btn-sm btn-outline-primary" onClick={markAllRead} style={{ borderRadius: 8 }}>
              <i className="bi bi-check2-all me-1" />Mark all read
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading && notifications.length === 0 ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : notifications.length === 0 ? (
          <div className="cg-card text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <i className="bi bi-bell-slash" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
            <div>No notifications yet</div>
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`cg-notif-item${n.isRead ? '' : ' unread'}`}
                onClick={() => handleClick(n)}
                style={{ cursor: n.complaint || n.link ? 'pointer' : 'default' }}
              >
                {/* Icon */}
                <div className="cg-notif-icon-wrap">
                  <i className={`bi ${typeIcon[n.type] || 'bi-bell'}`} style={{ fontSize: 17 }} />
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex align-items-center gap-1" style={{ flexShrink: 0 }}>
                  {!n.isRead && <span className="cg-notif-unread-dot" />}
                  <button
                    className="cg-notif-delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                    title="Delete"
                  >
                    <i className="bi bi-x" />
                  </button>
                </div>
              </div>
            ))}

            {notifications.length < total && (
              <div className="text-center mt-3">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => { const next = page + 1; setPage(next); fetchNotifications(next); }}
                  disabled={loading}
                  style={{ borderRadius: 8 }}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" /> : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
