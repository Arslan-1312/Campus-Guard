import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/shared/StatusBadge';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { downloadComplaint } from '../../utils/downloadComplaint';

const ChiefComplaintDetail = () => {
  const { id } = useParams();
  const { socket, joinComplaint, leaveComplaint } = useSocket();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [proctors, setProctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ proctorId: '', priority: '', note: '' });
  const [assigning, setAssigning] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', resolution: '' });
  const [updating, setUpdating] = useState(false);

  const refetch = async () => {
    const { data } = await api.get(`/complaints/${id}`);
    setComplaint(data.complaint);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [compRes, proctorRes] = await Promise.all([
          api.get(`/complaints/${id}`),
          api.get('/users/proctors'),
        ]);
        setComplaint(compRes.data.complaint);
        setStatusForm((f) => ({ ...f, status: compRes.data.complaint.status }));
        setProctors(proctorRes.data.proctors);
      } catch {
        toast.error('Complaint not found');
        navigate('/chief/complaints');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (!id || !socket) return;
    joinComplaint(id);
    socket.on('new_comment', ({ comment: c }) =>
      setComplaint((prev) => prev ? { ...prev, comments: [...(prev.comments || []), c] } : prev));
    socket.on('complaint_updated', (updated) => setComplaint(updated));
    return () => { leaveComplaint(id); socket.off('new_comment'); socket.off('complaint_updated'); };
  }, [id, socket, joinComplaint, leaveComplaint]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/complaints/${id}/comment`, { text: comment, isInternal });
      setComment('');
    } catch { toast.error('Failed to post comment'); }
    finally { setPosting(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.proctorId) return toast.error('Select a proctor');
    setAssigning(true);
    try {
      await api.put(`/complaints/${id}/assign`, assignForm);
      toast.success('Complaint assigned successfully!');
      setAssignModal(false);
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally { setAssigning(false); }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/complaints/${id}/status`, statusForm);
      toast.success('Status updated!');
      setStatusModal(false);
      await refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  if (loading) return <Layout title="Complaint Detail"><div className="text-center py-5"><div className="spinner-border text-primary" /></div></Layout>;
  if (!complaint) return null;

  return (
    <Layout title="Complaint Detail">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)} style={{ borderRadius: 8 }}>
            <i className="bi bi-arrow-left me-1" />Back
          </button>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-sm btn-outline-success" onClick={() => downloadComplaint(complaint)} style={{ borderRadius: 8 }} title="Download complaint PDF">
              <i className="bi bi-download me-1" />Download PDF
            </button>
            {!complaint.assignedTo && (
              <button className="btn btn-sm btn-cg-primary" onClick={() => setAssignModal(true)}>
                <i className="bi bi-person-plus me-1" />Assign to Proctor
              </button>
            )}
            {complaint.assignedTo && !['resolved', 'rejected', 'closed'].includes(complaint.status) && (
              <button className="btn btn-sm btn-outline-primary" onClick={() => setAssignModal(true)} style={{ borderRadius: 8 }}>
                <i className="bi bi-arrow-repeat me-1" />Reassign
              </button>
            )}
            {!['closed', 'resolved', 'rejected'].includes(complaint.status) && (
              <button className="btn btn-sm btn-outline-warning" onClick={() => setStatusModal(true)} style={{ borderRadius: 8 }}>
                <i className="bi bi-pencil me-1" />Update Status
              </button>
            )}
          </div>
        </div>

        {/* Main info */}
        <div className="cg-card mb-3">
          <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#3949ab', fontWeight: 700 }}>{complaint.referenceNumber}</span>
            <StatusBadge status={complaint.status} />
          </div>
          <h4 style={{ fontWeight: 800, color: '#1a237e' }}>{complaint.title}</h4>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <CategoryBadge category={complaint.category} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.isAnonymous && (
              <span style={{ background: '#fff3e0', color: '#e65100', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
                <i className="bi bi-incognito me-1" />Anonymous
              </span>
            )}
          </div>
          <p style={{ color: '#424242', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{complaint.description}</p>

          <div className="row g-2 mt-2" style={{ fontSize: 13, color: '#757575' }}>
            <div className="col-sm-6">
              <i className="bi bi-person me-1" />
              {complaint.isAnonymous && !complaint.submittedBy
                ? <em>Anonymous</em>
                : complaint._identityRevealed
                  ? (
                    <span>
                      <span style={{ background: '#fff3e0', color: '#e65100', borderRadius: 4, padding: '1px 6px', fontSize: 11, marginRight: 6 }}>
                        <i className="bi bi-eye me-1" />Identity Revealed
                      </span>
                      <strong>{complaint.submittedBy?.name}</strong>
                      {complaint.submittedBy?.rollNumber && ` · ${complaint.submittedBy.rollNumber}`}
                      {complaint.submittedBy?.department && ` · ${complaint.submittedBy.department}`}
                    </span>
                  )
                  : (
                    <span>
                      <strong>{complaint.submittedBy?.name}</strong>
                      {complaint.submittedBy?.rollNumber && ` · ${complaint.submittedBy.rollNumber}`}
                      {complaint.submittedBy?.department && ` · ${complaint.submittedBy.department}`}
                    </span>
                  )
              }
            </div>
            {/* Show phone/email for chief if identity is revealed or complaint is non-anonymous */}
            {complaint.submittedBy?.phone && (
              <div className="col-sm-6"><i className="bi bi-telephone me-1" />{complaint.submittedBy.phone}</div>
            )}
            {complaint.submittedBy?.email && (
              <div className="col-sm-6"><i className="bi bi-envelope me-1" />{complaint.submittedBy.email}</div>
            )}
            {complaint.location && <div className="col-sm-6"><i className="bi bi-geo-alt me-1" />{complaint.location}</div>}
            {complaint.incidentDate && <div className="col-sm-6"><i className="bi bi-calendar-event me-1" />{new Date(complaint.incidentDate).toLocaleDateString()}</div>}
            <div className="col-sm-6"><i className="bi bi-clock me-1" />Submitted: {new Date(complaint.createdAt).toLocaleString()}</div>
            {complaint.assignedTo && (
              <div className="col-sm-6">
                <i className="bi bi-person-check me-1" />
                Assigned to: <strong style={{ color: '#2e7d32' }}>{complaint.assignedTo.name}</strong>
                {complaint.assignedAt && <span style={{ fontSize: 11, marginLeft: 4 }}>({new Date(complaint.assignedAt).toLocaleDateString()})</span>}
              </div>
            )}
            {complaint.resolvedBy && (
              <div className="col-sm-6"><i className="bi bi-check-circle me-1" />Resolved by: <strong>{complaint.resolvedBy.name}</strong></div>
            )}
          </div>
        </div>

        {/* Evidence */}
        {complaint.evidence?.length > 0 && (
          <div className="cg-card mb-3">
            <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 12 }}>Evidence ({complaint.evidence.length})</h6>
            <div className="d-flex flex-wrap gap-2">
              {complaint.evidence.map((ev, i) => (
                <a key={i} href={ev.url} target="_blank" rel="noreferrer"
                  style={{ borderRadius: 8, overflow: 'hidden', border: '2px solid #e0e0e0', display: 'block' }}>
                  {(ev.resourceType === 'image' || ev.url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                    ? (
                      <>
                        <img src={ev.url} alt="evidence" style={{ width: 110, height: 85, objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; if (e.target.nextSibling) e.target.nextSibling.style.display='flex'; }} />
                        <div className="fallback-icon" style={{ width: 110, height: 85, background: '#f5f5f5', display: 'none', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                          <i className="bi bi-file-earmark-image" style={{ fontSize: 24, color: '#9e9e9e' }} />
                          <span style={{ fontSize: 10, color: '#9e9e9e' }}>Image (Broken)</span>
                        </div>
                      </>
                    )
                    : null
                  }
                  {(ev.resourceType !== 'image' && !ev.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                    <div style={{ width: 110, height: 85, background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                      <i className="bi bi-file-earmark" style={{ fontSize: 24, color: '#3949ab' }} />
                      <span style={{ fontSize: 10, color: '#555' }}>{ev.originalName?.slice(0, 12) || 'File'}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {complaint.resolution && (
          <div className="cg-card mb-3" style={{ borderLeft: '4px solid #2e7d32' }}>
            <h6 style={{ fontWeight: 700, color: '#2e7d32' }}><i className="bi bi-check-circle me-2" />Resolution</h6>
            <p style={{ margin: 0 }}>{complaint.resolution}</p>
            {complaint.resolvedAt && <div style={{ fontSize: 12, color: '#9e9e9e', marginTop: 6 }}>Resolved: {new Date(complaint.resolvedAt).toLocaleString()}</div>}
          </div>
        )}

        {/* Status history */}
        {complaint.statusHistory?.length > 0 && (
          <div className="cg-card mb-3">
            <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 12 }}>Status Timeline</h6>
            <div className="comment-timeline">
              {complaint.statusHistory.map((h, i) => (
                <div key={i} className="comment-item">
                  <div style={{ fontSize: 13 }}>
                    <StatusBadge status={h.status} />
                    {h.changedBy && <span className="ms-2 text-muted" style={{ fontSize: 12 }}>by {h.changedBy.name}</span>}
                    {h.note && <span className="ms-2" style={{ color: '#555' }}>— {h.note}</span>}
                    <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 3 }}>{new Date(h.changedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="cg-card">
          <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 14 }}>
            All Comments ({complaint.comments?.length || 0})
          </h6>
          <div className="comment-timeline mb-3">
            {complaint.comments?.length === 0 && <p style={{ color: '#9e9e9e', fontSize: 14 }}>No comments yet.</p>}
            {complaint.comments?.map((c, i) => (
              <div key={i} className="comment-item">
                <div style={{
                  background: c.isInternal ? 'rgba(230,81,0,0.1)' : (c.authorRole === 'student' ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.1)'),
                  borderRadius: 8, padding: '10px 14px',
                  border: c.isInternal ? '1px solid rgba(230,81,0,0.3)' : '1px solid var(--glass-border)',
                }}>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.isInternal ? '#e65100' : 'var(--violet-light)' }}>
                      {c.isInternal && <i className="bi bi-lock me-1" />}
                      {c.author?.name || 'User'} · <span style={{ fontWeight: 400, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{c.authorRole?.replace('_', ' ')}</span>
                      {c.isInternal && <span style={{ fontSize: 10, color: '#e65100', marginLeft: 6, background: 'rgba(230,81,0,0.15)', borderRadius: 4, padding: '1px 5px' }}>Internal</span>}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" id="internalChk" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
            <label className="form-check-label" htmlFor="internalChk" style={{ fontSize: 13, color: isInternal ? '#e65100' : '#555' }}>
              <i className="bi bi-lock me-1" />Internal note (proctors only, hidden from student)
            </label>
          </div>
          <form onSubmit={handleComment} className="d-flex gap-2">
            <input type="text" className="form-control" placeholder="Add comment..."
              value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="btn btn-cg-primary flex-shrink-0" disabled={posting || !comment.trim()}>
              {posting ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send" />}
            </button>
          </form>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#1a1040', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h5 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
              <i className="bi bi-person-plus me-2" />Assign to Proctor
            </h5>
            <form onSubmit={handleAssign}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Select Proctor *</label>
                {proctors.length === 0 ? (
                  <div style={{ color: '#c62828', fontSize: 14 }}>No active proctors found. <a href="/chief/create-staff">Add a proctor first.</a></div>
                ) : (
                  <select className="form-select" value={assignForm.proctorId} onChange={(e) => setAssignForm({ ...assignForm, proctorId: e.target.value })} required>
                    <option value="">Choose a proctor...</option>
                    {proctors.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.department ? `(${p.department})` : ''} {p.isOnline ? '🟢' : '⚫'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Override Priority</label>
                <select className="form-select" value={assignForm.priority} onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}>
                  <option value="">Keep current ({complaint.priority})</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Assignment Note (Optional)</label>
                <textarea className="form-control" rows={2} value={assignForm.note}
                  onChange={(e) => setAssignForm({ ...assignForm, note: e.target.value })}
                  placeholder="Instructions for the proctor..." />
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setAssignModal(false)} style={{ borderRadius: 8 }}>Cancel</button>
                <button type="submit" className="btn btn-cg-primary" disabled={assigning || proctors.length === 0}>
                  {assigning ? <><span className="spinner-border spinner-border-sm me-2" />Assigning...</> : <><i className="bi bi-person-check me-1" />Assign</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#1a1040', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h5 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>Update Status</h5>
            <form onSubmit={handleStatusUpdate}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>New Status</label>
                <select className="form-select" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} required>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Note</label>
                <textarea className="form-control" rows={2} value={statusForm.note}
                  onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} placeholder="Reason for change..." />
              </div>
              {statusForm.status === 'resolved' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Resolution Details</label>
                  <textarea className="form-control" rows={3} value={statusForm.resolution}
                    onChange={(e) => setStatusForm({ ...statusForm, resolution: e.target.value })} placeholder="How was this resolved?" />
                </div>
              )}
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setStatusModal(false)} style={{ borderRadius: 8 }}>Cancel</button>
                <button type="submit" className="btn btn-cg-primary" disabled={updating}>
                  {updating ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ChiefComplaintDetail;
