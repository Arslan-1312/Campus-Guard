import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/shared/StatusBadge';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import ChatPanel from '../../components/shared/ChatPanel';
import api, { getEvidenceUrl } from '../../utils/api';
import toast from 'react-hot-toast';
import { downloadComplaint } from '../../utils/downloadComplaint';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinComplaint, leaveComplaint, emitTyping, emitStopTyping } = useSocket();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  const [typingUser, setTypingUser] = useState('');
  const typingTimeout = useRef(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const { data } = await api.get(`/complaints/${id}`);
        setComplaint(data.complaint);
      } catch (err) {
        toast.error('Complaint not found');
        navigate('/student/complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id, navigate]);

  useEffect(() => {
    if (!id || !socket) return;
    joinComplaint(id);
    socket.on('new_comment', ({ comment: newComment }) => {
      setComplaint((prev) => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev);
    });
    socket.on('status_changed', ({ status }) => {
      setComplaint((prev) => prev ? { ...prev, status } : prev);
    });
    socket.on('user_typing', ({ userName }) => setTypingUser(userName));
    socket.on('user_stop_typing', () => setTypingUser(''));
    return () => {
      leaveComplaint(id);
      socket.off('new_comment');
      socket.off('status_changed');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [id, socket, joinComplaint, leaveComplaint]);

  const handleTyping = (e) => {
    setComment(e.target.value);
    emitTyping(id, user.name);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitStopTyping(id), 1500);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/complaints/${id}/comment`, { text: comment });
      setComment('');
      emitStopTyping(id);
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint deleted');
      navigate('/student/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete this complaint');
    }
  };

  if (loading) return <Layout title="Complaint Detail"><div className="text-center py-5"><div className="spinner-border text-primary" /></div></Layout>;
  if (!complaint) return null;

  const publicComments = complaint.comments?.filter((c) => !c.isInternal) || [];

  return (
    <Layout title="Complaint Detail">
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)} style={{ borderRadius: 8 }}>
            <i className="bi bi-arrow-left me-1" />Back
          </button>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-success" onClick={() => downloadComplaint(complaint)} style={{ borderRadius: 8 }} title="Download complaint report">
              <i className="bi bi-download me-1" />Download
            </button>
            {complaint.status === 'pending' && (
              <button className="btn btn-sm btn-outline-danger" onClick={handleDelete} style={{ borderRadius: 8 }}>
                <i className="bi bi-trash me-1" />Delete
              </button>
            )}
          </div>
        </div>

        {/* Main card */}
        <div className="cg-card mb-3">
          <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--violet-light)', fontWeight: 700 }}>
              {complaint.referenceNumber}
            </span>
            <StatusBadge status={complaint.status} />
          </div>

          <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{complaint.title}</h4>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <CategoryBadge category={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.isAnonymous && (
              <span style={{ background: '#fff3e0', color: '#e65100', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
                <i className="bi bi-incognito me-1" />Anonymous
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{complaint.description}</p>

          <div className="row g-2 mt-2" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {complaint.location && <div className="col-sm-6"><i className="bi bi-geo-alt me-1" />{complaint.location}</div>}
            {complaint.incidentDate && <div className="col-sm-6"><i className="bi bi-calendar-event me-1" />{new Date(complaint.incidentDate).toLocaleDateString()}</div>}
            <div className="col-sm-6"><i className="bi bi-clock me-1" />Submitted: {new Date(complaint.createdAt).toLocaleString()}</div>
            {complaint.assignedTo && (
              <div className="col-sm-6"><i className="bi bi-person-check me-1" />Assigned to: <strong>{complaint.assignedTo.name}</strong></div>
            )}
          </div>
        </div>

        {/* Evidence */}
        {complaint.evidence?.length > 0 && (
          <div className="cg-card mb-3">
            <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Evidence ({complaint.evidence.length})</h6>
            <div className="d-flex flex-wrap gap-2">
              {complaint.evidence.map((ev, i) => (
                <a key={i} href={getEvidenceUrl(ev.url)} target="_blank" rel="noreferrer"
                  style={{ display: 'block', borderRadius: 8, overflow: 'hidden', border: '2px solid #e0e0e0' }}>
                  {(ev.resourceType === 'image' || ev.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                    <>
                      <img src={getEvidenceUrl(ev.url)} alt="evidence" style={{ width: 100, height: 80, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }} />
                      <div className="fallback-icon" style={{ width: 100, height: 80, background: '#f5f5f5', display: 'none', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                        <i className="bi bi-file-earmark-image" style={{ fontSize: 22, color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Image (Broken)</span>
                      </div>
                    </>
                  ) : null}
                  {(ev.resourceType !== 'image' && !ev.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                    <div style={{ width: 100, height: 80, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                      <i className="bi bi-file-earmark" style={{ fontSize: 22, color: 'var(--violet-light)' }} />
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{ev.originalName?.slice(0, 12) || 'View'}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Status history */}
        {complaint.statusHistory?.length > 0 && (
          <div className="cg-card mb-3">
            <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Status Timeline</h6>
            <div className="comment-timeline">
              {complaint.statusHistory.map((h, i) => (
                <div key={i} className="comment-item">
                  <div style={{ fontSize: 13 }}>
                    <StatusBadge status={h.status} />
                    {h.note && <span className="ms-2 text-muted">{h.note}</span>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{new Date(h.changedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {complaint.resolution && (
          <div className="cg-card mb-3" style={{ borderLeft: '4px solid var(--cyan)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--cyan)' }}><i className="bi bi-check-circle me-2" />Resolution</h6>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{complaint.resolution}</p>
          </div>
        )}

        {/* Real-time Chat — only when assigned */}
        {complaint.assignedTo && (
          <div className="mb-3">
            <h6 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:'#f1f5f9', marginBottom:12, fontSize:15 }}>
              💬 Chat with your Proctor
            </h6>
            <ChatPanel
              complaintId={complaint._id}
              assignedTo={complaint.assignedTo?._id}
              submittedBy={complaint.submittedBy?._id}
            />
          </div>
        )}

        {/* Comments */}
        <div className="cg-card">
          <h6 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:'#f1f5f9', marginBottom:14, fontSize:15 }}>
            Updates &amp; Comments ({publicComments.length})
          </h6>

          {publicComments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No updates yet. We'll notify you when there are changes.</p>
          ) : (
            <div className="comment-timeline mb-3">
              {publicComments.map((c, i) => (
                <div key={i} className="comment-item">
                  <div style={{ background: c.authorRole === 'student' ? 'rgba(255,255,255,0.05)' : 'rgba(225,29,72,0.1)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--glass-border)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.authorRole === 'student' ? 'var(--text-primary)' : 'var(--violet-light)' }}>
                        {c.authorRole !== 'student' && <i className="bi bi-shield-check me-1" />}
                        {c.author?.name || 'User'} · <span style={{ textTransform: 'capitalize', fontWeight: 400, color: 'var(--text-secondary)' }}>{c.authorRole?.replace('_', ' ')}</span>
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {typingUser && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}><em>{typingUser} is typing...</em></div>}

          {/* Comment form — only if not closed/rejected */}
          {!['closed', 'rejected'].includes(complaint.status) && (
            <form onSubmit={handleComment} className="d-flex gap-2">
              <input type="text" className="form-control" placeholder="Add a comment or ask for update..."
                value={comment} onChange={handleTyping} />
              <button type="submit" className="btn btn-cg-primary flex-shrink-0" disabled={posting || !comment.trim()}>
                {posting ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ComplaintDetail;
