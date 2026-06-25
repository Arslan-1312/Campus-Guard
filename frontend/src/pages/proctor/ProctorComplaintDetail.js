import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/shared/StatusBadge';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import ChatPanel from '../../components/shared/ChatPanel';
import api, { getEvidenceUrl } from '../../utils/api';
import toast from 'react-hot-toast';

const ProctorComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinComplaint, leaveComplaint } = useSocket();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', resolution: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then((r) => { setComplaint(r.data.complaint); setStatusForm((f) => ({ ...f, status: r.data.complaint.status })); })
      .catch(() => navigate('/proctor/complaints'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!id || !socket) return;
    joinComplaint(id);
    socket.on('new_comment', ({ comment: c }) => setComplaint((prev) => prev ? { ...prev, comments: [...(prev.comments || []), c] } : prev));
    socket.on('status_changed', ({ status }) => setComplaint((prev) => prev ? { ...prev, status } : prev));
    return () => { leaveComplaint(id); socket.off('new_comment'); socket.off('status_changed'); };
  }, [id, socket, joinComplaint, leaveComplaint]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/complaints/${id}/comment`, { text: comment, isInternal });
      setComment('');
    } catch { toast.error('Failed to post'); }
    finally { setPosting(false); }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusForm.status) return toast.error('Select a status');
    setUpdating(true);
    try {
      await api.put(`/complaints/${id}/status`, statusForm);
      toast.success('Status updated!');
      setStatusModal(false);
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  if (loading) return <Layout title="Complaint"><div className="text-center py-5"><div className="spinner-border text-primary" /></div></Layout>;
  if (!complaint) return null;

  return (
    <Layout title="Manage Complaint">
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate(-1)} style={{ borderRadius: 8 }}>
          <i className="bi bi-arrow-left me-1" />Back
        </button>

        {/* Header */}
        <div className="cg-card mb-3">
          <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--violet-light)', fontWeight: 700 }}>{complaint.referenceNumber}</span>
            <div className="d-flex gap-2 align-items-center">
              <StatusBadge status={complaint.status} />
              {!['resolved', 'rejected', 'closed'].includes(complaint.status) && (
                <button className="btn btn-sm btn-cg-primary" onClick={() => setStatusModal(true)}>
                  <i className="bi bi-pencil me-1" />Update Status
                </button>
              )}
            </div>
          </div>

          <h4 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{complaint.title}</h4>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <CategoryBadge category={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{complaint.description}</p>

          <div className="row g-2 mt-2" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <div className="col-sm-6">
              <i className="bi bi-person me-1" />
              {complaint.isAnonymous ? <em>Anonymous Submission</em> : (
                <span>{complaint.submittedBy?.name} · {complaint.submittedBy?.rollNumber} · {complaint.submittedBy?.department}</span>
              )}
            </div>
            {complaint.location && <div className="col-sm-6"><i className="bi bi-geo-alt me-1" />{complaint.location}</div>}
            {complaint.incidentDate && <div className="col-sm-6"><i className="bi bi-calendar-event me-1" />{new Date(complaint.incidentDate).toLocaleDateString()}</div>}
            <div className="col-sm-6"><i className="bi bi-clock me-1" />{new Date(complaint.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Evidence */}
        {complaint.evidence?.length > 0 && (
          <div className="cg-card mb-3">
            <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Evidence ({complaint.evidence.length})</h6>
            <div className="d-flex flex-wrap gap-2">
              {complaint.evidence.map((ev, i) => (
                <a key={i} href={getEvidenceUrl(ev.url)} target="_blank" rel="noreferrer" style={{ borderRadius: 8, overflow: 'hidden', border: '2px solid #e0e0e0', display: 'block' }}>
                  {(ev.resourceType === 'image' || ev.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                    <>
                      <img src={getEvidenceUrl(ev.url)} alt="evidence" style={{ width: 100, height: 80, objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                      <div className="fallback-icon" style={{ width: 100, height: 80, background: '#f5f5f5', display: 'none', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                        <i className="bi bi-file-earmark-image" style={{ fontSize: 24, color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Image (Broken)</span>
                      </div>
                    </>
                  ) : null}
                  {(ev.resourceType !== 'image' && !ev.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                    <div style={{ width: 100, height: 80, background: 'var(--bg-base)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                      <i className="bi bi-file-earmark" style={{ fontSize: 24, color: 'var(--violet-light)' }} />
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{ev.originalName?.slice(0, 12) || 'View'}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {complaint.resolution && (
          <div className="cg-card mb-3" style={{ borderLeft: '4px solid var(--cyan)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--cyan)' }}><i className="bi bi-check-circle me-2" />Resolution Note</h6>
            <p style={{ margin: 0 }}>{complaint.resolution}</p>
          </div>
        )}

        {/* Real-time Chat */}
        <div className="mb-3">
          <h6 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:'#f1f5f9', marginBottom:12, fontSize:15 }}>
            💬 Chat with Student
          </h6>
          <ChatPanel
            complaintId={complaint._id}
            assignedTo={complaint.assignedTo?._id || user._id}
            submittedBy={complaint.submittedBy?._id || complaint.submittedBy}
          />
        </div>

        {/* Comments */}
        <div className="cg-card">
          <h6 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:'#f1f5f9', marginBottom:14, fontSize:15 }}>
            Comments ({complaint.comments?.length || 0})
          </h6>
          <div className="comment-timeline mb-3">
            {complaint.comments?.map((c, i) => (
              <div key={i} className="comment-item">
                <div style={{
                  background: c.isInternal ? 'rgba(230,81,0,0.1)' : (c.authorRole === 'student' ? 'rgba(255,255,255,0.05)' : 'rgba(225,29,72,0.1)'),
                  borderRadius: 8, padding: '10px 14px',
                  border: c.isInternal ? '1px solid rgba(230,81,0,0.3)' : '1px solid var(--glass-border)'
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.isInternal ? '#e65100' : 'var(--violet-light)' }}>
                      {c.isInternal && <i className="bi bi-lock me-1" title="Internal note" />}
                      {c.author?.name || 'System'} · <span style={{ fontWeight: 400, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{c.authorRole?.replace('_', ' ')}</span>
                      {c.isInternal && <span style={{ fontSize: 10, color: '#e65100', marginLeft: 6, background: 'rgba(230,81,0,0.15)', borderRadius: 4, padding: '1px 5px' }}>Internal</span>}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Internal note toggle */}
          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" id="internalCheck" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
            <label className="form-check-label" htmlFor="internalCheck" style={{ fontSize: 13, color: isInternal ? '#e65100' : 'var(--text-secondary)' }}>
              <i className="bi bi-lock me-1" />Internal note (hidden from student)
            </label>
          </div>
          <form onSubmit={handleComment} className="d-flex gap-2">
            <input type="text" className="form-control" placeholder="Add comment or note..."
              value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="btn btn-cg-primary flex-shrink-0" disabled={posting || !comment.trim()}>
              {posting ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send" />}
            </button>
          </form>
        </div>

        {/* Status update modal */}
        {statusModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <h5 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>Update Complaint Status</h5>
              <form onSubmit={handleStatusUpdate}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>New Status</label>
                  <select className="form-select" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} required>
                    <option value="under_review">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Note (Optional)</label>
                  <textarea className="form-control" rows={2} value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} placeholder="Explain the status change..." />
                </div>
                {statusForm.status === 'resolved' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Resolution Details</label>
                    <textarea className="form-control" rows={3} value={statusForm.resolution} onChange={(e) => setStatusForm({ ...statusForm, resolution: e.target.value })} placeholder="Describe how the issue was resolved..." />
                  </div>
                )}
                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setStatusModal(false)} style={{ borderRadius: 8 }}>Cancel</button>
                  <button type="submit" className="btn btn-cg-primary" disabled={updating}>
                    {updating ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProctorComplaintDetail;
