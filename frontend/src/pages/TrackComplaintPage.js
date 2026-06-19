import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/shared/StatusBadge';
import toast from 'react-hot-toast';

const TrackComplaintPage = () => {
  const { referenceNumber: paramRef } = useParams();
  const [refNum, setRefNum] = useState(paramRef || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!refNum.trim()) return toast.error('Enter a reference number');
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints/track/${refNum.trim().toUpperCase()}`);
      setComplaint(data.complaint);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Complaint not found');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)', padding: '40px 16px' }}>
      {/* Back */}
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textDecoration: 'none' }}>
          <i className="bi bi-arrow-left me-1" />Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="text-center text-white mb-4 mt-3">
        <div style={{ fontSize: 48 }}>🔍</div>
        <h2 style={{ fontWeight: 800 }}>Track Your Complaint</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Enter your reference number to check the status</p>
      </div>

      {/* Search card */}
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="cg-card">
          <form onSubmit={handleTrack} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="e.g. CG-LX2K3A-4B7C"
              value={refNum}
              onChange={(e) => setRefNum(e.target.value.toUpperCase())}
              style={{ fontFamily: 'monospace', fontSize: 15, letterSpacing: 1 }}
            />
            <button type="submit" className="btn btn-cg-primary flex-shrink-0" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-search me-1" />Track</>}
            </button>
          </form>
        </div>

        {/* Result */}
        {complaint && (
          <div className="cg-card mt-3">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <div style={{ fontSize: 12, color: '#757575', marginBottom: 4 }}>Reference Number</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a237e', fontSize: 15 }}>{complaint.referenceNumber}</div>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <h5 style={{ fontWeight: 700, color: '#1a237e' }}>{complaint.title}</h5>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <CategoryBadge category={complaint.category} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <div style={{ fontSize: 13, color: '#757575' }}>
              Submitted: {new Date(complaint.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            {/* Status history */}
            {complaint.statusHistory?.length > 0 && (
              <div className="mt-4">
                <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 12 }}>Status History</h6>
                <div className="comment-timeline">
                  {complaint.statusHistory.map((h, i) => (
                    <div key={i} className="comment-item">
                      <div style={{ fontSize: 13 }}>
                        <StatusBadge status={h.status} />
                        {h.note && <span className="ms-2" style={{ color: '#555' }}>{h.note}</span>}
                        <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 3 }}>
                          {new Date(h.changedAt).toLocaleString('en-PK')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {complaint.comments?.length > 0 && (
              <div className="mt-4">
                <h6 style={{ fontWeight: 700, color: '#1a237e', marginBottom: 12 }}>Updates from Administration</h6>
                {complaint.comments.map((c, i) => (
                  <div key={i} style={{ background: '#f5f6fa', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: '#3949ab', fontWeight: 600, marginBottom: 4 }}>
                      <i className="bi bi-shield-check me-1" />
                      {c.authorRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div style={{ fontSize: 14 }}>{c.text}</div>
                    <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 4 }}>{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaintPage;
