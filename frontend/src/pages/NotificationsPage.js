import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const typeIcon = {
  complaint_submitted: 'bi-plus-circle text-success',
  complaint_assigned: 'bi-person-check text-primary',
  status_update: 'bi-arrow-repeat text-warning',
  comment_added: 'bi-chat text-info',
  complaint_resolved: 'bi-check-circle text-success',
  system: 'bi-bell text-secondary',
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontWeight: 700, color: '#1a237e', margin: 0 }}>
            Notifications
            {unread > 0 && (
              <span style={{ background: '#ef5350', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>
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

        {loading && notifications.length === 0 ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : notifications.length === 0 ? (
          <div className="cg-card text-center py-5" style={{ color: '#9e9e9e' }}>
            <i className="bi bi-bell-slash" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
            <div>No notifications yet</div>
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <div key={n._id} style={{
                background: n.isRead ? '#fff' : '#e8eaf6',
                borderRadius: 10, padding: '14px 16px', marginBottom: 8,
                border: `1px solid ${n.isRead ? '#e0e0e0' : '#c5cae9'}`,
                cursor: n.complaint || n.link ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}
                onClick={() => handleClick(n)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,35,126,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: n.isRead ? '#f5f6fa' : '#c5cae9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${typeIcon[n.type] || 'bi-bell'}`} style={{ fontSize: 17 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14, color: '#212121' }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="d-flex align-items-center gap-1">
                  {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3949ab', display: 'block' }} />}
                  <button
                    className="btn btn-sm"
                    style={{ background: 'none', border: 'none', color: '#bdbdbd', padding: '2px 6px', fontSize: 14 }}
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
                <button className="btn btn-outline-primary btn-sm" onClick={() => { const next = page + 1; setPage(next); fetchNotifications(next); }}
                  disabled={loading} style={{ borderRadius: 8 }}>
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
