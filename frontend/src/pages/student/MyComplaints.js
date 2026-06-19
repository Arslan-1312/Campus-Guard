import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/shared/StatusBadge';
import api from '../../utils/api';
import { downloadComplaintsCSV, downloadComplaint } from '../../utils/downloadComplaint';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1 });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 10, ...filters });
      Object.keys(filters).forEach((k) => !filters[k] && params.delete(k));
      const { data } = await api.get(`/complaints?${params}`);
      setComplaints(data.complaints);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  return (
    <Layout title="My Complaints">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 style={{ fontWeight: 700, color: '#1a237e', margin: 0 }}>
          My Complaints <span style={{ fontSize: 13, color: '#757575', fontWeight: 400 }}>({total} total)</span>
        </h5>
        <div className="d-flex gap-2">
          {complaints.length > 0 && (
            <button className="btn btn-outline-success btn-sm" onClick={() => downloadComplaintsCSV(complaints, 'my-complaints')} title="Download all as CSV">
              <i className="bi bi-download me-1" />Export CSV
            </button>
          )}
          <Link to="/student/submit" className="btn btn-cg-primary btn-sm">
            <i className="bi bi-plus-circle me-1" />New Complaint
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="cg-card mb-3">
        <div className="row g-2">
          <div className="col-md-5">
            <input type="text" className="form-control form-control-sm" placeholder="🔍 Search complaints..."
              value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {['harassment','bullying','ragging','smoking','violence','theft','academic','misconduct','other'].map(c => (
                <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-1">
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => setFilters({ status: '', category: '', search: '', page: 1 })}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cg-card">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#9e9e9e' }}>
            <i className="bi bi-inbox" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
            <div>No complaints found.</div>
            <Link to="/student/submit" className="btn btn-sm btn-cg-primary mt-3">Submit Your First Complaint</Link>
          </div>
        ) : (
          <>
            <div className="cg-table-mobile-wrap table-responsive">
              <table className="cg-table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id}>
                      <td data-label="Ref #"><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#3949ab', whiteSpace: 'nowrap' }}>{c.referenceNumber}</span></td>
                      <td data-label="Title">
                        <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                        {c.isAnonymous && <span style={{ fontSize: 10, color: '#e65100' }}><i className="bi bi-incognito me-1" />Anonymous</span>}
                      </td>
                      <td data-label="Category"><CategoryBadge category={c.category} /></td>
                      <td data-label="Priority"><PriorityBadge priority={c.priority} /></td>
                      <td data-label="Status"><StatusBadge status={c.status} /></td>
                      <td data-label="Date" style={{ fontSize: 12, color: '#757575', whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td data-label="" style={{ whiteSpace: 'nowrap' }}>
                        <div className="d-flex gap-1">
                          <Link to={`/student/complaints/${c._id}`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: 6, fontSize: 12 }}>
                            View
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            style={{ borderRadius: 6, fontSize: 12 }}
                            title="Download complaint"
                            onClick={() => downloadComplaint(c)}
                          >
                            <i className="bi bi-download" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 10 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-sm btn-outline-secondary" disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                  <i className="bi bi-chevron-left" />
                </button>
                <span style={{ fontSize: 13, padding: '6px 12px', color: '#555' }}>
                  Page {filters.page} of {Math.ceil(total / 10)}
                </span>
                <button className="btn btn-sm btn-outline-secondary" disabled={filters.page >= Math.ceil(total / 10)}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyComplaints;
